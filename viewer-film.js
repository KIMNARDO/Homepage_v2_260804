const gallery = document.querySelector('#viewer-film');
const dialog = gallery.querySelector('#guide-dialog');
const video = dialog.querySelector('video');
const direct = dialog.querySelector('#guide-direct');
const fullscreen = dialog.querySelector('#guide-fullscreen');

const player = dialog.querySelector('.guide-player');
const play = dialog.querySelector('#guide-play');
const seek = dialog.querySelector('#guide-seek');
const time = dialog.querySelector('#guide-time');
function clock(seconds) {
  const whole = Math.floor(seconds);
  return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
}

function updateControls() {
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  seek.disabled = duration === 0;
  seek.max = duration;
  seek.value = video.currentTime;
  time.textContent = clock(video.currentTime) + ' / ' + clock(duration);
  seek.setAttribute('aria-valuetext', time.textContent);
  play.textContent = video.ended ? '다시 재생' : video.paused ? '재생' : '일시정지';
}

function togglePlayback() {
  if (video.paused) video.play().catch(updateControls);
  else video.pause();
}

gallery.addEventListener('click', event => {
  const link = event.target.closest('a[data-film]');
  if (!link || !dialog.showModal || event.defaultPrevented || event.button !== 0 ||
      event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  dialog.showModal();
  video.poster = link.querySelector('img').src;
  video.src = link.href;
  updateControls();
  video.play().catch(updateControls);
});

play.addEventListener('click', togglePlayback);
video.addEventListener('click', togglePlayback);
seek.addEventListener('input', () => { video.currentTime = Number(seek.value); });
for (const event of ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'ended']) {
  video.addEventListener(event, updateControls);
}

dialog.addEventListener('close', () => {
  if (dialog.open) return;
  video.pause();
  video.removeAttribute('src');
  video.load();
});

if ((document.fullscreenEnabled && player.requestFullscreen) || video.webkitEnterFullscreen) {
  fullscreen.hidden = false;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement === player) await document.exitFullscreen();
      else if (document.fullscreenEnabled && player.requestFullscreen) await player.requestFullscreen();
      else video.webkitEnterFullscreen();
    } catch {
      direct.focus();
    }
  });
}

document.addEventListener('fullscreenchange', () => {
  fullscreen.textContent = document.fullscreenElement === player ? '전체 화면 종료' : '전체 화면';
});
