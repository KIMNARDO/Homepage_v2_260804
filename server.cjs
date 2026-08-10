const { createServer } = require('node:http');
const { createReadStream, statSync } = require('node:fs');
const { createHmac, randomBytes, timingSafeEqual } = require('node:crypto');
const { basename, extname, join, resolve, sep } = require('node:path');

const root = resolve(__dirname, 'dist');
const port = Number(process.env.PORT) || 4173;
const leadNotificationEmail = process.env.LEAD_NOTIFICATION_EMAIL || 'kimnardo@papsnet.net';
const downloadTokenSecret = process.env.DOWNLOAD_TOKEN_SECRET || randomBytes(32).toString('hex');
const leadRateLimits = new Map();
const contactRateLimits = new Map();
const pendingContactDeliveries = new Map();
const contactProducts = new Set(['통합 PLM 전체', 'AI CADWin', 'Clip PDM', 'Clip PMS', 'Multi-BOM', 'Clip CMS']);
const contactTimes = new Set(['오후 2시~5시', '오전 9시~12시', '오후 5시 이후', '시간 무관']);
const deliveryRetryDelays = [0, 500, 1500];
const pendingContactRetryDelays = [30 * 1000, 2 * 60 * 1000, 10 * 60 * 1000];

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.m4v': 'video/x-m4v',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  let filePath = resolve(root, relativePath);

  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) return null;

  try {
    if (statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
    return statSync(filePath).isFile() ? filePath : null;
  } catch {
    if (!extname(relativePath)) {
      const htmlPath = resolve(root, `${relativePath}.html`);
      try {
        if (htmlPath.startsWith(`${root}${sep}`) && statSync(htmlPath).isFile()) return htmlPath;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function sendFile(req, res, filePath, extraHeaders = {}) {
  const stats = statSync(filePath);
  const extension = extname(filePath).toLowerCase();
  const range = req.headers.range;
  const headers = {
    'Accept-Ranges': 'bytes',
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  };

  headers['Cache-Control'] = extension === '.html'
    ? 'no-cache'
    : 'public, max-age=86400, stale-while-revalidate=604800';
  Object.assign(headers, extraHeaders);

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
      return res.end();
    }

    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : stats.size - 1;
    if (start > end || end >= stats.size) {
      res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
      return res.end();
    }

    res.writeHead(206, {
      ...headers,
      'Content-Length': end - start + 1,
      'Content-Range': `bytes ${start}-${end}/${stats.size}`,
    });
    if (req.method === 'HEAD') return res.end();
    return createReadStream(filePath, { start, end }).pipe(res);
  }

  res.writeHead(200, { ...headers, 'Content-Length': stats.size });
  if (req.method === 'HEAD') return res.end();
  return createReadStream(filePath).pipe(res);
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  return res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 32768) {
        rejectBody(new Error('REQUEST_TOO_LARGE'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolveBody(raw ? JSON.parse(raw) : {});
      } catch {
        rejectBody(new Error('INVALID_JSON'));
      }
    });
    req.on('error', rejectBody);
  });
}

function cleanText(value, maxLength) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getClientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return cleanText(forwarded || req.socket.remoteAddress || 'unknown', 80);
}

function consumeLeadRateLimit(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const current = leadRateLimits.get(ip);

  if (!current || now - current.startedAt > windowMs) {
    leadRateLimits.set(ip, { count: 1, startedAt: now });
    return true;
  }

  current.count += 1;
  return current.count <= 8;
}

function consumeContactRateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const current = contactRateLimits.get(ip);

  if (!current || now - current.startedAt > windowMs) {
    contactRateLimits.set(ip, { count: 1, startedAt: now });
    return true;
  }

  current.count += 1;
  return current.count <= 5;
}

function createContactLeadId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `PLM-${date}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

function createBrochureLeadId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `DL-${date}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

function hasRepeatedJunk(value) {
  const tokens = String(value).toLowerCase().match(/[a-z가-힣0-9]+/g) || [];
  if (/(.)\1{5,}/i.test(value)) return true;
  return tokens.length >= 6 && new Set(tokens).size / tokens.length <= 0.5;
}

