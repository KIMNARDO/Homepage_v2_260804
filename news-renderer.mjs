export const NEWS_PAGE_SIZE = 4;

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function safeUrl(value) {
  return typeof value === 'string' && /^(https:\/\/|\/(?!\/)|#[a-z])/i.test(value) ? value : '';
}

export function validateNews(data) {
  if (!Array.isArray(data.categories) || !Array.isArray(data.items)) throw new Error('소식 분류와 항목 목록이 필요합니다.');
  const categories = new Set(data.categories.map(category => category.id));
  if (categories.size !== data.categories.length) throw new Error('소식 분류 ID가 중복되었습니다.');
  const ids = new Set();
  for (const item of data.items) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || ids.has(item.id)) throw new Error(`소식 ID를 확인하세요: ${item.id}`);
    ids.add(item.id);
    if (!categories.has(item.category)) throw new Error(`소식 분류를 확인하세요: ${item.id}`);
    if (!['video', 'article', 'gallery', 'announcement'].includes(item.kind)) throw new Error(`소식 유형을 확인하세요: ${item.id}`);
    if (!item.title || !item.summary || !item.source || !Array.isArray(item.paragraphs)) throw new Error(`소식 필수 내용을 확인하세요: ${item.id}`);
    if (item.date && (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || Number.isNaN(Date.parse(item.date)) || new Date(item.date).toISOString().slice(0, 10) !== item.date)) throw new Error(`소식 날짜를 확인하세요: ${item.id}`);
    for (const key of ['image', 'sourceUrl', 'relatedUrl']) {
      if (item[key] && !safeUrl(item[key])) throw new Error(`소식 주소를 확인하세요: ${item.id}.${key}`);
    }
    if (item.kind === 'video' && (!/^[\w-]{11}$/.test(item.video?.id) || !Number.isFinite(item.video.start) || item.video.start < 0 || !Number.isFinite(item.video.end) || item.video.end <= item.video.start)) throw new Error(`방송 정보를 확인하세요: ${item.id}`);
    if (item.kind === 'article' && !item.sourceUrl) throw new Error(`기사 원문 주소가 필요합니다: ${item.id}`);
    if (item.kind === 'gallery' && (!item.photos?.length || item.photos.some(photo => !safeUrl(photo.src) || (photo.thumbnail && !safeUrl(photo.thumbnail)) || !photo.alt || !photo.caption))) throw new Error(`사진 정보를 확인하세요: ${item.id}`);
  }
  return data;
}

export function visibleNews(data) {
  return data.items.filter(item => item.published !== false);
}

export function getNewsPage(data, category = 'all', requestedPage = 0) {
  const filtered = visibleNews(data).filter(item => category === 'all' || item.category === category);
  const pages = Math.max(1, Math.ceil(filtered.length / NEWS_PAGE_SIZE));
  const page = Math.max(0, Math.min(Math.trunc(requestedPage) || 0, pages - 1));
  return { items: filtered.slice(page * NEWS_PAGE_SIZE, (page + 1) * NEWS_PAGE_SIZE), total: filtered.length, page, pages };
}

export function newsMeta(item) {
  return `<span>${escapeHtml(item.source)}</span>${item.date ? `<time datetime="${escapeHtml(item.date)}">${item.date.replaceAll('-', '.')}</time>` : ''}`;
}

export function newsCover(item) {
  if (item.image) return `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt)}" width="1280" height="720" loading="lazy" decoding="async">`;
  return `<div class="news-press-cover" aria-hidden="true"><span>${escapeHtml(item.coverLabel || item.source)}</span><strong>${escapeHtml(item.coverTitle || item.title).replaceAll('\n', '<br>')}</strong><small>${item.kind === 'article' ? '언론 보도' : '팹스넷 소식'}</small></div>`;
}

function newsCard(item, featured, data) {
  const category = data.categories.find(value => value.id === item.category).label;
  const fallback = item.sourceUrl || item.relatedUrl || item.photos?.[0]?.src || '#news';
  const action = item.kind === 'video' ? '방송 보기' : '자세히 보기';
  return `<article class="${featured ? 'news-featured' : 'news-row'}">
    <a class="news-story-link" href="${escapeHtml(fallback)}" data-news-id="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.title)} ${action}">
      <div class="news-cover">${newsCover(item)}<span class="news-cover-type">${escapeHtml(category)}</span></div>
      <div class="news-card-copy"><div class="news-meta">${newsMeta(item)}</div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p><span class="news-read">${action} <span aria-hidden="true">↗</span></span></div>
    </a>
  </article>`;
}

export function renderNewsItems(items, data) {
  if (!items.length) return '<p class="news-empty">등록된 소식이 없습니다.</p>';
  return newsCard(items[0], true, data) + (items.length > 1 ? `<div class="news-list">${items.slice(1).map(item => newsCard(item, false, data)).join('')}</div>` : '');
}

export function renderNewsFilters(data, selected = 'all') {
  const items = visibleNews(data);
  return [{ id: 'all', label: '전체' }, ...data.categories].map(category => {
    const count = category.id === 'all' ? items.length : items.filter(item => item.category === category.id).length;
    if (!count && category.id !== 'all') return '';
    return `<button type="button" class="news-filter" data-news-filter="${escapeHtml(category.id)}" aria-pressed="${category.id === selected}" aria-controls="newsContent">${escapeHtml(category.label)}<span>${count}</span></button>`;
  }).join('');
}

export function renderNewsFallback(data) {
  return visibleNews(data).map(item => `<li><a href="${escapeHtml(item.sourceUrl || item.relatedUrl || item.photos?.[0]?.src || '#news')}">${escapeHtml(item.title)}</a></li>`).join('');
}
