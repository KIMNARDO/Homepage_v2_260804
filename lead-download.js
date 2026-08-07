import './lead-download.css';

const PRODUCT_BY_FILE = {
  'AI_CADWin_브로슈어.pdf': 'AI CADWin',
  'Clip_PDM_브로슈어.pdf': 'Clip PDM',
  'Clip_PMS_브로슈어.pdf': 'Clip PMS',
  'Multi-BOM_브로슈어.pdf': 'Clip Multi-BOM EPL',
  'Clip_CMS_브로슈어.pdf': 'Clip CMS',
};

function inferProduct(resource, explicitProduct) {
  if (explicitProduct) return explicitProduct;
  const fileName = decodeURIComponent(String(resource || '').split('/').pop() || '');
  return PRODUCT_BY_FILE[fileName] || 'Clip PLM 솔루션 브로슈어';
}

function createLeadDialog() {
  const dialog = document.createElement('dialog');
  dialog.className = 'lead-download-dialog';
  dialog.setAttribute('aria-labelledby', 'leadDownloadTitle');
  dialog.innerHTML = `
    <form class="lead-download-form" data-lead-download-form novalidate>
      <aside class="lead-download-aside" aria-hidden="true">
        <div>
          <p class="lead-download-kicker">CLIP PLM · RESOURCE</p>
          <strong>제품 자료를 보내드릴 준비가 됐습니다.</strong>
        </div>
        <ul>
          <li>선택한 제품 자료 즉시 다운로드</li>
          <li>도입 환경에 맞춘 후속 안내</li>
          <li>입력 정보는 리드 확인 목적으로만 사용</li>
        </ul>
        <p class="lead-download-step">01 / DOWNLOAD REQUEST</p>
      </aside>
      <div class="lead-download-main">
        <button class="lead-download-close" type="button" data-lead-download-close aria-label="닫기">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>
        <h2 class="lead-download-heading" id="leadDownloadTitle">간단한 정보 입력 후<br>자료를 확인하세요.</h2>
        <p class="lead-download-intro">필수 항목 세 가지만 입력하면 다운로드가 바로 시작됩니다.</p>
        <div class="lead-download-fields">
          <label class="lead-download-field">
            <span>회사명 *</span>
            <input name="company" autocomplete="organization" maxlength="100" required>
          </label>
          <label class="lead-download-field">
            <span>담당자명 *</span>
            <input name="name" autocomplete="name" maxlength="40" required>
          </label>
          <label class="lead-download-field lead-download-field--wide">
            <span>업무 이메일 *</span>
            <input name="email" type="email" autocomplete="email" maxlength="160" inputmode="email" required>
          </label>
          <label class="lead-download-field">
            <span>연락처</span>
            <input name="phone" type="tel" autocomplete="tel" maxlength="30" inputmode="tel" placeholder="선택 입력">
          </label>
          <label class="lead-download-field">
            <span>선택 자료</span>
            <input name="product" readonly>
          </label>
          <label class="lead-download-honeypot" aria-hidden="true">
            <span>웹사이트</span>
            <input name="website" tabindex="-1" autocomplete="off">
          </label>
        </div>
        <label class="lead-download-consent">
          <input name="consent" type="checkbox" required>
          <span>자료 제공과 관련 안내를 위해 회사명, 이름, 이메일, 접속 정보를 수집·이용하는 데 동의합니다. *</span>
        </label>
        <div class="lead-download-actions">
          <p class="lead-download-status" data-lead-download-status role="status">제출 즉시 다운로드가 시작됩니다.</p>
          <button class="lead-download-submit" type="submit">자료 다운로드</button>
        </div>
      </div>
    </form>
  `;
  document.body.append(dialog);
  return dialog;
}

function initLeadDownloads() {
  const triggers = [...document.querySelectorAll(
    'a[download][href*="brochures/"], [data-lead-download]'
  )];
  if (!triggers.length) return;

  const dialog = createLeadDialog();
  const form = dialog.querySelector('[data-lead-download-form]');
  const closeButton = dialog.querySelector('[data-lead-download-close]');
  const status = dialog.querySelector('[data-lead-download-status]');
  const submitButton = form.querySelector('.lead-download-submit');
  const productInput = form.elements.product;
  let activeRequest = null;
  let lastTrigger = null;

  const closeDialog = () => {
    if (dialog.open) dialog.close();
  };

  const setStatus = (message, state = '') => {
    status.textContent = message;
    status.dataset.state = state;
  };

  const openDialog = (trigger) => {
    const isPrint = trigger.dataset.leadAction === 'print';
    const resource = isPrint
      ? 'print:solution-brochure'
      : decodeURIComponent(new URL(trigger.getAttribute('href'), window.location.href).pathname);
    const product = inferProduct(resource, trigger.dataset.product);

    activeRequest = { resource, product, action: isPrint ? 'print' : 'download' };
    lastTrigger = trigger;
    form.reset();
    productInput.value = product;
    setStatus('제출 즉시 다운로드가 시작됩니다.');
    submitButton.disabled = false;
    submitButton.textContent = isPrint ? 'PDF 인쇄 열기' : '자료 다운로드';
    document.body.classList.add('lead-download-open');
    dialog.showModal();
    requestAnimationFrame(() => form.elements.company.focus());
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openDialog(trigger);
    });
  });

  closeButton.addEventListener('click', closeDialog);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('lead-download-open');
    activeRequest = null;
    lastTrigger?.focus();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeRequest || submitButton.disabled) return;

    if (!form.reportValidity()) {
      setStatus('필수 항목과 개인정보 동의를 확인해 주세요.', 'error');
      return;
    }

    const values = new FormData(form);
    const payload = {
      company: String(values.get('company') || '').trim(),
      name: String(values.get('name') || '').trim(),
      email: String(values.get('email') || '').trim(),
      phone: String(values.get('phone') || '').trim(),
      website: String(values.get('website') || ''),
      consent: values.get('consent') === 'on',
      product: activeRequest.product,
      resource: activeRequest.resource,
      sourcePage: window.location.href,
    };

    submitButton.disabled = true;
    submitButton.textContent = '자료 준비 중...';
    setStatus('요청을 안전하게 접수하고 있습니다.');

    try {
      const response = await fetch('/api/brochure-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || '요청을 처리하지 못했습니다.');

      setStatus('접수되었습니다. 자료를 여는 중입니다.', 'success');

      if (activeRequest.action === 'print') {
        window.setTimeout(() => window.print(), 250);
      } else if (result.downloadUrl) {
        const downloadLink = document.createElement('a');
        downloadLink.href = result.downloadUrl;
        downloadLink.download = '';
        document.body.append(downloadLink);
        downloadLink.click();
        downloadLink.remove();
      } else {
        throw new Error('다운로드 링크를 발급하지 못했습니다.');
      }

      window.setTimeout(closeDialog, 900);
    } catch (error) {
      setStatus(error.message || '잠시 후 다시 시도해 주세요.', 'error');
      submitButton.disabled = false;
      submitButton.textContent = activeRequest?.action === 'print' ? 'PDF 인쇄 열기' : '다시 시도';
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLeadDownloads, { once: true });
} else {
  initLeadDownloads();
}
