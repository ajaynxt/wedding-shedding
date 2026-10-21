/**
 * NIKHIL KAPUR PHOTOGRAPHY - INTERACTIVE PORTFOLIO ENGINE
 * Full-fidelity reverse-engineered functionality:
 * - Responsive Header & Mobile Drawer
 * - Hero 3D Card Carousel with Progress Timer
 * - Stats Counter Animation
 * - Scroll-triggered Element Reveals
 * - Project Modal Gallery & Lightbox Viewer
 * - Retro Camera LCD HUD Slideshow & D-Pad Controls
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHeroCarousel();
  initStatsCounter();
  initScrollReveal();
  initProjectsGallery();
  initPortfolioFilters();
  initPortfolioSlider();
  initFilmsSlider();
  initRegionalSlider();
  initServicesSlider();
  initReviewsSlider();
  initScrollTop();
  initInquiryModal();
  initCustomCursor();
  initFilmModal();
  initCameraFooter();
  initThemeToggle();
  initFilmstripDropdown();
});

/* ============================================================
   1. FILMSTRIP MEGA-MENU DROPDOWN (.nk-fs)
   ============================================================ */
function initFilmstripDropdown() {
  const navItem = document.getElementById('navItemPhotography');
  const panel = document.getElementById('nkFsPanel');
  const header = document.getElementById('nk-site-header') || document.querySelector('.site-header');
  if (!navItem || !panel) return;

  let timer = null;
  const isDesk = () => window.innerWidth >= 1025;

  function place() {
    if (!header) return;
    const b = header.getBoundingClientRect().bottom;
    panel.style.top = Math.max(0, Math.round(b)) + 'px';
  }

  function show() {
    clearTimeout(timer);
    place();
    panel.classList.add('on');
    navItem.classList.add('nk-fs-open');
    header?.classList.add('nk-fs-on');
    const a = navItem.querySelector('a');
    if (a) a.setAttribute('aria-expanded', 'true');
  }

  function hide(now) {
    if (now) {
      clearTimeout(timer);
      panel.classList.remove('on');
      navItem.classList.remove('nk-fs-open');
      header?.classList.remove('nk-fs-on');
      const a = navItem.querySelector('a');
      if (a) a.setAttribute('aria-expanded', 'false');
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        panel.classList.remove('on');
        navItem.classList.remove('nk-fs-open');
        header?.classList.remove('nk-fs-on');
        const a = navItem.querySelector('a');
        if (a) a.setAttribute('aria-expanded', 'false');
      }, 220);
    }
  }

  navItem.addEventListener('mouseenter', () => { if (isDesk()) show(); });
  navItem.addEventListener('mouseleave', () => { if (isDesk()) hide(false); });
  panel.addEventListener('mouseenter', () => { clearTimeout(timer); });
  panel.addEventListener('mouseleave', () => { if (isDesk()) hide(false); });

  navItem.querySelector('a')?.addEventListener('click', (e) => {
    if (isDesk()) {
      e.preventDefault();
      panel.classList.contains('on') ? hide(true) : show();
    }
  });

  // Highlight corresponding label when hovering over film frame
  const frames = panel.querySelectorAll('.nk-fr');
  const labels = panel.querySelectorAll('.nk-labels .nk-lab a');
  frames.forEach(fr => {
    fr.addEventListener('mouseenter', () => {
      const idx = fr.dataset.i;
      labels.forEach(l => l.classList.toggle('is-hot', l.dataset.i === idx));
    });
  });
  panel.addEventListener('mouseleave', () => {
    labels.forEach(l => l.classList.remove('is-hot'));
  });

  window.addEventListener('scroll', () => { if (panel.classList.contains('on')) place(); }, { passive: true });
  window.addEventListener('resize', () => { if (panel.classList.contains('on')) place(); }, { passive: true });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(true); });
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('on') && !panel.contains(e.target) && !navItem.contains(e.target)) {
      hide(true);
    }
  });
}

/* ============================================================
   2. HEADER & MOBILE DRAWER
   ============================================================ */
function initHeader() {
  const header = document.querySelector('.site-header, #nk-site-header');
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const closeBtn = document.querySelector('.mobile-drawer-close');
  const drawer = document.querySelector('.mobile-drawer');

  // Sticky / Solid header scroll trigger & Smart Auto-Scroll Hide/Reveal
  const THRESHOLD = 30;
  let solid = null;
  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  let isHidden = false;

  function paint() {
    const y = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
    const nextSolid = y > THRESHOLD;
    if (nextSolid !== solid) {
      solid = nextSolid;
      header?.classList.toggle('is-solid', nextSolid);
      header?.classList.toggle('is-scrolled', nextSolid);
    }

    // Auto-scroll / Auto-hide on scroll down, reveal on scroll up
    const isDrawerOpen = drawer?.classList.contains('is-open');
    if (!isDrawerOpen) {
      const diff = y - lastScrollY;
      if (y > 70 && diff > 6 && !isHidden) {
        // Scrolling down: hide header
        isHidden = true;
        header?.classList.add('is-hidden');
      } else if ((diff < -6 || y <= 40) && isHidden) {
        // Scrolling up or near top: reveal header
        isHidden = false;
        header?.classList.remove('is-hidden');
      }
    }
    lastScrollY = y;
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      paint();
      ticking = false;
    });
  }

  paint();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', paint, { passive: true });

  // Mobile drawer
  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.add('is-open');
      header?.classList.remove('is-hidden');
      isHidden = false;
      document.body.classList.add('nk-proj-locked');
    });
  }
  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      document.body.classList.remove('nk-proj-locked');
    });
  }
  // Close drawer on link click
  drawer?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      document.body.classList.remove('nk-proj-locked');
    });
  });

  // Strip /index.html from browser address bar so only clean domain name is shown
  try {
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      if (window.location.pathname.endsWith('/index.html') || window.location.pathname === '/index.html') {
        const cleanPath = window.location.pathname.replace(/\/index\.html$/, '') || '/';
        const cleanUrl = cleanPath + window.location.search + window.location.hash;
        window.history.replaceState(null, '', cleanUrl);
      }
    }
  } catch (err) {}

  // Logo & Home click handling:
  // When clicked on homepage, smoothly scroll to top and ensure clean root URL in address bar
  document.querySelectorAll('.site-logo, a[href="/"], a[href="./"], a[href="index.html"]').forEach(link => {
    const isLogo = link.classList.contains('site-logo');
    const isHomeLink = link.textContent.trim().toLowerCase() === 'home';
    if (!isLogo && !isHomeLink) return;

    link.addEventListener('click', e => {
      const p = window.location.pathname;
      const isHome = p === '/' || p === '' || p.endsWith('/index.html') || p.endsWith('/nikhilkapur-clone/') || p.endsWith('/nikhilkapur-clone/index.html');
      if (isHome) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        header?.classList.remove('is-hidden');
        isHidden = false;
        try {
          if (window.history.pushState && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
            const rootPath = p.includes('/nikhilkapur-clone') ? '/nikhilkapur-clone/' : '/';
            window.history.pushState(null, '', rootPath);
          }
        } catch (err) {}
      }
    });
  });

  // Smooth Auto-scroll for in-page anchor links
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#' || href === '#!') return;
    
    const hashIndex = href.indexOf('#');
    const path = href.slice(0, hashIndex);
    const hash = href.slice(hashIndex);
    
    const isCurrentPage = !path || path === '/' || path === window.location.pathname.split('/').pop() || (window.location.pathname.endsWith('/') && (path === 'index.html' || path === ''));
    if (isCurrentPage && hash.length > 1) {
      link.addEventListener('click', e => {
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          const targetY = target.getBoundingClientRect().top + window.pageYOffset - 58;
          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: 'smooth'
          });
          header?.classList.remove('is-hidden');
          isHidden = false;
          if (history.pushState) {
            history.pushState(null, null, hash);
          }
        }
      });
    }
  });
}

/* ============================================================
   2. HERO CAROUSEL (.nkh) - NIKHIL KAPUR AUTHENTIC ACCORDION ENGINE
   ============================================================ */
