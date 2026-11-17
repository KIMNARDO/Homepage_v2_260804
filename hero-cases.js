import { initRecordTable } from './hero-record-table.js';
import { products, productScreenHref } from './home-products-data.js';

const cases = {
  0: {
    product: 'pdm', label: 'CLIP PDM · 제품 구조',
    question: '조립품 하나에 어떤 부품이 몇 개 들어갈까요?',
    example: 'PTC 히터 어셈블리(DEMO-A-L01)의 부품 구성과 조립 도면을 확인해 보세요.',
    screenTitle: 'PTC 히터 어셈블리 BOM · 실제 PDM 화면',
    screenCaptions: {
      '다단계 BOM': '방열핀 조립 아래에는 터미널 2개와 하네스 3개가 있습니다. 수량은 상위 조립품 1개 기준입니다.',
      '도면 상세': '같은 PTC 히터 어셈블리의 개정 01 도면(DEMO-A-L01_ASSY_R01.pdf)이 미리보기에 표시됩니다.'
    },
    screens: ['다단계 BOM', '도면 상세']
  },
  2: {
    product: 'pdm', label: 'CLIP PDM · 설계변경',
    question: '설계변경 사유와 변경 범위는 어디서 확인할까요?',
    example: '액추에이터(ACTUATOR)의 설계변경 기록입니다. 기본 정보에서 리비전과 변경 사유, 변경 내용을 함께 확인할 수 있습니다.',
    screenTitle: '액추에이터 설계변경 · 실제 PDM 화면',
    screenCaptions: {
      '설계변경': '리비전 01의 변경 사유는 ‘품질향상’이고, 변경 내용에는 ‘도면’과 ‘BOM’이 선택되어 있습니다.'
    },
    screens: ['설계변경']
  },
  3: {
    product: 'dds', label: 'CLIP DDMS · 도면 배포',
    question: '보낸 도면을 협력사가 수신확인했을까요?',
    example: '‘브라켓 P-3120 신규 배포 (Rev A)’를 사내 담당자와 협력사 화면에서 확인해 보세요. 두 화면의 배포 번호는 DEMO-2026-0915-0007입니다.',
    screenTitle: '브라켓 배포 목록 · 실제 DDMS 화면',
    screenCaptions: {
      '사내 배포 관리': '브라켓 P-3120 행에는 도면 1건, 배포 상태 ‘배포중’, 수신확인 2/2가 표시됩니다.',
      '협력사 포털': '‘최근 수신 배포’에서 같은 브라켓 P-3120 건의 상태는 ‘수신확인 완료’입니다.'
    },
    screens: ['사내 배포 관리', '협력사 포털']
  }
};

export function initHeroCases(hero) {
  const link = hero?.querySelector('[data-open-case]');
  const dialog = document.querySelector('[data-case-dialog]');
  if (!link || !dialog) return () => {};
  let current;
  const record = hero.querySelector('.linked-record');
  const updateTable = initRecordTable(record);
  function closeRecord() {
    record.hidden = true;
    hero.classList.remove('has-linked-record');
  }
  hero.addEventListener('hero-record-close', event => {
    if (event.target.classList.contains('is-active')) closeRecord();
  });
  hero.addEventListener('hero-record-select', event => {
    if (!current || !event.target.classList.contains('is-active')) return;
    const {name,path,drawing} = event.detail;
    updateTable(event.target, event.detail);
    const firstOpen = record.hidden;
    const view = screens()[0];
    record.querySelector('[data-record-product]').textContent = event.target.querySelector('.transport-title span').textContent;
    record.querySelector('h2').textContent = name;
    record.querySelector('[data-record-path]').textContent = path;
    record.querySelector('[data-drawing-caption]').textContent = name + (current.product==='dds' ? ' 평면도' : ' 투상도') + ' · 모델 참고도';
    const sheet = record.querySelector('[data-record-drawing]');
    sheet.src = record.querySelector('[data-drawing-full]').href = drawing;
    sheet.alt = name + ' 모델에서 생성한 참고 도면';
    record.querySelector('[data-record-screen-title]').textContent = current.screenTitle;
    const shot = record.querySelector('[data-record-screen]');
    shot.src = record.querySelector('[data-screen-full]').href = view.image;
    record.hidden = false;
    hero.classList.add('has-linked-record');
    if (firstOpen && matchMedia('(max-width:760px)').matches) {
      requestAnimationFrame(()=>event.target.scrollIntoView({block:'start',behavior:'instant'}));
    }
  });
  record.querySelector('[data-record-back]').addEventListener('click', () => {
    const slide = hero.querySelector('.am-industry-slide.is-active');
    slide.dispatchEvent(new Event('hero-entry-close'));
    closeRecord();
  });
  const controls = dialog.querySelector('.case-switch');
  const imageLink = dialog.querySelector('figure a');
  const image = imageLink.querySelector('img');
  function screens() {
    return current.screens.map(label => products[current.product].views.find(view => view.label === label));
  }
  function displayScreen(view) {
    dialog.querySelector('[data-case-product]').href = productScreenHref(products[current.product], view);
    image.src = imageLink.href = view.image;
    image.alt = view.caption;
    dialog.querySelector('figcaption').textContent = current.screenCaptions?.[view.label] ?? view.copy;
    for (const button of controls.children) {
      button.setAttribute('aria-pressed', String(button.textContent === view.label));
    }
  }
  function openCase(event) {
    if (!current || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const product = products[current.product];
    dialog.querySelector('[data-case-dialog-label]').textContent = current.label + ' · 실제 제품 화면';
    dialog.querySelector('h2').textContent = current.question;
    dialog.querySelector('[data-case-context]').textContent = current.example;
    dialog.querySelector('[data-case-consult]').href = 'contact.html?type=demo&product=' + encodeURIComponent(product.product);
    const views = screens();
    controls.hidden = views.length < 2;
    controls.replaceChildren(...views.map(view => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = view.label;
      button.addEventListener('click', () => displayScreen(view));
      return button;
    }));
    displayScreen(views[0]);
    dialog.showModal();
  }
  for (const opener of hero.querySelectorAll('[data-open-case], [data-case-near]')) {
    opener.addEventListener('click', openCase);
  }
  return function selectCase(industry) {
    if (current === cases[industry]) return;
    closeRecord();
    current = cases[industry];
    const [first] = screens();
    link.href = first.image;
    link.querySelector('img').src = first.image;
    link.querySelector('[data-case-label]').textContent = current.label;
    link.querySelector('[data-case-question]').textContent = current.question;
    link.querySelector('[data-case-link]').textContent = first.label + ' 실제 화면 보기 ↗';
  };
}
