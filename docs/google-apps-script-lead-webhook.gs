/**
 * Papsnet website lead webhook for Google Apps Script.
 *
 * Deployment:
 * 1. Paste this file into the Apps Script project attached to the lead Sheet.
 * 2. Add a Script Property named WEBHOOK_TOKEN with a long random value.
 * 3. Run setupLeadSheets() once as the Sheet owner.
 * 4. Deploy as a Web app (execute as you, access: Anyone).
 * 5. Set LEAD_WEBHOOK_URL to the /exec URL with ?token=<WEBHOOK_TOKEN>.
 */

const LEAD_CONFIG = Object.freeze({
  spreadsheetId: '1zfL3EKl4CsGySmq7Y94oxRc65gulGrhjdVX0fLITIg8',
  contactSheet: '상담문의',
  downloadSheet: '자료다운로드',
  primaryEmail: 'kimnardo@papsnet.net',
  backupEmail: 'kimnardo98@gmail.com',
  timeZone: 'Asia/Seoul',
});

const CONTACT_HEADERS = Object.freeze([
  '접수 ID',
  '접수 일시 (KST)',
  '문의 유형',
  '회사명',
  '이름',
  '부서 / 직책',
  '연락처',
  '회사 이메일',
  '이메일 유형',
  '관심 제품',
  '회사 규모',
  '도입 예정 시기',
  '현재 사용 시스템',
  '연락 가능 시간',
  '문의 내용',
  '개인정보 동의 시각',
  '유입 페이지',
  '문의 작성 페이지',
  '알림 메일 상태',
  '처리 상태',
  '담당자',
  '후속 연락일',
  '영업 메모',
]);

const DOWNLOAD_HEADERS = Object.freeze([
  '다운로드 ID',
  '다운로드 일시 (KST)',
  '선택 자료 / 제품',
  '요청 파일',
  '회사명',
  '이름',
  '연락처',
  '회사 이메일',
  '유입 페이지',
  '알림 메일 상태',
  '영업 확인 상태',
  '담당자',
  '메모',
]);

function setupLeadSheets() {
  const spreadsheet = SpreadsheetApp.openById(LEAD_CONFIG.spreadsheetId);
  spreadsheet.setSpreadsheetTimeZone(LEAD_CONFIG.timeZone);

  const contactSheet = ensureLeadSheet_(spreadsheet, LEAD_CONFIG.contactSheet, CONTACT_HEADERS, true);
  const downloadSheet = ensureLeadSheet_(spreadsheet, LEAD_CONFIG.downloadSheet, DOWNLOAD_HEADERS, true);

  applyDropdown_(contactSheet, 20, ['신규', '1차 연락', '상담 진행', '제안 준비', '보류', '완료']);
  applyDropdown_(downloadSheet, 11, ['미확인', '확인', '후속 연락', '완료']);

  contactSheet.setColumnWidth(1, 170);
  contactSheet.setColumnWidth(2, 155);
  contactSheet.setColumnWidths(3, 13, 145);
  contactSheet.setColumnWidth(15, 360);
  contactSheet.setColumnWidths(17, 2, 250);
  contactSheet.setColumnWidths(19, 5, 135);

  downloadSheet.setColumnWidth(1, 170);
  downloadSheet.setColumnWidth(2, 155);
  downloadSheet.setColumnWidths(3, 6, 170);
  downloadSheet.setColumnWidth(9, 260);
  downloadSheet.setColumnWidths(10, 4, 140);

  return `준비 완료: ${LEAD_CONFIG.contactSheet}, ${LEAD_CONFIG.downloadSheet}`;
}

function doGet(e) {
  try {
    assertWebhookToken_(e);
    return jsonOutput_({ ok: true, service: 'papsnet-lead-webhook' });
  } catch (error) {
    return jsonOutput_({ ok: false, message: error.message });
  }
}

