import { products } from './home-products-data.js';

export function initProductHighlights(onChange = () => {}) {
  const section = document.querySelector('.hp-products');
  if (!section) return () => {};
  initResultLoop(section);
  const panel = section.querySelector('#product-summary');
  const tabs = [...section.querySelectorAll('[data-product-tab]')];
  const find = key => section.querySelector(`[data-product-${key}]`);
  function showScreen(data, view) {
    find('screen').src = view.image;
    find('screen').alt = view.caption;
    find('caption').textContent = view.caption + (data.views ? ' · 원본 자료의 실제 화면' + (view.redacted ? ' / 일부 식별정보 비공개' : '') : '');
    section.querySelectorAll('[data-product-fullscreen]').forEach(link => {
      link.href = view.image;
      link.setAttribute('aria-label', `${view.caption} 크게 보기`);
    });
  }
  function select(key) {
    const data = products[key];
    if (!data) return;
    if (key !== '2d') section.querySelector('#viewer-demo video')?.pause();
    section.dataset.product = key;
    section.style.setProperty('--hp-accent', data.color);
    find('name').textContent = data.name;
    find('tag').textContent = data.tag;
    find('title').textContent = data.title;
    find('copy').textContent = data.copy;
    find('scope').textContent = data.scope;
    const mediaLabel = section.querySelector('[data-product-media-label]');
    if (mediaLabel) mediaLabel.textContent = data.mediaLabel || 'PRODUCT IN ACTION';
    const workflow = find('workflow');
    workflow.hidden = !data.workflow;
    workflow.replaceChildren();
    (data.workflow || []).forEach(label => { const item = document.createElement('li'); item.textContent = label; workflow.appendChild(item); });
    find('caption').textContent = data.shot;
    const art = find('art');
    art.hidden = !data.art;
    if (data.art) { art.src = data.art; art.alt = `${data.name} 제품 이미지`; }
    const views = find('views');
    const viewCopy = find('view-copy');
    views.replaceChildren();
    views.setAttribute('aria-label', `${data.name} 기능별 실제 화면`);
    views.hidden = !data.views;
    viewCopy.hidden = !data.views;
    viewCopy.textContent = '';
    showScreen(data, {image: data.image, caption: data.shot});
    if (data.views) {
      const chooseView = (view, selectedButton) => {
        showScreen(data, view);
        viewCopy.textContent = view.copy;
        [...views.children].forEach(button => button.setAttribute('aria-pressed', String(button === selectedButton)));
      };
      data.views.forEach((view, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = view.label;
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => chooseView(view, button));
        views.appendChild(button);
        if (i === 0) chooseView(view, button);
      });
    }
    section.querySelectorAll('[data-product-feature]').forEach((item, i) => {
      item.querySelector('b').textContent = data.features[i][0];
      item.querySelector('p').textContent = data.features[i][1];
    });
    find('consult').href = `contact.html?${new URLSearchParams({type: 'demo', product: data.product})}`;
    find('consult').textContent = data.consultLabel || '맞춤 데모 상담 ↗';
    find('detail').href = data.href;
    const download = find('download');
    download.hidden = !data.pdf;
    if (data.pdf) {
      download.href = data.pdf;
      download.dataset.product = data.product;
      download.setAttribute('aria-label', `${data.name} 제품 소개 PDF 다운로드`);
    } else {
      download.removeAttribute('href');
      download.removeAttribute('aria-label');
    }
    tabs.forEach(tab => {
      const active = tab.dataset.productTab === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tabs.some(tab => tab.dataset.productTab === key) ? `product-tab-${key}` : 'product-highlight-title');
    onChange(key);
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab.dataset.productTab));
    tab.addEventListener('keydown', event => {
      const directions = {ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1};
      let index;
      if (event.key in directions) index = (i + directions[event.key] + tabs.length) % tabs.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = tabs.length - 1;
      else return;
      event.preventDefault(); tabs[index].focus(); select(tabs[index].dataset.productTab);
    });
  });
  find('title').id = 'product-highlight-title';
  const requestedProduct = new URL(window.location.href).searchParams.get('product');
  select(Object.hasOwn(products, requestedProduct) ? requestedProduct : '2d');
  return select;
}

function initResultLoop(section) {
  const video = section.querySelector('#plm-result-loop');
  const button = section.querySelector('[data-result-play]');
  if (!video || !button) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let wantsPlayback = !motion.matches;
  let visible = false;
  function sync() {
    if (wantsPlayback && visible && !document.hidden) video.play().catch(() => {});
    else video.pause();
  }
  function label() { button.textContent = video.paused ? '재생' : '일시정지'; }
  video.addEventListener('play', label);
  video.addEventListener('pause', label);
  button.hidden = false;
  button.addEventListener('click', () => { wantsPlayback = video.paused; sync(); });
  motion.addEventListener('change', () => { wantsPlayback = !motion.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }, {threshold:0.15}).observe(video);
}
