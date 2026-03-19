/* ═══════════════════════════════════════════════
   SIMJ IA GUIDE — Animations
   animations.js · Anime.js v4.3.6 · 2026
   ═══════════════════════════════════════════════

   Techniques used:
   - anime.timeline()        → sequenced hero entrance
   - anime.stagger()         → cascading reveals
   - anime.spring()          → word-by-word title
   - anime.onScroll()        → scroll-triggered reveals
   - canvas + anime          → particle field
   - anime.utils.$()         → DOM selection
   - requestAnimationFrame   → orb float loop
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Guard: wait for anime.js ── */
  if (typeof anime === 'undefined') {
    console.warn('[SiMJ Animations] Anime.js not loaded.');
    return;
  }

  /* ── Reduced Motion ── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════════════════════════════════════
     1. PARTICLE CANVAS
  ══════════════════════════════════════════ */
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* Navy / lime palette matching brand */
    const COLORS = [
      'rgba(168,204,26,',   /* lime */
      'rgba(46,95,232,',    /* blue */
      'rgba(217,119,66,',   /* claude */
      'rgba(16,185,129,',   /* openai */
      'rgba(255,255,255,',  /* white */
    ];

    class Particle {
      constructor() { this.reset(true); }

      reset(init) {
        this.x  = Math.random() * W;
        this.y  = init ? Math.random() * H : H + 10;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(Math.random() * 0.4 + 0.1);
        this.r  = Math.random() * 1.4 + 0.4;
        this.alpha = Math.random() * 0.4 + 0.08;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.life  = 0;
        this.maxLife = Math.random() * 400 + 200;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        /* Fade in / out */
        const p = this.life / this.maxLife;
        this.currentAlpha = this.alpha * Math.sin(p * Math.PI);
        if (this.life >= this.maxLife || this.y < -10) this.reset(false);
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.currentAlpha + ')';
        ctx.fill();
      }
    }

    /* Create particles */
    const COUNT = Math.min(120, Math.floor((W * H) / 12000));
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());

    /* Draw connecting lines between nearby particles */
    function drawLines() {
      const MAX_DIST = 100;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const a = (1 - dist / MAX_DIST) * 0.06;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(168,204,26,${a})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    let animId;
    function loop() {
      ctx.clearRect(0, 0, W, H);
      if (!prefersReduced) drawLines();
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(loop);
    }
    loop();

    /* Pause when tab is hidden */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(animId);
      else loop();
    });
  }

  /* ══════════════════════════════════════════
     2. ORB FLOAT (CSS fallback + Anime.js)
  ══════════════════════════════════════════ */
  function initOrbs() {
    if (prefersReduced) return;

    const orbs = [
      { id: 'orb1', x: 30, y: 20, dur: 12000 },
      { id: 'orb2', x: -20, y: 30, dur: 16000 },
      { id: 'orb3', x: 15, y: -25, dur: 10000 },
    ];

    orbs.forEach(({ id, x, y, dur }) => {
      const el = document.getElementById(id);
      if (!el) return;

      anime({
        targets: el,
        translateX: [0, x, 0, -x * 0.5, 0],
        translateY: [0, y * 0.5, y, 0, 0],
        scale: [1, 1.08, 1, 0.96, 1],
        duration: dur,
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate',
      });
    });
  }

  /* ══════════════════════════════════════════
     3. HERO ENTRANCE (timeline + spring)
  ══════════════════════════════════════════ */
  function initHeroEntrance() {
    const brand    = document.getElementById('hero-brand');
    const kicker   = document.getElementById('hero-kicker');
    const words    = document.querySelectorAll('.hero__word');
    const right    = document.getElementById('hero-right');
    const scroll   = document.getElementById('hero-scroll');

    if (!brand) return;

    if (prefersReduced) {
      /* Skip animation, just show everything */
      [brand, kicker, right, scroll].forEach(el => {
        if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
      });
      words.forEach(w => { w.style.opacity = '1'; w.style.transform = 'none'; });
      return;
    }

    const tl = anime.timeline({ easing: 'easeOutExpo' });

    /* Brand row fades in */
    tl.add({
      targets: brand,
      opacity: [0, 1],
      translateY: [-16, 0],
      duration: 700,
    });

    /* Kicker slides in */
    tl.add({
      targets: kicker,
      opacity: [0, 1],
      translateX: [-24, 0],
      duration: 500,
    }, '-=300');

    /* Words bounce up one by one using spring */
    words.forEach((word, i) => {
      tl.add({
        targets: word,
        opacity: [0, 1],
        translateY: ['100%', '0%'],
        duration: 600,
        easing: 'spring(1, 80, 12, 0)',
      }, `-=${i === 0 ? 200 : 450}`);
    });

    /* Right col fades in */
    tl.add({
      targets: right,
      opacity: [0, 1],
      translateX: [28, 0],
      duration: 600,
      easing: 'easeOutCubic',
    }, '-=900');

    /* Scroll hint appears last */
    tl.add({
      targets: scroll,
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 500,
    }, '-=100');

    /* Stagger pills after right col is visible */
    tl.add({
      targets: '.hero__pills .pill',
      opacity: [0, 1],
      translateY: [10, 0],
      delay: anime.stagger(60),
      duration: 400,
    }, '-=500');
  }

  /* ══════════════════════════════════════════
     4. COUNTER ANIMATION
  ══════════════════════════════════════════ */
  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';

        if (prefersReduced) {
          el.textContent = target + suffix;
          io.unobserve(el);
          return;
        }

        anime({
          targets: { val: 0 },
          val: target,
          round: 1,
          duration: 1800,
          easing: 'easeOutExpo',
          update(anim) {
            el.textContent = Math.floor(anim.animations[0].currentValue) + suffix;
          },
          complete() {
            el.textContent = target + suffix;
          },
        });

        io.unobserve(el);
      });
    }, { threshold: 0.6 });

    counters.forEach(c => io.observe(c));
  }

  /* ══════════════════════════════════════════
     5. SCROLL REVEAL
  ══════════════════════════════════════════ */
  function initScrollReveal() {
    const items = document.querySelectorAll('.reveal-item');
    if (!items.length) return;

    if (prefersReduced) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);

        anime({
          targets: el,
          opacity: [0, 1],
          translateY: [28, 0],
          duration: 600,
          delay,
          easing: 'easeOutCubic',
          begin() { el.style.willChange = 'opacity, transform'; },
          complete() { el.style.willChange = ''; el.classList.add('is-visible'); },
        });

        io.unobserve(el);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -25px 0px' });

    items.forEach(el => io.observe(el));
  }

  /* ══════════════════════════════════════════
     6. STAGGER GRID REVEALS
  ══════════════════════════════════════════ */
  function initGridReveal() {
    if (prefersReduced) return;

    /* Error cards - stagger on first view */
    const errorSection = document.getElementById('errores');
    if (errorSection) {
      const io = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        anime({
          targets: '#errores .error-card',
          opacity: [0, 1],
          translateY: [24, 0],
          delay: anime.stagger(60, { grid: [3, 4], from: 'first' }),
          duration: 550,
          easing: 'easeOutCubic',
        });
        io.disconnect();
      }, { threshold: 0.1 });
      io.observe(errorSection);
    }

    /* Resource cards */
    const resSection = document.getElementById('recursos');
    if (resSection) {
      const io2 = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        anime({
          targets: '#recursos .res-card',
          opacity: [0, 1],
          translateY: [20, 0],
          delay: anime.stagger(50),
          duration: 500,
          easing: 'easeOutCubic',
        });
        io2.disconnect();
      }, { threshold: 0.05 });
      io2.observe(resSection);
    }
  }

  /* ══════════════════════════════════════════
     7. SECTION LABEL DRAW
  ══════════════════════════════════════════ */
  function initLabelReveal() {
    if (prefersReduced) return;

    const labels = document.querySelectorAll('.section-label');

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        anime({
          targets: el,
          opacity: [0, 1],
          translateX: [-16, 0],
          duration: 500,
          easing: 'easeOutCubic',
        });

        /* Animate the ::before line width */
        el.style.setProperty('--line-w', '0px');
        anime({
          targets: { w: 0 },
          w: 24,
          duration: 600,
          easing: 'easeOutExpo',
          update(anim) {
            el.style.setProperty('--line-w', anim.animations[0].currentValue + 'px');
          },
        });

        io.unobserve(el);
      });
    }, { threshold: 0.5 });

    labels.forEach(l => io.observe(l));
  }

  /* ══════════════════════════════════════════
     8. PROGRESS BAR
  ══════════════════════════════════════════ */
  function initProgressBar() {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ══════════════════════════════════════════
     9. CARD HOVER SHIMMER
  ══════════════════════════════════════════ */
  function initCardShimmer() {
    if (prefersReduced) return;

    document.querySelectorAll('.card, .res-card, .icard, .gloss-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        anime({
          targets: card,
          boxShadow: ['0 0 0 0 rgba(168,204,26,0)', '0 4px 24px rgba(168,204,26,0.08)'],
          duration: 300,
          easing: 'easeOutCubic',
        });
      });

      card.addEventListener('mouseleave', () => {
        anime({
          targets: card,
          boxShadow: '0 0 0 0 rgba(168,204,26,0)',
          duration: 400,
          easing: 'easeOutCubic',
        });
      });
    });
  }

  /* ══════════════════════════════════════════
     10. DUAL HEAD UNDERLINE DRAW
  ══════════════════════════════════════════ */
  function initDualHeadReveal() {
    if (prefersReduced) return;

    const heads = document.querySelectorAll('.dual__head');

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        anime({
          targets: entry.target,
          opacity: [0, 1],
          translateY: [-8, 0],
          duration: 400,
          easing: 'easeOutCubic',
        });
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    heads.forEach(h => {
      h.style.opacity = '0';
      io.observe(h);
    });
  }

  /* ══════════════════════════════════════════
     11. TIER BLOCK ENTRANCE
  ══════════════════════════════════════════ */
  function initTierReveal() {
    if (prefersReduced) return;

    const tiers = document.querySelectorAll('.tier-block');

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        anime({
          targets: entry.target,
          opacity: [0, 1],
          scale: [0.98, 1],
          translateY: [18, 0],
          duration: 600,
          delay: i * 80,
          easing: 'easeOutCubic',
        });
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08 });

    tiers.forEach(t => {
      t.style.opacity = '0';
      io.observe(t);
    });
  }

  /* ══════════════════════════════════════════
     12. DEBUGGER RESULT ENTRANCE
        Called externally from app.js
  ══════════════════════════════════════════ */
  window.animateDebuggerResults = function (scoreEl, modelEl, riskEl) {
    if (prefersReduced) return;

    /* Score counter */
    if (scoreEl) {
      const finalText = scoreEl.textContent;
      const num = parseFloat(finalText);
      scoreEl.textContent = '0';
      anime({
        targets: { v: 0 },
        v: num,
        round: 10,
        duration: 900,
        easing: 'easeOutExpo',
        update(a) {
          scoreEl.textContent = (a.animations[0].currentValue / 10).toFixed(0) + '/10';
        },
        complete() { scoreEl.textContent = finalText; },
      });
    }

    /* Score box pulse */
    anime({
      targets: '.debugger__score-box',
      opacity: [0, 1],
      translateY: [12, 0],
      delay: anime.stagger(80),
      duration: 400,
      easing: 'easeOutCubic',
    });

    /* Issue items slide in */
    anime({
      targets: '.issue-item',
      opacity: [0, 1],
      translateX: [-12, 0],
      delay: anime.stagger(60),
      duration: 350,
      easing: 'easeOutCubic',
    });

    /* Suggestions */
    anime({
      targets: '.sug-item',
      opacity: [0, 1],
      translateY: [8, 0],
      delay: anime.stagger(50),
      duration: 300,
      easing: 'easeOutCubic',
    });
  };

  /* ══════════════════════════════════════════
     13. CHECKLIST TICK ANIMATION
        Called externally from app.js
  ══════════════════════════════════════════ */
  window.animateCheckTick = function (box, isChecked) {
    if (prefersReduced) return;

    if (isChecked) {
      anime({
        targets: box,
        scale: [1, 1.3, 1],
        duration: 400,
        easing: 'spring(1, 80, 14, 0)',
      });
    } else {
      anime({
        targets: box,
        scale: [1, 0.85, 1],
        duration: 300,
        easing: 'easeOutCubic',
      });
    }
  };

  /* ══════════════════════════════════════════
     14. TAB SWITCH ANIMATION
        Called externally from app.js
  ══════════════════════════════════════════ */
  window.animateTabSwitch = function (panelEl) {
    if (!panelEl || prefersReduced) return;

    anime({
      targets: panelEl,
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 350,
      easing: 'easeOutCubic',
    });

    /* Stagger cards inside the panel */
    anime({
      targets: panelEl.querySelectorAll('.icard'),
      opacity: [0, 1],
      translateY: [16, 0],
      delay: anime.stagger(70),
      duration: 400,
      easing: 'easeOutCubic',
    });
  };

  /* ══════════════════════════════════════════
     15. ERROR FIX EXPAND
        Called externally from app.js
  ══════════════════════════════════════════ */
  window.animateErrorFix = function (fixEl, isOpening) {
    if (prefersReduced) return;

    if (isOpening) {
      const height = fixEl.scrollHeight;
      anime({
        targets: fixEl,
        height: [0, height],
        opacity: [0, 1],
        duration: 350,
        easing: 'easeOutCubic',
        begin() { fixEl.style.overflow = 'hidden'; },
        complete() { fixEl.style.height = ''; fixEl.style.overflow = ''; },
      });
    } else {
      const height = fixEl.scrollHeight;
      anime({
        targets: fixEl,
        height: [height, 0],
        opacity: [1, 0],
        duration: 280,
        easing: 'easeInCubic',
        begin() { fixEl.style.overflow = 'hidden'; fixEl.style.height = height + 'px'; },
        complete() { fixEl.hidden = true; fixEl.style.height = ''; fixEl.style.overflow = ''; },
      });
    }
  };

  /* ══════════════════════════════════════════
     16. GLOSSARY CARD STAGGER
        Called externally from app.js
  ══════════════════════════════════════════ */
  window.animateGlossaryCards = function () {
    if (prefersReduced) return;

    anime({
      targets: '#gloss-grid .gloss-card',
      opacity: [0, 1],
      scale: [0.96, 1],
      translateY: [10, 0],
      delay: anime.stagger(30, { from: 'first' }),
      duration: 350,
      easing: 'easeOutCubic',
    });
  };

  /* ══════════════════════════════════════════
     17. MEGA BLOCK COPY FLASH
        Called externally from app.js
  ══════════════════════════════════════════ */
  window.animateCopyFlash = function (btnEl) {
    if (prefersReduced) return;

    anime({
      targets: btnEl,
      scale: [1, 1.1, 1],
      duration: 350,
      easing: 'spring(1, 80, 14, 0)',
    });
  };

  /* ══════════════════════════════════════════
     18. PHASE CARDS STAGGER
  ══════════════════════════════════════════ */
  function initPhaseReveal() {
    if (prefersReduced) return;

    const testingSection = document.getElementById('testing');
    if (!testingSection) return;

    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;

      anime({
        targets: '#testing .phase',
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: anime.stagger(100),
        duration: 550,
        easing: 'easeOutCubic',
      });

      io.disconnect();
    }, { threshold: 0.1 });

    io.observe(testingSection);

    /* Pre-hide */
    document.querySelectorAll('#testing .phase').forEach(p => {
      p.style.opacity = '0';
    });
  }

  /* ══════════════════════════════════════════
     19. INTRO SECTION BRAND COLS
  ══════════════════════════════════════════ */
  function initBrandColsReveal() {
    if (prefersReduced) return;

    const intro = document.getElementById('intro');
    if (!intro) return;

    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;

      anime({
        targets: '#intro .brand-col',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(120),
        duration: 600,
        easing: 'easeOutCubic',
      });

      io.disconnect();
    }, { threshold: 0.1 });

    io.observe(intro);

    document.querySelectorAll('#intro .brand-col').forEach(c => {
      c.style.opacity = '0';
    });
  }

  /* ══════════════════════════════════════════
     20. HERO BADGE GLOW PULSE
  ══════════════════════════════════════════ */
  function initBadgeGlow() {
    if (prefersReduced) return;

    const badge = document.querySelector('.hero__badge');
    if (!badge) return;

    anime({
      targets: badge,
      boxShadow: [
        '0 0 0px rgba(168,204,26,0)',
        '0 0 18px rgba(168,204,26,0.35)',
        '0 0 0px rgba(168,204,26,0)',
      ],
      duration: 3000,
      easing: 'easeInOutSine',
      loop: true,
      direction: 'normal',
    });
  }

  /* ══════════════════════════════════════════
     INIT
  ══════════════════════════════════════════ */
  function init() {
    initParticles();
    initOrbs();
    initProgressBar();
    initHeroEntrance();
    initCounters();
    initScrollReveal();
    initGridReveal();
    initLabelReveal();
    initDualHeadReveal();
    initTierReveal();
    initPhaseReveal();
    initBrandColsReveal();
    initBadgeGlow();
    initCardShimmer();
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