function initHeroCarousel() {
  const root = document.getElementById('nkh');
  if (!root || root.dataset.init) return;
  root.dataset.init = '1';

  const list = root.querySelector('.nkh__list');
  const stage = root.querySelector('.nkh__stage');
  const count = root.querySelector('.nkh__count b');
  const bar = root.querySelector('.nkh__bar i');
  if (!list || !stage) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUR = (window.innerWidth <= 1024 ? 2800 : 2500);
  let timer = null;
  let busy = false;
  let hover = false;
  let focus = false;
  let visible = true;
  let holdUntil = 0;

  root.style.setProperty('--dur', DUR + 'ms');
  const ACTIVE = 4; // Zero-based: 5th slot is the open card

  // Second copy of the ring so columns can slide in from the hidden edges
  Array.prototype.slice.call(list.children).forEach(function(li) {
    const c = li.cloneNode(true);
    c.classList.add('is-clone');
    const im = c.querySelector('img');
    if (im) {
      im.removeAttribute('fetchpriority');
      im.loading = 'lazy';
    }
    list.appendChild(c);
  });

  const items = function() { return list.children; };

  function vis() {
    const w = window.innerWidth;
    return w < 768 ? [3, 5] : w <= 1024 ? [2, 6] : [1, 7];
  }

  function header() {
    const h = document.querySelector('header.header, #nk-site-header, .site-header, header');
    let v = h ? Math.round(h.getBoundingClientRect().height) : 52;
    if (v < 30 || v > 120) v = 52;
    root.style.setProperty('--top', v + 'px');
    root.style.setProperty('--stage-w', stage.clientWidth + 'px');
  }

  function sync() {
    const a = items()[ACTIVE];
    if (!a) return;
    if (count) count.textContent = ('0' + a.dataset.i).slice(-2);
    const r = vis();
    Array.prototype.forEach.call(items(), function(li, k) {
      const shown = k >= r[0] && k <= r[1];
      li.setAttribute('aria-hidden', shown ? 'false' : 'true');
      if (li.firstElementChild) li.firstElementChild.tabIndex = shown ? 0 : -1;
    });
    restartBar();
  }

  function restartBar() {
    root.classList.remove('is-playing');
    if (bar) void bar.offsetWidth;
    if (!reduce && running()) root.classList.add('is-playing');
  }

  function next() {
    if (hot) setHot(null);
    list.appendChild(items()[0]);
    sync();
  }

  function prev() {
    if (hot) setHot(null);
    list.insertBefore(items()[items().length - 1], items()[0]);
    sync();
  }

  function go(steps) {
    if (busy || !steps) return;
    busy = true;
    const dir = steps > 0 ? 1 : -1;
    let n = Math.abs(steps);
    (function step() {
      dir > 0 ? next() : prev();
      if (--n > 0) setTimeout(step, reduce ? 0 : 240);
      else setTimeout(function() { busy = false; }, reduce ? 0 : 300);
    })();
  }

  function running() {
    return !hover && !focus && visible && !document.hidden && Date.now() >= holdUntil;
  }

  function schedule() {
    clearTimeout(timer);
    if (reduce) return;
    root.classList.toggle('is-paused', !running());
    if (running()) {
      root.classList.add('is-playing');
      timer = setTimeout(function() {
        if (running()) {
          go(1);
        }
        schedule();
      }, DUR);
    }
  }

  function user(steps) {
    holdUntil = Date.now() + DUR;
    go(steps);
    root.classList.remove('is-playing');
    clearTimeout(timer);
    setTimeout(schedule, DUR + 20);
  }

  root.querySelector('.nkh__btn--next')?.addEventListener('click', function() { user(1); });
  root.querySelector('.nkh__btn--prev')?.addEventListener('click', function() { user(-1); });

  stage.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); user(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); user(-1); }
  });

  let hot = null;
  function setHot(li) {
    if (hot === li) return;
    if (hot) hot.classList.remove('is-hot');
    hot = li;
    const act = items()[ACTIVE];
    if (li && li !== act) {
      li.classList.add('is-hot');
      list.classList.add('has-hot');
      if (count) count.textContent = ('0' + li.dataset.i).slice(-2);
    } else {
      hot = null;
      list.classList.remove('has-hot');
      if (act && count) count.textContent = ('0' + act.dataset.i).slice(-2);
    }
  }

  // Desktop hover card expand (5s arm delay as in Nikhil Kapur)
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const desk = function() { return window.innerWidth > 1024; };
    const armAt = Date.now() + 5000;
    let lx = null, ly = null;
    list.addEventListener('mousemove', function(e) {
      if (!desk() || Date.now() < armAt) return;
      if (e.screenX === lx && e.screenY === ly) return;
      lx = e.screenX; ly = e.screenY;
      const li = e.target.closest('.nkh__item');
      if (li && li.getAttribute('aria-hidden') === 'false') {
        setHot(li);
        if (!hover) { hover = true; schedule(); }
      }
    });
    list.addEventListener('mouseleave', function() {
      setHot(null);
      if (hover) { hover = false; schedule(); }
    });
  }

  root.addEventListener('focusin', function(e) {
    if (e.target.matches(':focus-visible')) { focus = true; schedule(); }
  });
  root.addEventListener('focusout', function() {
    focus = false; schedule();
  });

  // Touch swipe support
  let sx = 0, sy = 0, t0 = 0, swiped = false;
  stage.addEventListener('touchstart', function(e) {
    const t = e.touches[0]; sx = t.clientX; sy = t.clientY; t0 = Date.now(); swiped = false;
  }, { passive: true });
  stage.addEventListener('touchend', function(e) {
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2 && Date.now() - t0 < 800) {
      swiped = true;
      user(dx < 0 ? 1 : -1);
    }
  }, { passive: true });
  list.addEventListener('click', function(e) {
    if (swiped) { e.preventDefault(); swiped = false; }
  });

  document.addEventListener('visibilitychange', schedule);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(es) {
      visible = es[0].isIntersecting; schedule();
    }, { threshold: 0.25 }).observe(root);
  }

  header();
  window.addEventListener('resize', function() { header(); sync(); });
  window.addEventListener('load', header);

  sync();
  root.classList.add('nkh-ready');
  schedule();
}

/* ============================================================
   3. STATS NUMBER COUNTER ANIMATION
   ============================================================ */
function initStatsCounter() {
  const countEls = document.querySelectorAll('[data-nkx-count]');
  if (!countEls.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);

      const el = entry.target;
      const target = +el.dataset.nkxCount;
      const duration = 1600;
      let start = null;

      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * easeOut);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.3 });

  countEls.forEach(el => {
    el.textContent = '0';
    observer.observe(el);
  });
}

/* ============================================================
   4. SCROLL REVEAL ANIMATIONS (.nkx-rv)
   ============================================================ */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.nkx-rv');
  if (!reveals.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach((el, i) => {
    el.style.transitionDelay = ((i % 5) * 80) + 'ms';
    observer.observe(el);
  });
}

/* ============================================================
   5. PROJECT MODAL & FULLSCREEN LIGHTBOX VIEWER
   ============================================================ */