function doPost(e) {
  let lock;

  try {
    assertWebhookToken_(e);
    const payload = parsePayload_(e);
    const event = String(payload.event || '');
    const leadId = safeCell_(payload.leadId, 80);

    if (!['contact.requested', 'brochure.downloaded'].includes(event)) {
      throw new Error('지원하지 않는 이벤트입니다.');
    }
    if (!/^(PLM|DL)-\d{8}-[A-F0-9]{6}$/.test(leadId)) {
      throw new Error('접수 ID 형식이 올바르지 않습니다.');
    }

    const spreadsheet = SpreadsheetApp.openById(LEAD_CONFIG.spreadsheetId);
    const isContact = event === 'contact.requested';
    const headers = isContact ? CONTACT_HEADERS : DOWNLOAD_HEADERS;
    const sheetName = isContact ? LEAD_CONFIG.contactSheet : LEAD_CONFIG.downloadSheet;
    const statusColumn = isContact ? 19 : 10;
    const sheet = ensureLeadSheet_(spreadsheet, sheetName, headers);

    lock = LockService.getScriptLock();
    lock.waitLock(10000);

    const existingCell = sheet
      .getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1)
      .createTextFinder(leadId)
      .matchEntireCell(true)
      .findNext();
    const duplicate = Boolean(existingCell);
    const rowNumber = existingCell ? existingCell.getRow() : appendLead_(sheet, event, payload);
    const existingEmailStatus = String(sheet.getRange(rowNumber, statusColumn).getDisplayValue() || '');
    const emailAlreadySent = existingEmailStatus.indexOf('전송 완료') === 0;

    lock.releaseLock();
    lock = null;

    let emailSent = emailAlreadySent;
    let emailError = '';
    const notificationRequested = payload.notificationRequested !== false;

    if (notificationRequested && !emailAlreadySent) {
      try {
        sendLeadEmail_(event, payload);
        emailSent = true;
        updateEmailStatus_(sheet, rowNumber, statusColumn, `전송 완료 · ${formatNow_()}`);
      } catch (error) {
        emailError = String(error.message || error).slice(0, 180);
        updateEmailStatus_(sheet, rowNumber, statusColumn, `전송 실패 · ${formatNow_()}`);
      }
    } else if (!notificationRequested && !existingEmailStatus) {
      updateEmailStatus_(sheet, rowNumber, statusColumn, '외부 알림 채널 사용');
    }

    return jsonOutput_({
      ok: true,
      stored: true,
      duplicate,
      emailSent,
      emailError,
      leadId,
      sheet: sheetName,
    });
  } catch (error) {
    return jsonOutput_({ ok: false, stored: false, emailSent: false, message: String(error.message || error) });
  } finally {
    if (lock) lock.releaseLock();
  }
}

function ensureLeadSheet_(spreadsheet, name, headers, configure) {
  let sheet = spreadsheet.getSheetByName(name);
  const created = !sheet;
  if (created) sheet = spreadsheet.insertSheet(name);

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (!configure && !created) return sheet;

  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#10272d')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 36);

  const existingFilter = sheet.getFilter();
  if (existingFilter) existingFilter.remove();
  sheet.getRange(1, 1, sheet.getMaxRows(), headers.length).createFilter();
  return sheet;
}

function applyDropdown_(sheet, column, values) {
  const validation = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, column, sheet.getMaxRows() - 1, 1).setDataValidation(validation);
}

function appendLead_(sheet, event, payload) {
  const isContact = event === 'contact.requested';
  const values = isContact ? buildContactRow_(payload) : buildDownloadRow_(payload);
  sheet.appendRow(values);
  const rowNumber = sheet.getLastRow();
  sheet.getRange(rowNumber, 1, 1, values.length)
    .setVerticalAlignment('top')
    .setWrap(true);
  return rowNumber;
}

function buildContactRow_(lead) {
  return [
    safeCell_(lead.leadId, 80),
    formatLeadDate_(lead.requestedAt),
    safeCell_(lead.leadType, 30),
    safeCell_(lead.company, 100),
    safeCell_(lead.name, 60),
    safeCell_(lead.departmentTitle, 100),
    safeCell_(lead.phone, 40),
    safeCell_(lead.email, 180),
    lead.isFreeEmail ? '개인 이메일' : '회사 이메일',
    safeCell_(Array.isArray(lead.products) ? lead.products.join(', ') : lead.product, 300),
    safeCell_(lead.companySize, 60),
    safeCell_(lead.implementationTiming, 60),
    safeCell_(lead.currentSystems, 300),
    safeCell_(lead.contactTime, 60),
    safeCell_(lead.message, 1500),
    formatLeadDate_(lead.consentAt),
    safeCell_(lead.sourcePage, 500),
    safeCell_(lead.formPage, 500),
    '',
    '신규',
    '',
    '',
    '',
  ];
}

