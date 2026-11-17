const descriptions = [
  'SOLIDWORKS에서 신규 품목 11개를 등록한 뒤, 웹 PDM에서 조립품의 L0~L3 구조와 부품 수량을 확인합니다.',
  'AutoCAD에서 도면을 체크아웃해 A2 표기가 있는 도면을 열고, 변경 사유를 입력해 체크인한 뒤 웹 PDM에서 도면을 확인합니다.'
];

for (const section of document.querySelectorAll('[data-cad-walkthrough]')) {
  const video = section.querySelector('video');
  const description = section.querySelector('[data-cad-description]');
  const fullscreen = section.querySelector('[data-cad-fullscreen]');
  const links = [...section.querySelectorAll('.cad-film-choices [data-poster]')];
  fullscreen.addEventListener('click', async event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const standard = document.fullscreenEnabled && video.requestFullscreen;
    if (!standard && !video.webkitEnterFullscreen) return;
    event.preventDefault();
    try {
      if (standard) await video.requestFullscreen();
      else video.webkitEnterFullscreen();
      await video.play().catch(() => {});
    } catch {
      // The media URL also works in browsers that restrict inline fullscreen.
      window.location.assign(fullscreen.href);
    }
  });
  function selectFilm(index) {
    const link = links[index];
    if (video.src !== link.href) {
      video.pause();
      video.poster = link.dataset.poster;
      video.src = link.href;
    }
    fullscreen.href = link.href;
    video.setAttribute('aria-label', buttons[index].firstChild.textContent.trim() + ' 연동 시연');
    description.textContent = descriptions[index];
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }

  const buttons = links.map((link, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.film = link.dataset.film;
    button.append(...link.childNodes);
    button.addEventListener('click', () => {
      selectFilm(index);
      video.play().catch(() => {}); // Native controls also allow manual playback.
    });
    link.replaceWith(button);
    return button;
  });
  const requestedFilm = new URLSearchParams(location.search).get('film');
  const index = links.findIndex(link => link.dataset.film === requestedFilm);
  selectFilm(index >= 0 ? index : 0);
}