function initProjectsGallery() {
  const PROJECTS = {
    // 1. Royal Weddings
    "royal-wedding": {
      "title": "ROYAL WEDDING CELEBRATION",
      "images": [
        "assets/images/ws_hero.jpg?v=3",
        "assets/images/ws_haldi_couple.jpg?v=4",
        "assets/images/ws_photo-01.jpg?v=3",
        "assets/images/ws_celebration_01.jpg?v=3",
        "assets/images/ws_photo-04.jpg?v=3",
        "assets/images/ws_photo-02.jpg?v=3",
        "assets/images/ws_photo-03.jpg?v=3",
        "assets/images/ws_photo-05.jpg?v=3",
        "assets/images/ws_photo-06.jpg?v=3",
        "assets/images/ws_photo-07.jpg?v=3",
        "assets/images/ws_photo-08.jpg?v=3",
        "assets/images/ws_family_01.jpg?v=3"
      ]
    },
    // 2. Haldi & Sangeet
    "haldi-sangeet": {
      "title": "VIBRANT HALDI & SANGEET CEREMONIES",
      "images": [
        "assets/images/ws_haldi_couple.jpg?v=4",
        "assets/images/ws_celebration_01.jpg?v=3",
        "assets/images/ws_photo-02.jpg?v=3",
        "assets/images/ws_photo-07.jpg?v=3",
        "assets/images/ws_family_01.jpg?v=3"
      ]
    },
    // 3. Romantic Pre-Wedding
    "pre-wedding": {
      "title": "ROMANTIC PRE-WEDDING & DESTINATION STORIES",
      "images": [
        "assets/images/ws_photo-05.jpg?v=3",
        "assets/images/ws_couple_portrait.jpg?v=3",
        "assets/images/ws_photo-01.jpg?v=3",
        "assets/images/ws_photo-02.jpg?v=3",
        "assets/images/ws_photo-04.jpg?v=3"
      ]
    },
    // 4. Sacred Rituals & Traditions
    "rituals-traditions": {
      "title": "SACRED RITUALS, PHERAS & VIDAAI",
      "images": [
        "assets/images/ws_photo-06.jpg?v=3",
        "assets/images/ws_photo-03.jpg?v=3",
        "assets/images/ws_photo-04.jpg?v=3",
        "assets/images/ws_celebration_01.jpg?v=3",
        "assets/images/ws_photo-08.jpg?v=3",
        "assets/images/ws_photo-01.jpg?v=3"
      ]
    },
    // 5. Real Estate Amore (4K Drone Video)
    "real-estate-amore": {
      "title": "AMORE LUXURY REAL ESTATE & AERIAL CINEMATOGRAPHY",
      "videoUrl": "https://drive.google.com/file/d/13YlJQDQ9bocJ4kS242FbfmO04ccSZdEw/preview",
      "videoBadge": "4K AERIAL DRONE CINEMATOGRAPHY &middot; AMORE TOWERS",
      "images": [
        "assets/images/ws_realestate_amore.jpg?v=3",
        "assets/images/ws_video_school.jpg?v=3",
        "assets/images/ws_video_ecommerce.jpg?v=3"
      ]
    },
    // 5b. Campus & Infrastructure Drone (4K Video)
    "campus-drone": {
      "title": "INSTITUTIONAL CAMPUS & INFRASTRUCTURE DRONE CINEMATOGRAPHY",
      "videoUrl": "https://drive.google.com/file/d/1m7iBCeFVwyR3FNUkZt2JnWlS_8rjiwDy/preview",
      "videoBadge": "4K AERIAL DRONE TOUR &middot; CAMPUS INFRASTRUCTURE",
      "images": [
        "assets/images/ws_video_school.jpg?v=3",
        "assets/images/ws_realestate_amore.jpg?v=3",
        "assets/images/ws_video_ecommerce.jpg?v=3"
      ]
    },
    // 6. Corporate Brand Shoot (4K Video)
    "corporate-shoot": {
      "title": "CORPORATE BRAND CINEMATOGRAPHY & EXECUTIVE MEDIA",
      "videoUrl": "https://drive.google.com/file/d/1yxzlKQ0uS81pbwml0b7CaD42nQ6mw_p_/preview",
      "videoBadge": "4K CORPORATE BRAND CINEMA &middot; LEADERSHIP FILM",
      "images": [
        "assets/images/ws_video_corporate.jpg?v=3",
        "assets/images/ws_corp_01.jpg?v=3",
        "assets/images/ws_video_interview.jpg?v=3",
        "assets/images/ws_video_sourceone.jpg?v=3"
      ]
    },
    // 7. Source One Corporate (4K Video)
    "source-one-corporate": {
      "title": "SOURCE ONE &middot; CORPORATE TECH & BRAND CULTURE PRODUCTION",
      "videoUrl": "https://drive.google.com/file/d/1VrN7bfzPDa7rP6Dagmwodr6ShQZrJxtf/preview",
      "videoBadge": "4K TECH ENTERPRISE FILM &middot; SOURCE ONE",
      "images": [
        "assets/images/ws_video_sourceone.jpg?v=3",
        "assets/images/ws_corp_01.jpg?v=3",
        "assets/images/ws_video_corporate.jpg?v=3",
        "assets/images/ws_video_interview.jpg?v=3"
      ]
    },
    // 8. Bougie Cut 2 Fashion (4K Video)
    "bougie-cut-fashion": {
      "title": "BOUGIE CUT 2 &middot; HIGH FASHION RUNWAY & COUTURE FILM",
      "videoUrl": "https://drive.google.com/file/d/1Q9NNlStf5vIOe0dfpRZUeGRCa7kcApfV/preview",
      "videoBadge": "4K HAUTE COUTURE RUNWAY &middot; BOUGIE CUT 2",
      "images": [
        "assets/images/ws_video_bougie.jpg?v=3",
        "assets/images/ws_photo-07.jpg?v=3",
        "assets/images/ws_photo-14.jpg?v=3",
        "assets/images/ws_photo-01.jpg?v=3",
        "assets/images/ws_photo-08.jpg?v=3",
        "assets/images/ws_photo-11.jpg?v=3"
      ]
    },
    // 9. Lakmé Fashion & Beauty
    "lakme-fashion": {
      "title": "LAKMÉ SALON & BRIDAL COUTURE CAMPAIGNS",
      "images": [
        "assets/images/ws_photo-07.jpg?v=3",
        "assets/images/ws_photo-01.jpg?v=3",
        "assets/images/ws_photo-08.jpg?v=3",
        "assets/images/ws_photo-14.jpg?v=3",
        "assets/images/ws_photo-13.jpg?v=3",
        "assets/images/ws_photo-11.jpg?v=3"
      ]
    },
    // 10. Healthcare & Medical Clinic (4K Video)
    "healthcare-clinic": {
      "title": "CLINICAL INFRASTRUCTURE & ADVANCED HEALTHCARE FACILITY TOUR",
      "videoUrl": "https://drive.google.com/file/d/1YVyasZASap-bq4vxUp5aAX3lZFbINP6f/preview",
      "videoBadge": "4K CLINICAL FACILITY TOUR &middot; MEDICAL INFRASTRUCTURE",
      "images": [
        "assets/images/ws_video_clinic.jpg?v=3",
        "assets/images/ws_video_dr_prachi.jpg?v=3",
        "assets/images/ws_corp_01.jpg?v=3",
        "assets/images/ws_video_corporate.jpg?v=3"
      ]
    },
    // 11. Dr. Prachi Benara Medical Success (4K Video)
    "dr-prachi-benara": {
      "title": "DR. PRACHI BENARA &middot; MEDICAL SUCCESS & PATIENT STORIES",
      "videoUrl": "https://drive.google.com/file/d/1e3eryFBIA7D1sVSg9a5pqzgTNhFc79Ay/preview",
      "videoBadge": "4K MEDICAL SUCCESS DOCUMENTARY &middot; DR. PRACHI BENARA",
      "images": [
        "assets/images/ws_video_dr_prachi.jpg?v=3",
        "assets/images/ws_video_clinic.jpg?v=3",
        "assets/images/ws_video_interview.jpg?v=3",
        "assets/images/ws_corp_01.jpg?v=3"
      ]
    },
    // 12. Diablo High-Energy Brand & Nightlife (4K Video)
    "gaming-diablo": {
      "title": "DIABLO &middot; HIGH-ENERGY NIGHTLIFE & BRAND EXPERIENCE",
      "videoUrl": "https://drive.google.com/file/d/1BmaOmYdxkXps2_PhoC049HRsydYwKEpQ/preview",
      "videoBadge": "4K HIGH-OCTANE BRAND CINEMA &middot; DIABLO",
      "images": [
        "assets/images/ws_video_diablo.jpg?v=3",
        "assets/images/ws_video_micdrop.jpg?v=3",
        "assets/images/ws_video_event.jpg?v=3",
        "assets/images/ws_esports_01.jpg?v=3"
      ]
    },
    // 13. PUBG & Esports Arena
    "pubg-esports": {
      "title": "PUBG & ESPORTS CHAMPIONSHIP ARENA",
      "images": [
        "assets/images/ws_esports_01.jpg?v=3"
      ]
    },
    // 14. E-Commerce Explainer Video (4K Video)
    "ecommerce-explainer": {
      "title": "E-COMMERCE STORE EXPLAINER & D2C PRODUCT COMMERCIAL",
      "videoUrl": "https://drive.google.com/file/d/1CA77ORrNXFxf844dOZ8OIJfoV3OLXUq7/preview",
      "videoBadge": "4K E-COMMERCE EXPLAINER &middot; D2C STORE COMMERCIAL",
      "images": [
        "assets/images/ws_video_ecommerce.jpg?v=3",
        "assets/images/ws_service_product_stationery.jpg?v=3",
        "assets/images/ws_video_interview.jpg?v=3",
        "assets/images/ws_video_corporate.jpg?v=3"
      ]
    },
    // 15. Mega Gala Event (4K Video)
    "mega-gala-event": {
      "title": "GRAND GALA & LIVE STAGE EVENT PRODUCTION",
      "videoUrl": "https://drive.google.com/file/d/1m3YcKKb05apywT9wRV-XVEu3gyIUNcEd/preview",
      "videoBadge": "4K MULTI-CAM LIVE EVENT FILM &middot; GRAND GALA",
      "images": [
        "assets/images/ws_video_event.jpg?v=3",
        "assets/images/ws_esports_01.jpg?v=3",
        "assets/images/ws_video_utkarsh.jpg?v=3",
        "assets/images/ws_video_micdrop.jpg?v=3"
      ]
    },
    // 16. Utkarsh Classes 2023 JEE Result Celebration (4K Video)
    "utkarsh-result-celebration": {
      "title": "UTKARSH CLASSES 2023 &middot; JEE RESULT CELEBRATION & ARENA CONCERT",
      "videoUrl": "https://drive.google.com/file/d/1sK66FbH_XNDO85WTE0SNf2lpMkzlUccw/preview",
      "videoBadge": "4K MEGA ARENA CELEBRATION &middot; UTKARSH 2023",
      "images": [
        "assets/images/ws_video_utkarsh.jpg?v=3",
        "assets/images/ws_video_jee.jpg?v=3",
        "assets/images/ws_video_event.jpg?v=3",
        "assets/images/ws_video_school.jpg?v=3"
      ]
    },
    // 17. Mic Drop Live Comedy & Show (4K Video)
    "micdrop-live-comedy": {
      "title": "MIC DROP &middot; LIVE STAND-UP COMEDY & CONCERT EXPERIENCE",
      "videoUrl": "https://drive.google.com/file/d/1s4O3Dkyw0lQer3eZW1dFUdWKaQWj8GY9/preview",
      "videoBadge": "4K LIVE STANDUP &middot; MIC DROP COMEDY & CONCERT",
      "images": [
        "assets/images/ws_video_micdrop.jpg?v=3",
        "assets/images/ws_video_diablo.jpg?v=3",
        "assets/images/ws_video_event.jpg?v=3",
        "assets/images/ws_esports_01.jpg?v=3"
      ]
    },
    // 18. School Campus & Annual Day (4K Video)
    "school-campus-film": {
      "title": "CAMPUS LIFE, ACADEMICS & SCHOOL ANNUAL DAY CINEMATOGRAPHY",
      "videoUrl": "https://drive.google.com/file/d/1m7iBCeFVwyR3FNUkZt2JnWlS_8rjiwDy/preview",
      "videoBadge": "4K SCHOOL & CAMPUS FILM &middot; ANNUAL DAY",
      "images": [
        "assets/images/ws_video_school.jpg?v=3",
        "assets/images/ws_video_jee.jpg?v=3",
        "assets/images/ws_video_utkarsh.jpg?v=3",
        "assets/images/ws_video_event.jpg?v=3"
      ]
    },
    // 19. JEE Advanced Toppers Felicitation (4K Video)
    "jee-advanced-triumph": {
      "title": "JEE ADVANCED &middot; MERIT FELICITATION & STUDENT TRIUMPH",
      "videoUrl": "https://drive.google.com/file/d/1NEw4aj7_enT0PET8o0rUBFKtu5X91aEK/preview",
      "videoBadge": "4K ACADEMIC SUCCESS &middot; JEE ADVANCED",
      "images": [
        "assets/images/ws_video_jee.jpg?v=3",
        "assets/images/ws_video_utkarsh.jpg?v=3",
        "assets/images/ws_video_school.jpg?v=3",
        "assets/images/ws_video_interview.jpg?v=3"
      ]
    },
    // 20. The Swiss Village Resort
    "swiss-village": {
      "title": "THE SWISS VILLAGE LUXURY RESORT CINEMATOGRAPHY",
      "images": [
        "assets/images/films/film_sagar_manshi_rishikesh.jpg?v=3",
        "assets/images/ws_realestate_amore.jpg?v=3",
        "assets/images/ws_video_school.jpg?v=3",
        "assets/images/ws_video_ecommerce.jpg?v=3"
      ]
    },
    // 21. NGO & Social Impact Documentaries
    "ngo-documentary": {
      "title": "NGO & SOCIAL IMPACT CSR DOCUMENTARIES",
      "images": [
        "assets/images/ws_video_event.jpg?v=3",
        "assets/images/ws_corp_01.jpg?v=3",
        "assets/images/ws_video_school.jpg?v=3",
        "assets/images/ws_video_interview.jpg?v=3"
      ]
    },
    // 22. IRAM Corporate
    "iram-corporate": {
      "title": "ADVOCATE IRAM MAJID · EXECUTIVE CHAMBERS & LEGAL LEADERSHIP",
      "images": [
        "assets/images/ws_corp_01.jpg?v=3",
        "assets/images/ws_video_interview.jpg?v=3"
      ]
    },
    // 23. Gym & Fitness
    "gym-fitness": {
      "title": "GYM, ATHLETES & HIGH-ENERGY FITNESS MEDIA",
      "images": [
        "assets/images/ws_service_esports_player_walk.jpg?v=3",
        "assets/images/ws_esports_01.jpg?v=3",
        "assets/images/ws_video_diablo.jpg?v=3"
      ]
    },
    // 24. Political Campaigns
    "political-campaigns": {
      "title": "POLITICAL & PUBLIC LEADERSHIP EVENTS",
      "images": [
        "assets/images/ws_video_event.jpg?v=3",
        "assets/images/ws_video_utkarsh.jpg?v=3",
        "assets/images/ws_corp_01.jpg?v=3",
        "assets/images/ws_video_sourceone.jpg?v=3"
      ]
    }
  };

  const modal = document.getElementById('nkProjModal');
  const viewer = document.getElementById('nkProjViewer');
  if (!modal || !viewer) return;

  const grid = modal.querySelector('.nk-proj-modal__grid');
  const titleEl = modal.querySelector('.nk-proj-modal__title');
  const countEl = modal.querySelector('.nk-proj-modal__count');
  const vImg = viewer.querySelector('.nk-proj-viewer__img');
  const vCount = viewer.querySelector('.nk-proj-viewer__count');
  const vPrev = viewer.querySelector('.nk-proj-viewer__prev');
  const vNext = viewer.querySelector('.nk-proj-viewer__next');

  let current = [];
  let idx = 0;
  let lastFocus = null;

  function lock(on) {
    if (on) {
      const sw = window.innerWidth - document.documentElement.clientWidth;
      if (sw > 0) document.body.style.paddingRight = sw + 'px';
      document.body.classList.add('nk-proj-locked');
    } else {
      document.body.classList.remove('nk-proj-locked');
      document.body.style.paddingRight = '';
    }
  }

  window.openProjectModal = function(key) {
    const proj = PROJECTS[key];
    if (!proj) return;
    current = proj.images || [];
    titleEl.innerHTML = proj.title;
    countEl.textContent = proj.videoUrl
      ? ('1 4K Cinema Film' + (current.length ? ' + ' + current.length + ' High-Res Photos' : ''))
      : (current.length + ' High-Res Photographs');
    grid.innerHTML = '';

    // If project has an embedded video player
    if (proj.videoUrl) {
      current = []; // Single item only: no extra filler photos below video
      countEl.textContent = '4K CINEMA FILM';
      const panel = modal.querySelector('.nk-proj-modal__panel');
      if (panel) panel.classList.add('is-video-mode');
      grid.style.display = 'block';

      const vidWrap = document.createElement('div');
      vidWrap.className = 'nk-proj-video-embed';
      vidWrap.style.cssText = 'width: 100%; max-width: 960px; margin: 0 auto; border-radius: 8px; overflow: hidden; border: 1px solid rgba(212,175,55,0.45); background: #000; box-shadow: 0 10px 35px rgba(0,0,0,0.35);';
      
      const cleanTitle = (proj.title || 'Film').replace(/&middot;|&amp;/g, ' ').replace(/\s+/g, ' ').trim();
      vidWrap.innerHTML = `
        <div style="position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;background:#000;">
          <iframe src="${proj.videoUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="autoplay; fullscreen" allowfullscreen></iframe>
          <!-- Shield to block Google Drive top header pop-out button so user plays inline only -->
          <div class="gdrive-shield-top" style="position:absolute;top:0;left:0;right:0;height:56px;z-index:15;pointer-events:all;background:transparent;" title=""></div>
        </div>
        <div style="padding:14px 18px;display:flex;align-items:center;justify-content:space-between;background:var(--bg-alt);flex-wrap:wrap;gap:10px;border-top:1px solid var(--ln);">
          <span style="font-family:var(--font-display);font-size:12px;font-weight:700;color:var(--g);letter-spacing:1px;display:inline-flex;align-items:center;gap:6px;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            ${proj.videoBadge || '4K CINEMA PRODUCTION'}
          </span>
          <a href="https://wa.me/917503550936?text=Hi%20Wedding%20Shedding,%20I%20am%20inquiring%20about%20${encodeURIComponent(cleanTitle)}." target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--g);font-weight:700;text-decoration:none;">
            Book on WhatsApp &rarr;
          </a>
        </div>
      `;
      grid.appendChild(vidWrap);
    } else {
      current = proj.images || [];
      countEl.textContent = current.length + ' High-Res Photographs';
      const panel = modal.querySelector('.nk-proj-modal__panel');
      if (panel) panel.classList.remove('is-video-mode');
      grid.style.display = '';

      const NUM_COLS = 3;
      const cols = [];
      for (let c = 0; c < NUM_COLS; c++) {
        const colDiv = document.createElement('div');
        colDiv.className = 'nk-proj-col';
        grid.appendChild(colDiv);
        cols.push(colDiv);
      }

      current.forEach((url, i) => {
        const a = document.createElement('a');
        a.href = '#';
        a.setAttribute('data-proj-idx', i);
        const im = document.createElement('img');
        im.src = url;
        im.alt = proj.title + ' ' + (i + 1);
        im.loading = 'lazy';
        a.appendChild(im);
        cols[i % NUM_COLS].appendChild(a);
      });
    }

    lastFocus = document.activeElement;
    modal.hidden = false;
    lock(true);
    grid.scrollTop = 0;
    modal.querySelector('.nk-proj-modal__close')?.focus();
  };

  function closeModal() {
    modal.hidden = true;
    grid.innerHTML = ''; // Unload video iframe to stop audio/video immediately
    grid.style.display = '';
    const panel = modal.querySelector('.nk-proj-modal__panel');
    if (panel) panel.classList.remove('is-video-mode');
    if (viewer.hidden) lock(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function showImage(i) {
    if (!current.length) return;
    idx = (i + current.length) % current.length;
    vImg.src = current[idx];
    vCount.textContent = (idx + 1) + ' / ' + current.length;
    const multi = current.length > 1;
    vPrev.style.display = multi ? '' : 'none';
    vNext.style.display = multi ? '' : 'none';
  }

  function openViewer(i) {
    showImage(i);
    viewer.hidden = false;
    lock(true);
    viewer.querySelector('.nk-proj-viewer__close')?.focus();
  }

  function closeViewer() {
    viewer.hidden = true;
    vImg.removeAttribute('src');
    if (modal.hidden) lock(false);
  }

  // Event delegations
  document.addEventListener('click', e => {
    // Trigger buttons with data-project
    const trigger = e.target.closest('[data-project]');
    if (trigger) {
      e.preventDefault();
      const pKey = trigger.getAttribute('data-project');
      window.openProjectModal(pKey);
      return;
    }

    // Grid thumbnail click
    const thumb = e.target.closest('.nk-proj-col a');
    if (thumb) {
      e.preventDefault();
      openViewer(parseInt(thumb.getAttribute('data-proj-idx'), 10) || 0);
      return;
    }

    if (e.target.closest('[data-proj-vclose]')) { closeViewer(); return; }
    if (e.target.closest('[data-proj-close]')) { closeModal(); return; }
    if (!viewer.hidden && e.target === viewer) { closeViewer(); return; }
  });

  vPrev?.addEventListener('click', e => { e.stopPropagation(); showImage(idx - 1); });
  vNext?.addEventListener('click', e => { e.stopPropagation(); showImage(idx + 1); });

  document.addEventListener('keydown', e => {
    if (!viewer.hidden) {
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowLeft') showImage(idx - 1);
      if (e.key === 'ArrowRight') showImage(idx + 1);
      return;
    }
    if (!modal.hidden && e.key === 'Escape') closeModal();
  });
}

/* ============================================================
   5B. PORTFOLIO CATEGORY FILTER TABS (NIKHIL KAPUR STANDARD)
   ============================================================ */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
  const cards = document.querySelectorAll('.project-card[data-category]');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter') || 'all';

      // Update active tab button
      filterBtns.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      // Filter portfolio project cards
      cards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        const match = filter === 'all' || cat.split(/\s+/).includes(filter);
        if (match) {
          card.classList.remove('is-filtered-out');
          card.classList.remove('is-filtered-in');
          void card.offsetWidth; // Force reflow to re-trigger smooth entrance animation
          card.classList.add('is-filtered-in');
        } else {
          card.classList.remove('is-filtered-in');
          card.classList.add('is-filtered-out');
        }
      });

      // Sync portfolio slider with filtered cards
      const slider = document.getElementById('portfolioSlider');
      if (slider && typeof slider.__syncSlider === 'function') {
        slider.__syncSlider();
      }
    });
  });
}

