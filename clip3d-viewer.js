const galleries = document.querySelectorAll('[data-viewer-gallery]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

galleries.forEach((gallery) => {
  const tabs = [...gallery.querySelectorAll('.viewer-demo-tab')];
  const stage = gallery.querySelector('.viewer-demo-stage');
  const image = gallery.querySelector('[data-viewer-image]');
  const label = gallery.querySelector('[data-viewer-label]');
  const index = gallery.querySelector('[data-viewer-index]');
  const title = gallery.querySelector('[data-viewer-title]');
  const copy = gallery.querySelector('[data-viewer-copy]');
  const progress = gallery.querySelector('.viewer-demo-progress');
  const expand = gallery.querySelector('[data-viewer-expand]');
  let activeIndex = Math.max(0, tabs.findIndex((tab) => tab.classList.contains('active')));
  let timer;
  let isPaused = false;

  const preloadNext = (nextIndex) => {
    const preload = new Image();
    preload.src = tabs[nextIndex]?.dataset.image || '';
  };

  const restartProgress = () => {
    if (!progress || reduceMotion) return;
    progress.classList.remove('is-running');
    void progress.offsetWidth;
    progress.classList.add('is-running');
  };

  const alignActiveTab = (tab) => {
    const rail = tab?.parentElement;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;
    const targetLeft = tab.offsetLeft - Math.max(0, (rail.clientWidth - tab.offsetWidth) / 2);
    rail.scrollTo({ left: targetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const schedule = () => {
    window.clearTimeout(timer);
    if (reduceMotion || isPaused || document.hidden) return;
    timer = window.setTimeout(() => select((activeIndex + 1) % tabs.length, true), 7000);
  };

  const select = (nextIndex, automated = false) => {
    const tab = tabs[nextIndex];
    if (!tab || !image) return;

    activeIndex = nextIndex;
    tabs.forEach((item, itemIndex) => {
      const selected = itemIndex === activeIndex;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    stage?.classList.add('is-changing');
    const nextImage = new Image();
    nextImage.onload = () => {
      image.src = tab.dataset.image;
      image.alt = tab.dataset.alt || '';
      if (label) label.textContent = (tab.dataset.label || '').toUpperCase();
      if (index) index.textContent = String(activeIndex + 1).padStart(2, '0');
      if (title) title.textContent = tab.dataset.title || '';
      if (copy) copy.textContent = tab.dataset.copy || '';
      window.setTimeout(() => stage?.classList.remove('is-changing'), 60);
    };
    nextImage.src = tab.dataset.image;

    alignActiveTab(tab);
    preloadNext((activeIndex + 1) % tabs.length);
    restartProgress();
    schedule();
  };

  tabs.forEach((tab, tabIndex) => {
    tab.addEventListener('click', () => select(tabIndex));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = activeIndex;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (activeIndex + 1) % tabs.length;
      select(nextIndex);
      tabs[nextIndex].focus();
    });
  });

  gallery.addEventListener('mouseenter', () => { isPaused = true; window.clearTimeout(timer); });
  gallery.addEventListener('mouseleave', () => { isPaused = false; restartProgress(); schedule(); });
  gallery.addEventListener('focusin', () => { isPaused = true; window.clearTimeout(timer); });
  gallery.addEventListener('focusout', (event) => {
    if (gallery.contains(event.relatedTarget)) return;
    isPaused = false;
    restartProgress();
    schedule();
  });

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      restartProgress();
      schedule();
    } else {
      window.clearTimeout(timer);
    }
  }, { threshold: 0.25 });
  observer.observe(gallery);

  expand?.addEventListener('click', () => {
    const dialog = document.querySelector('[data-viewer-lightbox]');
    const dialogImage = dialog?.querySelector('[data-viewer-lightbox-image]');
    if (!dialog || !dialogImage) return;
    dialogImage.src = image.src;
    dialogImage.alt = image.alt;
    dialog.showModal();
  });

  preloadNext((activeIndex + 1) % tabs.length);
});

const lightbox = document.querySelector('[data-viewer-lightbox]');
lightbox?.querySelector('[data-viewer-lightbox-close]')?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', (event) => {
  const rect = lightbox.getBoundingClientRect();
  const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  if (!inside) lightbox.close();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) document.querySelectorAll('.viewer-demo-progress').forEach((item) => item.classList.remove('is-running'));
});
