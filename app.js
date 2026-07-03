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
    const icon = themeToggle.querySelector('.material-symbols-rounded');
    if (icon) icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
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
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
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
  // 폼 릴레이(FormSubmit AJAX)로 사이트에서 직접 접수 — 방문자 메일 앱 불필요.
  // 전송 실패 시에만 mailto 초안 폴백.
  // =============================
  const demoModal = document.getElementById('demoModal');
  if (demoModal) {
    let lastFocus = null;

    function openDemo(e) {
      if (e) e.preventDefault();
      lastFocus = document.activeElement;
      demoModal.hidden = false;
      requestAnimationFrame(() => demoModal.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      const first = demoModal.querySelector('input, select, textarea');
      if (first) first.focus();
    }

    function closeDemo() {
      demoModal.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { demoModal.hidden = true; }, 200);
      if (lastFocus) lastFocus.focus();
    }

    document.querySelectorAll('[data-demo-open]').forEach(el => el.addEventListener('click', openDemo));
    demoModal.querySelectorAll('[data-demo-close]').forEach(el => el.addEventListener('click', closeDemo));

    // 접수 완료 팝업 (폼 모달과 분리)
    const doneModal = document.getElementById('demoDoneModal');

    function openDone() {
      if (!doneModal) return;
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
      if (!demoModal.hidden) closeDemo();
    });

    const demoForm = document.getElementById('demoForm');
    if (demoForm) {
      const CONTACT_EMAIL = 'kimnardo@papsnet.net';

      demoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const f = new FormData(demoForm);
        const subject = `[데모 상담] ${f.get('company') || ''} ${f.get('name') || ''}`.trim();
        const submitBtn = demoForm.querySelector('.demo-submit');
        const btnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.textContent = '전송 중…';

        try {
          // 사이트에서 직접 접수 — 릴레이 서버가 상담 메일함으로 전달
          const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              _subject: subject,
              _template: 'table',
              _replyto: f.get('email') || '',
              '회사명': f.get('company') || '-',
              '성함': f.get('name') || '-',
              '연락처': f.get('phone') || '-',
              '이메일': f.get('email') || '-',
              '관심 제품': f.get('product') || '-',
              '문의 내용': f.get('message') || '-'
            })
          });
          if (!res.ok) throw new Error('relay failed: ' + res.status);
          demoForm.reset();
          closeDemo();
          setTimeout(openDone, 220); // 폼 모달 닫힘 애니메이션 후 완료 팝업

        } catch (err) {
          // 릴레이 실패 시 메일 초안 폴백
          const body = [
            `회사명: ${f.get('company') || '-'}`,
            `성함: ${f.get('name') || '-'}`,
            `연락처: ${f.get('phone') || '-'}`,
            `이메일: ${f.get('email') || '-'}`,
            `관심 제품: ${f.get('product') || '-'}`,
            '',
            '문의 내용:',
            f.get('message') || '-'
          ].join('\n');
          window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        } finally {
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