/* ============================================================
   5C. PORTFOLIO SLIDER & AUTO SLIDE BAR (NIKHIL KAPUR STANDARD)
   ============================================================ */
function initPortfolioSlider() {
  const slider = document.getElementById('portfolioSlider');
  const track = document.getElementById('portfolioSliderTrack');
  if (!slider || !track) return;

  const currentCountEl = document.getElementById('portfolioSlideCurrent');
  const totalCountEl = document.getElementById('portfolioSlideTotal');
  const barFill = document.getElementById('portfolioSlideBarFill');
  const progressBar = document.getElementById('portfolioSlideBar');
  const prevBtn = document.getElementById('portfolioNavPrev');
  const nextBtn = document.getElementById('portfolioNavNext');
  const playPauseBtn = document.getElementById('portfolioNavPlayPause');
  const autoPulse = document.getElementById('portfolioAutoPulse');
  const autoLabel = document.getElementById('portfolioAutoLabel');

  const INTERVAL = 3800; // 3.8s per slide
  let isPaused = false;
  let isHovered = false;
  let isTouching = false;
  let elapsed = 0;
  let lastTimestamp = null;
  let activeIndex = 0;

  function getVisibleSlides() {
    return Array.from(track.querySelectorAll('.project-card:not(.is-filtered-out)'));
  }

  function updateTotal() {
    const visible = getVisibleSlides();
    const count = visible.length;
    if (totalCountEl) {
      totalCountEl.textContent = ('0' + Math.max(count, 1)).slice(-2);
    }
    updateCurrent();
  }

  function updateCurrent() {
    const visible = getVisibleSlides();
    if (!visible.length) return;
    if (activeIndex >= visible.length) activeIndex = 0;
    if (currentCountEl) {
      currentCountEl.textContent = ('0' + (activeIndex + 1)).slice(-2);
    }
  }

  function scrollToSlide(index, smooth = true) {
    const visible = getVisibleSlides();
    if (!visible.length) return;
    if (index >= visible.length) index = 0;
    if (index < 0) index = visible.length - 1;
    activeIndex = index;

    const target = visible[activeIndex];
    if (target) {
      const scrollPos = target.offsetLeft - track.offsetLeft;
      track.scrollTo({
        left: scrollPos,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
    updateCurrent();
  }

  function animateLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    const visible = getVisibleSlides();
    if (visible.length <= 1) {
      if (barFill) barFill.style.width = '100%';
    } else {
      if (!isPaused && !isHovered && !isTouching) {
        elapsed += delta;
        const progress = Math.min(elapsed / INTERVAL, 1);
        if (barFill) {
          barFill.style.width = (progress * 100) + '%';
        }

        if (progress >= 1) {
          elapsed = 0;
          scrollToSlide(activeIndex + 1, true);
        }
      }
    }

    requestAnimationFrame(animateLoop);
  }

  function resetTimer() {
    elapsed = 0;
    if (barFill) barFill.style.width = '0%';
  }

  function togglePlayPause() {
    isPaused = !isPaused;
    if (playPauseBtn) {
      const pauseIcon = playPauseBtn.querySelector('.icon-pause');
      const playIcon = playPauseBtn.querySelector('.icon-play');
      if (pauseIcon && playIcon) {
        pauseIcon.style.display = isPaused ? 'none' : 'block';
        playIcon.style.display = isPaused ? 'block' : 'none';
      }
      playPauseBtn.setAttribute('aria-label', isPaused ? 'Resume auto slide' : 'Pause auto slide');
    }
    if (autoPulse) {
      autoPulse.classList.toggle('is-paused', isPaused);
    }
    if (autoLabel) {
      autoLabel.textContent = isPaused ? 'PAUSED' : 'AUTO SLIDE';
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      scrollToSlide(activeIndex + 1, true);
      resetTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      scrollToSlide(activeIndex - 1, true);
      resetTimer();
    });
  }

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', togglePlayPause);
  }

  // Hover detection
  slider.addEventListener('mouseenter', () => { isHovered = true; });
  slider.addEventListener('mouseleave', () => { isHovered = false; });

  // Touch handling
  track.addEventListener('touchstart', () => { isTouching = true; }, { passive: true });
  track.addEventListener('touchend', () => {
    isTouching = false;
    resetTimer();
  }, { passive: true });

  // Click on progress bar to jump
  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const visible = getVisibleSlides();
      if (visible.length) {
        const targetIdx = Math.min(Math.floor(ratio * visible.length), visible.length - 1);
        scrollToSlide(targetIdx, true);
        resetTimer();
      }
    });
  }

  // Scroll listener for manual dragging / touch swiping
  let scrollRAF = null;
  track.addEventListener('scroll', () => {
    if (scrollRAF) cancelAnimationFrame(scrollRAF);
    scrollRAF = requestAnimationFrame(() => {
      const visible = getVisibleSlides();
      if (!visible.length) return;
      const currentScroll = track.scrollLeft;
      let closestIdx = 0;
      let minDiff = Infinity;
      visible.forEach((slide, idx) => {
        const diff = Math.abs((slide.offsetLeft - track.offsetLeft) - currentScroll);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      if (closestIdx !== activeIndex) {
        activeIndex = closestIdx;
        updateCurrent();
      }
    });
  }, { passive: true });

  // Sync hook when filter tabs are clicked
  slider.__syncSlider = function() {
    activeIndex = 0;
    updateTotal();
    scrollToSlide(0, false);
    resetTimer();
  };

  updateTotal();
  requestAnimationFrame(animateLoop);
}

/* ============================================================
   5C. NIKHIL KAPUR SIGNATURE MAGNETIC LUXURY CURSOR
   ============================================================ */
function initCustomCursor() {
  // Disabled: native responsive system cursor requested by user
  return;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMoving) {
      isMoving = true;
      ringX = mouseX;
      ringY = mouseY;
    }
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    dot.classList.remove('is-hidden');
    ring.classList.remove('is-hidden');
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    dot.classList.add('is-hidden');
    ring.classList.add('is-hidden');
  });

  // Smooth lerp loop for outer magnetic follower ring
  function renderCursor() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover expansion on interactive elements
  const interactiveSelector = 'a, button, [role="button"], [role="tab"], .project-card, .portfolio-filter-btn, input, select, textarea, .nk-camera-screen, .nkh__card, .nkf__key, .service-card, .package-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      ring.classList.add('is-hovering');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      ring.classList.remove('is-hovering');
    }
  }, { passive: true });
}

