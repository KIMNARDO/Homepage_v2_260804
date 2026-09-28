// One intentional vertical wheel gesture advances one hero scene.
// Normalize pixel/line/page events and wait for an idle gap before advancing again.
export function createWheelStepGate({ threshold = 80, idleMs = 200 } = {}) {
  let lastTime = -Infinity;
  let total = 0;
  let consumed = false;
  return (event, now, pageHeight = 800) => {
    const { deltaX = 0, deltaY = 0, deltaMode = 0, ctrlKey = false } = event;
    if (ctrlKey || Math.abs(deltaX) > Math.abs(deltaY) || !deltaY) return 0;
    if (now - lastTime >= idleMs) {
      total = 0;
      consumed = false;
    }
    lastTime = now;
    if (consumed) return 0;
    const pixels = deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? pageHeight : 1);
    if (Math.sign(total) !== Math.sign(pixels)) total = 0;
    total += pixels;
    if (Math.abs(total) < threshold) return 0;
    consumed = true;
    return Math.sign(total);
  };
}