function isPlausibleCompany(value) {
  return value.length >= 2 && /[A-Za-z가-힣]/.test(value) && !hasRepeatedJunk(value);
}

function isPlausibleName(value) {
  return value.length >= 2 && value.length <= 40 && /^[A-Za-z가-힣 .'-]+$/.test(value) && !hasRepeatedJunk(value);
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15 && /^[0-9+()\-\s]+$/.test(value);
}

function isValidEmail(value) {
  return value.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function resolveLeadResource(resource) {
  if (typeof resource !== 'string') return null;

  let decodedResource;
  try {
    decodedResource = decodeURIComponent(resource);
  } catch {
    return null;
  }

  if (!decodedResource.startsWith('/brochures/') || extname(decodedResource).toLowerCase() !== '.pdf') {
    return null;
  }

  const brochureRoot = resolve(root, 'brochures');
  const filePath = resolve(root, decodedResource.replace(/^\/+/, ''));
  if (!filePath.startsWith(`${brochureRoot}${sep}`)) return null;

  try {
    return statSync(filePath).isFile() ? filePath : null;
  } catch {
    return null;
  }
}

function createDownloadToken(resource, expires) {
  return createHmac('sha256', downloadTokenSecret)
    .update(`${resource}|${expires}`)
    .digest('hex');
}

function isValidDownloadToken(resource, expires, token) {
  if (!resource || !token || !Number.isFinite(expires) || expires < Date.now()) return false;
  const expected = Buffer.from(createDownloadToken(resource, expires), 'utf8');
  const provided = Buffer.from(String(token), 'utf8');
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

function wait(delayMs) {
  return new Promise(resolveWait => setTimeout(resolveWait, delayMs));
}

function isRetryableDeliveryStatus(status) {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

async function fetchDelivery(url, options, label) {
  let lastError;

  for (let attempt = 0; attempt < deliveryRetryDelays.length; attempt += 1) {
    const delayMs = deliveryRetryDelays[attempt];
    if (delayMs) await wait(delayMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(8000),
      });
      const responseText = await response.text();
      if (response.ok) return { response, responseText };

      lastError = new Error(`${label} failed: ${response.status}`);
      if (!isRetryableDeliveryStatus(response.status)) break;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error(`${label} failed`);
}

function parseFormSubmitResponse(responseText, label) {
  let payload;

  try {
    payload = JSON.parse(responseText);
  } catch {
    throw new Error(`${label} returned an invalid response`);
  }

  // FormSubmit can return success as either a boolean or a string.
  // Treat every value except an explicit true as a rejected delivery.
  const accepted = payload.success === true || String(payload.success).toLowerCase() === 'true';
  if (!accepted) {
    throw new Error(`${label} rejected: ${cleanText(payload.message, 180) || 'unknown reason'}`);
  }

  return payload;
}

function uniqueEndpoints(...values) {
  return [...new Set(values.filter(Boolean).map(value => String(value).trim()).filter(Boolean))];
}

async function deliverBrochureViaResend(lead, rows, htmlRows) {
  await fetchDelivery('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.LEAD_FROM_EMAIL,
      to: [leadNotificationEmail],
      reply_to: lead.email,
      subject: `[Clip PLM 자료 다운로드 ${lead.leadId}] ${lead.company} · ${lead.name}`,
      text: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
      html: `<h2 style="font-family:Arial,sans-serif">새 Clip PLM 자료 다운로드</h2><table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${htmlRows}</table>`,
    }),
  }, 'Resend brochure notification');
  return 'resend';
}

async function deliverBrochureViaFormSubmit(lead) {
  const endpoints = uniqueEndpoints(
    process.env.BROCHURE_FORM_ENDPOINT,
    process.env.CONTACT_FORM_ENDPOINT,
    `https://formsubmit.co/ajax/${leadNotificationEmail}`,
  );
  const payload = {
    _subject: `[Clip PLM 자료 다운로드 ${lead.leadId}] ${lead.company} · ${lead.name}`,
    _template: 'table',
    _captcha: 'false',
    _replyto: lead.email,
    _url: lead.sourcePage,
    email: lead.email,
    name: lead.name,
    company: lead.company,
    phone: lead.phone || '미입력',
    message: `${lead.product} 자료 다운로드 요청`,
    '접수번호': lead.leadId,
    '선택 자료': lead.product,
    '요청 파일': lead.resource,
    '요청 시각': lead.requestedAt,
    '유입 페이지': lead.sourcePage,
    '접속 IP': lead.ip,
  };
  let lastError;

  for (const endpoint of endpoints) {
    try {
      const { responseText } = await fetchDelivery(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'Papsnet-Website/1.0',
        },
        body: JSON.stringify(payload),
      }, 'FormSubmit brochure notification');
      parseFormSubmitResponse(responseText, 'FormSubmit brochure notification');
      return 'formsubmit';
    } catch (error) {
      lastError = error;
      console.error('[brochure-lead-formsubmit-endpoint-error]', lead.leadId, endpoint, error.message);
    }
  }

  throw lastError || new Error('FormSubmit brochure notification failed');
}