/* ============================================================
   5D. CINEMATIC FILM LIGHTBOX MODAL
   ============================================================ */
function initFilmModal() {
  const modal = document.getElementById('nkFilmModal');
  const iframe = document.getElementById('nkFilmIframe');
  const titleEl = document.getElementById('nkFilmModalTitle');
  const ytLink = document.getElementById('nkFilmModalYtLink');
  const waLink = document.getElementById('nkFilmModalWaLink');
  if (!modal || !iframe) return;

  function lock(on) {
    if (on) {
      const sw = window.innerWidth - document.documentElement.clientWidth;
      if (sw > 0) document.body.style.paddingRight = sw + 'px';
      document.body.classList.add('nk-proj-locked');
    } else {
      document.body.classList.remove('nk-proj-locked');
      document.body.style.paddingRight = '';
    }
  }

  function openFilm(ytId, title) {
    if (!ytId) return;
    if (titleEl) titleEl.textContent = title || 'Cinematic Wedding Film';
    if (ytLink) ytLink.href = `https://youtu.be/${ytId}`;
    if (waLink) waLink.href = `https://wa.me/917503550936?text=Hi%20Wedding%20Shedding,%20I%20loved%20the%20${encodeURIComponent(title || 'wedding film')}%20and%20want%20to%20inquire%20about%20booking.`;
    iframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    modal.hidden = false;
    lock(true);
    modal.querySelector('.nk-film-modal__close')?.focus();
  }

  function closeFilm() {
    modal.hidden = true;
    iframe.src = '';
    const isOtherOpen = !document.getElementById('nkProjModal')?.hidden || !document.getElementById('nkProjViewer')?.hidden;
    if (!isOtherOpen) lock(false);
  }

  // Click on any film card play trigger
  document.addEventListener('click', e => {
    const playTrigger = e.target.closest('.js-play-film, [data-youtube-id] .nk-film-thumbwrap');
    if (playTrigger) {
      e.preventDefault();
      const card = playTrigger.closest('.nk-film-card') || playTrigger;
      const ytId = playTrigger.getAttribute('data-yt') || card.getAttribute('data-youtube-id');
      const title = card.querySelector('.nk-film-name')?.textContent?.trim() || 'Cinematic Wedding Film';
      openFilm(ytId, title);
      return;
    }

    if (e.target.closest('[data-film-close]')) {
      closeFilm();
      return;
    }
    if (!modal.hidden && e.target === modal) {
      closeFilm();
      return;
    }
  });

  document.addEventListener('keydown', e => {
    if (!modal.hidden && e.key === 'Escape') {
      closeFilm();
    }
  });
}

