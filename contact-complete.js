const params = new URLSearchParams(window.location.search);
let conversion = {};

try {
  conversion = JSON.parse(sessionStorage.getItem('papsnetLeadConversion') || '{}');
} catch {
  conversion = {};
}

const requestedLeadId = params.get('lead') || '';
const isVerifiedSession = Boolean(conversion.leadId && requestedLeadId === conversion.leadId);
const leadId = isVerifiedSession ? conversion.leadId : '접수 완료';
const leadType = params.get('type') || conversion.type || 'contact';
const products = Array.isArray(conversion.products) ? conversion.products : [];
const typeLabels = {
  contact: '도입 문의',
  consult: '도입 상담',
  diagnosis: 'PLM 도입 진단',
  demo: '제품 데모',
  product: '제품 상담',
};

document.querySelector('#leadNumber').textContent = leadId;
document.querySelector('#leadTypeLabel').textContent = typeLabels[leadType] || '도입 상담';
document.querySelector('#leadProducts').textContent = products.length ? products.join(' · ') : '상담 시 확인';

const conversionKey = `papsnetLeadTracked:${conversion.leadId || 'none'}`;
if (isVerifiedSession && !sessionStorage.getItem(conversionKey)) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'generate_lead',
    form_id: 'plm_contact',
    lead_id: leadId,
    lead_type: leadType,
    product_interest: products.join('|'),
    value: 1,
    currency: 'KRW',
  });
  sessionStorage.setItem(conversionKey, '1');
}
