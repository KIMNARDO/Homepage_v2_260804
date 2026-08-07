const { createServer } = require('node:http');
const { createReadStream, statSync } = require('node:fs');
const { createHmac, randomBytes, timingSafeEqual } = require('node:crypto');
const { basename, extname, join, resolve, sep } = require('node:path');

const root = resolve(__dirname, 'dist');
const port = Number(process.env.PORT) || 4173;
const leadNotificationEmail = process.env.LEAD_NOTIFICATION_EMAIL || 'kimnardo@papsnet.net';
const downloadTokenSecret = process.env.DOWNLOAD_TOKEN_SECRET || randomBytes(32).toString('hex');
const leadRateLimits = new Map();

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

async function notifyLead(lead) {
  const attempts = [];
  const channels = [];

  if (process.env.RESEND_API_KEY && process.env.LEAD_FROM_EMAIL) {
    channels.push('email');
    const rows = [
      ['제품', lead.product],
      ['회사', lead.company],
      ['담당자', lead.name],
      ['이메일', lead.email],
      ['연락처', lead.phone || '미입력'],
      ['요청 시각', lead.requestedAt],
      ['유입 페이지', lead.sourcePage],
      ['접속 IP', lead.ip],
    ];
    const htmlRows = rows.map(([label, value]) => `
      <tr><th style="padding:9px 12px;text-align:left;background:#f1f4f2;border:1px solid #dce2df">${escapeHtml(label)}</th>
      <td style="padding:9px 12px;border:1px solid #dce2df">${escapeHtml(value)}</td></tr>`).join('');

    attempts.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.LEAD_FROM_EMAIL,
        to: [leadNotificationEmail],
        reply_to: lead.email,
        subject: `[팹스넷 자료 다운로드] ${lead.company} · ${lead.name} · ${lead.product}`,
        text: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
        html: `<h2 style="font-family:Arial,sans-serif">새 제품 자료 다운로드</h2><table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${htmlRows}</table>`,
      }),
      signal: AbortSignal.timeout(8000),
    }).then(response => {
      if (!response.ok) throw new Error(`Resend notification failed: ${response.status}`);
      return 'email';
    }));
  }

  if (process.env.LEAD_WEBHOOK_URL) {
    channels.push('webhook');
    attempts.push(fetch(process.env.LEAD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'brochure.downloaded', ...lead }),
      signal: AbortSignal.timeout(8000),
    }).then(response => {
      if (!response.ok) throw new Error(`Lead webhook failed: ${response.status}`);
      return 'webhook';
    }));
  }

  if (!attempts.length) {
    console.log('[brochure-lead]', JSON.stringify(lead));
    if (process.env.LEAD_CAPTURE_REQUIRED === 'true') {
      throw new Error('Lead notification is not configured');
    }
    return { configured: false, delivered: ['server-log'] };
  }

  const results = await Promise.allSettled(attempts);
  const delivered = results.filter(result => result.status === 'fulfilled').map(result => result.value);
  results.filter(result => result.status === 'rejected').forEach(result => console.error(result.reason));
  if (!delivered.length) throw new Error(`Lead notification failed for: ${channels.join(', ')}`);
  return { configured: true, delivered };
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

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email);
  const isPrintResource = lead.resource === 'print:solution-brochure';
  const resourcePath = isPrintResource ? null : resolveLeadResource(lead.resource);

  if (body.website || !body.consent || lead.company.length < 2 || lead.name.length < 2 || !isEmail || !lead.product) {
    return sendJson(res, 400, { message: '필수 입력값을 확인해 주세요.' });
  }
  if (!isPrintResource && !resourcePath) {
    return sendJson(res, 404, { message: '요청한 자료를 찾을 수 없습니다.' });
  }

  try {
    const notification = await notifyLead(lead);
    let downloadUrl = null;
    if (!isPrintResource) {
      const expires = Date.now() + (15 * 60 * 1000);
      const token = createDownloadToken(lead.resource, expires);
      const params = new URLSearchParams({ resource: lead.resource, expires: String(expires), token });
      downloadUrl = `/api/download?${params.toString()}`;
    }
    return sendJson(res, 200, { ok: true, downloadUrl, notification });
  } catch (error) {
    console.error('[brochure-lead-error]', error);
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
