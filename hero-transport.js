import { connectUnrealPreview } from './hero-unreal.js';
import tracks from './transport-anchors.json';

import { records, recordSelection } from './hero-record-data.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function setupTransport(slide, stage) {
  const kind = stage.dataset.transport;
  const viewer = stage.querySelector('model-viewer');
  // The exterior stays photographic. This optional EV view shows only the
  // original drivetrain, battery and wheels for mesh picking and part animation.
  if (kind === 'ev') {
    const gltf = viewer.originalGltfJson;
    const shell = gltf.nodes.find(node => node.name === 'Finished exterior');
    const finishes = new Set(gltf.meshes[shell.mesh].primitives.map(p => p.material));
    for (const index of finishes) {
      const material = viewer.model.materials[index];
      material.setAlphaMode('MASK');
      material.setAlphaCutoff(0.5);
      material.pbrMetallicRoughness.setBaseColorFactor([0, 0, 0, 0]);
    }
  }
  const refreshUnreal = kind === 'ev' ? () => {} : connectUnrealPreview(viewer, kind);
  const actions = slide.querySelector('.transport-actions');
  const choices = slide.querySelector('.bom-choices');
  const detail = slide.querySelector('[data-bom-path]');
  const toggle = actions.querySelector('[data-explode]');
  const entry = slide.querySelector('[data-inspect], [data-inspect-photo]');
  const invitation = stage.querySelector('[data-inspect-pin]');
  const title = slide.querySelector('.transport-title strong');
  const headline = title.textContent;
  const overviewDetail = detail.textContent;
  const firstPart = 1;
  let exterior = true;
  let viewRequest = 0;
  const orbit = viewer.getAttribute('camera-orbit');
  let frame, progress = 0, destination = 0;
  let selected = 0;
  let inspecting = false;
  const overviewTarget = viewer.getAttribute('camera-target');
  const assembledAim = overviewTarget.split(' ').map(parseFloat);
  const assembledOrbit = orbit.split(' ').map(parseFloat);
  let inspectionOrbit = assembledOrbit;
  const partStart = .9 + 1 / 30; // GLB shell travel precedes Blender frames 1–61.


  // The global pose and individual part clips use the same Blender samples.
  // A selected cell raises the enclosure first so the module can clear the pack.
  let activePart = null;
  let clipRequest = 0;
  async function setPartClip(part, target, immediate = false) {
    const clip = part || 'Assembly';
    const changed = viewer.animationName !== clip;
    const request = ++clipRequest;
    cancelAnimationFrame(frame);
    const previousPart = activePart;
    activePart = part;
    if (changed) {
      // Keep the shell in place while changing components inside the open product.
      progress = previousPart ? Math.min(progress, partStart / viewer.duration) : 0;
      viewer.animationName = clip;
      await viewer.updateComplete;
      if (request !== clipRequest) return;
    }
    animate(target, immediate);
  }

  function setMode(finished) {
    exterior = finished;
    stage.classList.toggle('inspection-open', !finished);
    entry.hidden = !finished;
    actions.hidden = choices.hidden = finished;
    title.textContent = finished ? headline : kind === 'ev' ? '선택한 부품의 BOM 경로와 수량' : '설계변경을 검토할 부품 위치';
    if (finished) {
      detail.textContent = overviewDetail;
      slide.dispatchEvent(new CustomEvent('hero-record-close',{bubbles:true}));
    }
  }
  async function openPart(index, key = records[kind][index].key, immediate = false) {
    if (exterior) {
      const moveFocus = document.activeElement === entry || document.activeElement === invitation;
      const request = ++viewRequest;
      setMode(false);
      viewer.animationName = viewer.availableAnimations[0];
      await viewer.updateComplete;
      if (request !== viewRequest || exterior) return;
      animate(0, true);
      if (moveFocus) buttons[index].item.focus({preventScroll:true});
    }
    return select(index, true, key, immediate);
  }
  invitation.addEventListener('click', () => openPart(firstPart));
  function select(index, focus = false, key = records[kind][index].key, immediate = false) {
    selected = index;
    if (focus && kind === 'ev') {
      inspecting = true;
      const [azimuth, polar, distance] = [[38.52,55,8.4],[44,48,6.0],[38,66,5.5],[57,66,5.1]][index];
      const [, side, end] = key.split(' ');
      const rear = (index === 2 && side === '1') || (index === 3 && end === '1');
      const left = (index === 1 || index === 3) && side === '-1';
      const angle = (left ? -1 : 1) * (rear ? 180 - azimuth : azimuth);
      inspectionOrbit = [angle,polar,distance];
    }
    if (focus && kind === 'aircraft') {
      inspecting = true;
      const [azimuth, polar, distance] = [[65,72,5.6],[72,64,4.35],[34,72,3.4],[38,50,6.9]][index];
      inspectionOrbit = [azimuth,polar,distance];
    }
    const selection = recordSelection(kind, index, key);
    detail.textContent = selection.path;
    if (focus) slide.dispatchEvent(new CustomEvent('hero-record-select', {bubbles:true, detail:selection}));
    buttons.forEach(({pin, item}, i) => {
      for (const el of [pin, item]) el.setAttribute('aria-pressed', String(i === index));
    });
    if (focus) return setPartClip(key, activePart === key && destination > 0 ? 0 : 1, immediate);
  }

  const buttons = records[kind].map(({key, name:label}, index) => {
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'bom-pin';
    pin.slot = 'hotspot-' + index;
    pin.dataset.position = tracks[kind][key].poses[0].map(n => n + 'm').join(' ');
    pin.dataset.normal = '0 1 0';
    pin.textContent = String(index + 1);
    pin.setAttribute('aria-label', (index + 1) + '번 ' + label + ' BOM');
    pin.title = label;
    viewer.append(pin);
    const item = document.createElement('button');
    item.type = 'button';
    item.textContent = (index + 1) + ' ' + label;
    choices.append(item);
    for (const el of [item,pin]) el.addEventListener('click', () => {
      openPart(index, index === selected && activePart ? activePart : key);
    });
    return {pin,item,key};
  });

  // A tap on the mesh selects the same BOM row as its pin. A drag only orbits.
  let press;
  viewer.addEventListener('pointerdown', event => {
    press = event.isPrimary && event.button === 0 && !event.target.closest('button')
      ? {id:event.pointerId, x:event.clientX, y:event.clientY} : null;
  });
  viewer.addEventListener('pointermove', event => {
    if (press && Math.hypot(event.clientX-press.x, event.clientY-press.y) > 5) {
      press = null;
      inspecting = false; // The visitor takes over the camera while the part keeps moving.
    }
  });
  viewer.addEventListener('pointercancel', () => { press = null; });
  viewer.addEventListener('pointerup', event => {
    if (!press || press.id !== event.pointerId) return;
    press = null;
    const hit = viewer.surfaceFromPoint(event.clientX, event.clientY);
    if (!hit) return;
    const mesh = Number(hit.split(' ')[0]);
    if (exterior) {
      openPart(firstPart);
      return;
    }
    const hitKey = Object.keys(tracks[kind]).find(key => tracks[kind][key].mesh === mesh);
    if (!hitKey) return;
    const index = buttons.findIndex(({key}) => kind === 'ev'
      ? key.split(' ')[0] === hitKey.split(' ')[0] : key === hitKey);
    if (index >= 0) openPart(index, hitKey);
  });

  function pose(value) {
    progress = value;
    const time = Math.min(viewer.duration - .001, value * viewer.duration);
    viewer.currentTime = Math.max(0,time);
    refreshUnreal();
    const travel = Math.min(1,Math.max(0,(time-partStart)/2));
    const segment = travel < .45 ? 0 : 1;
    const fraction = segment === 0 ? travel / .45 : (travel - .45) / .55;
    // Let the visitor see the shell lift at the portrait angle before tracking the selected part.
    const blend = Math.min(1,Math.max(0,(time-.43)/1.02));
    const focus = blend*blend*(3-2*blend);
    if (inspecting) {
      const angles = assembledOrbit.map((n,i)=>n+(inspectionOrbit[i]-n)*focus);
      viewer.cameraOrbit = angles[0]+'deg '+angles[1]+'deg '+angles[2]+'m';
    }
    for (const [index, {key,pin}] of buttons.entries()) {
      const part = activePart && index === selected ? activePart : key;
      const moves = !activePart || part === activePart || (activePart.startsWith('Cell ') && part === 'Battery enclosure');
      const points = tracks[kind][part].poses;
      const vector = points[segment].map((n, axis) => n + (points[segment + 1][axis] - n) * fraction);
      const pinPosition = moves ? vector : points[0];
      const position = pinPosition.map(n => n + 'm').join(' ');
      viewer.updateHotspot({name:pin.slot, position});
      if (inspecting && index === selected) {
        viewer.cameraTarget = pinPosition.map((n,i)=>(assembledAim[i]+(n-assembledAim[i])*focus)+'m').join(' ');
      }
    }
  }

  function animate(target, immediate = false, complete) {
    cancelAnimationFrame(frame);
    destination = target;
    toggle.textContent = kind === 'ev'
      ? (activePart ? '부품 ' : '전체 ') + (target > 0 ? '조립' : '분해')
      : (target > 0 ? '다시 조립' : '분해 보기');
    const start = progress;
    if (reducedMotion.matches || immediate || start === target) {
      pose(target);
      complete?.();
      return;
    }
    const begin = performance.now();
    const duration = Math.max(360, 2400 * Math.abs(target-start));
    function step(now) {
      const t = Math.min(1, (now-begin)/duration);
      pose(start + (target-start) * t*t*(3-2*t));
      if (t < 1) frame = requestAnimationFrame(step);
      else complete?.();
    }
    frame = requestAnimationFrame(step);
  }

  toggle.addEventListener('click', () => animate(destination > 0 ? 0 : 1));
  function resetCamera() {
    inspecting = false;
    viewer.cameraTarget = overviewTarget;
    viewer.cameraOrbit = orbit;
    viewer.jumpCameraToGoal();
  }
  async function finishedView(reverse = false) {
    if (reverse && !exterior && progress > 0) {
      animate(0, false, () => finishedView());
      return;
    }
    ++viewRequest;
    ++clipRequest;
    cancelAnimationFrame(frame);
    progress = destination = 0;
    activePart = null;
    const restoreFocus = actions.contains(document.activeElement);
    setMode(true);
    if (restoreFocus) entry.focus({preventScroll:true});
    resetCamera();
    viewer.animationName = 'Finished';
    await viewer.updateComplete;
    if (exterior) viewer.currentTime = 0;
    refreshUnreal();
  }
  actions.querySelector('[data-reset-view]')?.addEventListener('click', () => {
    finishedView(true);
  });
  viewer.animationName = 'Finished';
  stage.classList.add('model-ready');
  return {select: openPart, reset: finishedView};
}
