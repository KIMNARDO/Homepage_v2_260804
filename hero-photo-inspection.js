import { documentId, records } from './hero-record-data.js';

export function setupPhotoInspection(slide, stage, selectRecord, openModel) {
  const kind = stage.dataset.transport;
  const items = records[kind];
  const image = stage.querySelector('.photo-cutaway');
  const group = stage.querySelector('.photo-pins');
  const controls = slide.querySelector('.photo-controls');
  const toggle = controls.querySelector('[data-photo-toggle]');
  const label = controls.querySelector('[data-photo-selection]');
  const status = stage.querySelector('.scene-load-status');
  let exposed = false;

  function expose(open) {
    exposed = open;
    stage.classList.toggle('show-cutaway', open);
    image.setAttribute('aria-hidden', String(!open));
    toggle.textContent = open ? '외관 보기' : '단면 보기';
    if (open && !image.hasAttribute('src')) image.src = image.dataset.cutaway;
  }

  image.addEventListener('load', () => stage.classList.add('cutaway-ready'));
  image.addEventListener('error', () => {
    image.removeAttribute('src');
    stage.classList.remove('cutaway-ready');
    if (exposed) status.textContent = '단면 사진을 불러오지 못했습니다. 부품을 다시 선택해 주세요.';
  });
  toggle.addEventListener('click', () => { status.textContent = ''; expose(!exposed); });
  controls.querySelector('[data-photo-3d]').addEventListener('click', openModel);

  const pins = items.map(({name, photoPoint}, index) => {
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'photo-pin';
    pin.textContent = String(index + 1);
    pin.style.left = photoPoint[0] + '%';
    pin.style.top = photoPoint[1] + '%';
    pin.title = name;
    pin.setAttribute('aria-label', (index + 1) + '번 ' + name + ' 도면 보기');
    pin.addEventListener('click', () => selectRecord(index));
    group.append(pin);
    return pin;
  });

  return {
    select(index, key, focusPin) {
      const item = items[index];
      controls.hidden = false;
      slide.classList.add('photo-inspecting');
      stage.style.setProperty('--reveal-x', item.photoPoint[0] + '%');
      stage.style.setProperty('--reveal-y', item.photoPoint[1] + '%');
      status.textContent = '';
      label.textContent = item.name + ' · ' + documentId(kind, item, key);
      pins.forEach((pin, i) => pin.setAttribute('aria-pressed', String(index === i)));
      expose(true);
      if (focusPin) pins[index].focus({preventScroll:true});
    },
    close() {
      slide.classList.remove('photo-inspecting');
      controls.hidden = true;
      expose(false);
    }
  };
}