async function notifyLead(lead) {
  if (process.env.LEAD_DELIVERY_MODE === 'log') return ['server-log'];

  const rows = [
    ['접수번호', lead.leadId],
    ['선택 자료', lead.product],
    ['회사명', lead.company],
    ['담당자명', lead.name],
    ['업무 이메일', lead.email],
    ['연락처', lead.phone || '미입력'],
    ['요청 파일', lead.resource],
    ['요청 시각', lead.requestedAt],
    ['유입 페이지', lead.sourcePage],
    ['접속 IP', lead.ip],
  ];
  const htmlRows = rows.map(([label, value]) => `
    <tr><th style="padding:9px 12px;text-align:left;background:#f1f4f2;border:1px solid #dce2df">${escapeHtml(label)}</th>
    <td style="padding:9px 12px;border:1px solid #dce2df">${escapeHtml(value)}</td></tr>`).join('');

  let emailChannel;
  if (process.env.RESEND_API_KEY && process.env.LEAD_FROM_EMAIL) {
    try {
      emailChannel = await deliverBrochureViaResend(lead, rows, htmlRows);
    } catch (error) {
      console.error('[brochure-lead-resend-error]', lead.leadId, error);
    }
  }
  if (!emailChannel) emailChannel = await deliverBrochureViaFormSubmit(lead);

  const delivered = [emailChannel];
  if (process.env.LEAD_WEBHOOK_URL) {
    try {
      const response = await fetch(process.env.LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'brochure.downloaded', ...lead }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`Lead webhook failed: ${response.status}`);
      delivered.push('webhook');
    } catch (error) {
      console.error('[brochure-lead-webhook-error]', lead.leadId, error);
    }
  }
  return delivered;
}

async function deliverContactViaResend(lead, rows, htmlRows) {
  await fetchDelivery('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.LEAD_FROM_EMAIL,
      to: [leadNotificationEmail],
      reply_to: lead.email,
      subject: `[Clip PLM 상담 ${lead.leadId}] ${lead.company} · ${lead.name}`,
      text: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
      html: `<h2 style="font-family:Arial,sans-serif">새 Clip PLM 상담 요청</h2><table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${htmlRows}</table>`,
    }),
  }, 'Resend contact notification');
  return 'resend';
}

async function deliverContactViaFormSubmit(lead) {
  const endpoints = uniqueEndpoints(
    process.env.CONTACT_FORM_ENDPOINT,
    `https://formsubmit.co/ajax/${leadNotificationEmail}`,
  );
  const payload = {
    _subject: `[Clip PLM 상담 ${lead.leadId}] ${lead.company} · ${lead.name}`,
    _template: 'table',
    _captcha: 'false',
    _replyto: lead.email,
    _url: lead.sourcePage,
    email: lead.email,
    name: lead.name,
    company: lead.company,
    phone: lead.phone,
    message: lead.message,
    '접수번호': lead.leadId,
    '관심 제품': lead.product,
    '연락 가능 시간': lead.contactTime,
    '접수 시각': lead.requestedAt,
    '유입 페이지': lead.sourcePage,
  };
  let lastError;

  for (const endpoint of endpoints) {
    try {
      const { responseText } = await fetchDelivery(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Origin: 'https://www.papsnet.net',
          Referer: 'https://www.papsnet.net/',
        },
        body: JSON.stringify(payload),
      }, 'FormSubmit contact notification');
      parseFormSubmitResponse(responseText, 'FormSubmit contact notification');
      return 'formsubmit';
    } catch (error) {
      lastError = error;
      console.error('[contact-lead-formsubmit-endpoint-error]', lead.leadId, endpoint, error.message);
    }
  }

  throw lastError || new Error('FormSubmit contact notification failed');
}

