import './lead-download.js';

/* =============================================
   Papsnet Homepage — AntiGravity + Magic UI
   Vanilla JS — All Interactive Effects
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // =============================
  // THEME TOGGLE
  // =============================
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('papsnet-theme') || 'light';
  html.setAttribute('data-theme', savedTheme);

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    themeToggle.setAttribute('aria-label', theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환');
    themeToggle.title = theme === 'dark' ? '라이트 모드' : '다크 모드';
  }
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('papsnet-theme', next);
      updateThemeIcon(next);
    });
  }


  // =============================
  // SCROLL PROGRESS BAR
  // =============================
  const progressBar = document.getElementById('scrollProgress');

  function updateProgress() {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }


  // =============================
  // NAVIGATION
  // =============================
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const announcement = document.getElementById('announcement');

  function handleNav() {
    if (!nav) return;
    const annHeight = announcement ? announcement.offsetHeight : 0;
    nav.classList.toggle('scrolled', window.scrollY > annHeight);
  }

  // Mobile menu toggle
  const mobileMenuClose = document.getElementById('mobileMenuClose');

  function closeMobileMenu() {
    if (navToggle) navToggle.classList.remove('active');
    if (mobileMenu) mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // =============================
  // NAV DROPDOWN
  // =============================
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      // Close all dropdowns first
      document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
      if (!isOpen) dropdown.classList.add('open');
    });

    // Close when clicking a link inside
    dropdown.querySelectorAll('.nav-dropdown-item').forEach(item => {
      item.addEventListener('click', () => dropdown.classList.remove('open'));
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
  });

  // Active nav link highlight
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentFile && currentFile !== 'index.html') {
      link.classList.add('active');
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = document.body.classList.contains('plm-home-v2') ? 132 : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  // =============================
  // DASHBOARD TABS
  // =============================
  const dashboardTabs = document.querySelectorAll('[data-dashboard-target]');
  const dashboardPanels = document.querySelectorAll('[data-dashboard-panel]');

  dashboardTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.dashboardTarget;

      dashboardTabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', active ? 'true' : 'false');
      });

  dashboardPanels.forEach(panel => {
        panel.classList.toggle('active', panel.dataset.dashboardPanel === target);
      });
    });
  });

  // =============================
  // AI / CAD TECHNOLOGY TABS
  // =============================
  const techTabs = document.querySelectorAll('[data-tech-tab]');
  const techImage = document.querySelector('[data-tech-image]');
  const techWindow = document.querySelector('[data-tech-window]');
  const techEyebrow = document.querySelector('[data-tech-eyebrow]');
  const techTitle = document.querySelector('[data-tech-title]');
  const techCopy = document.querySelector('[data-tech-copy]');
  const techLink = document.querySelector('[data-tech-link]');
  const techStage = document.querySelector('[data-tech-stage]');
  const techCaption = document.querySelector('[data-tech-caption]');
  const techSpecOneLabel = document.querySelector('[data-tech-spec-one-label]');
  const techSpecOneValue = document.querySelector('[data-tech-spec-one-value]');
  const techSpecTwoLabel = document.querySelector('[data-tech-spec-two-label]');
  const techSpecTwoValue = document.querySelector('[data-tech-spec-two-value]');

  const technologyData = {
    viewer2d: {
      image: 'images/clip-2d-viewer.png',
      alt: 'Clip PLM DWG 2D 도면 뷰어 화면',
      window: 'DWG / DXF VIEWER',
      eyebrow: '2D Viewer',
      title: 'DWG·DXF를 PLM 안에서 확인',
      copy: '도면 파일과 관련 문서, 개정 정보를 같은 화면에서 확인합니다.',
      href: 'product-clippdm.html',
      link: 'Clip PDM에서 자세히 보기',
      caption: '도면과 개정 정보를 한 화면에서 확인',
      specOne: ['FORMAT', 'DWG · DXF'],
      specTwo: ['CONNECTED', '문서 · 개정']
    },
    viewer3d: {
      image: 'images/clip-3d-viewer.png',
      alt: 'Clip PLM 3D 형상 뷰어 화면',
      window: 'CATIA 3D VIEWER',
      eyebrow: '3D Viewer',
      title: 'CATIA 형상을 PLM에서 검토',
      copy: 'CATIA 데이터를 확인하는 3D 뷰어를 Clip PLM과 함께 제공합니다.',
      href: 'product-clippdm.html',
      link: '3D 뷰어 구성 보기',
      caption: '제품 구조와 형상을 분해해 검토',
      specOne: ['FORMAT', 'CATIA'],
      specTwo: ['CONNECTED', 'BOM · 주석']
    },
    chatbot: {
      image: 'images/product-tour/chatbot-results.png',
      alt: '실제 Clip PLM 프로젝트 화면에서 AI 챗봇으로 데이터를 조회한 화면',
      window: 'AI CHATBOT / PLM DATA',
      eyebrow: 'AI Chatbot',
      title: 'PLM 데이터에 대화형으로 접근',
      copy: '제품개발 데이터를 대상으로 사용하는 AI 챗봇을 Clip PLM과 함께 제공합니다.',
      href: 'product-clippdm.html',
      link: 'Clip PLM 구성 보기',
      caption: '현재 화면을 유지한 채 프로젝트 데이터를 질의',
      specOne: ['CONTEXT', 'PLM DATA'],
      specTwo: ['WORKSPACE', '프로젝트 화면']
    },
    autocad: {
      image: 'videos/poster-cadwin-clean.png',
      alt: 'AI CADWin AutoCAD 연동 화면',
      window: 'AUTOCAD INTEGRATION',
      eyebrow: 'AutoCAD Integration',
      title: '설계 환경과 PLM을 연결',
      copy: 'AI CADWin은 AutoCAD 환경에서 BOM 정보 추출과 도면 검색을 지원합니다.',
      href: 'product-cadwin.html',
      link: 'AI CADWin 자세히 보기',
      caption: 'AutoCAD 작업에서 도면 정보와 BOM을 연결',
      specOne: ['SOURCE', 'AUTOCAD'],
      specTwo: ['CONNECTED', '도면 · BOM']
    }
  };

  function setTechnology(targetKey) {
    const data = technologyData[targetKey];
    if (!data) return;

    if (techImage) {
      techImage.src = data.image;
      techImage.alt = data.alt;
    }
    if (techWindow) techWindow.textContent = data.window;
    if (techEyebrow) techEyebrow.textContent = data.eyebrow;
    if (techTitle) techTitle.textContent = data.title;
    if (techCopy) techCopy.textContent = data.copy;
    if (techStage) techStage.dataset.activeTech = targetKey;
    if (techCaption) techCaption.textContent = data.caption;
    if (techSpecOneLabel) techSpecOneLabel.textContent = data.specOne[0];
    if (techSpecOneValue) techSpecOneValue.textContent = data.specOne[1];
    if (techSpecTwoLabel) techSpecTwoLabel.textContent = data.specTwo[0];
    if (techSpecTwoValue) techSpecTwoValue.textContent = data.specTwo[1];
    if (techLink) {
      techLink.href = data.href;
      techLink.firstChild.textContent = `${data.link} `;
    }

    techTabs.forEach(tab => {
      const active = tab.dataset.techTab === targetKey;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  techTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setTechnology(tab.dataset.techTab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1;
      const nextTab = techTabs[(index + direction + techTabs.length) % techTabs.length];
      nextTab.focus();
      setTechnology(nextTab.dataset.techTab);
    });
  });

  // =============================
  // PRODUCT SHOWCASE TABS
  // =============================
  const productShowcase = document.querySelector('.am-product-showcase');
  const productsSection = document.querySelector('#products');
  const productTabs = document.querySelectorAll('[data-product-tab]');
  const productDetailLink = document.querySelector('[data-product-detail-link]');
  const productDetailImage = document.querySelector('[data-product-detail-image]');
  const productDetailEyebrow = document.querySelector('[data-product-detail-eyebrow]');
  const productDetailTitle = document.querySelector('[data-product-detail-title]');
  const productDetailCopy = document.querySelector('[data-product-detail-copy]');
  const productFeatures = document.querySelectorAll('[data-product-feature]');
  const productStep = document.querySelector('[data-product-step]');
  const productCurrent = document.querySelector('[data-product-current]');
  let currentProductKey = 'cadwin';
  if (productShowcase) productShowcase.dataset.product = currentProductKey;
  if (productsSection) productsSection.dataset.product = currentProductKey;

  const productShowcaseData = {
    cadwin: {
      href: 'product-cadwin.html',
      image: 'images/cadwin_drawing_inspection.png',
      alt: 'AI CADWin 도면 검사 화면',
      eyebrow: 'AI CADWin',
      title: 'AI 도면 검색과 도면 정보 추출',
      copy: 'CAD 도면의 표제란, 부품 정보, 유사 도면을 빠르게 찾고 설계 데이터 재사용을 지원합니다.',
      features: [
        ['images/icons3d/smart_toy-cyan.webp', '도면 인식', '표제란과 부품 정보 추출', 'AutoCAD 도면에서 품번, 재질, 수량 등 BOM 정보를 추출합니다.'],
        ['images/icons3d/search-blue.webp', '유사 도면', '형상 기반 검색', 'AI 형상 인식을 기반으로 기존 도면의 유사도를 분석합니다.'],
        ['images/icons3d/account_tree-cyan.webp', 'BOM 연결', '도면 정보의 구조화', '추출한 정보를 품목과 BOM 데이터에 연결합니다.'],
        ['images/icons3d/draw-cyan.webp', 'CAD 연동', 'AutoCAD 리본 통합', 'AutoCAD 환경에서 AI CADWin 기능을 사용할 수 있습니다.']
      ]
    },
    pdm: {
      href: 'product-clippdm.html',
      image: 'images/plm_project_dashboard.png',
      alt: 'Clip PDM 프로젝트와 도면 관리 화면',
      eyebrow: 'Clip PDM',
      title: '도면과 문서 승인 흐름을 한곳에서 관리',
      copy: '체크인, 체크아웃, 개정, 승인 이력을 제품 데이터 기준으로 묶어 설계 변경의 기준 화면을 만듭니다.',
      features: [
        ['images/icons3d/database-blue.webp', '문서 관리', '도면과 문서 기준화', '도면, 사양서, 산출물을 품목과 프로젝트에 연결해 관리합니다.'],
        ['images/icons3d/fact_check-purple.webp', '승인 흐름', '검토와 결재 이력', '부서별 승인 상태와 변경 요청을 같은 화면에서 추적합니다.'],
        ['images/icons3d/manage_history-blue.webp', '개정 관리', '리비전 추적', '최신본과 이전본의 변경 이력을 관리합니다.'],
        ['images/icons3d/view_in_ar-cyan.webp', '통합 뷰어', '2D·3D 형상 확인', 'DWG·DXF 도면과 CATIA 3D 형상을 PLM에서 확인합니다.']
      ]
    },
    pms: {
      href: 'product-clippms.html',
      image: 'images/pms_project_overview.png',
      alt: 'Clip PMS 프로젝트 일정과 산출물 관리 화면',
      eyebrow: 'Clip PMS',
      title: '프로젝트 일정과 산출물을 업무 단계별로 추적',
      copy: '개발 단계, 담당자, 산출물, 이슈를 프로젝트 기준으로 연결해 지연 구간과 책임 범위를 빠르게 확인합니다.',
      features: [
        ['images/icons3d/calendar_month-orange.webp', '일정 관리', '단계별 마일스톤', '개발 단계와 Gate 일정을 한 화면에서 확인합니다.'],
        ['images/icons3d/view_timeline-orange.webp', '업무 구조', '일정과 담당자', '업무 단위별 담당자, 기간, 진행 상태를 추적합니다.'],
        ['images/icons3d/warning-orange.webp', '이슈 추적', '지연과 리스크 관리', '지연 업무와 주요 이슈를 프로젝트 기준으로 관리합니다.'],
        ['images/icons3d/description-purple.webp', '산출물 관리', '검토 자료 연결', '회의록, 도면, 보고서 등 산출물을 일정과 함께 관리합니다.']
      ]
    },
    bom: {
      href: 'product-multibom.html',
      image: 'images/multibom_dashboard_real.webp',
      alt: 'Multi-BOM 구조 비교 화면',
      eyebrow: 'Multi-BOM',
      title: 'E-BOM과 M-BOM의 구조 차이를 비교',
      copy: '설계 BOM과 제조 BOM을 같은 기준에서 비교하고 변경된 품목과 수량을 확인합니다.',
      features: [
        ['images/icons3d/account_tree-green.webp', '설계 BOM', 'E-BOM 구조 관리', '설계 관점의 제품 구조와 품목 관계를 관리합니다.'],
        ['images/icons3d/layers-green.webp', '제조 BOM', 'M-BOM 구조 관리', '제조 관점의 공정과 조립 구조를 관리합니다.'],
        ['images/icons3d/swap_horiz-green.webp', '구조 비교', '변경 항목 확인', 'BOM 간 추가, 삭제, 변경 항목을 비교합니다.'],
        ['images/icons3d/hub-green.webp', '데이터 연결', '품목 관계 추적', '설계와 제조 데이터의 연결 관계를 확인합니다.']
      ]
    },
    cms: {
      href: 'product-clipcms.html',
      image: 'images/cms_cost_dashboard.png',
      alt: 'Clip CMS 원가 분석 대시보드 화면',
      eyebrow: 'Clip CMS',
      title: '사전 원가와 사후 원가를 같은 기준으로 비교',
      copy: '자재비, 가공비, 견적, 실제 원가를 제품 기준으로 연결해 변경이 비용에 미치는 영향을 분석합니다.',
      features: [
        ['images/icons3d/calculate-purple.webp', '사전 원가', '견적 기준 관리', '제품과 품목 기준으로 사전 원가 데이터를 관리합니다.'],
        ['images/icons3d/payments-amber.webp', '사후 원가', '실적 원가 비교', '사전 원가와 사후 원가를 같은 구조에서 비교합니다.'],
        ['images/icons3d/query_stats-amber.webp', '영향 분석', '변경 비용 검토', '설계 변경 전후의 원가 데이터를 비교합니다.'],
        ['images/icons3d/monitoring-amber.webp', '대시보드', '원가 현황 확인', '프로젝트와 제품별 원가 데이터를 화면에서 확인합니다.']
      ]
    }
  };

  function setProductShowcase(targetKey) {
    const data = productShowcaseData[targetKey];
    if (!data || !productShowcase) return;

    currentProductKey = targetKey;
    productShowcase.dataset.product = targetKey;
    if (productsSection) productsSection.dataset.product = targetKey;
    productShowcase.classList.add('is-changing');

    const selectedTab = Array.from(productTabs).find(tab => tab.dataset.productTab === targetKey);
    if (productStep && selectedTab) productStep.textContent = selectedTab.dataset.index || '01';
    if (productCurrent) productCurrent.textContent = data.eyebrow;

    if (productDetailLink) productDetailLink.href = data.href;
    if (productDetailImage) {
      productDetailImage.src = data.image;
      productDetailImage.alt = data.alt;
    }
    if (productDetailEyebrow) productDetailEyebrow.textContent = data.eyebrow;
    if (productDetailTitle) productDetailTitle.textContent = data.title;
    if (productDetailCopy) productDetailCopy.textContent = data.copy;

    productFeatures.forEach((card, index) => {
      const feature = data.features[index];
      if (!feature) return;
      if (targetKey === 'cadwin' && index === 2) feature[0] = 'images/icons3d/account_tree-green.webp';
      if (targetKey === 'cadwin' && index === 3) feature[0] = 'images/icons3d/manage_history-orange.webp';
      const mark = card.querySelector('[data-feature-mark]');
      const label = card.querySelector('[data-feature-label]');
      const title = card.querySelector('h3');
      const copy = card.querySelector('p');

      if (mark) {
        let icon = mark.querySelector('img');
        if (!icon) {
          icon = document.createElement('img');
          icon.alt = '';
          icon.decoding = 'async';
          mark.textContent = '';
          mark.appendChild(icon);
        }
        icon.src = feature[0];
      }
      if (label) label.textContent = feature[1];
      if (title) title.textContent = feature[2];
      if (copy) copy.textContent = feature[3];
    });

    productTabs.forEach(tab => {
      const active = tab.dataset.productTab === targetKey;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    window.setTimeout(() => productShowcase.classList.remove('is-changing'), 180);
  }

  productTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setProductShowcase(tab.dataset.productTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + productTabs.length) % productTabs.length;
      const nextTab = productTabs[nextIndex];
      nextTab.focus();
      setProductShowcase(nextTab.dataset.productTab);
    });
  });

  // =============================
  // ACTUAL PRODUCT TOUR
  // Real Clip PMS captures are presented as one connected task flow.
  // =============================
  const productTour = document.querySelector('[data-product-tour]');

  if (productTour) {
    const tourTabs = Array.from(productTour.querySelectorAll('[data-tour-tab]'));
    const tourPanels = Array.from(productTour.querySelectorAll('[data-tour-panel]'));
    const tourStatusBars = Array.from(productTour.querySelectorAll('.am-tour-status > span'));
    const tourWindow = productTour.querySelector('[data-tour-window]');
    const tourEyebrow = productTour.querySelector('[data-tour-eyebrow]');
    const tourTitle = productTour.querySelector('[data-tour-title]');
    const tourCopy = productTour.querySelector('[data-tour-copy]');
    const tourStatus = productTour.querySelector('[data-tour-status]');
    const tourVideos = Array.from(productTour.querySelectorAll('video'));
    const tourJumpLinks = Array.from(productTour.querySelectorAll('[data-tour-jump]'));
    const reduceTourMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let tourIndex = 0;
    let tourTimer = null;
    let tourInView = false;
    let tourPaused = false;
    let tourRailProgrammatic = false;
    let tourRailScrollTimer = null;

    const tourData = {
      dashboard: {
        window: 'TEAM LEAD · PROJECT STATUS',
        eyebrow: 'PORTFOLIO VIEW',
        title: '팀장이 먼저 봐야 할 지연과 이슈',
        copy: '프로젝트 단계, 진행률, 지연 과제와 이슈를 같은 화면에서 비교해 우선 대응할 업무를 찾습니다.'
      },
      projects: {
        window: 'DEVELOPMENT PROJECTS · INDEX',
        eyebrow: 'PROJECT INDEX',
        title: '고객사와 차종을 기준으로 프로젝트 탐색',
        copy: '프로젝트 목록을 OEM, 차종, 수행 상태와 일정 기준으로 좁혀 필요한 개발 건으로 바로 이동합니다.'
      },
      detail: {
        window: 'PROJECT · DETAIL CONTEXT',
        eyebrow: 'PROJECT CONTEXT',
        title: '기본 정보와 실행 데이터를 한 프로젝트에',
        copy: '프로젝트 기본 정보에서 WBS, 멤버, 이슈, 간트차트, 설계변경과 BOM까지 같은 맥락으로 연결합니다.'
      },
      schedule: {
        window: 'CUSTOMER MASTER SCHEDULE · GATE',
        eyebrow: 'CUSTOMER MILESTONE',
        title: '고객 대일정과 내부 Gate를 같은 시간축에서',
        copy: '고객 마일스톤, WBS Gate, 현재 위치와 D-day를 함께 보여 지연 구간과 다음 대응 시점을 분명하게 만듭니다.'
      },
      assistant: {
        window: 'PLM AI ASSISTANT · PROJECT DATA',
        eyebrow: 'AI ASSISTANT',
        title: '검색 조건 대신 자연어로 프로젝트 조회',
        copy: 'Clip PLM 안의 프로젝트 데이터를 대상으로 질문하고, 관련 프로젝트와 업무 결과를 목록으로 확인합니다.'
      }
    };

    const restartTourTimer = () => {
      window.clearInterval(tourTimer);
      productTour.classList.remove('is-running');
      if (reduceTourMotion || !tourInView || tourPaused || tourTabs.length < 2) return;
      void productTour.offsetWidth;
      productTour.classList.add('is-running');
      tourTimer = window.setInterval(() => {
        setTourStep((tourIndex + 1) % tourTabs.length);
      }, 7000);
    };

    function setTourStep(nextIndex) {
      if (!tourTabs.length) return;
      tourIndex = (nextIndex + tourTabs.length) % tourTabs.length;
      const activeKey = tourTabs[tourIndex].dataset.tourTab;
      const activeData = tourData[activeKey];

      productTour.dataset.tour = activeKey;
      tourTabs.forEach((tab, index) => {
        const active = index === tourIndex;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.tabIndex = active ? 0 : -1;
      });
      if (window.innerWidth <= 720) {
        const rail = productTour.querySelector('.am-tour-rail');
        const activeTab = tourTabs[tourIndex];
        window.requestAnimationFrame(() => {
          tourRailProgrammatic = true;
          rail?.scrollTo({
            left: activeTab.offsetLeft - ((rail.clientWidth - activeTab.offsetWidth) / 2),
            behavior: reduceTourMotion ? 'auto' : 'smooth',
          });
          window.clearTimeout(tourRailScrollTimer);
          tourRailScrollTimer = window.setTimeout(() => {
            tourRailProgrammatic = false;
          }, reduceTourMotion ? 40 : 420);
        });
      }
      tourPanels.forEach(panel => {
        panel.classList.toggle('active', panel.dataset.tourPanel === activeKey);
      });
      tourVideos.forEach(video => {
        const active = video.closest('[data-tour-panel]')?.dataset.tourPanel === activeKey;
        if (!active || reduceTourMotion) {
          video.pause();
          return;
        }
        video.currentTime = 0;
        const playRequest = video.play();
        if (playRequest) playRequest.catch(() => {});
      });
      tourStatusBars.forEach((bar, index) => bar.classList.toggle('active', index === tourIndex));

      if (activeData) {
        if (tourWindow) tourWindow.textContent = activeData.window;
        if (tourEyebrow) tourEyebrow.textContent = activeData.eyebrow;
        if (tourTitle) tourTitle.textContent = activeData.title;
        if (tourCopy) tourCopy.textContent = activeData.copy;
      }
      if (tourStatus) tourStatus.textContent = String(tourIndex + 1).padStart(2, '0');
      restartTourTimer();
    }

    tourTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => setTourStep(index));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
        const nextIndex = (index + direction + tourTabs.length) % tourTabs.length;
        tourTabs[nextIndex].focus();
        setTourStep(nextIndex);
      });
    });

    const tourRail = productTour.querySelector('.am-tour-rail');
    tourRail?.addEventListener('scroll', () => {
      if (window.innerWidth > 720 || tourRailProgrammatic) return;
      window.clearTimeout(tourRailScrollTimer);
      tourRailScrollTimer = window.setTimeout(() => {
        const railCenter = tourRail.scrollLeft + (tourRail.clientWidth / 2);
        const closestIndex = tourTabs.reduce((bestIndex, tab, index) => {
          const tabCenter = tab.offsetLeft + (tab.offsetWidth / 2);
          const bestTab = tourTabs[bestIndex];
          const bestCenter = bestTab.offsetLeft + (bestTab.offsetWidth / 2);
          return Math.abs(tabCenter - railCenter) < Math.abs(bestCenter - railCenter) ? index : bestIndex;
        }, 0);

        if (closestIndex !== tourIndex) setTourStep(closestIndex);
      }, 120);
    }, { passive: true });

    tourJumpLinks.forEach(link => {
      link.addEventListener('click', event => {
        const targetIndex = tourTabs.findIndex(tab => tab.dataset.tourTab === link.dataset.tourJump);
        if (targetIndex < 0) return;
        event.preventDefault();
        setTourStep(targetIndex);
        productTour.querySelector('.am-tour-console')?.scrollIntoView({
          behavior: reduceTourMotion ? 'auto' : 'smooth',
          block: 'center'
        });
      });
    });

    productTour.addEventListener('pointerenter', () => {
      tourPaused = true;
      restartTourTimer();
    });
    productTour.addEventListener('pointerleave', () => {
      tourPaused = false;
      restartTourTimer();
    });
    productTour.addEventListener('focusin', () => {
      tourPaused = true;
      restartTourTimer();
    });
    productTour.addEventListener('focusout', event => {
      if (productTour.contains(event.relatedTarget)) return;
      tourPaused = false;
      restartTourTimer();
    });

    const tourObserver = new IntersectionObserver(entries => {
      tourInView = entries[0].isIntersecting;
      restartTourTimer();
    }, { threshold: 0.32 });

    tourObserver.observe(productTour);
    setTourStep(0);
  }


  // =============================
  // PRODUCT GALLERY (가로 스크롤 캐러셀)
  // =============================
  document.querySelectorAll('.product-gallery').forEach(gallery => {
    const track = gallery.querySelector('.product-gallery-track');
    if (!track) return;
    const prev = gallery.querySelector('.pg-prev');
    const next = gallery.querySelector('.pg-next');
    const stepSize = () => {
      const card = track.querySelector('.product-card');
      const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    };
    if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -stepSize(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => track.scrollBy({ left: stepSize(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  // =============================
  // SCROLL ZOOM VIDEO
  // =============================
  const scrollZoomWrapper = document.querySelector('.scroll-zoom-wrapper');
  const scrollZoomVideo = document.getElementById('scrollZoomVideo');

  function updateScrollZoom() {
    if (!scrollZoomWrapper || !scrollZoomVideo) return;
    const rect = scrollZoomWrapper.getBoundingClientRect();
    const vh = window.innerHeight;
    let progress = -rect.top / (rect.height - vh);
    progress = Math.max(0, Math.min(1, progress));

    const scale = 0.85 + progress * 0.15;
    const borderRadius = 24 * (1 - progress);
    const width = 75 + progress * 25;
    const shadowOpacity = 0.15 * (1 - progress * 0.7);

    scrollZoomVideo.style.transform = `scale(${scale})`;
    scrollZoomVideo.style.borderRadius = `${borderRadius}px`;
    scrollZoomVideo.style.width = `${width}%`;
    scrollZoomVideo.style.maxWidth = progress > 0.8 ? 'none' : '1100px';
    scrollZoomVideo.style.boxShadow = `0 ${20 * (1 - progress)}px ${80 * (1 - progress)}px rgba(0,0,0,${shadowOpacity})`;
  }


  // =============================
  // MAGIC NAV GLOW (Mouse-tracking radial on nav bar)
  // =============================
  if (nav) {
    nav.addEventListener('mousemove', (e) => {
      const rect = nav.getBoundingClientRect();
      nav.style.setProperty('--nav-x', `${e.clientX - rect.left}px`);
      nav.style.setProperty('--nav-y', `${e.clientY - rect.top}px`);
    });
    nav.addEventListener('mouseleave', () => {
      nav.style.setProperty('--nav-x', '-999px');
      nav.style.setProperty('--nav-y', '-999px');
    });
  }


  // =============================
  // MAGIC CARD (Mouse Glow)
  // =============================
  function initMagicCards() {
    document.querySelectorAll('.magic-card, .capability-card, .marquee-item, .icard').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    });
  }
  initMagicCards();


  // =============================
  // BLUR FADE (IntersectionObserver)
  // =============================
  const blurFadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('in-view'), delay * 120);
        blurFadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.blur-fade').forEach(el => blurFadeObserver.observe(el));

  // =============================
  // HEIMDALL-STYLE TEXT REVEAL
  // =============================
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const textRevealTargets = document.querySelectorAll(
    '.plm-home-v2 .am-hero:not(.am-hero-editorial) h1, ' +
    '.plm-home-v2 .am-section-head h2, ' +
    '.plm-home-v2 .am-technology-head h2, ' +
    '.plm-home-v2 .am-tour-heading h2, ' +
    '.plm-home-v2 .am-proof-card h2, ' +
    '.plm-home-v2 .am-cta-card h2'
  );

  function buildTextReveal(el) {
    if (!el || el.dataset.textRevealReady === 'true') return;

    const clone = el.cloneNode(true);
    clone.querySelectorAll('br').forEach(br => br.replaceWith(document.createTextNode('\n')));
    const text = clone.textContent
      .replace(/[ \t\r\f\v]+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\s+\n/g, '\n')
      .trim();
    if (!text) return;

    el.dataset.textRevealReady = 'true';
    el.dataset.textRevealText = text;
    el.setAttribute('aria-label', text.replace(/\n+/g, ' '));
    el.classList.add('am-text-reveal');
    if (el.matches('p')) el.classList.add('am-reveal-soft');

    renderLineReveal(el);

    if (motionQuery.matches) el.classList.add('is-visible');
  }

  function renderLineReveal(el) {
    const text = el.dataset.textRevealText;
    if (!text) return;

    const wasVisible = el.classList.contains('is-visible');
    el.textContent = '';
    el.classList.remove('is-visible');

    const wordItems = [];
    const segments = text.split(/\n+/).map(segment => segment.trim()).filter(Boolean);

    segments.forEach((segment, segmentIndex) => {
      const words = segment.split(/\s+/).filter(Boolean);

      words.forEach((wordText, wordIndex) => {
        const word = document.createElement('span');
        word.className = 'am-measure-word';
        word.textContent = wordText;
        el.appendChild(word);
        wordItems.push({ word, text: wordText, forceBreak: false });

        if (wordIndex < words.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });

      if (segmentIndex < segments.length - 1) {
        wordItems.push({ forceBreak: true });
        el.appendChild(document.createElement('br'));
      }
    });

    const lines = [];
    let currentLine = [];
    let previousTop = null;

    wordItems.forEach(item => {
      if (item.forceBreak) {
        if (currentLine.length) lines.push(currentLine);
        currentLine = [];
        previousTop = null;
        return;
      }

      const top = Math.round(item.word.offsetTop);
      if (previousTop !== null && Math.abs(top - previousTop) > 2 && currentLine.length) {
        lines.push(currentLine);
        currentLine = [];
      }

      currentLine.push(item.text);
      previousTop = top;
    });

    if (currentLine.length) lines.push(currentLine);

    el.textContent = '';

    lines.forEach((lineWords, index) => {
      const mask = document.createElement('span');
      const line = document.createElement('span');
      mask.className = 'am-line-mask';
      line.className = 'am-line';
      line.style.setProperty('--line-index', index);
      line.textContent = lineWords.join(' ');
      mask.appendChild(line);
      el.appendChild(mask);
    });

    if (wasVisible || motionQuery.matches) el.classList.add('is-visible');
  }

  textRevealTargets.forEach(buildTextReveal);

  let textRevealResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(textRevealResizeTimer);
    textRevealResizeTimer = window.setTimeout(() => {
      textRevealTargets.forEach(renderLineReveal);
    }, 180);
  });

  const textRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        textRevealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.22, rootMargin: '0px 0px -8% 0px' });

  if (!motionQuery.matches) {
    textRevealTargets.forEach(el => textRevealObserver.observe(el));
  }

  // Hero motion follows scroll after the initial line reveal.
  // Each line and functional prompt travels at a different speed to create depth.
  const heroSection = document.querySelector('.plm-home-v2 .am-hero');
  const heroCopy = heroSection?.querySelector('.am-hero-copy');
  const heroMedia = heroSection?.querySelector('.am-hero-media');
  const floatingDemoCta = document.querySelector('.plm-home-v2 .floating-demo-cta');
  const heroIndustrySlides = Array.from(document.querySelectorAll('[data-hero-industry-slide]'));
  const heroStepButtons = Array.from(document.querySelectorAll('[data-hero-step]'));
  const heroStepStatus = document.querySelector('[data-hero-step-status]');
  let heroIndustryIndex = 0;
  let heroPointerFrame = 0;
  let heroEvParts = [];
  let heroEvPartTotal = 0;
  let heroEvManifest = null;
  let heroAeroParts = [];
  let heroAeroPartTotal = 0;
  let heroAeroManifest = null;
  let heroFacilityParts = [];
  const heroFacilityPartTotal = 7;
  let heroSequenceStep = 0;
  let heroSequenceFrame = 0;
  let heroSequenceAnimating = false;
  let heroWheelAccumulator = 0;
  let heroWheelResetTimer = 0;
  let heroExitLock = false;
  let heroTouchStartY = null;
  let heroTouchHandled = false;
  const heroSequenceValues = { ev: 1, aero: 0, facility: 0 };
  const heroSequenceStates = [
    { industry: 0, ev: 1, aero: 0, facility: 0, explode: 1 },
    { industry: 0, ev: 0, aero: 0, facility: 0, explode: 0 },
    { industry: 2, ev: 0, aero: 1, facility: 0, explode: 1 },
    { industry: 3, ev: 0, aero: 1, facility: 1, explode: 1 },
  ];

  function smoothStep(value) {
    const clamped = Math.max(0, Math.min(1, value));
    return clamped * clamped * (3 - (2 * clamped));
  }

  function setBomPartGeometry(partNode, part, manifest, canvas, profile = {}) {
    if (!canvas) return;

    const canvasWidth = canvas.clientWidth || 1;
    const canvasHeight = canvas.clientHeight || 1;
    const centerX = manifest.sourceWidth / 2;
    const centerY = manifest.sourceHeight / 2;
    const compactXRatio = profile.compactX ?? 0.27;
    const compactYRatio = profile.compactY ?? 0.55;
    const compactX = centerX + ((part.cx - centerX) * compactXRatio);
    const compactY = centerY + ((part.cy - centerY) * compactYRatio);
    const translateX = ((compactX - part.cx) / manifest.sourceWidth) * canvasWidth;
    const translateY = ((compactY - part.cy) / manifest.sourceHeight) * canvasHeight;
    const radialX = (part.cx - centerX) / Math.max(centerX, 1);
    const radialY = (part.cy - centerY) / Math.max(centerY, 1);
    const depthScale = window.innerWidth <= 760 ? 0.58 : 1;
    const spreadScale = window.innerWidth <= 760 ? 0.5 : 1;
    const depthMagnitude = Math.min(
      profile.maxDepth ?? 560,
      (profile.baseDepth ?? 70)
        + (part.distance * (profile.depthRange ?? 230))
        + ((part.sequence % 6) * 4),
    );
    const longitudinalLayer = Math.max(-1, Math.min(1, radialY * 1.18));
    const sequenceLayer = (((part.sequence % 5) - 2) / 2) * 0.18;
    const layerPosition = Math.max(-1, Math.min(1, longitudinalLayer + sequenceLayer));
    const layerStrength = 0.34 + (Math.abs(layerPosition) * 0.66);
    const depthDirection = layerPosition < 0 ? -1 : 1;
    const depth = part.anchor
      ? 0
      : depthMagnitude * depthDirection * layerStrength * depthScale;
    const spreadWeight = 0.42 + Math.min(1, part.distance * 2.1);
    const explodeX = part.anchor
      ? 0
      : radialX * (profile.spreadX ?? 92) * spreadWeight * spreadScale;
    const explodeY = part.anchor
      ? 0
      : radialY * (profile.spreadY ?? 72) * spreadWeight * spreadScale;
    const lightShift = part.anchor ? 0.08 : layerPosition * 0.08;

    partNode.style.setProperty('--part-assemble-x', `${translateX.toFixed(2)}px`);
    partNode.style.setProperty('--part-assemble-y', `${translateY.toFixed(2)}px`);
    partNode.style.setProperty('--part-explode-x', `${explodeX.toFixed(2)}px`);
    partNode.style.setProperty('--part-explode-y', `${explodeY.toFixed(2)}px`);
    partNode.style.setProperty('--part-rotation', '0deg');
    partNode.style.setProperty('--part-depth', `${depth.toFixed(2)}px`);
    partNode.style.setProperty('--part-light-shift', lightShift.toFixed(3));
    partNode.style.setProperty('--part-rotate-x', '0deg');
    partNode.style.setProperty('--part-rotate-y', '0deg');
    partNode.style.setProperty('--part-rotate-z', '0deg');
    partNode.style.setProperty('--part-turn-y', '0deg');
  }

  function setEvPartGeometry(partNode, part, manifest) {
    setBomPartGeometry(
      partNode,
      part,
      manifest,
      document.querySelector('[data-ev-parts-canvas]'),
      {
        compactX: 0.27,
        compactY: 0.55,
        baseDepth: 86,
        depthRange: 760,
        maxDepth: 560,
        spreadX: 96,
        spreadY: 76,
      },
    );
  }

  function setAeroPartGeometry(partNode, part, manifest) {
    setBomPartGeometry(
      partNode,
      part,
      manifest,
      document.querySelector('[data-aero-parts-canvas]'),
      {
        compactX: 0.20,
        compactY: 0.34,
        baseDepth: 96,
        depthRange: 850,
        maxDepth: 650,
        spreadX: 88,
        spreadY: 88,
      },
    );
  }

  async function initializeEvPartSequence() {
    const layer = document.querySelector('[data-ev-parts-layer]');
    if (!layer) return;

    try {
      const response = await fetch('images/hero-ev-parts/manifest.json');
      if (!response.ok) throw new Error(`EV parts manifest ${response.status}`);
      const manifest = await response.json();
      heroEvManifest = manifest;
      heroEvPartTotal = manifest.parts.length;

      const fragment = document.createDocumentFragment();
      heroEvParts = manifest.parts.map(part => {
        const partNode = document.createElement('span');
        const sprite = document.createElement('img');
        partNode.className = `am-ev-part${part.anchor ? ' is-datum' : ''}`;
        partNode.dataset.sequence = String(part.sequence);
        partNode.style.left = `${((part.x / manifest.sourceWidth) * 100).toFixed(5)}%`;
        partNode.style.top = `${((part.y / manifest.sourceHeight) * 100).toFixed(5)}%`;
        partNode.style.width = `${((part.width / manifest.sourceWidth) * 100).toFixed(5)}%`;
        partNode.style.height = `${((part.height / manifest.sourceHeight) * 100).toFixed(5)}%`;
        partNode.style.zIndex = String(20 + Math.round(part.distance * 100));
        partNode.style.setProperty('--part-progress', part.anchor ? '1' : '0');
        partNode.style.setProperty('--part-assembly', part.anchor ? '0' : '1');
        partNode.style.setProperty('--part-motion', '0');

        sprite.src = 'images/hero-ev-parts/ev-parts-atlas.png';
        sprite.alt = '';
        sprite.decoding = 'async';
        sprite.draggable = false;
        sprite.style.width = `${((manifest.atlasWidth / part.width) * 100).toFixed(5)}%`;
        sprite.style.height = `${((manifest.atlasHeight / part.height) * 100).toFixed(5)}%`;
        sprite.style.left = `${((-part.atlasX / part.width) * 100).toFixed(5)}%`;
        sprite.style.top = `${((-part.atlasY / part.height) * 100).toFixed(5)}%`;

        partNode.appendChild(sprite);
        fragment.appendChild(partNode);
        setEvPartGeometry(partNode, part, manifest);
        return { node: partNode, part };
      });

      layer.replaceChildren(fragment);
      const total = document.querySelector('[data-ev-part-total]');
      if (total) total.textContent = `/ ${String(heroEvPartTotal).padStart(3, '0')}`;
      updateHeroScrollMotion();
    } catch (error) {
      console.warn('EV component sequence could not be initialized.', error);
    }
  }

  async function initializeAeroPartSequence() {
    const layer = document.querySelector('[data-aero-parts-layer]');
    if (!layer) return;

    try {
      const response = await fetch('images/hero-aerospace-parts/manifest.json');
      if (!response.ok) throw new Error(`Aerospace parts manifest ${response.status}`);
      const manifest = await response.json();
      heroAeroManifest = manifest;
      heroAeroPartTotal = manifest.parts.length;

      const fragment = document.createDocumentFragment();
      heroAeroParts = manifest.parts.map(part => {
        const partNode = document.createElement('span');
        const sprite = document.createElement('img');
        partNode.className = `am-bom-part am-aero-part${part.anchor ? ' is-datum' : ''}`;
        partNode.dataset.sequence = String(part.sequence);
        partNode.style.left = `${((part.x / manifest.sourceWidth) * 100).toFixed(5)}%`;
        partNode.style.top = `${((part.y / manifest.sourceHeight) * 100).toFixed(5)}%`;
        partNode.style.width = `${((part.width / manifest.sourceWidth) * 100).toFixed(5)}%`;
        partNode.style.height = `${((part.height / manifest.sourceHeight) * 100).toFixed(5)}%`;
        partNode.style.zIndex = String(20 + Math.round(part.distance * 100));
        partNode.style.setProperty('--part-progress', part.anchor ? '1' : '0');
        partNode.style.setProperty('--part-assembly', part.anchor ? '0' : '1');
        partNode.style.setProperty('--part-motion', '0');

        sprite.src = 'images/hero-aerospace-parts/ev-parts-atlas.png';
        sprite.alt = '';
        sprite.decoding = 'async';
        sprite.draggable = false;
        sprite.style.width = `${((manifest.atlasWidth / part.width) * 100).toFixed(5)}%`;
        sprite.style.height = `${((manifest.atlasHeight / part.height) * 100).toFixed(5)}%`;
        sprite.style.left = `${((-part.atlasX / part.width) * 100).toFixed(5)}%`;
        sprite.style.top = `${((-part.atlasY / part.height) * 100).toFixed(5)}%`;

        partNode.appendChild(sprite);
        fragment.appendChild(partNode);
        setAeroPartGeometry(partNode, part, manifest);
        return { node: partNode, part };
      });

      layer.replaceChildren(fragment);
      const total = document.querySelector('[data-aero-part-total]');
      if (total) total.textContent = `/ ${String(heroAeroPartTotal).padStart(3, '0')}`;
      updateHeroScrollMotion();
    } catch (error) {
      console.warn('Aerospace component sequence could not be initialized.', error);
    }
  }

  function initializeFacilityPartSequence() {
    const layer = document.querySelector('[data-facility-parts-layer]');
    const canvas = document.querySelector('[data-facility-parts-canvas]');
    if (!layer || !canvas) return;

    const depthScale = window.innerWidth <= 760 ? 0.58 : 1;
    const spreadScale = window.innerWidth <= 760 ? 0.5 : 1;
    const bands = [
      { top: 0, bottom: 18, x: -84, y: 72, z: -520 },
      { top: 13, bottom: 35, x: 72, y: 48, z: -340 },
      { top: 29, bottom: 49, x: -64, y: 26, z: -170 },
      { top: 43, bottom: 61, x: 0, y: 0, z: 0 },
      { top: 56, bottom: 73, x: 58, y: -28, z: 170 },
      { top: 68, bottom: 86, x: -68, y: -52, z: 340 },
      { top: 81, bottom: 100, x: 78, y: -76, z: 520 },
    ];

    const fragment = document.createDocumentFragment();
    heroFacilityParts = bands.map((band, index) => {
      const partNode = document.createElement('span');
      const image = document.createElement('img');
      partNode.className = 'am-bom-part am-facility-part';
      partNode.dataset.sequence = String(index);
      partNode.style.setProperty('--facility-clip-top', `${band.top}%`);
      partNode.style.setProperty('--facility-clip-bottom', `${100 - band.bottom}%`);
      partNode.style.setProperty('--part-assemble-x', `${band.x}px`);
      partNode.style.setProperty('--part-assemble-y', `${band.y}px`);
      partNode.style.setProperty('--part-explode-x', `${(band.x * 0.62 * spreadScale).toFixed(2)}px`);
      partNode.style.setProperty('--part-explode-y', `${(band.y * 0.48 * spreadScale).toFixed(2)}px`);
      partNode.style.setProperty('--part-depth', `${(band.z * depthScale).toFixed(2)}px`);
      partNode.style.setProperty('--part-light-shift', ((index - 3) * 0.025).toFixed(3));
      partNode.style.setProperty('--part-rotate-x', '0deg');
      partNode.style.setProperty('--part-rotate-y', '0deg');
      partNode.style.setProperty('--part-rotate-z', '0deg');
      partNode.style.setProperty('--part-turn-y', '0deg');
      partNode.style.setProperty('--part-progress', '0');
      partNode.style.setProperty('--part-assembly', '1');
      partNode.style.setProperty('--part-motion', '0');

      image.src = 'images/hero-equipment-digital-twin.png';
      image.alt = '';
      image.decoding = 'async';
      image.draggable = false;
      partNode.appendChild(image);
      fragment.appendChild(partNode);
      return { node: partNode, part: { sequence: index, anchor: false } };
    });

    layer.replaceChildren(fragment);
    updateHeroScrollMotion();
  }

  function updateBomPartNodes(parts, total, sequenceProgress) {
    const sequenceSpan = 0.82;
    const releaseDuration = 0.045;
    let released = sequenceProgress > 0.985 ? 1 : 0;

    parts.forEach(({ node, part }, index) => {
      if (part.anchor) {
        node.style.setProperty('--part-progress', '1');
        node.style.setProperty('--part-assembly', '0');
        node.style.setProperty('--part-motion', Math.sin(sequenceProgress * Math.PI).toFixed(4));
        node.style.setProperty('--part-turn-y', '0deg');
        return;
      }

      const order = total > 2 ? (index - 1) / (total - 2) : 0;
      const start = order * sequenceSpan;
      const local = smoothStep((sequenceProgress - start) / releaseDuration);
      node.style.setProperty('--part-progress', local.toFixed(4));
      node.style.setProperty('--part-assembly', (1 - local).toFixed(4));
      node.style.setProperty('--part-motion', Math.sin(local * Math.PI).toFixed(4));
      node.style.setProperty('--part-turn-y', '0deg');
      if (local > 0.96) released += 1;
    });

    return released;
  }

  function updateEvPartSequence(progress) {
    if (!heroEvParts.length) return;
    const sequenceProgress = Math.max(0, Math.min(1, progress));
    const released = updateBomPartNodes(heroEvParts, heroEvPartTotal, sequenceProgress);
    const counter = document.querySelector('[data-ev-part-counter]');
    if (counter) counter.textContent = String(Math.max(0, heroEvPartTotal - released)).padStart(3, '0');
    heroSection?.style.setProperty('--ev-sequence-progress', sequenceProgress.toFixed(4));
    heroSection?.style.setProperty('--ev-rotate-x', '0deg');
    heroSection?.style.setProperty('--ev-rotate-y', `${(sequenceProgress * 360).toFixed(3)}deg`);
    heroSection?.style.setProperty('--ev-rotate-z', '0deg');
    heroSection?.style.setProperty('--ev-orbit-x', '0px');
    heroSection?.style.setProperty('--ev-orbit-y', '0px');
    heroSection?.style.setProperty('--ev-rotation-scale', '1');
  }

  function updateAeroPartSequence(progress) {
    if (!heroAeroParts.length) return;
    const sequenceProgress = Math.max(0, Math.min(1, progress));
    const released = updateBomPartNodes(heroAeroParts, heroAeroPartTotal, sequenceProgress);
    const counter = document.querySelector('[data-aero-part-counter]');
    if (counter) counter.textContent = String(released).padStart(3, '0');
    heroSection?.style.setProperty('--aero-sequence-progress', sequenceProgress.toFixed(4));
    heroSection?.style.setProperty('--aero-rotate-x', '0deg');
    heroSection?.style.setProperty('--aero-rotate-y', `${(sequenceProgress * -360).toFixed(3)}deg`);
    heroSection?.style.setProperty('--aero-rotate-z', '0deg');
    heroSection?.style.setProperty('--aero-orbit-x', '0px');
    heroSection?.style.setProperty('--aero-orbit-y', '0px');
    heroSection?.style.setProperty('--aero-rotation-scale', '1');
  }

  function updateFacilityPartSequence(progress) {
    if (!heroFacilityParts.length) return;
    const sequenceProgress = Math.max(0, Math.min(1, progress));
    const released = updateBomPartNodes(heroFacilityParts, heroFacilityPartTotal, sequenceProgress);
    const counter = document.querySelector('[data-facility-part-counter]');
    if (counter) counter.textContent = String(released).padStart(3, '0');
    heroSection?.style.setProperty('--facility-sequence-progress', sequenceProgress.toFixed(4));
    heroSection?.style.setProperty('--facility-rotate-x', '0deg');
    heroSection?.style.setProperty('--facility-rotate-y', `${(sequenceProgress * 360).toFixed(3)}deg`);
    heroSection?.style.setProperty('--facility-rotate-z', '0deg');
    heroSection?.style.setProperty('--facility-orbit-x', '0px');
    heroSection?.style.setProperty('--facility-orbit-y', '0px');
    heroSection?.style.setProperty('--facility-rotation-scale', '1');
  }

  function setHeroIndustry(nextIndustry) {
    if (!heroIndustrySlides.length) return;

    heroIndustrySlides.forEach(slide => {
      const slideIndustry = Number(slide.dataset.heroIndustrySlide || 0);
      const isActive = slideIndustry === nextIndustry;
      const wasActive = slide.classList.contains('is-active');
      slide.classList.toggle('is-active', isActive);
      slide.classList.toggle('is-leaving', wasActive && !isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    const selectedStep = Math.max(1, heroSequenceStep);
    heroStepButtons.forEach(button => {
      const isActive = Number(button.dataset.heroStep || 1) === selectedStep;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      button.tabIndex = isActive ? 0 : -1;
    });

    heroIndustryIndex = nextIndustry;

    window.setTimeout(() => {
      heroIndustrySlides.forEach(slide => {
        if (Number(slide.dataset.heroIndustrySlide || 0) !== heroIndustryIndex) {
          slide.classList.remove('is-leaving');
        }
      });
    }, 940);
  }

  function renderHeroSequence() {
    if (!heroSection) return;
    const state = heroSequenceStates[heroSequenceStep];
    const activeProgress = state.industry === 0
      ? heroSequenceValues.ev
      : state.industry === 2
        ? heroSequenceValues.aero
        : heroSequenceValues.facility;

    heroSection.dataset.heroStep = String(heroSequenceStep);
    heroSection.style.setProperty('--hero-scroll', (heroSequenceStep / 3).toFixed(4));
    heroSection.style.setProperty('--hero-explode', activeProgress.toFixed(4));
    heroSection.style.setProperty('--hero-assemble', (1 - activeProgress).toFixed(4));
    updateEvPartSequence(heroSequenceValues.ev);
    updateAeroPartSequence(heroSequenceValues.aero);
    updateFacilityPartSequence(heroSequenceValues.facility);

    if (heroStepStatus) {
      heroStepStatus.textContent = heroSequenceStep === 0
        ? 'SCROLL · ASSEMBLE'
        : `SCROLL · ${String(heroSequenceStep).padStart(2, '0')} / 03`;
    }
  }

  function setHeroSequenceStep(nextStep, immediate = false) {
    const targetStep = Math.max(0, Math.min(heroSequenceStates.length - 1, nextStep));
    if (targetStep === heroSequenceStep && !immediate) return;

    const targetState = heroSequenceStates[targetStep];
    const startValues = { ...heroSequenceValues };
    const startTime = performance.now();
    const duration = immediate || motionQuery.matches ? 0 : 980;

    window.cancelAnimationFrame(heroSequenceFrame);
    heroSequenceStep = targetStep;
    setHeroIndustry(targetState.industry);
    heroSequenceAnimating = duration > 0;
    heroSection?.classList.toggle('is-sequence-moving', heroSequenceAnimating);

    const animate = now => {
      const linear = duration ? Math.min(1, (now - startTime) / duration) : 1;
      const eased = 1 - Math.pow(1 - linear, 4);
      heroSequenceValues.ev = startValues.ev + ((targetState.ev - startValues.ev) * eased);
      heroSequenceValues.aero = startValues.aero + ((targetState.aero - startValues.aero) * eased);
      heroSequenceValues.facility = startValues.facility + ((targetState.facility - startValues.facility) * eased);
      renderHeroSequence();

      if (linear < 1) {
        heroSequenceFrame = window.requestAnimationFrame(animate);
      } else {
        heroSequenceAnimating = false;
        heroSection?.classList.remove('is-sequence-moving');
      }
    };

    heroSequenceFrame = window.requestAnimationFrame(animate);
  }

  heroStepButtons.forEach(button => {
    button.addEventListener('click', () => {
      setHeroSequenceStep(Number(button.dataset.heroStep || 1));
    });
  });

  function heroIsInControlRange() {
    if (!heroSection) return false;
    const rect = heroSection.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.28 && rect.bottom > window.innerHeight * 0.68;
  }

  function exitHeroSequence() {
    const nextSection = document.querySelector('#platform');
    if (!nextSection || heroExitLock) return;
    heroExitLock = true;
    nextSection.scrollIntoView({ behavior: motionQuery.matches ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => { heroExitLock = false; }, 900);
  }

  function handleHeroDirection(direction) {
    if (heroSequenceAnimating || heroExitLock) return;
    if (direction > 0) {
      if (heroSequenceStep < heroSequenceStates.length - 1) {
        setHeroSequenceStep(heroSequenceStep + 1);
      } else {
        exitHeroSequence();
      }
    } else if (heroSequenceStep > 0) {
      setHeroSequenceStep(heroSequenceStep - 1);
    }
  }

  function handleHeroWheel(event) {
    if (!heroIsInControlRange() || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    const direction = Math.sign(event.deltaY);
    if (!direction || (direction < 0 && heroSequenceStep === 0)) return;

    event.preventDefault();
    if (heroSequenceAnimating || heroExitLock) return;

    heroWheelAccumulator += event.deltaY;
    window.clearTimeout(heroWheelResetTimer);
    heroWheelResetTimer = window.setTimeout(() => { heroWheelAccumulator = 0; }, 140);
    if (Math.abs(heroWheelAccumulator) < 18) return;

    const accumulatedDirection = Math.sign(heroWheelAccumulator);
    heroWheelAccumulator = 0;
    handleHeroDirection(accumulatedDirection);
  }

  function handleHeroKeydown(event) {
    if (!heroIsInControlRange()) return;
    const downKeys = ['ArrowDown', 'PageDown', ' '];
    const upKeys = ['ArrowUp', 'PageUp'];
    if (!downKeys.includes(event.key) && !upKeys.includes(event.key)) return;
    if (upKeys.includes(event.key) && heroSequenceStep === 0) return;
    event.preventDefault();
    handleHeroDirection(downKeys.includes(event.key) ? 1 : -1);
  }

  heroSection?.addEventListener('touchstart', event => {
    heroTouchStartY = event.touches[0]?.clientY ?? null;
    heroTouchHandled = false;
  }, { passive: true });

  heroSection?.addEventListener('touchmove', event => {
    if (heroTouchHandled || heroTouchStartY === null || !heroIsInControlRange()) return;
    const currentY = event.touches[0]?.clientY ?? heroTouchStartY;
    const delta = heroTouchStartY - currentY;
    if (Math.abs(delta) < 46) return;
    if (delta < 0 && heroSequenceStep === 0) return;
    event.preventDefault();
    heroTouchHandled = true;
    handleHeroDirection(Math.sign(delta));
  }, { passive: false });

  window.addEventListener('wheel', handleHeroWheel, { passive: false });
  window.addEventListener('keydown', handleHeroKeydown);
  setHeroIndustry(0);
  setHeroSequenceStep(0, true);

  function updateHeroScrollMotion() {
    if (!heroSection || heroSequenceAnimating) return;
    renderHeroSequence();
  }

  function updateFloatingDemoVisibility() {
    if (!floatingDemoCta) return;
    const threshold = heroSection ? heroSection.offsetHeight * 0.72 : 160;
    floatingDemoCta.classList.toggle('is-page-visible', window.scrollY > threshold);
  }

  function updateHeroPointer(event) {
    if (!heroSection || motionQuery.matches) return;
    const rect = heroSection.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    window.cancelAnimationFrame(heroPointerFrame);
    heroPointerFrame = window.requestAnimationFrame(() => {
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      heroSection.style.setProperty('--hero-pointer-x', Math.max(-1, Math.min(1, x)).toFixed(3));
      heroSection.style.setProperty('--hero-pointer-y', Math.max(-1, Math.min(1, y)).toFixed(3));
    });
  }

  function resetHeroPointer() {
    heroSection?.style.setProperty('--hero-pointer-x', '0');
    heroSection?.style.setProperty('--hero-pointer-y', '0');
  }

  heroSection?.addEventListener('pointermove', updateHeroPointer, { passive: true });
  heroSection?.addEventListener('pointerleave', resetHeroPointer);
  initializeEvPartSequence();
  initializeAeroPartSequence();
  initializeFacilityPartSequence();

  window.addEventListener('resize', () => {
    if (heroEvManifest) {
      heroEvParts.forEach(({ node, part }) => setEvPartGeometry(node, part, heroEvManifest));
    }
    if (heroAeroManifest) {
      heroAeroParts.forEach(({ node, part }) => setAeroPartGeometry(node, part, heroAeroManifest));
    }
    initializeFacilityPartSequence();
  });

  // Legacy .reveal support
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
    .forEach(el => revealObserver.observe(el));


  // =============================
  // NUMBER TICKER
  // =============================
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 2200;
    const start = performance.now();
    const isDecimal = target % 1 !== 0;

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const val = eased * target;
      el.textContent = prefix + (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));


  // =============================
  // MARQUEE — Pause on Hover
  // =============================
  document.querySelectorAll('.marquee').forEach(marquee => {
    const track = marquee.querySelector('.marquee-track');
    if (!track) return;
    marquee.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    marquee.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
  });


  // =============================
  // FEATURE CARD SLIDE ANIMATIONS
  // =============================
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    const text = card.querySelector('.feature-card-text');
    const media = card.querySelector('.feature-card-media');
    const isReverse = card.classList.contains('reverse');
    if (text) {
      text.style.cssText = `opacity:0;transform:translateX(${isReverse ? '40px' : '-40px'});transition:all 0.8s cubic-bezier(0.16,1,0.3,1)`;
    }
    if (media) {
      media.style.cssText = `opacity:0;transform:translateX(${isReverse ? '-40px' : '40px'});transition:all 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s`;
    }
  });

  const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const text = entry.target.querySelector('.feature-card-text');
        const media = entry.target.querySelector('.feature-card-media');
        if (text) { text.style.opacity = '1'; text.style.transform = 'translateX(0)'; }
        if (media) { media.style.opacity = '1'; media.style.transform = 'translateX(0)'; }
        featureObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });
  featureCards.forEach(card => featureObserver.observe(card));


  // =============================
  // BACK TO TOP
  // =============================
  const backToTop = document.getElementById('backToTop');

  function updateBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle('visible', window.scrollY > 600);
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }


  // =============================
  // SCROLL-DRIVEN TYPEWRITER
  // =============================
  const typewriters = document.querySelectorAll('[data-scroll-typewriter]');
  typewriters.forEach(el => {
    const raw = el.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    // HTML 들여쓰기 공백·소스 개행이 글자 span/빈 줄로 렌더되지 않도록 정규화
    const text = new DOMParser().parseFromString(raw, 'text/html').body.textContent
      .split('\n').map(line => line.trim()).filter(Boolean).join('\n');
    el.innerHTML = '';
    text.split('').forEach(char => {
      if (char === '\n') {
        el.appendChild(document.createElement('br'));
      } else {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.cssText = 'opacity:0.1;transition:opacity 0.2s,color 0.2s;';
        el.appendChild(span);
      }
    });
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    el.appendChild(cursor);
  });

  function handleScrollTypewriter() {
    const vh = window.innerHeight;
    typewriters.forEach(el => {
      const rect = el.getBoundingClientRect();
      const spans = el.querySelectorAll('span:not(.typewriter-cursor)');
      const start = vh * 0.9, end = vh * 0.3;
      const progress = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);
      const count = Math.floor(progress * spans.length);
      spans.forEach((span, i) => { span.style.opacity = i < count ? '1' : '0.12'; });
    });
  }


  // =============================
  // CTA DOTS CANVAS
  // =============================
  const dotsCanvas = document.getElementById('dotsCanvas');
  if (dotsCanvas) {
    const dCtx = dotsCanvas.getContext('2d');
    let dWidth, dHeight, dots = [];
    const spacing = 55;
    let dotsPaused = false;

    function initDots() {
      const parent = dotsCanvas.parentElement;
      dWidth = dotsCanvas.width = parent.offsetWidth;
      dHeight = dotsCanvas.height = parent.offsetHeight;
      dots = [];
      for (let x = 0; x < dWidth; x += spacing) {
        for (let y = 0; y < dHeight; y += spacing) {
          dots.push({ x, y, ox: x, oy: y });
        }
      }
    }

    function animateDots() {
      if (!dotsPaused) {
        dCtx.clearRect(0, 0, dWidth, dHeight);
        const isDark = html.getAttribute('data-theme') === 'dark';
        dCtx.fillStyle = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.09)';
        const time = Date.now() * 0.001;
        dots.forEach(dot => {
          const waveY = Math.sin(dot.ox * 0.015 + time) * 4;
          const waveX = Math.cos(dot.oy * 0.015 + time * 0.7) * 2;
          dCtx.beginPath();
          dCtx.arc(dot.x + waveX, dot.y + waveY, 1.5, 0, Math.PI * 2);
          dCtx.fill();
        });
      }
      requestAnimationFrame(animateDots);
    }

    new IntersectionObserver((entries) => { dotsPaused = !entries[0].isIntersecting; }).observe(dotsCanvas);
    setTimeout(() => { initDots(); animateDots(); }, 120);
    window.addEventListener('resize', () => setTimeout(initDots, 100));
  }


  // =============================
  // SHIMMER / MAGNETIC BUTTON
  // =============================
  document.querySelectorAll('.btn-primary, .btn-shimmer').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty('--btn-x', `${e.clientX - rect.left}px`);
      btn.style.setProperty('--btn-y', `${e.clientY - rect.top}px`);
    });
  });


  // =============================
  // 3D TILT CARD (Customer Stories)
  // =============================
  document.querySelectorAll('.tilt-card').forEach(wrapper => {
    const card = wrapper.querySelector('.story-card');
    if (!card) return;
    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      card.style.transform = `perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) scale(1.03)`;
    });
    wrapper.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });


  // =============================
  // CUSTOMER CAROUSEL (Fallback if marquee not used)
  // =============================
  const carouselTrack = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  if (carouselTrack && prevBtn && nextBtn) {
    const scrollAmt = () => {
      const card = carouselTrack.querySelector('.tilt-card');
      return card ? card.offsetWidth + 24 : 360;
    };
    prevBtn.addEventListener('click', () => carouselTrack.scrollBy({ left: -scrollAmt(), behavior: 'smooth' }));
    nextBtn.addEventListener('click', () => carouselTrack.scrollBy({ left: scrollAmt(), behavior: 'smooth' }));

    let autoScroll = setInterval(() => {
      const max = carouselTrack.scrollWidth - carouselTrack.clientWidth;
      if (carouselTrack.scrollLeft >= max - 10) {
        carouselTrack.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carouselTrack.scrollBy({ left: scrollAmt(), behavior: 'smooth' });
      }
    }, 5000);

    carouselTrack.addEventListener('mouseenter', () => clearInterval(autoScroll));
    carouselTrack.addEventListener('mouseleave', () => {
      autoScroll = setInterval(() => {
        const max = carouselTrack.scrollWidth - carouselTrack.clientWidth;
        if (carouselTrack.scrollLeft >= max - 10) {
          carouselTrack.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselTrack.scrollBy({ left: scrollAmt(), behavior: 'smooth' });
        }
      }, 5000);
    });
  }


  // =============================
  // DEMO CONSULT MODAL (데모 상담)
  // 서버 검증 API를 통과한 상담만 영업 알림으로 전달하고 접수번호를 발급한다.
  // 전송 실패 시 입력값을 유지해 사용자가 다시 시도할 수 있도록 한다.
  // =============================
  const demoModal = document.getElementById('demoModal');
  if (demoModal) {
    let lastFocus = null;
    const diagnosisModal = document.getElementById('diagnosisModal');
    const diagnosisForm = document.getElementById('diagnosisForm');
    const diagnosisResult = diagnosisModal?.querySelector('[data-diagnosis-result]');
    const diagnosisTitle = diagnosisModal?.querySelector('[data-diagnosis-title]');
    const diagnosisCopy = diagnosisModal?.querySelector('[data-diagnosis-copy]');
    const diagnosisConsult = diagnosisModal?.querySelector('[data-diagnosis-consult]');
    let lastDiagnosisFocus = null;
    const demoForm = document.getElementById('demoForm');
    const demoSteps = demoForm ? [...demoForm.querySelectorAll('[data-demo-step]')] : [];
    const progressTrack = demoModal.querySelector('[role="progressbar"]');
    const progressFill = demoModal.querySelector('[data-demo-progress-fill]');
    const progressValue = demoModal.querySelector('[data-demo-progress-value]');
    const progressLabel = demoModal.querySelector('[data-demo-progress-label]');

    // UX 원칙 2·3·6: 목표 달성 효과 + 스마트 기본값 + 점진적 공개.
    // 개인정보는 localStorage에 저장하지 않고 모달이 열린 현재 세션에서만 관리한다.
    const leadFormState = {
      step: 1,
      sourceProduct: '통합 PLM 전체',
      messageEdited: false,
      submitting: false,
      startedAt: Date.now()
    };

    const productDefaultMap = {
      cadwin: 'AI CADWin',
      pdm: 'Clip PDM',
      pms: 'Clip PMS',
      cms: 'Clip CMS'
    };

    const messageDefaults = {
      '통합 PLM 전체': '현재 도면, BOM, ERP 흐름의 누수 지점과 단계별 PLM 도입 범위를 상담받고 싶습니다.',
      'AI CADWin': '반복되는 도면 검색과 정보 추출 시간을 줄일 수 있는 AI CADWin 적용 범위를 상담받고 싶습니다.',
      'Clip PDM': '도면 최신본, 개정 및 승인 이력을 연결하는 Clip PDM 도입 범위를 상담받고 싶습니다.',
      'Clip PMS': '프로젝트 일정, 담당자, 산출물의 지연 구간을 관리하는 Clip PMS 도입 범위를 상담받고 싶습니다.',
      'Multi-BOM': 'E-BOM, M-BOM과 ERP BOM의 차이를 관리하는 Multi-BOM 적용 범위를 상담받고 싶습니다.',
      'Clip CMS': '설계 변경 전후의 원가 영향을 비교하는 Clip CMS 도입 범위를 상담받고 싶습니다.'
    };

    function setLeadStep(step) {
      leadFormState.step = step;
      demoSteps.forEach(panel => {
        panel.hidden = Number(panel.dataset.demoStep) !== step;
      });
      syncLeadProgress();
      const focusTarget = demoForm?.querySelector(`[data-demo-step="${step}"] input, [data-demo-step="${step}"] select`);
      if (focusTarget) focusTarget.focus();
    }

    function syncLeadProgress(isComplete = false) {
      if (!demoForm) return;
      const values = new FormData(demoForm);
      const firstStepCount = ['company', 'name'].filter(name => String(values.get(name) || '').trim()).length;
      const secondStepCount = [
        String(values.get('phone') || '').trim(),
        String(values.get('email') || '').trim(),
        String(values.get('message') || '').trim()
      ].filter(Boolean).length;

      // 실제 필드 수보다 빠르게 전진하는 인지적 진행률로 마지막 행동의 부담을 낮춘다.
      const progress = isComplete
        ? 100
        : leadFormState.step === 1
          ? 35 + firstStepCount * 11
          : Math.min(94, 72 + secondStepCount * 7);
      const label = leadFormState.step === 1 ? '기본 정보 · 1/2' : '연락 정보 · 2/2';

      if (progressFill) progressFill.style.transform = `scaleX(${progress / 100})`;
      if (progressValue) progressValue.textContent = `${progress}%`;
      if (progressLabel) progressLabel.textContent = isComplete ? '작성 완료' : label;
      if (progressTrack) progressTrack.setAttribute('aria-valuenow', String(progress));
    }

    function applySmartDefaults(useActiveProduct, explicitProduct) {
      if (!demoForm) return;
      const productSelect = demoForm.elements.product;
      const message = demoForm.elements.message;
      leadFormState.sourceProduct = explicitProduct || (useActiveProduct
        ? (productDefaultMap[currentProductKey] || '통합 PLM 전체')
        : '통합 PLM 전체');
      productSelect.value = leadFormState.sourceProduct;

      if (!leadFormState.messageEdited || !message.value.trim()) {
        message.value = messageDefaults[leadFormState.sourceProduct];
        leadFormState.messageEdited = false;
      }
      syncLeadProgress();
    }

    function showDemo(trigger) {
      lastFocus = document.activeElement;
      demoForm?.reset();
      leadFormState.messageEdited = false;
      leadFormState.startedAt = Date.now();
      const status = demoForm?.querySelector('[data-demo-status]');
      if (status) {
        status.textContent = '';
        status.removeAttribute('data-state');
      }
      demoModal.hidden = false;
      setLeadStep(1);
      applySmartDefaults(
        trigger?.dataset.demoContext === 'active-product',
        trigger?.dataset.demoProduct
      );
      requestAnimationFrame(() => demoModal.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      const first = demoModal.querySelector('input, select, textarea');
      if (first) first.focus();
    }

    function openDemo(e) {
      if (e) e.preventDefault();
      showDemo(e?.currentTarget);
    }

    function closeDemo() {
      demoModal.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { demoModal.hidden = true; }, 200);
      if (lastFocus) lastFocus.focus();
    }

    document.querySelectorAll('[data-demo-open]').forEach(el => el.addEventListener('click', openDemo));
    demoModal.querySelectorAll('[data-demo-close]').forEach(el => el.addEventListener('click', closeDemo));

    function openDiagnosis(e) {
      if (e) e.preventDefault();
      if (!diagnosisModal) return;
      lastDiagnosisFocus = document.activeElement;
      diagnosisForm?.reset();
      if (diagnosisForm) diagnosisForm.hidden = false;
      if (diagnosisResult) diagnosisResult.hidden = true;
      diagnosisModal.hidden = false;
      requestAnimationFrame(() => diagnosisModal.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      diagnosisModal.querySelector('input')?.focus();
    }

    function closeDiagnosis(restoreFocus = true) {
      if (!diagnosisModal) return;
      diagnosisModal.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { diagnosisModal.hidden = true; }, 200);
      if (restoreFocus && lastDiagnosisFocus) lastDiagnosisFocus.focus();
    }

    document.querySelectorAll('[data-diagnosis-open]').forEach(el => el.addEventListener('click', openDiagnosis));
    diagnosisModal?.querySelectorAll('[data-diagnosis-close]').forEach(el => {
      el.addEventListener('click', () => closeDiagnosis());
    });

    const diagnosisRecommendations = {
      drawing: {
        product: 'Clip PDM',
        title: 'Clip PDM + AI CADWin부터 검토하세요.',
        copy: '도면 최신본과 개정 이력을 먼저 기준화하고, 반복되는 도면 검색과 정보 추출을 AI CADWin으로 연결하는 순서가 적합합니다.'
      },
      bom: {
        product: 'Multi-BOM',
        title: 'Multi-BOM을 기준 화면으로 시작하세요.',
        copy: 'E-BOM, M-BOM과 ERP BOM의 차이를 먼저 가시화한 뒤 변경 승인과 후속 업무 범위를 연결하는 구성이 적합합니다.'
      },
      schedule: {
        product: 'Clip PMS',
        title: 'Clip PMS로 일정과 산출물을 연결하세요.',
        copy: '개발 단계, 담당자, 산출물과 지연 이슈를 한 기준으로 묶은 뒤 필요한 문서 관리 기능을 단계적으로 확장하는 구성이 적합합니다.'
      },
      cost: {
        product: 'Clip CMS',
        title: 'Clip CMS로 변경 원가부터 추적하세요.',
        copy: '사전·사후 원가와 설계 변경 영향을 같은 제품 구조에서 비교한 뒤 BOM과 ERP 연동 범위를 넓히는 구성이 적합합니다.'
      }
    };

    diagnosisForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!diagnosisForm.checkValidity()) {
        diagnosisForm.reportValidity();
        return;
      }
      const values = new FormData(diagnosisForm);
      const recommendation = diagnosisRecommendations[values.get('issue')];
      const scopeText = values.get('scope') === 'pilot'
        ? '한 부서의 실제 데이터로 작게 검증하는 방식'
        : values.get('scope') === 'division'
          ? 'R&D 표준 프로세스를 먼저 정리하는 방식'
          : 'CAD·ERP 연동 범위를 함께 설계하는 방식';
      if (diagnosisTitle) diagnosisTitle.textContent = recommendation.title;
      if (diagnosisCopy) diagnosisCopy.textContent = `${recommendation.copy} 현재 선택에는 ${scopeText}을 권장합니다.`;
      if (diagnosisConsult) diagnosisConsult.dataset.demoProduct = recommendation.product;
      diagnosisForm.hidden = true;
      if (diagnosisResult) diagnosisResult.hidden = false;
      diagnosisResult?.focus?.();
    });

    diagnosisModal?.querySelector('[data-diagnosis-retry]')?.addEventListener('click', () => {
      diagnosisForm?.reset();
      if (diagnosisForm) diagnosisForm.hidden = false;
      if (diagnosisResult) diagnosisResult.hidden = true;
      diagnosisModal.querySelector('input')?.focus();
    });

    diagnosisConsult?.addEventListener('click', () => {
      closeDiagnosis(false);
      diagnosisModal.hidden = true;
      showDemo(diagnosisConsult);
    });

    // 접수 완료 팝업 (폼 모달과 분리)
    const doneModal = document.getElementById('demoDoneModal');

    function openDone(receiptId) {
      if (!doneModal) return;
      const receipt = doneModal.querySelector('[data-demo-receipt]');
      if (receipt) receipt.textContent = receiptId || '메일 접수 완료';
      doneModal.hidden = false;
      requestAnimationFrame(() => doneModal.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      const confirmBtn = doneModal.querySelector('.demo-done-confirm');
      if (confirmBtn) confirmBtn.focus();
    }

    function closeDone() {
      if (!doneModal) return;
      doneModal.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { doneModal.hidden = true; }, 200);
      if (lastFocus) lastFocus.focus();
    }

    if (doneModal) {
      doneModal.querySelectorAll('[data-done-close]').forEach(el => el.addEventListener('click', closeDone));
    }

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (doneModal && !doneModal.hidden) { closeDone(); return; }
      if (diagnosisModal && !diagnosisModal.hidden) { closeDiagnosis(); return; }
      if (!demoModal.hidden) closeDemo();
    });

    if (demoForm) {
      const messageField = demoForm.elements.message;
      const statusField = demoForm.querySelector('[data-demo-status]');

      function setDemoStatus(message, state = 'error') {
        if (!statusField) return;
        statusField.textContent = message;
        statusField.dataset.state = state;
      }

      function validateDemoFields() {
        const company = demoForm.elements.company;
        const name = demoForm.elements.name;
        const phone = demoForm.elements.phone;
        const email = demoForm.elements.email;
        const message = demoForm.elements.message;

        [company, name, phone, email, message].forEach(field => field.setCustomValidity(''));

        if (!/[A-Za-z가-힣]/.test(company.value) || company.value.trim().length < 2) {
          company.setCustomValidity('실제 회사명을 2자 이상 입력해 주세요.');
        }
        if (!/^[A-Za-z가-힣 .'-]{2,40}$/.test(name.value.trim())) {
          name.setCustomValidity('담당자명을 한글 또는 영문으로 입력해 주세요.');
        }
        const phoneDigits = phone.value.replace(/\D/g, '');
        if (phoneDigits.length < 9 || phoneDigits.length > 15) {
          phone.setCustomValidity('연락 가능한 전화번호를 입력해 주세요.');
        }
        if (!email.validity.valid || !email.value.trim()) {
          email.setCustomValidity('회신 가능한 이메일 주소를 입력해 주세요.');
        }
        if (message.value.trim().length < 10) {
          message.setCustomValidity('상담이 필요한 내용을 10자 이상 입력해 주세요.');
        }

        return demoForm.checkValidity();
      }

      demoForm.addEventListener('input', (event) => {
        event.target?.setCustomValidity?.('');
        if (event.target === messageField) leadFormState.messageEdited = true;
        if (statusField?.textContent) setDemoStatus('', '');
        syncLeadProgress();
      });

      demoForm.elements.product.addEventListener('change', () => {
        leadFormState.sourceProduct = demoForm.elements.product.value;
        if (!leadFormState.messageEdited) {
          messageField.value = messageDefaults[leadFormState.sourceProduct] || messageDefaults['통합 PLM 전체'];
        }
        syncLeadProgress();
      });

      demoForm.querySelector('.demo-next')?.addEventListener('click', () => {
        const firstStep = demoForm.querySelector('[data-demo-step="1"]');
        const requiredFields = [...firstStep.querySelectorAll('[required]')];
        const isValid = requiredFields.every(field => field.reportValidity());
        if (isValid) setLeadStep(2);
      });

      demoForm.querySelector('.demo-prev')?.addEventListener('click', () => setLeadStep(1));

      demoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateDemoFields()) {
          demoForm.reportValidity();
          return;
        }
        const f = new FormData(demoForm);
        const submitBtn = demoForm.querySelector('.demo-submit');
        const btnHtml = submitBtn.innerHTML;
        leadFormState.submitting = true;
        syncLeadProgress(true);
        setDemoStatus('입력 내용을 안전하게 접수하고 있습니다.', 'sending');
        submitBtn.disabled = true;
        submitBtn.textContent = '전송 중…';

        try {
          // 서버 검증을 통과한 리드만 상담 메일로 전달하고 접수번호를 발급한다.
          const res = await fetch('/api/contact-leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              company: f.get('company'),
              name: f.get('name'),
              phone: f.get('phone'),
              email: f.get('email'),
              product: f.get('product'),
              contactTime: f.get('contactTime'),
              message: f.get('message'),
              consent: f.get('consent') === 'on',
              website: f.get('website'),
              startedAt: leadFormState.startedAt,
              sourcePage: window.location.href
            })
          });
          const result = await res.json().catch(() => ({}));
          if (!res.ok || !result.ok) {
            throw new Error(result.message || '상담 요청을 접수하지 못했습니다.');
          }
          demoForm.reset();
          closeDemo();
          setTimeout(() => openDone(result.leadId), 220);

        } catch (err) {
          const message = err instanceof TypeError
            ? '네트워크 연결을 확인한 뒤 다시 시도해 주세요.'
            : (err.message || '상담 요청을 접수하지 못했습니다.');
          setDemoStatus(`${message} 입력 내용은 유지됩니다. 또는 070-5001-1144로 연락해 주세요.`);
          syncLeadProgress();
        } finally {
          leadFormState.submitting = false;
          submitBtn.disabled = false;
          submitBtn.innerHTML = btnHtml;
        }
      });
    }
  }


  // =============================
  // UNIFIED SCROLL HANDLER (RAF throttled)
  // =============================
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
        handleNav();
        updateScrollZoom();
        updateHeroScrollMotion();
        updateFloatingDemoVisibility();
        updateBackToTop();
        handleScrollTypewriter();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial calls on load
  updateProgress();
  handleNav();
  updateScrollZoom();
  updateHeroScrollMotion();
  updateFloatingDemoVisibility();
  updateBackToTop();
  handleScrollTypewriter();

  window.addEventListener('resize', handleNav);

});


/* =========================================
   TILT EFFECT LOGIC (Added in Renewal)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  const tiltElements = document.querySelectorAll('.tilt-element');
  
  tiltElements.forEach(el => {
    // Only apply on non-touch devices
    if (window.matchMedia('(pointer: fine)').matches) {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Slightly reduced rotation for a more subtle, premium feel
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;
        
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        el.style.transition = 'transform 0.1s ease-out';
        
        // Update variables for the glow
        el.style.setProperty('--x', `${x}px`);
        el.style.setProperty('--y', `${y}px`);
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        el.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      });
    }
  });
});
