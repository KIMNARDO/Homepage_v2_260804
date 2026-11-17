// The slow film uses the same complete camera turn as the draggable photo orbit.
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const preferenceChange = new EventTarget();
let userEnabled;

export function enableIdleOrbit(slide, stage, kind, {getBearing, draw, loadPins}) {
  const hero = slide.closest('#hero');
  const hint = stage.querySelector('.transport-hint');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'orbit-toggle';
  hint.after(toggle);
  let visible = false, interrupted = false, unavailable = false;
  let video, timer, frameId, running = false, generation = 0;

  const enabled = () => userEnabled ?? !(motion.matches || navigator.connection?.saveData);
  function exterior() {
    return slide.classList.contains('is-active') && stage.classList.contains('scene-cover') &&
      !slide.classList.contains('film-playing') && !stage.classList.contains('inspection-open') &&
      !hero.classList.contains('has-linked-record');
  }
  function eligible() {
    return exterior() && visible && !document.hidden && !unavailable && enabled() &&
      !interrupted && !document.querySelector('dialog[open]');
  }
  function stop() {
    generation++;
    clearTimeout(timer);
    timer = null;
    running = false;
    video?.pause();
    if (frameId != null) {
      if (video.requestVideoFrameCallback) video.cancelVideoFrameCallback(frameId);
      else cancelAnimationFrame(frameId);
      frameId = null;
    }
  }
  function paint(_, metadata) {
    if (!running) return;
    if (!video.seeking && video.readyState >= 2 && video.duration > 0) {
      draw(video, ((metadata?.mediaTime ?? video.currentTime) / video.duration) % 1);
    }
    frameId = video.requestVideoFrameCallback ? video.requestVideoFrameCallback(paint) : requestAnimationFrame(paint);
  }
  function fail() {
    unavailable = true;
    sync();
  }
  async function start() {
    timer = null;
    if (!eligible()) return;
    running = true;
    const current = generation;
    try {
      await loadPins();
      if (current !== generation) return;
      if (!video) {
        video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.addEventListener('error', fail);
        video.src = '/models/orbit/' + kind + '-idle.mp4';
      }
      // currentTime can be set before metadata arrives. Keep both cameras at the
      // displayed bearing when resuming after a drag or an offscreen pause.
      video.currentTime = getBearing() * 40;
      await video.play();
      if (current === generation) paint();
    } catch (error) {
      if (current === generation && error.name !== 'AbortError') fail();
    }
  }
  function sync(immediate = false) {
    const on = enabled() && !interrupted;
    toggle.hidden = !exterior() || unavailable;
    toggle.textContent = on ? 'Ⅱ  회전 멈춤' : '▷  자동 회전';
    toggle.setAttribute('aria-label', on ? '자동 회전 일시정지' : '자동 회전 시작');
    if (!eligible()) stop();
    else if (!timer && !running) timer = setTimeout(start, immediate === true ? 0 : 1500);
  }
  function interrupt() {
    interrupted = true;
    sync();
  }
  function reset() {
    stop();
    interrupted = false;
    if (video) {
      video.removeEventListener('error', fail);
      video.removeAttribute('src');
      video.load();
      video = null;
    }
  }
  toggle.addEventListener('click', () => {
    userEnabled = interrupted || !enabled();
    interrupted = false;
    preferenceChange.dispatchEvent(new Event('change'));
    if (eligible() && timer) { clearTimeout(timer); start(); }
  });
  preferenceChange.addEventListener('change', sync);
  motion.addEventListener('change', () => { userEnabled = undefined; sync(); });
  document.addEventListener('visibilitychange', sync);
  const observer = new MutationObserver(() => sync());
  for (const node of [slide, stage, hero]) observer.observe(node, {attributes:true, attributeFilter:['class']});
  for (const dialog of document.querySelectorAll('dialog')) {
    observer.observe(dialog, {attributes:true, attributeFilter:['open']});
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .25;
    sync();
  }, {threshold:[0,.25]}).observe(stage);
  stage.addEventListener('focusin', e => {
    if (e.target !== toggle && exterior()) interrupt();
  });
  stage.querySelector('[data-load-scene]').addEventListener('pointerenter', e => {
    if (e.pointerType === 'mouse' && running) interrupt();
  });
  slide.addEventListener('hero-record-select', interrupt);
  sync();
  return {interrupt, reset};
}