function buildContactEmailContent(lead) {
  const rows = [
    ['접수번호', lead.leadId],
    ['회사명', lead.company],
    ['담당자명', lead.name],
    ['연락처', lead.phone],
    ['업무 이메일', lead.email],
    ['관심 제품', lead.product],
    ['연락 가능 시간', lead.contactTime],
    ['문의 내용', lead.message],
    ['접수 시각', lead.requestedAt],
    ['유입 페이지', lead.sourcePage],
  ];
  const htmlRows = rows.map(([label, value]) => `
    <tr><th style="padding:9px 12px;text-align:left;background:#f1f4f2;border:1px solid #dce2df">${escapeHtml(label)}</th>
    <td style="padding:9px 12px;border:1px solid #dce2df">${escapeHtml(value)}</td></tr>`).join('');
  return { rows, htmlRows };
}

async function deliverContactEmail(lead) {
  const { rows, htmlRows } = buildContactEmailContent(lead);
  const failures = [];

  if (process.env.RESEND_API_KEY && process.env.LEAD_FROM_EMAIL) {
    try {
      return { channel: await deliverContactViaResend(lead, rows, htmlRows), failures };
    } catch (error) {
      failures.push(`resend:${error.message}`);
      console.error('[contact-lead-resend-error]', lead.leadId, error.message);
    }
  }

  try {
    return { channel: await deliverContactViaFormSubmit(lead), failures };
  } catch (error) {
    failures.push(`formsubmit:${error.message}`);
    return { channel: null, failures };
  }
}

async function notifyContactLead(lead) {
  if (process.env.CONTACT_DELIVERY_MODE === 'log') {
    return { delivered: ['server-log'], failures: [], emailDelivered: true };
  }

  const email = await deliverContactEmail(lead);
  const delivered = email.channel ? [email.channel] : [];
  const failures = [...email.failures];
  if (process.env.LEAD_WEBHOOK_URL) {
    try {
      const response = await fetch(process.env.LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'contact.requested', ...lead }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`Contact webhook failed: ${response.status}`);
      delivered.push('webhook');
    } catch (error) {
      failures.push(`webhook:${error.message}`);
      console.error('[contact-lead-webhook-error]', lead.leadId, error.message);
    }
  }
  return { delivered, failures, emailDelivered: Boolean(email.channel) };
}

function scheduleContactLeadRetry(lead, retryIndex = 0) {
  if (retryIndex >= pendingContactRetryDelays.length) {
    pendingContactDeliveries.delete(lead.leadId);
    console.error('[contact-lead-delivery-exhausted]', lead.leadId);
    return;
  }

  const delayMs = pendingContactRetryDelays[retryIndex];
  pendingContactDeliveries.set(lead.leadId, { lead, retryIndex, scheduledAt: Date.now() + delayMs });
  const timer = setTimeout(async () => {
    try {
      const delivery = await deliverContactEmail(lead);
      if (delivery.channel) {
        pendingContactDeliveries.delete(lead.leadId);
        console.log('[contact-lead-delivery-recovered]', JSON.stringify({
          leadId: lead.leadId,
          delivered: [delivery.channel],
          retry: retryIndex + 1,
        }));
        return;
      }
      console.error('[contact-lead-delivery-retry-failed]', lead.leadId, retryIndex + 1, delivery.failures.join(' | '));
    } catch (error) {
      console.error('[contact-lead-delivery-retry-error]', lead.leadId, retryIndex + 1, error.message);
    }
    scheduleContactLeadRetry(lead, retryIndex + 1);
  }, delayMs);
  timer.unref?.();
}

