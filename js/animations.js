/* ═══════════════════════════════════════════════
   SIMJ IA GUIDE — Animations
   animations.js · Anime.js v4.3.6 API correcta · 2026

   API v4 changes vs v3:
   - anime({targets,...})  →  anime.animate(targets, props)
   - anime.timeline()      →  anime.createTimeline(defaults)
   - tl.add({targets,...}) →  tl.add(targets, props, offset)
   - anime.stagger()       →  anime.stagger()  (igual)
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  if (typeof anime === 'undefined') {
    console.warn('[SiMJ] Anime.js no cargado.');
    return;
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* v4 helpers */
  const anim    = (targets, props) => anime.animate(targets, props);
  const stagger = (val, opts)      => anime.stagger(val, opts);

  /* ══════ 1. PARTICLES ══════ */
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COLORS = ['rgba(168,204,26,','rgba(46,95,232,','rgba(217,119,66,','rgba(16,185,129,','rgba(255,255,255,'];

    class Particle {
      constructor() { this.reset(true); }
      reset(init) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : H + 10;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(Math.random() * 0.4 + 0.1);
        this.r  = Math.random() * 1.4 + 0.4;
        this.alpha = Math.random() * 0.4 + 0.08;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.life = 0;
        this.maxLife = Math.random() * 400 + 200;
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.life++;
        const p = this.life / this.maxLife;
        this.ca = this.alpha * Math.sin(p * Math.PI);
        if (this.life >= this.maxLife || this.y < -10) this.reset(false);
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.ca + ')';
        ctx.fill();
      }
    }

    const COUNT = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 14000));
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(168,204,26,${(1-d/100)*0.055})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    let raf;
    function loop() {
      ctx.clearRect(0, 0, W, H);
      if (!reduced) drawLines();
      particles.forEach(p => { p.update(); p.draw(); });
      raf = requestAnimationFrame(loop);
    }
    loop();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf); else loop();
    });
  }

  /* ══════ 2. ORB FLOAT ══════ */
  function initOrbs() {
    if (reduced) return;
    [
      { id: 'orb1', tx: 30,  ty: 20,  dur: 12000 },
      { id: 'orb2', tx: -20, ty: 30,  dur: 16000 },
      { id: 'orb3', tx: 15,  ty: -25, dur: 10000 },
    ].forEach(({ id, tx, ty, dur }) => {
      const el = document.getElementById(id);
      if (!el) return;
      anim(el, {
        translateX: [{ to: tx }, { to: 0 }, { to: -tx * 0.5 }, { to: 0 }],
        translateY: [{ to: ty * 0.5 }, { to: ty }, { to: 0 }, { to: 0 }],
        scale:      [{ to: 1.08 }, { to: 0.96 }, { to: 1 }, { to: 1 }],
        duration:   dur,
        easing:     'easeInOutSine',
        loop:       true,
      });
    });
  }

  /* ══════ 3. HERO ENTRANCE ══════ */
  function initHeroEntrance() {
    const brand  = document.getElementById('hero-brand');
    const kicker = document.getElementById('hero-kicker');
    const words  = document.querySelectorAll('.hero__word');
    const right  = document.getElementById('hero-right');
    const scroll = document.getElementById('hero-scroll');

    if (!brand) return;

    if (reduced) {
      [brand, kicker, right, scroll].forEach(el => {
        if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
      });
      words.forEach(w => { w.style.opacity = '1'; w.style.transform = 'none'; });
      return;
    }

    /* v4: createTimeline */
    const timeline = anime.createTimeline({ defaults: { easing: 'easeOutExpo' } });

    timeline
      .add(brand,  { opacity: [0, 1], translateY: [-16, 0], duration: 700 })
      .add(kicker, { opacity: [0, 1], translateX: [-24, 0], duration: 500 }, '-=300');

    words.forEach((word, i) => {
      timeline.add(word, {
        opacity:    [0, 1],
        translateY: ['100%', '0%'],
        duration:   600,
        easing:     'spring(1, 80, 12, 0)',
      }, i === 0 ? '-=200' : '-=450');
    });

    timeline
      .add(right,  { opacity: [0, 1], translateX: [28, 0],  duration: 600, easing: 'easeOutCubic' }, '-=900')
      .add(scroll, { opacity: [0, 1], translateY: [12, 0],  duration: 500 }, '-=100')
      .add('.hero__pills .pill', {
        opacity: [0, 1], translateY: [10, 0],
        delay: stagger(60), duration: 400,
      }, '-=500');
  }

  /* ══════ 4. COUNTERS ══════ */
  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';

        if (reduced) { el.textContent = target + suffix; io.unobserve(el); return; }

        const proxy = { val: 0 };
        anim(proxy, {
          val: target, round: 1, duration: 1800, easing: 'easeOutExpo',
          onUpdate()   { el.textContent = Math.floor(proxy.val) + suffix; },
          onComplete() { el.textContent = target + suffix; },
        });
        io.unobserve(el);
      });
    }, { threshold: 0.6 });

    counters.forEach(c => io.observe(c));
  }

  /* ══════ 5. SCROLL REVEAL ══════ */
  function initScrollReveal() {
    const items = document.querySelectorAll('.reveal-item');
    if (!items.length) return;
    if (reduced) { items.forEach(el => el.classList.add('is-visible')); return; }

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        anim(el, {
          opacity: [0, 1], translateY: [28, 0],
          duration: 600, delay, easing: 'easeOutCubic',
          onComplete() { el.classList.add('is-visible'); },
        });
        io.unobserve(el);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -25px 0px' });

    items.forEach(el => io.observe(el));
  }

  /* ══════ 6. GRID REVEAL ══════ */
  function initGridReveal() {
    if (reduced) return;

    const errSec = document.getElementById('errores');
    if (errSec) {
      const io = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        anim('#errores .error-card', { opacity:[0,1], translateY:[24,0], delay:stagger(60), duration:550, easing:'easeOutCubic' });
        io.disconnect();
      }, { threshold: 0.1 });
      io.observe(errSec);
    }

    const resSec = document.getElementById('recursos');
    if (resSec) {
      const io2 = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        anim('#recursos .res-card', { opacity:[0,1], translateY:[20,0], delay:stagger(50), duration:500, easing:'easeOutCubic' });
        io2.disconnect();
      }, { threshold: 0.05 });
      io2.observe(resSec);
    }
  }

  /* ══════ 7. PROGRESS BAR ══════ */
  function initProgressBar() {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      bar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  }

  /* ══════ 8. CARD SHIMMER ══════ */
  function initCardShimmer() {
    if (reduced) return;
    document.querySelectorAll('.card, .res-card, .icard, .gloss-card').forEach(card => {
      card.addEventListener('mouseenter', () =>
        anim(card, { boxShadow: '0 4px 24px rgba(168,204,26,0.08)', duration: 300, easing: 'easeOutCubic' })
      );
      card.addEventListener('mouseleave', () =>
        anim(card, { boxShadow: '0 0 0px rgba(168,204,26,0)', duration: 400, easing: 'easeOutCubic' })
      );
    });
  }

  /* ══════ 9. TIER REVEAL ══════ */
  function initTierReveal() {
    if (reduced) return;
    const tiers = document.querySelectorAll('.tier-block');
    const io = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        anim(entry.target, { opacity:[0,1], scale:[0.98,1], translateY:[18,0], duration:600, delay:i*80, easing:'easeOutCubic' });
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    tiers.forEach(t => { t.style.opacity = '0'; io.observe(t); });
  }

  /* ══════ 10. PHASE REVEAL ══════ */
  function initPhaseReveal() {
    if (reduced) return;
    const sec = document.getElementById('testing');
    if (!sec) return;
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      anim('#testing .phase', { opacity:[0,1], translateX:[-20,0], delay:stagger(100), duration:550, easing:'easeOutCubic' });
      io.disconnect();
    }, { threshold: 0.1 });
    document.querySelectorAll('#testing .phase').forEach(p => { p.style.opacity = '0'; });
    io.observe(sec);
  }

  /* ══════ 11. BRAND COLS REVEAL ══════ */
  function initBrandColsReveal() {
    if (reduced) return;
    const intro = document.getElementById('intro');
    if (!intro) return;
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      anim('#intro .brand-col', { opacity:[0,1], translateY:[20,0], delay:stagger(120), duration:600, easing:'easeOutCubic' });
      io.disconnect();
    }, { threshold: 0.1 });
    document.querySelectorAll('#intro .brand-col').forEach(c => { c.style.opacity = '0'; });
    io.observe(intro);
  }

  /* ══════ 12. BADGE GLOW ══════ */
  function initBadgeGlow() {
    if (reduced) return;
    const badge = document.querySelector('.hero__badge');
    if (!badge) return;
    anim(badge, {
      boxShadow: [
        { to: '0 0 0px rgba(168,204,26,0)',     duration: 1500 },
        { to: '0 0 18px rgba(168,204,26,0.35)', duration: 1500 },
      ],
      loop: true, easing: 'easeInOutSine',
    });
  }

  /* ══════ EXPORTED — called from app.js ══════ */

  window.animateDebuggerResults = function (scoreEl) {
    if (reduced) return;

    anim('.debugger__score-box', { opacity:[0,1], translateY:[12,0], delay:stagger(80), duration:400, easing:'easeOutCubic' });
    anim('.issue-item',          { opacity:[0,1], translateX:[-12,0], delay:stagger(60), duration:350, easing:'easeOutCubic' });
    anim('.sug-item',            { opacity:[0,1], translateY:[8,0],  delay:stagger(50), duration:300, easing:'easeOutCubic' });

    if (scoreEl) {
      const final = scoreEl.textContent;
      const num   = parseInt(final, 10) || 0;
      const proxy = { v: 0 };
      anim(proxy, {
        v: num, round: 1, duration: 900, easing: 'easeOutExpo',
        onUpdate()   { scoreEl.textContent = Math.floor(proxy.v) + '/10'; },
        onComplete() { scoreEl.textContent = final; },
      });
    }
  };

  window.animateCheckTick = function (box, isChecked) {
    if (reduced) return;
    anim(box, {
      scale:    isChecked ? [1, 1.3, 1] : [1, 0.85, 1],
      duration: isChecked ? 400 : 300,
      easing:   isChecked ? 'spring(1, 80, 14, 0)' : 'easeOutCubic',
    });
  };

  window.animateTabSwitch = function (panelEl) {
    if (!panelEl || reduced) return;
    anim(panelEl, { opacity:[0,1], translateY:[12,0], duration:350, easing:'easeOutCubic' });
    const cards = panelEl.querySelectorAll('.icard');
    if (cards.length) {
      anim(cards, { opacity:[0,1], translateY:[16,0], delay:stagger(70), duration:400, easing:'easeOutCubic' });
    }
  };

  window.animateErrorFix = function (fixEl, isOpening) {
    if (reduced) return;
    if (isOpening) {
      const h = fixEl.scrollHeight;
      fixEl.style.overflow = 'hidden';
      anim(fixEl, {
        height: [0, h], opacity: [0, 1], duration: 350, easing: 'easeOutCubic',
        onComplete() { fixEl.style.height = ''; fixEl.style.overflow = ''; },
      });
    } else {
      const h = fixEl.scrollHeight;
      fixEl.style.overflow = 'hidden';
      fixEl.style.height   = h + 'px';
      anim(fixEl, {
        height: [h, 0], opacity: [1, 0], duration: 280, easing: 'easeInCubic',
        onComplete() { fixEl.hidden = true; fixEl.style.height = ''; fixEl.style.overflow = ''; },
      });
    }
  };

  window.animateGlossaryCards = function () {
    if (reduced) return;
    anim('#gloss-grid .gloss-card', { opacity:[0,1], scale:[0.96,1], translateY:[10,0], delay:stagger(30), duration:350, easing:'easeOutCubic' });
  };

  window.animateCopyFlash = function (btnEl) {
    if (reduced) return;
    anim(btnEl, { scale:[1,1.1,1], duration:350, easing:'spring(1, 80, 14, 0)' });
  };

  /* ══════ INIT ══════ */
  function init() {
    initParticles();
    initOrbs();
    initProgressBar();
    initHeroEntrance();
    initCounters();
    initScrollReveal();
    initGridReveal();
    initTierReveal();
    initPhaseReveal();
    initBrandColsReveal();
    initBadgeGlow();
    initCardShimmer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