/* ============================================================
   6. RETRO CAMERA FOOTER INTERACTIVE ENGINE (.nkf)
   ============================================================ */
function initCameraFooter() {
  const f = document.getElementById('nkf');
  if (!f) return;

  const yr = f.querySelector('.nkf__yr');
  if (yr) yr.textContent = new Date().getFullYear();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const glass = f.querySelector('.nkf__glass');
  const slides = f.querySelectorAll('.nkf__slide');
  if (!slides || slides.length === 0) return;
  const cat = f.querySelector('.nkf__cat');
  const ttl = f.querySelector('.nkf__ttl');
  const ctr = f.querySelector('.nkf__ctr');
  const af = f.querySelector('.nkf__af');
  const prog = f.querySelector('.nkf__prog');
  const ok = f.querySelector('.nkf__ok');
  const play = f.querySelector('.nkf__play');
  const info = f.querySelector('.nkf__info');

  let i = 0;
  const n = slides.length;
  const DUR = 3000;
  let t = null;
  let playing = !reduce;
  let visible = false;

  f.style.setProperty('--dur', DUR + 'ms');

  function pad(k) { return ('0' + k).slice(-2); }

  function show(k) {
    slides[i].classList.remove('is-on');
    i = (k + n) % n;
    const s = slides[i];
    s.classList.add('is-on');
    if (cat) cat.textContent = s.dataset.cat;
    if (ttl) ttl.textContent = s.dataset.t;
    if (ctr) ctr.textContent = pad(i + 1) + '/' + pad(n);
    if (af) {
      af.classList.remove('lock');
      void af.offsetWidth;
      setTimeout(() => af.classList.add('lock'), 380);
    }
    restart();
  }

  function restart() {
    clearTimeout(t);
    if (n <= 1) return;
    if (prog) {
      prog.classList.remove('run');
      void prog.offsetWidth;
      if (playing && visible && !document.hidden) {
        prog.classList.add('run');
        t = setTimeout(() => show(i + 1), DUR);
      }
    }
  }

  function setPlay(p) {
    playing = p;
    f.classList.toggle('is-paused', !p);
    const lbl = p ? 'Pause slideshow' : 'Play slideshow';
    ok?.setAttribute('aria-label', lbl);
    play?.setAttribute('aria-label', lbl);
    if (play) {
      play.querySelector('.i-pause').style.display = p ? '' : 'none';
      play.querySelector('.i-play').style.display = p ? 'none' : '';
    }
    restart();
  }

  function press(b) {
    b?.classList.add('pressed');
    setTimeout(() => b?.classList.remove('pressed'), 140);
  }

  f.querySelectorAll('.nkf__arr--l, .nkf__arr--u').forEach(b => {
    b.addEventListener('click', () => { press(b); show(i - 1); });
  });
  f.querySelectorAll('.nkf__arr--r, .nkf__arr--d').forEach(b => {
    b.addEventListener('click', () => { press(b); show(i + 1); });
  });

  ok?.addEventListener('click', () => { press(ok); setPlay(!playing); });
  play?.addEventListener('click', () => { press(play); setPlay(!playing); });

  info?.addEventListener('click', () => {
    press(info);
    const off = glass?.classList.toggle('hud-off');
    info.setAttribute('aria-pressed', off ? 'false' : 'true');
  });

  const scr = f.querySelector('.nkf__screen');
  scr?.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault(); show(i + 1); press(f.querySelector('.nkf__arr--r'));
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault(); show(i - 1); press(f.querySelector('.nkf__arr--l'));
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault(); setPlay(!playing); press(ok);
    }
  });

  if ('IntersectionObserver' in window && glass) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      restart();
    }, { threshold: 0.2 }).observe(glass);
  } else {
    visible = true;
  }

  document.addEventListener('visibilitychange', restart);
  if (reduce) f.classList.add('is-paused');
  show(0);
}