async function handleContactLeadRequest(req, res) {
  const ip = getClientIp(req);
  if (!consumeContactRateLimit(ip)) {
    return sendJson(res, 429, { message: '상담 요청이 너무 많습니다. 15분 후 다시 시도해 주세요.' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    const status = error.message === 'REQUEST_TOO_LARGE' ? 413 : 400;
    return sendJson(res, status, { message: '상담 요청 형식을 확인해 주세요.' });
  }

  // 숨김 필드를 채운 자동화 요청은 실제 메일을 만들지 않고 조용히 종료한다.
  if (cleanText(body.website, 200)) {
    console.warn('[contact-spam-blocked]', JSON.stringify({ reason: 'honeypot', ip }));
    return sendJson(res, 200, { ok: true, leadId: '접수 완료' });
  }

  const now = Date.now();
  const startedAt = Number(body.startedAt);
  const completionMs = now - startedAt;
  if (!Number.isFinite(startedAt) || completionMs < 1500 || completionMs > 4 * 60 * 60 * 1000) {
    console.warn('[contact-spam-blocked]', JSON.stringify({ reason: 'invalid-timing', ip }));
    return sendJson(res, 400, { message: '상담 폼을 다시 열어 작성해 주세요.' });
  }

  const lead = {
    leadId: createContactLeadId(),
    company: cleanText(body.company, 80),
    name: cleanText(body.name, 40),
    phone: cleanText(body.phone, 20),
    email: cleanText(body.email, 160).toLowerCase(),
    product: cleanText(body.product, 80),
    contactTime: cleanText(body.contactTime, 40),
    message: cleanText(body.message, 1200),
    sourcePage: cleanText(body.sourcePage, 500),
    requestedAt: new Date().toISOString(),
    ip,
    userAgent: cleanText(req.headers['user-agent'], 300),
  };

  const errors = [];
  if (!body.consent) errors.push('개인정보 수집 및 이용 동의가 필요합니다.');
  if (!isPlausibleCompany(lead.company)) errors.push('실제 회사명을 입력해 주세요.');
  if (!isPlausibleName(lead.name)) errors.push('담당자명을 확인해 주세요.');
  if (!isValidPhone(lead.phone)) errors.push('연락 가능한 전화번호를 입력해 주세요.');
  if (!isValidEmail(lead.email)) errors.push('회신 가능한 이메일 주소를 입력해 주세요.');
  if (!contactProducts.has(lead.product)) errors.push('관심 제품을 다시 선택해 주세요.');
  if (!contactTimes.has(lead.contactTime)) errors.push('연락 가능 시간을 다시 선택해 주세요.');
  if (lead.message.length < 10 || hasRepeatedJunk(lead.message)) errors.push('상담이 필요한 내용을 10자 이상 입력해 주세요.');

  if (errors.length) {
    console.warn('[contact-spam-blocked]', JSON.stringify({ reason: 'validation', ip, errors }));
    return sendJson(res, 422, { message: errors[0], errors });
  }

  // 외부 메일 서비스 상태와 무관하게 검증된 상담 정보는 먼저 Heroku 로그에 확정 기록한다.
  console.log('[contact-lead-received]', JSON.stringify(lead));

  try {
    const delivery = await notifyContactLead(lead);
    const deliveryPending = !delivery.emailDelivered;
    console.log('[contact-lead]', JSON.stringify({ ...lead, ...delivery, deliveryPending }));
    if (deliveryPending) scheduleContactLeadRetry(lead);
    return sendJson(res, deliveryPending ? 202 : 200, {
      ok: true,
      leadId: lead.leadId,
      receivedAt: lead.requestedAt,
      deliveryPending,
    });
  } catch (error) {
    console.error('[contact-lead-delivery-unexpected-error]', lead.leadId, error.message);
    scheduleContactLeadRetry(lead);
    return sendJson(res, 202, {
      ok: true,
      leadId: lead.leadId,
      receivedAt: lead.requestedAt,
      deliveryPending: true,
    });
  }
}

async function handleLeadRequest(req, res) {
  const ip = getClientIp(req);
  if (!consumeLeadRateLimit(ip)) {
    return sendJson(res, 429, { message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    const status = error.message === 'REQUEST_TOO_LARGE' ? 413 : 400;
    return sendJson(res, status, { message: '요청 형식을 확인해 주세요.' });
  }

  const lead = {
    leadId: createBrochureLeadId(),
    company: cleanText(body.company, 100),
    name: cleanText(body.name, 40),
    email: cleanText(body.email, 160).toLowerCase(),
    phone: cleanText(body.phone, 30),
    product: cleanText(body.product, 80),
    resource: cleanText(body.resource, 240),
    sourcePage: cleanText(body.sourcePage, 500),
    requestedAt: new Date().toISOString(),
    ip,
    userAgent: cleanText(req.headers['user-agent'], 300),
  };

  const isPrintResource = lead.resource === 'print:solution-brochure';
  const resourcePath = isPrintResource ? null : resolveLeadResource(lead.resource);

  if (body.website || !body.consent || !isPlausibleCompany(lead.company) || !isPlausibleName(lead.name) || !isValidEmail(lead.email) || !lead.product) {
    return sendJson(res, 400, { message: '필수 입력값을 확인해 주세요.' });
  }
  if (!isPrintResource && !resourcePath) {
    return sendJson(res, 404, { message: '요청한 자료를 찾을 수 없습니다.' });
  }

  try {
    const delivered = await notifyLead(lead);
    console.log('[brochure-lead]', JSON.stringify({ ...lead, delivered }));
    let downloadUrl = null;
    if (!isPrintResource) {
      const expires = Date.now() + (15 * 60 * 1000);
      const token = createDownloadToken(lead.resource, expires);
      const params = new URLSearchParams({ resource: lead.resource, expires: String(expires), token });
      downloadUrl = `/api/download?${params.toString()}`;
    }
    return sendJson(res, 200, { ok: true, leadId: lead.leadId, receivedAt: lead.requestedAt, downloadUrl });
  } catch (error) {
    console.error('[brochure-lead-error]', lead.leadId, error);
    return sendJson(res, 502, { message: '자료 요청 알림을 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.' });
  }
}

function handleProtectedDownload(req, res, requestUrl) {
  const resource = requestUrl.searchParams.get('resource') || '';
  const expires = Number(requestUrl.searchParams.get('expires'));
  const token = requestUrl.searchParams.get('token') || '';
  const filePath = resolveLeadResource(resource);

  if (!filePath || !isValidDownloadToken(resource, expires, token)) {
    return sendJson(res, 403, { message: '다운로드 링크가 만료되었거나 올바르지 않습니다.' });
  }

  const encodedName = encodeURIComponent(basename(filePath));
  return sendFile(req, res, filePath, {
    'Cache-Control': 'private, no-store',
    'Content-Disposition': `attachment; filename*=UTF-8''${encodedName}`,
  });
}

createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', 'http://localhost');

  if (req.method === 'POST' && requestUrl.pathname === '/api/brochure-leads') {
    return handleLeadRequest(req, res);
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/contact-leads') {
    return handleContactLeadRequest(req, res);
  }

  if ((req.method === 'GET' || req.method === 'HEAD') && requestUrl.pathname === '/api/download') {
    return handleProtectedDownload(req, res, requestUrl);
  }

  if ((req.method === 'GET' || req.method === 'HEAD') && requestUrl.pathname.startsWith('/brochures/')) {
    return sendJson(res, 403, { message: '자료 다운로드 전 간단한 정보를 입력해 주세요.' });
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD, POST' });
    return res.end('Method Not Allowed');
  }

  try {
    const filePath = resolveRequestPath(req.url || '/');
    if (!filePath) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not Found');
    }
    return sendFile(req, res, filePath);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad Request');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Papsnet homepage is listening on port ${port}`);
});
