const form = document.querySelector('#contactForm');
const params = new URLSearchParams(window.location.search);
const leadType = params.get('type') || 'contact';
const requestedProduct = params.get('product') || '';
const startedAt = Date.now();
const entryPage = document.referrer || window.location.href;
const freeEmailDomains = new Set(['gmail.com', 'naver.com', 'daum.net', 'hanmail.net', 'nate.com', 'outlook.com', 'hotmail.com']);

const typeCopy = {
  diagnosis: {
    kicker: 'PLM FLOW DIAGNOSIS',
    title: '현재 업무의<br>단절 지점을 찾습니다.',
    lede: '도면, 품번, BOM, 프로젝트와 원가 흐름을 기준으로 우선 진단할 범위를 정리합니다.',
  },
  demo: {
    kicker: 'CLIP PLM DEMO',
    title: '실제 화면으로<br>업무 흐름을 확인하세요.',
    lede: '관심 제품과 현재 시스템을 알려주시면 업무에 맞는 데모 범위를 준비합니다.',
  },
  consult: {
    kicker: 'CLIP PLM CONSULTATION',
    title: '도입 범위를<br>함께 정리하겠습니다.',
    lede: '현재 사용 중인 도면, BOM, 프로젝트, 원가 흐름을 기준으로 구축 순서를 확인합니다.',
  },
  product: {
    kicker: 'PRODUCT CONSULTATION',
    title: '필요한 기능과<br>연동 범위를 확인합니다.',
    lede: '선택한 제품을 현재 CAD, ERP, MES 환경에 적용하는 방법을 함께 검토합니다.',
  },
};

const copy = typeCopy[leadType] || typeCopy.consult;
document.querySelector('#contactKicker').textContent = copy.kicker;
document.querySelector('#contactTitle').innerHTML = copy.title;
document.querySelector('#contactLede').textContent = copy.lede;
document.querySelector('#leadType').value = leadType;
document.querySelector('#startedAt').value = String(startedAt);

if (requestedProduct) {
  const requested = [...form.querySelectorAll('input[name="products"]')]
    .find(input => input.value.toLowerCase() === requestedProduct.toLowerCase());
  if (requested) requested.checked = true;
}

let formStarted = false;
form.addEventListener('input', event => {
  if (!formStarted && event.isTrusted) {
    formStarted = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'form_start', form_id: 'plm_contact', lead_type: leadType });
  }
});

const emailInput = document.querySelector('#companyEmail');
const emailHint = document.querySelector('#emailHint');
emailInput.addEventListener('input', () => {
  const domain = emailInput.value.split('@')[1]?.toLowerCase();
  const isFreeEmail = domain && freeEmailDomains.has(domain);
  emailHint.textContent = isFreeEmail
    ? '회사 이메일을 입력하시면 담당자 배정이 더 빠릅니다. 개인 이메일로도 접수할 수 있습니다.'
    : '회신 가능한 업무 이메일을 입력해 주세요.';
  emailHint.classList.toggle('is-warning', Boolean(isFreeEmail));
});

const setStatus = (message, type = '') => {
  const status = document.querySelector('#formStatus');
  status.textContent = message;
  status.className = `form-status ${type}`.trim();
};

form.addEventListener('submit', async event => {
  event.preventDefault();
  const productInputs = [...form.querySelectorAll('input[name="products"]:checked')];
  const productError = document.querySelector('#productError');
  productError.textContent = productInputs.length ? '' : '관심 제품을 한 개 이상 선택해 주세요.';

  if (!form.reportValidity() || !productInputs.length) {
    setStatus('필수 입력 항목을 확인해 주세요.', 'is-error');
    return;
  }

  const data = new FormData(form);
  const products = productInputs.map(input => input.value);
  const payload = {
    company: data.get('company'),
    name: data.get('name'),
    departmentTitle: data.get('departmentTitle'),
    phone: data.get('phone'),
    email: data.get('email'),
    products,
    product: products.join(', '),
    companySize: data.get('companySize'),
    implementationTiming: data.get('implementationTiming'),
    currentSystems: data.get('currentSystems'),
    message: data.get('message'),
    leadType,
    consent: data.get('consent') === 'on',
    consentAt: new Date().toISOString(),
    startedAt,
    website: data.get('website'),
    sourcePage: entryPage,
    formPage: window.location.href,
  };

  const button = document.querySelector('#submitButton');
  button.disabled = true;
  button.classList.add('is-loading');
  button.querySelector('span:first-child').textContent = '접수 중';
  setStatus('입력 내용을 안전하게 전송하고 있습니다.');

  try {
    const response = await fetch('/api/contact-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || '상담 요청을 접수하지 못했습니다.');

    const conversion = {
      leadId: result.leadId,
      type: leadType,
      products,
      submittedAt: Date.now(),
      deliveryPending: Boolean(result.deliveryPending),
    };
    sessionStorage.setItem('papsnetLeadConversion', JSON.stringify(conversion));
    const next = new URL('contact-complete.html', window.location.href);
    next.searchParams.set('lead', result.leadId);
    next.searchParams.set('type', leadType);
    window.location.assign(next.href);
  } catch (error) {
    setStatus(error.message || '전송 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'is-error');
    button.disabled = false;
    button.classList.remove('is-loading');
    button.querySelector('span:first-child').textContent = '도입 상담 접수';
  }
});
