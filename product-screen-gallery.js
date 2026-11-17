import { products } from './home-products-data.js';

for (const gallery of document.querySelectorAll('[data-screen-gallery]')) {
  const data = products[gallery.dataset.screenGallery];
  if (!data?.views) continue;
  const find = key => gallery.querySelector(`[data-screen-${key}]`);
  const buttons = [...gallery.querySelectorAll('[data-screen-index]')];
  function select(index) {
    const view = data.views[index];
    if (!view) return;
    find('title').textContent = view.caption;
    find('copy').textContent = view.copy;
    find('image').src = view.image;
    find('image').alt = view.caption;
    find('zoom').href = view.image;
    find('zoom').setAttribute('aria-label', `${view.caption} 크게 보기`);
    find('caption').textContent = '제품 소개자료의 실제 화면 · 클릭하여 확대' + (view.redacted ? ' / 일부 식별정보 비공개' : '');
    find('points').replaceChildren(...(view.points || []).map(text => {const li = document.createElement('li');li.textContent = text;return li;}));
    buttons.forEach((button,i) => button.setAttribute('aria-pressed',String(i === index)));
  }
  buttons.forEach((button,index) => {
    button.addEventListener('click', () => {
      select(index);
      const id = data.views[index].id;
      if (id) {
        const url = new URL(location.href);
        url.searchParams.set('screen', id);
        history.replaceState(history.state, '', url);
      }
    });
  });
  const requested = new URLSearchParams(location.search).get('screen');
  select(Math.max(0, data.views.findIndex(view => view.id === requested)));
}