/* ============================================================
   7. THEME TOGGLE (WHITE / BLACK DUAL MODE)
   ============================================================ */
function initThemeToggle() {
  const toggleBtnDesktop = document.getElementById('themeToggleBtn');
  const toggleBtnMobile = document.getElementById('themeToggleBtnMobile');

  // Check persisted theme or default to crisp white light mode
  const savedTheme = localStorage.getItem('ws_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('theme-dark');
  } else {
    document.body.classList.remove('theme-dark');
  }

  function handleToggle() {
    const isDark = document.body.classList.toggle('theme-dark');
    localStorage.setItem('ws_theme', isDark ? 'dark' : 'light');
  }

  toggleBtnDesktop?.addEventListener('click', handleToggle);
  toggleBtnMobile?.addEventListener('click', handleToggle);
}

/* ============================================================
   8. CINEMA FILMS AUTO-SLIDER & FILTERS (#films)
   ============================================================ */
function initFilmsSlider() {
  const slider = document.getElementById('filmsSlider');
  const track = document.getElementById('filmsSliderTrack');
  if (!slider || !track) return;

  const slides = Array.from(track.querySelectorAll('.film-slide'));
  const currentEl = document.getElementById('filmsCurrent');
  const totalEl = document.getElementById('filmsTotal');
  const progressFill = document.getElementById('filmsProgressFill');
  const prevBtn = document.getElementById('filmsPrevBtn');
  const nextBtn = document.getElementById('filmsNextBtn');
  const playPauseBtn = document.getElementById('filmsPlayPauseBtn');
  const filterBtns = Array.from(document.querySelectorAll('.films-filter-btn'));

  let activeSlides = slides.slice();
  let currentIndex = 0;
  let isPlaying = true;
  let timer = null;
  const INTERVAL = 4500; // 4.5 seconds per slide

  function updateHUD() {
    if (activeSlides.length === 0) return;
    const pad = n => String(n).padStart(2, '0');
    if (currentEl) currentEl.textContent = pad(currentIndex + 1);
    if (totalEl) totalEl.textContent = pad(activeSlides.length);
    if (progressFill) {
      const pct = ((currentIndex + 1) / activeSlides.length) * 100;
      progressFill.style.width = pct + '%';
    }
  }

  function scrollToSlide(index) {
    if (index < 0) index = activeSlides.length - 1;
    if (index >= activeSlides.length) index = 0;
    currentIndex = index;

    const target = activeSlides[currentIndex];
    if (target) {
      const targetLeft = target.offsetLeft - track.offsetLeft;
      track.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
    updateHUD();
    resetTimer();
  }

  function nextSlide() {
    scrollToSlide(currentIndex + 1);
  }

  function prevSlide() {
    scrollToSlide(currentIndex - 1);
  }

  function tick() {
    if (!isPlaying) return;
    nextSlide();
  }

  function resetTimer() {
    if (timer) clearInterval(timer);
    if (isPlaying) {
      timer = setInterval(tick, INTERVAL);
    }
  }

  function setPlaying(state) {
    isPlaying = state;
    if (playPauseBtn) {
      const pauseIcon = playPauseBtn.querySelector('.i-pause');
      const playIcon = playPauseBtn.querySelector('.i-play');
      if (pauseIcon && playIcon) {
        pauseIcon.style.display = isPlaying ? 'block' : 'none';
        playIcon.style.display = isPlaying ? 'none' : 'block';
      }
      playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play');
    }
    if (isPlaying) resetTimer();
    else if (timer) clearInterval(timer);
  }

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filmFilter;
      slides.forEach(slide => {
        const cat = slide.dataset.filmCat || '';
        if (filter === 'all' || cat.includes(filter)) {
          slide.classList.remove('is-filtered-out');
        } else {
          slide.classList.add('is-filtered-out');
        }
      });

      activeSlides = slides.filter(s => !s.classList.contains('is-filtered-out'));
      currentIndex = 0;
      track.scrollTo({ left: 0, behavior: 'smooth' });
      updateHUD();
      resetTimer();
    });
  });

  // Controls
  nextBtn?.addEventListener('click', nextSlide);
  prevBtn?.addEventListener('click', prevSlide);
  playPauseBtn?.addEventListener('click', () => setPlaying(!isPlaying));

  // Pause on hover
  slider.addEventListener('mouseenter', () => { if (isPlaying) clearInterval(timer); });
  slider.addEventListener('mouseleave', () => { if (isPlaying) resetTimer(); });

  // Touch / Scroll event detection
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollPos = track.scrollLeft;
      let closestIdx = 0;
      let minDiff = Infinity;
      activeSlides.forEach((slide, idx) => {
        const diff = Math.abs(slide.offsetLeft - track.offsetLeft - scrollPos);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      if (closestIdx !== currentIndex) {
        currentIndex = closestIdx;
        updateHUD();
      }
    }, 100);
  }, { passive: true });

  updateHUD();
  resetTimer();
}

/* ============================================================
   REUSABLE AUTO-SLIDER ENGINE
   ============================================================ */
