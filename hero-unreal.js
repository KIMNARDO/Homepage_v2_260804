// Local workstation preview: Unreal renders the vehicle, bay and floor in one pass.
// model-viewer owns camera input, hit testing and accessible model-space hotspots.
export function connectUnrealPreview(viewer, kind) {
  if (!['127.0.0.1', 'localhost'].includes(location.hostname) || location.port !== '5186') {
    return () => {};
  }
  const slide = viewer.closest('[data-hero-industry-slide]');
  const frame = document.createElement('img');
  frame.alt = '';
  frame.slot = 'canvas';
  frame.className = 'transport-unreal-frame';
  frame.draggable = false;
  let stationaryPasses = 0;
  let previous = '', busy = false, scheduled = false, onScreen = true, retryAt = 0;
  let objectUrl = '';
  function visible() {
    return onScreen && !document.hidden && slide.classList.contains('is-active') && !viewer.parentElement.classList.contains('scene-cover') && viewer.loaded;
  }
  function requestFrame() {
    if (scheduled || busy || !visible() || performance.now() < retryAt) return;
    scheduled = true;
    requestAnimationFrame(draw);
  }
  async function draw() {
    scheduled = false;
    if (!visible()) return;
    const {theta, phi, radius} = viewer.getCameraOrbit();
    const {x, y, z} = viewer.getCameraTarget();
    const rect = viewer.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const scale = Math.min(Math.max(1.6, devicePixelRatio), 2, 1200/rect.width, 1100/rect.height);
    const params = new URLSearchParams({
      kind, theta:theta.toFixed(4), phi:phi.toFixed(4), r:radius.toFixed(3),
      x:x.toFixed(3), y:y.toFixed(3), z:z.toFixed(3), fov:viewer.getFieldOfView().toFixed(3),
      w:Math.max(80, Math.round(rect.width*scale)), h:Math.max(60, Math.round(rect.height*scale)),
      clip:viewer.animationName || 'Finished', t:viewer.currentTime.toFixed(3)
    }).toString();
    // Keep a few stationary samples for Unreal's temporal lighting and polished surfaces.
    if (previous === params && stationaryPasses >= 5) return;
    busy = true;
    try {
      const res = await fetch('http://127.0.0.1:5198/frame?'+params, {
        signal:AbortSignal.timeout(9000), credentials:'omit', referrerPolicy:'no-referrer'
      });
      if (!res.ok) throw new Error('Unreal frame '+res.status);
      const url = URL.createObjectURL(await res.blob());
      const old = objectUrl;
      objectUrl = url;
      frame.src = url;
      try { await frame.decode(); } finally { if (old) URL.revokeObjectURL(old); }
      if (!frame.isConnected) viewer.append(frame);
      viewer.dataset.renderer = 'unreal';
      stationaryPasses = previous === params ? stationaryPasses + 1 : 0;
      previous = params;
    } catch {
      frame.remove();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = previous = '';
      delete viewer.dataset.renderer;
      retryAt = performance.now()+10000;
      setTimeout(requestFrame, 10100);
    } finally {
      busy = false;
      requestFrame();
    }
  }
  new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; requestFrame(); }).observe(viewer);
  new ResizeObserver(requestFrame).observe(viewer);
  new MutationObserver(requestFrame).observe(slide,{attributes:true,attributeFilter:['class']});
  viewer.addEventListener('camera-change', requestFrame);
  viewer.addEventListener('load', requestFrame);
  document.addEventListener('visibilitychange', requestFrame);
  requestFrame();
  return requestFrame;
}
