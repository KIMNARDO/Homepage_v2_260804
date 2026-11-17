import { enablePhotoOrbit } from './hero-cover-orbit.js';
import { recordSelection } from './hero-record-data.js';
import { setupPhotoInspection } from './hero-photo-inspection.js';

export function initSceneEntry(slide) {
  const stage = slide.querySelector('.am-industry-visual');
  const template = stage.querySelector('[data-scene-viewer]');
  const entry = stage.querySelector('[data-load-scene]');
  const status = stage.querySelector('.scene-load-status');
  const kind = stage.dataset.transport || 'building';
  let controller, loading, selection;
  let modelRequest = 0, failedAttempts = 0;
  stage.classList.add('scene-cover');

  function showRecord(index, key) {
    selection = recordSelection(kind, index, key);
    slide.dispatchEvent(new CustomEvent('hero-record-select', {bubbles:true, detail:selection}));
  }

  // The table, photo and 3D hotspots share the same part and drawing selection.
  slide.addEventListener('hero-record-select', e => { selection = e.detail; });
  const photo = kind === 'building' ? null : setupPhotoInspection(
    slide, stage, inspectPhoto, () => launch(selection.index, selection.key)
  );

  function inspectPhoto(index, key, focusPin = false) {
    closeFilm();
    ++modelRequest;
    if (!stage.classList.contains('scene-cover')) {
      stage.classList.add('scene-cover');
      controller?.reset();
    }
    showRecord(index, key);
    photo.select(index, selection.key, focusPin);
  }

  const orbit = enablePhotoOrbit(slide, stage, stage.dataset.transport || 'campus');
  const player = stage.querySelector('.hero-film-player');
  const video = player?.querySelector('video');
  function closeFilm(focusButton = false) {
    if (!player || player.hidden) return;
    video.pause();
    player.hidden = true;
    slide.classList.remove('film-playing');
    if (focusButton) slide.querySelector('.photo-controls [data-film-play]').focus({preventScroll:true});
  }
  function playFilm() {
    // Each film follows one authored BOM clip, so its drawing remains beside it.
    orbit.clear();
    inspectPhoto(1);
    player.hidden = false;
    slide.classList.add('film-playing');
    if (!video.hasAttribute('src')) video.src = video.dataset.filmSrc;
    if (video.ended) video.currentTime = 0;
    video.play().catch(error => {
      if (error.name !== 'AbortError' && !player.hidden) {
        status.textContent = '재생 버튼을 눌러 영상을 시작해 주세요.';
      }
    });
    video.focus({preventScroll:true});
  }
  slide.querySelectorAll('[data-film-play]').forEach(button => button.addEventListener('click', playFilm));
  player?.querySelector('[data-film-close]').addEventListener('click', () => closeFilm(true));
  player?.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.stopPropagation(); closeFilm(true); }
  });
  video?.addEventListener('error', () => {
    if (player.hidden) return;
    closeFilm(true);
    video.removeAttribute('src');
    status.textContent = '영상을 불러오지 못했습니다. 영상 보기를 눌러 다시 시도해 주세요.';
  });

  async function load() {
    const [scene] = await Promise.all([
      kind === 'building' ? import('./hero-campus.js') : import('./hero-transport.js'),
      import('@google/model-viewer')
    ]);
    const viewer = template.content.firstElementChild.cloneNode(true);
    const listeners = new AbortController();
    try {
      const loaded = new Promise((resolve, reject) => {
        viewer.addEventListener('load', resolve, {once:true, signal:listeners.signal});
        viewer.addEventListener('error', reject, {once:true, signal:listeners.signal});
      });
      stage.append(viewer);
      viewer.loading = 'eager';
      if (kind !== 'building') viewer.skyboxImage = '/models/'+kind+'-room.jpg';
      const src = new URL(kind === 'building' ? '/models/clip-campus.glb' : '/models/hero-'+kind+'.glb?bom='+(kind==='ev'?'8':'6'), location.href);
      if (failedAttempts) src.searchParams.set('retry', String(failedAttempts));
      viewer.src = src.href;
      await loaded;
      controller = kind === 'building' ? scene.setupCampus(viewer, stage) : scene.setupTransport(slide, stage);
    } catch (error) {
      viewer.remove();
      throw error;
    } finally {
      listeners.abort();
    }
  }

  async function launch(index, key) {
    orbit.clear();
    const request = ++modelRequest;
    closeFilm();
    if (index !== undefined) showRecord(index, key);
    if (!controller) {
      status.textContent = '3D 불러오는 중…';
      loading ??= load().finally(() => { loading = null; });
      try {
        await loading;
      } catch {
        if (request === modelRequest) {
          failedAttempts++;
          status.textContent = '3D를 열 수 없습니다. 다시 눌러 시도해 주세요.';
        }
        return;
      }
    }
    if (request !== modelRequest || !slide.classList.contains('is-active')) return;
    const moveFocus = document.activeElement === entry ||
      document.activeElement?.matches('[data-inspect], [data-photo-3d]');
    status.textContent = '';
    photo?.close();
    stage.classList.remove('scene-cover');
    await controller.select(index, key);
    if (moveFocus) slide.querySelector('[aria-pressed="true"].campus-pin, .bom-choices [aria-pressed="true"]')?.focus({preventScroll:true});
  }

  function openEntry() {
    if (!photo || !stage.classList.contains('scene-cover')) return launch(1);
    if (orbit.isTurned()) inspectPhoto(1);
    else playFilm();
  }
  entry.addEventListener('click', openEntry);
  slide.querySelector('[data-inspect-photo]')?.addEventListener('click', () => inspectPhoto(1, undefined, true));
  slide.querySelector('[data-inspect]')?.addEventListener('click', () => launch(1));
  slide.querySelector('[data-back-photo]')?.addEventListener('click', () => {
    inspectPhoto(selection.index, selection.key, true);
  });
  slide.querySelectorAll('[data-floor]').forEach((button,i) => button.addEventListener('click', () => launch(i)));
  slide.addEventListener('hero-row-select', e => {
    if (!stage.classList.contains('scene-cover')) controller?.select(e.detail);
    else if (photo) inspectPhoto(e.detail);
    else showRecord(e.detail);
  });
  function cover() {
    closeFilm();
    selection = null;
    ++modelRequest;
    photo?.close();
    stage.classList.add('scene-cover');
    controller?.reset();
    status.textContent = '';
  }
  slide.querySelector('[data-return-exterior]')?.addEventListener('click', () => {
    slide.dispatchEvent(new Event('hero-entry-close'));
  });
  slide.addEventListener('hero-scene-leave', cover);
  slide.addEventListener('hero-entry-close', () => { cover(); entry.focus({preventScroll:true}); });

  // Shared links open the corresponding record before any 3D download.
  slide.addEventListener('hero-linked-entry', () => {
    const params = new URLSearchParams(location.search);
    const floor = Number(params.get('floor'));
    const part = params.get('part');
    if (kind === 'building' && floor >= 1 && floor <= 3 && Number.isInteger(floor)) showRecord(floor-1);
    if (kind === 'ev') {
      const index = ['enclosure', 'battery', 'motor', 'wheel'].indexOf(part);
      if (index >= 0) inspectPhoto(index);
    }
    if (kind === 'aircraft' && part === 'avionics') inspectPhoto(1);
  });
}