function setupAutoSlider(config) {
  const slider = document.getElementById(config.sliderId);
  const track = document.getElementById(config.trackId);
  if (!slider || !track) return null;

  const slides = Array.from(track.querySelectorAll(config.slideClass));
  if (slides.length === 0) return null;

  const currentEl = document.getElementById(config.currentId);
  const totalEl = document.getElementById(config.totalId);
  const progressFill = document.getElementById(config.progressFillId);
  const prevBtn = document.getElementById(config.prevBtnId);
  const nextBtn = document.getElementById(config.nextBtnId);
  const playPauseBtn = document.getElementById(config.playPauseBtnId);

  let currentIndex = 0;
  let isPlaying = true;
  let timer = null;
  const interval = config.interval || 4500;

  function updateHUD() {
    const pad = n => String(n).padStart(2, '0');
    if (currentEl) currentEl.textContent = pad(currentIndex + 1);
    if (totalEl) totalEl.textContent = pad(slides.length);
    if (progressFill) {
      const pct = ((currentIndex + 1) / slides.length) * 100;
      progressFill.style.width = pct + '%';
    }
  }

  function scrollToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;

    const target = slides[currentIndex];
    if (target) {
      const targetLeft = target.offsetLeft - track.offsetLeft;
      track.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
    updateHUD();
    resetTimer();
  }

  function nextSlide() { scrollToSlide(currentIndex + 1); }
  function prevSlide() { scrollToSlide(currentIndex - 1); }

  function tick() {
    if (!isPlaying) return;
    nextSlide();
  }

  function resetTimer() {
    if (timer) clearInterval(timer);
    if (isPlaying) timer = setInterval(tick, interval);
  }

  function setPlaying(state) {
    isPlaying = state;
    if (playPauseBtn) {
      const pauseIcon = playPauseBtn.querySelector('.i-pause');
      const playIcon = playPauseBtn.querySelector('.i-play');
      if (pauseIcon && playIcon) {
        pauseIcon.style.display = isPlaying ? 'block' : 'none';
        playIcon.style.display = isPlaying ? 'none' : 'block';
      }
      playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play');
    }
    if (isPlaying) resetTimer();
    else if (timer) clearInterval(timer);
  }

  nextBtn?.addEventListener('click', nextSlide);
  prevBtn?.addEventListener('click', prevSlide);
  playPauseBtn?.addEventListener('click', () => setPlaying(!isPlaying));

  slider.addEventListener('mouseenter', () => { if (isPlaying) clearInterval(timer); });
  slider.addEventListener('mouseleave', () => { if (isPlaying) resetTimer(); });

  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollPos = track.scrollLeft;
      let closestIdx = 0;
      let minDiff = Infinity;
      slides.forEach((slide, idx) => {
        const diff = Math.abs(slide.offsetLeft - track.offsetLeft - scrollPos);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      if (closestIdx !== currentIndex) {
        currentIndex = closestIdx;
        updateHUD();
      }
    }, 100);
  }, { passive: true });

  updateHUD();
  resetTimer();

  return { next: nextSlide, prev: prevSlide, setPlaying };
}

function initRegionalSlider() {
  setupAutoSlider({
    sliderId: 'regionalSlider',
    trackId: 'regionalSliderTrack',
    slideClass: '.regional-slide',
    currentId: 'regionalCurrent',
    totalId: 'regionalTotal',
    progressFillId: 'regionalProgressFill',
    prevBtnId: 'regionalPrevBtn',
    nextBtnId: 'regionalNextBtn',
    playPauseBtnId: 'regionalPlayPauseBtn',
    interval: 4200
  });
}

function initServicesSlider() {
  setupAutoSlider({
    sliderId: 'servicesSlider',
    trackId: 'servicesSliderTrack',
    slideClass: '.service-card',
    currentId: 'servicesCurrent',
    totalId: 'servicesTotal',
    progressFillId: 'servicesProgressFill',
    prevBtnId: 'servicesPrevBtn',
    nextBtnId: 'servicesNextBtn',
    playPauseBtnId: 'servicesPlayPauseBtn',
    interval: 4500
  });
}

function initReviewsSlider() {
  setupAutoSlider({
    sliderId: 'reviewsSlider',
    trackId: 'reviewsSliderTrack',
    slideClass: '.nk-review-card',
    currentId: 'reviewsCurrent',
    totalId: 'reviewsTotal',
    progressFillId: 'reviewsProgressFill',
    prevBtnId: 'reviewsPrevBtn',
    nextBtnId: 'reviewsNextBtn',
    playPauseBtnId: 'reviewsPlayPauseBtn',
    interval: 4800
  });
}

/* ============================================================
   9. SCROLL TO TOP & FLOATING DOCK
   ============================================================ */
function initScrollTop() {
  const scrollBtn = document.getElementById('nkScrollTop');
  if (!scrollBtn) return;

  function checkScroll() {
    const y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (y > 350) {
      scrollBtn.classList.add('is-visible');
    } else {
      scrollBtn.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   10. LUXURY INQUIRY & BOOKING MODAL
   ============================================================ */
function initInquiryModal() {
  const modal = document.getElementById('nkInquiryModal');
  const form = document.getElementById('nkInquiryForm');
  if (!modal) return;

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('#inqName')?.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  // Open modal on click of any .js-open-inquiry button
  document.addEventListener('click', e => {
    const trigger = e.target.closest('.js-open-inquiry');
    if (trigger) {
      e.preventDefault();
      openModal();
    }
    if (e.target.closest('[data-inquiry-close]')) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (!modal.hidden && e.key === 'Escape') closeModal();
  });

  // Service Pills toggle
  modal.querySelectorAll('.nk-service-pill').forEach(pill => {
    const input = pill.querySelector('input');
    if (!input) return;
    pill.classList.toggle('is-selected', input.checked);
    input.addEventListener('change', () => {
      pill.classList.toggle('is-selected', input.checked);
    });
  });

  // Helper to get formatted inquiry details
  function getInquiryData() {
    const name = form.querySelector('#inqName')?.value.trim() || '';
    const phone = form.querySelector('#inqPhone')?.value.trim() || '';
    const date = form.querySelector('#inqDate')?.value.trim() || '';
    const city = form.querySelector('#inqCity')?.value.trim() || '';
    const notes = form.querySelector('#inqNotes')?.value.trim() || '';
    const services = Array.from(form.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value);

    return { name, phone, date, city, notes, services };
  }

  // Submit via WhatsApp
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const { name, phone, date, city, notes, services } = getInquiryData();
    if (!name || !phone || !date || !city) {
      alert('Please fill in your Name, Phone, Date, and City/Venue.');
      return;
    }

    const sList = services.length ? services.join(', ') : 'Royal Wedding Coverage';
    const text = `Hi Sonu & Wedding Shedding team! 👋\n\nI would like to check availability and get an instant quote:\n• Name: ${name}\n• Phone: ${phone}\n• Event Date: ${date}\n• City / Venue: ${city}\n• Services: ${sList}${notes ? `\n• Notes: ${notes}` : ''}\n\nLooking forward to hearing from you!`;

    const waUrl = `https://wa.me/917503550936?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    closeModal();
  });

  // Submit via Email
  const emailBtn = document.getElementById('inqSubmitMail');
  emailBtn?.addEventListener('click', () => {
    const { name, phone, date, city, notes, services } = getInquiryData();
    if (!name || !phone) {
      alert('Please enter at least your Name and Phone/WhatsApp number.');
      return;
    }

    const sList = services.length ? services.join(', ') : 'Wedding Photography';
    const subject = `Wedding Photography Inquiry - ${name} (${date || 'Upcoming'})`;
    const body = `Hi Sonu,\n\nI would like to check availability for Wedding Shedding:\n\n• Name: ${name}\n• Phone: ${phone}\n• Event Date: ${date}\n• City / Venue: ${city}\n• Services: ${sList}\n• Notes: ${notes}\n\nBest regards,\n${name}`;

    const mailUrl = `mailto:sonukumar2255@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailUrl;
    closeModal();
  });
}


