import { records, documentId } from './hero-record-data.js';

const headings = {
  ev: ['설계 BOM', '구성 품목', '수량', '연결 도면'],
  aircraft: ['설계변경 대상 목록', '변경 대상', '검토 항목', '연결 도면'],
  building: ['층별 도면 배포 목록', '배포 항목', '수신처 · 상태', '평면도']
};

export function initRecordTable(panel) {
  const table = panel.querySelector('.record-list');
  const columns = table.tHead.rows[0];
  const body = table.tBodies[0];
  let showingKind;
  let activeSlide;
  body.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.getAttribute('aria-current') === 'true') return;
    activeSlide.dispatchEvent(new CustomEvent('hero-row-select', {detail:Number(button.dataset.index)}));
  });

  return function update(slide, {kind, index, key}) {
    const items = records[kind];
    activeSlide = slide;
    if (showingKind !== kind) {
      showingKind = kind;
      const [title, ...labels] = headings[kind];
      panel.querySelector('[data-list-title]').textContent = title;
      columns.replaceChildren(...labels.map(label => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = label;
        return th;
      }));
      body.replaceChildren(...items.map((item, i) => {
        const row = document.createElement('tr');
        const name = document.createElement('button');
        name.type = 'button';
        name.dataset.index = String(i);
        const pin = document.createElement('span');
        pin.className = 'record-pin';
        pin.textContent = kind === 'building' ? (i + 1)+'F' : String(i + 1);
        name.append(pin, item.name);
        row.insertCell().append(name);
        const detail = row.insertCell();
        if (kind === 'building') {
          detail.append(item.recipient);
          const status = document.createElement('small');
          status.textContent = item.status;
          detail.append(status);
        } else {
          detail.textContent = kind === 'ev' ? item.count+'개' : item.review;
        }
        row.insertCell();
        return row;
      }));
    }
    for (const [i, item] of items.entries()) {
      const row = body.rows[i];
      const active = i === index;
      row.classList.toggle('is-selected', active);
      row.querySelector('button').setAttribute('aria-current', String(active));
      row.cells[2].textContent = documentId(kind, item, active ? key : item.key);
    }
    panel.querySelector('[data-drawing-id]').textContent = body.rows[index].cells[2].textContent;
  };
}
