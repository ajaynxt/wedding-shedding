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
  initCustomCursor();
  initFilmModal();
  initCameraFooter();
  initThemeToggle();
});

/* ============================================================
   1. HEADER & MOBILE DRAWER
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

  // Smooth Auto-scroll for in-page anchor links
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#' || href === '#!') return;
    
    const hashIndex = href.indexOf('#');
    const path = href.slice(0, hashIndex);
    const hash = href.slice(hashIndex);
    
    const isCurrentPage = !path || path === window.location.pathname.split('/').pop() || (window.location.pathname.endsWith('/') && path === 'index.html');
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
        "assets/images/ws_photo-16.jpg?v=3",
        "assets/images/ws_photo-12.jpg?v=3",
        "assets/images/ws_photo-10.jpg?v=3"
      ]
    },
    // 6. Corporate Brand Shoot (4K Video)
    "corporate-shoot": {
      "title": "CORPORATE BRAND CINEMATOGRAPHY & EXECUTIVE MEDIA",
      "videoUrl": "https://drive.google.com/file/d/1yxzlKQ0uS81pbwml0b7CaD42nQ6mw_p_/preview",
      "videoBadge": "4K CORPORATE BRAND CINEMA &middot; LEADERSHIP FILM",
      "images": [
        "assets/images/ws_video_corporate.jpg?v=3",
        "assets/images/ws_photo-14.jpg?v=3",
        "assets/images/ws_photo-17.jpg?v=3",
        "assets/images/ws_photo-09.jpg?v=3",
        "assets/images/ws_photo-08.jpg?v=3"
      ]
    },
    // 7. Source One Corporate (4K Video)
    "source-one-corporate": {
      "title": "SOURCE ONE &bull; CORPORATE TECH & BRAND CULTURE PRODUCTION",
      "videoUrl": "https://drive.google.com/file/d/1VrN7bfzPDa7rP6Dagmwodr6ShQZrJxtf/preview",
      "videoBadge": "4K TECH ENTERPRISE FILM &middot; SOURCE ONE",
      "images": [
        "assets/images/ws_video_sourceone.jpg?v=3",
        "assets/images/ws_photo-14.jpg?v=3",
        "assets/images/ws_photo-17.jpg?v=3",
        "assets/images/ws_photo-09.jpg?v=3",
        "assets/images/ws_photo-01.jpg?v=3"
      ]
    },
    // 8. Bougie Cut 2 Fashion (4K Video)
    "bougie-cut-fashion": {
      "title": "BOUGIE CUT 2 &bull; HIGH FASHION RUNWAY & COUTURE FILM",
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
        "assets/images/ws_photo-03.jpg?v=3",
        "assets/images/ws_photo-05.jpg?v=3",
        "assets/images/ws_photo-18.jpg?v=3",
        "assets/images/ws_photo-07.jpg?v=3"
      ]
    },
    // 11. Dr. Prachi Benara Medical Success (4K Video)
    "dr-prachi-benara": {
      "title": "DR. PRACHI BENARA &bull; MEDICAL SUCCESS & PATIENT STORIES",
      "videoUrl": "https://drive.google.com/file/d/1e3eryFBIA7D1sVSg9a5pqzgTNhFc79Ay/preview",
      "videoBadge": "4K MEDICAL SUCCESS DOCUMENTARY &middot; DR. PRACHI BENARA",
      "images": [
        "assets/images/ws_video_dr_prachi.jpg?v=3",
        "assets/images/ws_photo-03.jpg?v=3",
        "assets/images/ws_photo-18.jpg?v=3",
        "assets/images/ws_photo-05.jpg?v=3",
        "assets/images/ws_photo-14.jpg?v=3"
      ]
    },
    // 12. Diablo High-Energy Brand & Nightlife (4K Video)
    "gaming-diablo": {
      "title": "DIABLO &bull; HIGH-ENERGY NIGHTLIFE & BRAND EXPERIENCE",
      "videoUrl": "https://drive.google.com/file/d/1BmaOmYdxkXps2_PhoC049HRsydYwKEpQ/preview",
      "videoBadge": "4K HIGH-OCTANE BRAND CINEMA &middot; DIABLO",
      "images": [
        "assets/images/ws_video_diablo.jpg?v=3",
        "assets/images/ws_photo-05.jpg?v=3",
        "assets/images/ws_photo-06.jpg?v=3",
        "assets/images/ws_photo-09.jpg?v=3",
        "assets/images/ws_photo-17.jpg?v=3"
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
        "assets/images/ws_photo-15.jpg?v=3",
        "assets/images/ws_photo-08.jpg?v=3",
        "assets/images/ws_photo-02.jpg?v=3",
        "assets/images/ws_photo-17.jpg?v=3"
      ]
    },
    // 15. Mega Gala Event (4K Video)
    "mega-gala-event": {
      "title": "GRAND GALA & LIVE STAGE EVENT PRODUCTION",
      "videoUrl": "https://drive.google.com/file/d/1m3YcKKb05apywT9wRV-XVEu3gyIUNcEd/preview",
      "videoBadge": "4K MULTI-CAM LIVE EVENT FILM &middot; GRAND GALA",
      "images": [
        "assets/images/ws_video_event.jpg?v=3",
        "assets/images/ws_photo-09.jpg?v=3",
        "assets/images/ws_photo-17.jpg?v=3",
        "assets/images/ws_photo-01.jpg?v=3",
        "assets/images/ws_photo-14.jpg?v=3"
      ]
    },
    // 16. Utkarsh Classes 2023 JEE Result Celebration (4K Video)
    "utkarsh-result-celebration": {
      "title": "UTKARSH CLASSES 2023 &bull; JEE RESULT CELEBRATION & ARENA CONCERT",
      "videoUrl": "https://drive.google.com/file/d/1sK66FbH_XNDO85WTE0SNf2lpMkzlUccw/preview",
      "videoBadge": "4K MEGA ARENA CELEBRATION &middot; UTKARSH 2023",
      "images": [
        "assets/images/ws_video_utkarsh.jpg?v=3",
        "assets/images/ws_photo-09.jpg?v=3",
        "assets/images/ws_photo-17.jpg?v=3",
        "assets/images/ws_photo-01.jpg?v=3",
        "assets/images/ws_photo-08.jpg?v=3"
      ]
    },
    // 17. Mic Drop Live Comedy & Show (4K Video)
    "micdrop-live-comedy": {
      "title": "MIC DROP &bull; LIVE STAND-UP COMEDY & CONCERT EXPERIENCE",
      "videoUrl": "https://drive.google.com/file/d/1s4O3Dkyw0lQer3eZW1dFUdWKaQWj8GY9/preview",
      "videoBadge": "4K LIVE STANDUP &middot; MIC DROP COMEDY & CONCERT",
      "images": [
        "assets/images/ws_video_micdrop.jpg?v=3",
        "assets/images/ws_photo-09.jpg?v=3",
        "assets/images/ws_photo-17.jpg?v=3",
        "assets/images/ws_photo-02.jpg?v=3",
        "assets/images/ws_photo-06.jpg?v=3"
      ]
    },
    // 18. School Campus & Annual Day (4K Video)
    "school-campus-film": {
      "title": "CAMPUS LIFE, ACADEMICS & SCHOOL ANNUAL DAY CINEMATOGRAPHY",
      "videoUrl": "https://drive.google.com/file/d/1m7iBCeFVwyR3FNUkZt2JnWlS_8rjiwDy/preview",
      "videoBadge": "4K SCHOOL & CAMPUS FILM &middot; ANNUAL DAY",
      "images": [
        "assets/images/ws_video_school.jpg?v=3",
        "assets/images/ws_photo-06.jpg?v=3",
        "assets/images/ws_photo-02.jpg?v=3",
        "assets/images/ws_photo-14.jpg?v=3",
        "assets/images/ws_photo-04.jpg?v=3"
      ]
    },
    // 19. JEE Advanced Toppers Felicitation (4K Video)
    "jee-advanced-triumph": {
      "title": "JEE ADVANCED &bull; MERIT FELICITATION & STUDENT TRIUMPH",
      "videoUrl": "https://drive.google.com/file/d/1NEw4aj7_enT0PET8o0rUBFKtu5X91aEK/preview",
      "videoBadge": "4K ACADEMIC SUCCESS &middot; JEE ADVANCED",
      "images": [
        "assets/images/ws_video_jee.jpg?v=3",
        "assets/images/ws_photo-14.jpg?v=3",
        "assets/images/ws_photo-09.jpg?v=3",
        "assets/images/ws_photo-05.jpg?v=3",
        "assets/images/ws_photo-17.jpg?v=3"
      ]
    },
    // 20. The Swiss Village Resort
    "swiss-village": {
      "title": "THE SWISS VILLAGE LUXURY RESORT CINEMATOGRAPHY",
      "images": [
        "assets/images/ws_photo-16.jpg?v=3",
        "assets/images/ws_photo-12.jpg?v=3",
        "assets/images/ws_photo-10.jpg?v=3",
        "assets/images/ws_photo-11.jpg?v=3",
        "assets/images/ws_hero.jpg?v=3",
        "assets/images/ws_photo-09.jpg?v=3"
      ]
    },
    // 21. NGO & Social Impact Documentaries
    "ngo-documentary": {
      "title": "NGO & SOCIAL IMPACT CSR DOCUMENTARIES",
      "images": [
        "assets/images/ws_photo-04.jpg?v=3",
        "assets/images/ws_photo-18.jpg?v=3",
        "assets/images/ws_photo-03.jpg?v=3",
        "assets/images/ws_photo-05.jpg?v=3",
        "assets/images/ws_photo-06.jpg?v=3",
        "assets/images/ws_photo-02.jpg?v=3"
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
        "assets/images/ws_photo-05.jpg?v=3",
        "assets/images/ws_photo-02.jpg?v=3",
        "assets/images/ws_photo-06.jpg?v=3",
        "assets/images/ws_photo-15.jpg?v=3",
        "assets/images/ws_photo-11.jpg?v=3",
        "assets/images/ws_photo-12.jpg?v=3"
      ]
    },
    // 24. Political Campaigns
    "political-campaigns": {
      "title": "POLITICAL & PUBLIC LEADERSHIP EVENTS",
      "images": [
        "assets/images/ws_photo-17.jpg?v=3",
        "assets/images/ws_photo-09.jpg?v=3",
        "assets/images/ws_photo-14.jpg?v=3",
        "assets/images/ws_photo-01.jpg?v=3",
        "assets/images/ws_photo-08.jpg?v=3",
        "assets/images/ws_photo-04.jpg?v=3"
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
    titleEl.textContent = proj.title;
    countEl.textContent = proj.videoUrl
      ? ('1 4K Cinema Film' + (current.length ? ' + ' + current.length + ' High-Res Photos' : ''))
      : (current.length + ' High-Res Photographs');
    grid.innerHTML = '';

    // If project has an embedded video player
    if (proj.videoUrl) {
      const vidWrap = document.createElement('div');
      vidWrap.className = 'nk-proj-video-embed';
      vidWrap.style.cssText = 'grid-column: 1 / -1; margin-bottom: 24px; border-radius: 10px; overflow: hidden; border: 1px solid rgba(212,175,55,0.45); background: #000; box-shadow: 0 10px 35px rgba(0,0,0,0.35);';
      vidWrap.innerHTML = `
        <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;background:#000;">
          <iframe src="${proj.videoUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="autoplay; fullscreen" allowfullscreen></iframe>
        </div>
        <div style="padding:14px 18px;display:flex;align-items:center;justify-content:space-between;background:var(--bg-alt);flex-wrap:wrap;gap:10px;border-top:1px solid var(--ln);">
          <span style="font-family:var(--font-display);font-size:12px;font-weight:700;color:var(--g);letter-spacing:1px;display:inline-flex;align-items:center;gap:6px;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            ${proj.videoBadge || '4K CINEMA PRODUCTION'}
          </span>
          <a href="https://wa.me/917503550936?text=Hi%20Wedding%20Shedding,%20I%20am%20inquiring%20about%20${encodeURIComponent(proj.title)}." target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--g);font-weight:700;text-decoration:none;">
            Book Similar Video on WhatsApp &rarr;
          </a>
        </div>
      `;
      grid.appendChild(vidWrap);
    }

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

    lastFocus = document.activeElement;
    modal.hidden = false;
    lock(true);
    grid.scrollTop = 0;
    modal.querySelector('.nk-proj-modal__close')?.focus();
  };

  function closeModal() {
    modal.hidden = true;
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
  const dot = document.getElementById('nkCursorDot');
  const ring = document.getElementById('nkCursorRing');
  if (!dot || !ring) return;

  // Touch device check
  if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isMoving = false;

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