function buildDownloadRow_(lead) {
  return [
    safeCell_(lead.leadId, 80),
    formatLeadDate_(lead.requestedAt),
    safeCell_(lead.product, 160),
    safeCell_(lead.resource, 300),
    safeCell_(lead.company, 100),
    safeCell_(lead.name, 60),
    safeCell_(lead.phone, 40),
    safeCell_(lead.email, 180),
    safeCell_(lead.sourcePage, 500),
    '',
    '미확인',
    '',
    '',
  ];
}

function sendLeadEmail_(event, lead) {
  const isContact = event === 'contact.requested';
  const rows = isContact ? [
    ['접수번호', lead.leadId],
    ['회사명', lead.company],
    ['담당자명', lead.name],
    ['부서 / 직책', lead.departmentTitle || '-'],
    ['연락처', lead.phone],
    ['업무 이메일', lead.email],
    ['관심 제품', Array.isArray(lead.products) ? lead.products.join(', ') : lead.product],
    ['회사 규모', lead.companySize || '-'],
    ['도입 검토 시기', lead.implementationTiming || '-'],
    ['현재 사용 시스템', lead.currentSystems || '-'],
    ['연락 가능 시간', lead.contactTime || '-'],
    ['문의 내용', lead.message || '-'],
    ['접수 시각', formatLeadDate_(lead.requestedAt)],
    ['유입 페이지', lead.sourcePage],
  ] : [
    ['접수번호', lead.leadId],
    ['선택 자료', lead.product],
    ['회사명', lead.company],
    ['담당자명', lead.name],
    ['업무 이메일', lead.email],
    ['연락처', lead.phone || '-'],
    ['요청 파일', lead.resource],
    ['요청 시각', formatLeadDate_(lead.requestedAt)],
    ['유입 페이지', lead.sourcePage],
  ];
  const subjectPrefix = isContact ? 'Clip PLM 상담' : 'Clip PLM 자료 다운로드';
  const subject = `[${subjectPrefix} ${safeCell_(lead.leadId, 80)}] ${safeCell_(lead.company, 100)} · ${safeCell_(lead.name, 60)}`;
  const textBody = rows.map(row => `${row[0]}: ${safeCell_(row[1], 1500)}`).join('\n');
  const htmlRows = rows.map(row => `<tr><th style="padding:9px 12px;text-align:left;background:#eef3f2;border:1px solid #d5dfdc">${escapeHtml_(row[0])}</th><td style="padding:9px 12px;border:1px solid #d5dfdc">${escapeHtml_(row[1])}</td></tr>`).join('');

  MailApp.sendEmail({
    to: LEAD_CONFIG.primaryEmail,
    bcc: LEAD_CONFIG.backupEmail,
    replyTo: safeCell_(lead.email, 180),
    subject,
    body: textBody,
    htmlBody: `<h2 style="font-family:Arial,sans-serif">${escapeHtml_(subjectPrefix)} 접수</h2><table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${htmlRows}</table>`,
    name: 'Papsnet Website',
  });
}

function updateEmailStatus_(sheet, rowNumber, columnNumber, value) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet.getRange(rowNumber, columnNumber).setValue(value);
  } finally {
    lock.releaseLock();
  }
}

function assertWebhookToken_(e) {
  const expected = PropertiesService.getScriptProperties().getProperty('WEBHOOK_TOKEN');
  const provided = e && e.parameter ? String(e.parameter.token || '') : '';
  if (!expected || provided !== expected) throw new Error('인증되지 않은 요청입니다.');
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) throw new Error('요청 본문이 없습니다.');
  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error('JSON 요청 형식이 올바르지 않습니다.');
  }
}

function safeCell_(value, maxLength) {
  let text = String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  text = text.slice(0, maxLength || 500);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return text;
}

function formatLeadDate_(value) {
  const date = value ? new Date(value) : new Date();
  return Utilities.formatDate(Number.isNaN(date.getTime()) ? new Date() : date, LEAD_CONFIG.timeZone, 'yyyy-MM-dd HH:mm:ss');
}

function formatNow_() {
  return Utilities.formatDate(new Date(), LEAD_CONFIG.timeZone, 'yyyy-MM-dd HH:mm:ss');
}

function escapeHtml_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function jsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
