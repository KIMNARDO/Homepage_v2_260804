import newsData from './content/news.json';
import { escapeHtml as e, validateNews, visibleNews, getNewsPage, renderNewsItems, newsMeta, newsCover } from './news-renderer.mjs';

const section = document.querySelector('#news');

if (section) {
  validateNews(newsData);
  const items = visibleNews(newsData);
  const content = section.querySelector('[data-news-content]');
  const filters = section.querySelector('[data-news-filters]');
  const pagination = section.querySelector('[data-news-pagination]');
  const status = section.querySelector('[data-news-status]');
  const dialog = document.querySelector('[data-news-dialog]');
  const dialogBody = dialog.querySelector('[data-news-body]');
  const dialogTitle = dialog.querySelector('#newsDialogTitle');
  const events = new AbortController();
  const { signal } = events;
  let category = 'all';
  let page = 0;
  let activeItem;
  let photoIndex = 0;
  let opener;

  function renderList() {
    const result = getNewsPage(newsData, category, page);
    const { pages, total } = result;
    page = result.page;
    content.innerHTML = renderNewsItems(result.items, newsData);
    filters.querySelectorAll('[data-news-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.newsFilter === category)));
    pagination.hidden = pages <= 1;
    pagination.querySelector('[data-news-page-label]').textContent = `${page + 1} / ${pages}`;
    pagination.querySelector('[data-news-previous]').disabled = page === 0;
    pagination.querySelector('[data-news-next]').disabled = page === pages - 1;
    status.textContent = `${total}개의 소식${pages > 1 ? ` · ${page + 1} / ${pages} 페이지` : ''}`;
  }

  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-news-filter]');
    if (!button) return;
    category = button.dataset.newsFilter;
    page = 0;
    renderList();
  }, { signal });
  pagination.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    page += button.hasAttribute('data-news-next') ? 1 : -1;
    renderList();
    content.querySelector('a')?.focus({ preventScroll: true });
    section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }, { signal });

  function renderGallery(item) {
    const photo = item.photos[0];
    return `<div class="news-gallery" aria-label="강의 사진">
      <figure><img data-news-photo src="${e(photo.src)}" alt="${e(photo.alt)}" width="1280" height="960"><figcaption aria-live="polite"><span data-news-photo-caption>${e(photo.caption)}</span><span data-news-photo-counter>1 / ${item.photos.length}</span></figcaption></figure>
      <div class="news-gallery-controls"><button type="button" data-news-photo-previous aria-label="이전 강의 사진"><span class="material-symbols-rounded" aria-hidden="true">chevron_left</span></button><div class="news-gallery-thumbnails" role="group" aria-label="강의 사진 선택">${item.photos.map((photo, index) => `<button type="button" data-news-photo-index="${index}" aria-label="강의 사진 ${index + 1}" aria-pressed="${index === 0}" tabindex="${index === 0 ? 0 : -1}"><img src="${e(photo.thumbnail || photo.src)}" alt="" width="240" height="180" loading="lazy" decoding="async"><span aria-hidden="true">${index + 1}</span></button>`).join('')}</div><button type="button" data-news-photo-next aria-label="다음 강의 사진"><span class="material-symbols-rounded" aria-hidden="true">chevron_right</span></button></div>
      ${item.photos.length > 6 ? '<p class="news-gallery-hint">작은 사진을 좌우로 넘겨 다른 장면을 선택하세요.</p>' : ''}
    </div>`;
  }

  function selectPhoto(index) {
    if (activeItem?.kind !== 'gallery') return;
    photoIndex = (index + activeItem.photos.length) % activeItem.photos.length;
    const photo = activeItem.photos[photoIndex];
    const image = dialogBody.querySelector('[data-news-photo]');
    image.src = photo.src;
    image.alt = photo.alt;
    dialogBody.querySelector('[data-news-photo-caption]').textContent = photo.caption;
    dialogBody.querySelector('[data-news-photo-counter]').textContent = `${photoIndex + 1} / ${activeItem.photos.length}`;
    dialogBody.querySelectorAll('[data-news-photo-index]').forEach(button => {
      const selected = Number(button.dataset.newsPhotoIndex) === photoIndex;
      button.setAttribute('aria-pressed', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    const selected = dialogBody.querySelector('[data-news-photo-index][aria-pressed="true"]');
    const thumbnails = selected.parentElement;
    if (document.activeElement?.hasAttribute('data-news-photo-index')) selected.focus({ preventScroll: true });
    thumbnails.scrollTo({
      left: selected.offsetLeft - (thumbnails.clientWidth - selected.offsetWidth) / 2,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  function openStory(item, trigger) {
    if (!item || typeof dialog.showModal !== 'function') return false;
    activeItem = item;
    photoIndex = 0;
    opener = trigger || section.querySelector(`[data-news-id="${item.id}"]`) || section.querySelector('.news-filter');
    dialogTitle.textContent = item.title;
    dialog.querySelector('[data-news-dialog-category]').textContent = newsData.categories.find(value => value.id === item.category).label;
    let media = '';
    if (item.kind === 'video') {
      const { id, start, end } = item.video;
      // A card click requests playback; direct links show the native play control.
      const parameters = new URLSearchParams({ start, end, autoplay: trigger ? '1' : '0', controls: '1', rel: '0', playsinline: '1' });
      media = `<div class="news-video" data-news-video><iframe src="https://www.youtube-nocookie.com/embed/${e(id)}?${e(parameters)}" title="${e(item.title)} 방송 영상" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
    } else if (item.kind === 'gallery') {
      media = renderGallery(item);
    } else if (item.kind === 'announcement' && item.image) {
      media = `<img class="news-detail-image" src="${e(item.image)}" alt="${e(item.imageAlt)}" width="1920" height="1080">`;
    } else if (item.kind === 'article') {
      media = `<div class="news-article-cover">${newsCover(item)}</div>`;
    }
    const source = item.sourceUrl ? `<div class="news-source-box">${item.sourceTitle ? `<p class="news-original-title">원문 기사 · ${e(item.sourceTitle)}</p>` : ''}<a class="news-detail-link" href="${e(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${item.kind === 'video' ? 'YouTube에서 전체 영상 보기' : '기사 원문 보기'}<span class="material-symbols-rounded" aria-hidden="true">open_in_new</span><span class="news-sr-only"> (새 창)</span></a></div>` : '';
    const videoInfo = item.kind === 'video' ? `<div class="news-video-info"><div><p>팹스넷 소개 · ${e(item.video.label)}</p><p class="news-video-quality">고화질 보기: 영상 설정 → 화질 → 1080p</p></div>${source}</div>` : '';
    const related = item.relatedUrl ? `<a class="news-detail-link" href="${e(item.relatedUrl)}" data-news-related>${e(item.relatedLabel)}<span aria-hidden="true">↗</span></a>` : '';
    dialogBody.innerHTML = `<div class="news-meta news-detail-meta">${newsMeta(item)}</div>${media}${videoInfo}<div class="news-detail-copy">${item.paragraphs.map(text => `<p>${e(text)}</p>`).join('')}${item.kind === 'video' ? '' : source}${related}</div>`;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('news-dialog-open');
    return true;
  }

  content.addEventListener('click', event => {
    const link = event.target.closest('[data-news-id]');
    if (!link || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.button !== 0) return;
    const item = items.find(item => item.id === link.dataset.newsId);
    if (openStory(item, link)) {
      event.preventDefault();
      event.stopPropagation();
      history.pushState(null, '', `#news/${item.id}`);
    }
  }, { capture: true, signal });

  dialog.querySelector('[data-news-close]').addEventListener('click', () => dialog.close(), { signal });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }, { signal });
  dialog.addEventListener('close', () => {
    dialogBody.replaceChildren(); // Unload an active video as soon as the detail closes.
    document.body.classList.remove('news-dialog-open');
    activeItem = null;
    if (location.hash.startsWith('#news/') || ['#media-feature', '#ai-education'].includes(location.hash)) history.replaceState(null, '', '#news');
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }, { signal });
  dialog.addEventListener('keydown', event => {
    if (activeItem?.kind !== 'gallery' || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? activeItem.photos.length - 1 : photoIndex + (event.key === 'ArrowRight' ? 1 : -1);
    selectPhoto(target);
  }, { signal });
  dialogBody.addEventListener('click', event => {
    if (event.target.closest('[data-news-related]')) dialog.close();
    const thumbnail = event.target.closest('[data-news-photo-index]');
    if (thumbnail) selectPhoto(Number(thumbnail.dataset.newsPhotoIndex));
    if (event.target.closest('[data-news-photo-previous]')) selectPhoto(photoIndex - 1);
    if (event.target.closest('[data-news-photo-next]')) selectPhoto(photoIndex + 1);
  }, { signal });

  function handleHash() {
    const aliases = { '#media-feature': 'paxnet-tv-2026', '#ai-education': 'hwagok-ai-lecture' };
    const id = aliases[location.hash] || location.hash.match(/^#news\/([a-z0-9-]+)$/)?.[1];
    const item = items.find(item => item.id === id);
    if (item) {
      section.scrollIntoView({ block: 'start', behavior: 'instant' });
      openStory(item);
    } else if (dialog.open) {
      dialog.close();
    }
  }
  window.addEventListener('hashchange', handleHash, { signal });
  const visibility = new IntersectionObserver(([entry]) => document.body.classList.toggle('news-section-in-view', entry.isIntersecting));
  visibility.observe(section);
  renderList();
  handleHash();

  if (import.meta.hot) import.meta.hot.dispose(() => {
    if (dialog.open) dialog.close();
    visibility.disconnect();
    document.body.classList.remove('news-section-in-view', 'news-dialog-open');
    events.abort();
  });
}
