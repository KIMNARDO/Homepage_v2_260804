import { enableIdleOrbit } from './hero-idle-orbit.js';

// Each seek selects a photographed Blender view and the pins projected by that camera.
const standardOrbit = {frames:96, fps:24};
const evExterior = {frames:240, fps:60};

export function enablePhotoOrbit(slide, stage, kind) {
  const plane = stage.querySelector('.photo-plane');
  const canvas = document.createElement('canvas');
  canvas.className = 'photo-orbit-frame';
  canvas.hidden = true;
  canvas.setAttribute('aria-hidden', 'true');
  plane.prepend(canvas);
  const ctx = canvas.getContext('2d', {alpha:false});
  const entry = plane.querySelector('[data-load-scene]');
  const entryCaption = entry.querySelector('.scene-pin-label span');
  const initialCaption = entryCaption.textContent;
  const turnedCaption = entryCaption.dataset.turnedLabel ?? initialCaption;
  const pins = [...plane.querySelectorAll('.photo-pin')];
  const status = stage.querySelector('.scene-load-status');
  const state = () => stage.classList.contains('show-cutaway') ? 'section' : 'exterior';
  const version = kind === 'ev' ? '?v=evOrbit240' : '';
  const trackFor = view => kind === 'ev' && view === 'exterior' ? evExterior : standardOrbit;
  let track = trackFor(state());
  let paintRequest = 0;
  let player, tracks, fetchTracks, drag;
  let ignorePointerClickUntil = 0;
  let goal = 0, displayed = 0, lastState = state();
  let manual = false, bearing = 0;
  const failed = '회전 화면을 불러오지 못했습니다. 다시 드래그해 주세요.';

  const isTurned = () => manual && !canvas.hidden && displayed !== 0;

  function positionPins(frame = displayed) {
    const label = isTurned() ? turnedCaption : initialCaption;
    if (entryCaption.textContent !== label) entryCaption.textContent = label;
    const views = tracks?.[state()];
    const index = Math.floor(frame);
    const points = views?.[index];
    if (!points) return;
    const fraction = frame - index;
    const next = views[(index + 1) % views.length];
    for (const [i, el] of [entry, ...pins].entries()) {
      const pin = i === 0 ? 1 : i-1;
      const [x,y] = points[pin];
      el.style.left = (x + fraction * (next[pin][0] - x))+'%';
      el.style.top = (y + fraction * (next[pin][1] - y))+'%';
    }
  }

  function loadPins() {
    fetchTracks ??= fetch('/models/orbit/'+kind+'.json'+version).then(response => {
      if (!response.ok) throw new Error('orbit pins');
      return response.json();
    }).then(data => { tracks = data; positionPins(); }).catch(error => {
      fetchTracks = null;
      throw error;
    });
    return fetchTracks;
  }
  function drawFrame(video) {
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    ctx.drawImage(video,0,0);
    canvas.hidden = false;
  }
  const idle = enableIdleOrbit(slide, stage, kind, {
    loadPins,
    getBearing: () => bearing,
    draw(video, turn) {
      if (player) discardPlayer();
      manual = false;
      bearing = turn;
      const frame = turn * track.frames;
      goal = displayed = Math.round(frame) % track.frames;
      drawFrame(video);
      positionPins(frame);
    }
  });

  function discardPlayer() {
    cancelAnimationFrame(paintRequest);
    paintRequest = 0;
    if (!player) return;
    const old = player;
    player = null;
    old.pause();
    old.removeAttribute('src');
    old.load();
  }

  function clear() {
    idle.interrupt();
    discardPlayer();
    drag = null;
    manual = false;
    goal = displayed = bearing = 0;
    canvas.hidden = true;
    if (status.textContent === '회전 화면 불러오는 중…' || status.textContent === failed) status.textContent = '';
    positionPins();
  }

  function seek() {
    if (!player || player.readyState < 2 || player.seeking) return;
    const target = goal;
    const frame = Math.floor(player.currentTime * track.fps);
    if (frame !== target) {
      player.currentTime = (target+.35)/track.fps;
    }
  }

  function update() {
    if (!fetchTracks) loadPins().catch(() => {});
    if (!player) {
      const video = document.createElement('video');
      player = video;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      status.textContent = '회전 화면 불러오는 중…';
      const paint = () => {
        if (video !== player || video.seeking || video.readyState < 2) return;
        if (track !== evExterior && Math.floor(video.currentTime * track.fps) !== goal) {
          seek();
          return;
        }
        drawFrame(video);
        displayed = Math.min(track.frames-1, Math.floor(video.currentTime*track.fps));
        bearing = displayed / track.frames;
        positionPins();
        status.textContent = '';
        seek();
      };
      video.addEventListener('loadeddata',paint);
      video.addEventListener('seeked',paint);
      video.addEventListener('error',() => {
        if (video !== player) return;
        clear();
        status.textContent = failed;
      });
      const mediaVersion = kind === 'ev' && state() === 'section' ? '?v=original96b' : version;
      video.src = '/models/orbit/'+kind+'-'+state()+'.mp4'+mediaVersion;
      video.load();
    } else seek();
  }

  function canRotate() {
    return stage.classList.contains('scene-cover') && slide.classList.contains('is-active') &&
      !slide.classList.contains('film-playing');
  }
  function rotate(frame) {
    goal = ((Math.round(frame) % track.frames) + track.frames) % track.frames;
    if (track !== evExterior) {
      update();
      return;
    }
    // Pointer events can arrive faster than display refresh or video seeking.
    // Paint each decoded view with its own pins, then seek the newest target.
    if (!paintRequest) paintRequest = requestAnimationFrame(() => {
      paintRequest = 0;
      update();
    });
  }
  stage.tabIndex = 0;
  stage.setAttribute('role','group');
  stage.setAttribute('aria-label', (kind==='ev'?'자동차':kind==='aircraft'?'항공기':'건축')+' 360도 보기. 좌우 드래그 또는 방향키로 회전');
  stage.addEventListener('pointerdown', event => {
    const button = event.target.closest('button');
    if (!canRotate() || !event.isPrimary || event.button !== 0 ||
        event.target.closest('a, model-viewer, .hero-film-player') ||
        (button && !button.matches('.scene-pin, .photo-pin'))) return;
    idle.interrupt();
    ignorePointerClickUntil = 0;
    drag = {id:event.pointerId,x:event.clientX,y:event.clientY,frame:goal,started:false,onPin:!!button};
    if (!button) stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId || !canRotate()) return;
    const dx = event.clientX-drag.x;
    if (!drag.started) {
      if (Math.abs(dx)<5 || (event.pointerType==='touch' && Math.abs(event.clientY-drag.y)>Math.abs(dx))) return;
      drag.started = true;
      manual = true;
      if (drag.onPin) stage.setPointerCapture(event.pointerId);
    }
    rotate(drag.frame + dx*track.frames/stage.clientWidth);
  });
  function release(event) {
    if (drag?.id !== event.pointerId ||
        (event.type === 'lostpointercapture' && event.target !== stage)) return;
    if (drag.started && drag.onPin) ignorePointerClickUntil = performance.now()+350;
    drag = null;
  }
  stage.addEventListener('click', event => {
    if (event.detail && performance.now() < ignorePointerClickUntil) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
  for (const type of ['pointerup','pointercancel','lostpointercapture']) stage.addEventListener(type,release);
  stage.addEventListener('dragstart',event => event.preventDefault());
  stage.addEventListener('keydown',event => {
    if (event.target!==stage || !canRotate() || !['ArrowLeft','ArrowRight','Home'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    idle.interrupt();
    manual = true;
    const step = kind === 'ev' && !event.shiftKey ? 1 : 4;
    rotate(event.key==='Home'?0:goal+(event.key==='ArrowLeft'?-step:step));
  });

  new MutationObserver(() => {
    const next = state();
    if (next === lastState) return;
    const continueView = !canvas.hidden && canRotate();
    const previousTrack = track;
    lastState = next;
    track = trackFor(next);
    discardPlayer();
    drag = null;
    if (continueView) {
      // Transfer the actual painted bearing between the two authored cameras.
      // The EV cutaway has a 27° assembly turn and an 8° camera offset.
      const offset = kind === 'ev' ? 35/360 : (kind === 'aircraft' ? 8 : 7)/96;
      const sourceFrame = kind === 'ev' ? displayed : goal;
      const bearing = sourceFrame/previousTrack.frames + (next === 'section' ? offset : -offset);
      goal = (Math.round(bearing * track.frames) + track.frames) % track.frames;
      update();
    } else {
      canvas.hidden = true;
      goal = displayed = 0;
      positionPins();
    }
  }).observe(stage,{attributes:true,attributeFilter:['class']});
  slide.addEventListener('hero-scene-leave',() => { clear(); idle.reset(); });
  slide.addEventListener('hero-entry-close',clear);
  return {clear, isTurned};
}
