// Screens change only when a reader selects a feature.
for (const gallery of document.querySelectorAll('[data-viewer-gallery]')) {
  const tabs = [...gallery.querySelectorAll('.viewer-demo-tab')];
  const image = gallery.querySelector('[data-viewer-image]');
  let active = Math.max(0, tabs.findIndex(tab => tab.classList.contains('active')));
  let request = 0;
  function select(next) {
    const tab = tabs[next];
    if (!tab || !image) return;
    active = next;
    const token = ++request;
    tabs.forEach((button, i) => {
      button.classList.toggle('active', i === active);
      button.setAttribute('aria-selected', String(i === active));
      button.tabIndex = i === active ? 0 : -1;
    });
    const preview = new Image();
    preview.onload = () => {
      // A slower image from a previous selection must not replace the current view.
      if (token !== request) return;
      image.src = tab.dataset.image;
      image.alt = tab.dataset.alt || '';
      for (const [key, value] of Object.entries({label: (tab.dataset.label || '').toUpperCase(), index: String(next + 1).padStart(2, '0'), title: tab.dataset.title, copy: tab.dataset.copy})) {
        const node = gallery.querySelector(`[data-viewer-${key}]`);
        if (node) node.textContent = value || '';
      }
    };
    preview.onerror = () => {
      if (token !== request) return;
      const copy = gallery.querySelector('[data-viewer-copy]');
      if (copy) copy.textContent = '화면을 불러오지 못했습니다. 다른 항목을 선택하거나 다시 시도해 주세요.';
    };
    preview.src = tab.dataset.image;
    const rail = tab.parentElement;
    if (rail.scrollWidth > rail.clientWidth) rail.scrollTo({left: tab.offsetLeft - Math.max(0, (rail.clientWidth - tab.offsetWidth) / 2)});
  }
  tabs.forEach((tab, i) => {
    tab.tabIndex = i === active ? 0 : -1;
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (active + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1) + tabs.length) % tabs.length;
      select(next); tabs[next].focus();
    });
  });
  gallery.querySelector('[data-viewer-expand]')?.addEventListener('click', () => {
    const dialog = document.querySelector('[data-viewer-lightbox]');
    const full = dialog?.querySelector('[data-viewer-lightbox-image]');
    if (!dialog || !full || !image) return;
    full.src = image.src; full.alt = image.alt; dialog.showModal();
  });
}
const lightbox = document.querySelector('[data-viewer-lightbox]');
lightbox?.querySelector('[data-viewer-lightbox-close]')?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', event => {
  const r = lightbox.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) lightbox.close();
});
