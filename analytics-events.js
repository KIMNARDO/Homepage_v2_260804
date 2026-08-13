const pushAnalyticsEvent = (event, details = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...details });
};

document.addEventListener('click', event => {
  const phoneLink = event.target.closest('a[href^="tel:"]');
  if (!phoneLink) return;

  pushAnalyticsEvent('phone_click', {
    phone_number: phoneLink.getAttribute('href').replace(/^tel:/, ''),
    link_text: phoneLink.textContent.trim(),
    page_path: window.location.pathname,
  });
});

if (/\/brochure(?:\.html)?$/i.test(window.location.pathname)) {
  pushAnalyticsEvent('brochure_view', {
    page_path: window.location.pathname,
    page_title: document.title,
  });
}

window.papsnetAnalytics = { push: pushAnalyticsEvent };
