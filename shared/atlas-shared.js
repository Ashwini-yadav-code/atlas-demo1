/* ==========================================================================
   Atlas shared interaction engine
   Generalized from atlas-portal-v2-ember.html's inline <script> so every new
   screen gets the exact same motion feel (GSAP reveal/tilt/ripple/spotlight,
   theme toggle, a11y control upgrades) without re-implementing it per page.

   Usage: include gsap + ScrollTrigger, then this file, then call
     AtlasUI.boot({ theme: true, spotlight: true })
   at the bottom of the page (or let it auto-boot on DOMContentLoaded).
   Every step feature-detects its elements — omit any of #loader,
   #themeToggle, #spotlight, .tilt, .reveal and it just no-ops.
   ========================================================================== */
(function (global) {
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skipGSAP = typeof gsap === 'undefined' || !window.gsap;
  if (!skipGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- theme (persisted across pages via localStorage) ---------- */
  function initTheme() {
    const html = document.documentElement;
    try {
      const saved = localStorage.getItem('atlas-theme');
      if (saved === 'dark' || saved === 'light') html.setAttribute('data-theme', saved);
    } catch (e) { /* storage unavailable — fall back to markup default */ }

    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    const iconSun = toggle.querySelector('.icon-sun');
    const iconMoon = toggle.querySelector('.icon-moon');
    const isDark = html.getAttribute('data-theme') === 'dark';

    if (iconSun && iconMoon) {
      if (!skipGSAP) {
        gsap.set(iconSun, { opacity: isDark ? 1 : 0, rotate: isDark ? 0 : -90 });
        gsap.set(iconMoon, { opacity: isDark ? 0 : 1, rotate: 0 });
      } else {
        iconSun.style.opacity = isDark ? '1' : '0';
        iconMoon.style.opacity = isDark ? '0' : '1';
      }
    }

    toggle.addEventListener('click', () => {
      const goingDark = html.getAttribute('data-theme') !== 'dark';
      html.classList.add('theme-anim');
      html.setAttribute('data-theme', goingDark ? 'dark' : 'light');
      try { localStorage.setItem('atlas-theme', goingDark ? 'dark' : 'light'); } catch (e) {}
      setTimeout(() => html.classList.remove('theme-anim'), 500);

      if (!iconSun || !iconMoon) return;
      if (skipGSAP || REDUCE) {
        iconSun.style.opacity = goingDark ? '1' : '0';
        iconMoon.style.opacity = goingDark ? '0' : '1';
        return;
      }
      gsap.to(goingDark ? iconMoon : iconSun, { opacity: 0, rotate: goingDark ? 90 : -90, duration: .3, ease: 'power2.in' });
      gsap.to(goingDark ? iconSun : iconMoon, { opacity: 1, rotate: 0, duration: .45, delay: .08, ease: 'back.out(2.2)' });
      gsap.fromTo(toggle, { scale: .8 }, { scale: 1, duration: .4, ease: 'back.out(3)' });
    });
  }

  /* ---------- ripple (tap affordance, kept even with hover-tilt off) ---------- */
  function spawnRipple(el) {
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.4;
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = size + 'px';
    span.style.left = (rect.width / 2 - size / 2) + 'px';
    span.style.top = (rect.height / 2 - size / 2) + 'px';
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = el.style.overflow || 'hidden';
    el.appendChild(span);
    if (skipGSAP || REDUCE) { span.remove(); return; }
    gsap.fromTo(span, { scale: 0, opacity: .55 }, { scale: 1, opacity: 0, duration: .55, ease: 'power2.out', onComplete: () => span.remove() });
  }

  function initRipples(selector) {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest(selector);
      if (!btn) return;
      if (!skipGSAP && !REDUCE) spawnRipple(btn);
    });
  }

  /* ---------- press scale (immediate, no spring — per interaction spec) ---------- */
  function initPressScale(selector) {
    if (skipGSAP || REDUCE) return;
    document.addEventListener('pointerdown', (e) => {
      const el = e.target.closest(selector);
      if (!el) return;
      gsap.to(el, { scale: .97, duration: .08, ease: 'none' });
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(evt => {
      document.addEventListener(evt, (e) => {
        const el = e.target.closest(selector);
        if (!el) return;
        gsap.to(el, { scale: 1, duration: .12, ease: 'power2.out' });
      });
    });
  }

  /* ---------- 3D tilt for .tilt cards (desktop pointer only) ---------- */
  function initTilt() {
    if (REDUCE || skipGSAP || matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('.tilt').forEach(el => {
      gsap.set(el, { transformPerspective: 700 });
      const rotX = gsap.quickTo(el, 'rotationX', { duration: .5, ease: 'power3' });
      const rotY = gsap.quickTo(el, 'rotationY', { duration: .5, ease: 'power3' });
      const liftY = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        rotY(px * 10);
        rotX(py * -10);
        liftY(-3);
      });
      el.addEventListener('mouseleave', () => { rotX(0); rotY(0); liftY(0); });
    });
  }

  /* ---------- cursor spotlight glow ---------- */
  function initSpotlight() {
    if (REDUCE || skipGSAP) return;
    const spotlight = document.getElementById('spotlight');
    const glow = document.getElementById('spotlightGlow');
    if (!spotlight || !glow) return;
    const moveX = gsap.quickTo(glow, 'x', { duration: .7, ease: 'power3' });
    const moveY = gsap.quickTo(glow, 'y', { duration: .7, ease: 'power3' });
    let primed = false;
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      if (!primed) { gsap.set(glow, { x: e.clientX, y: e.clientY }); primed = true; }
      moveX(e.clientX); moveY(e.clientY);
      spotlight.classList.add('on');
    }, { passive: true });
    document.addEventListener('pointerout', (e) => {
      if (!e.relatedTarget && !e.toElement) spotlight.classList.remove('on');
    });
    window.addEventListener('blur', () => spotlight.classList.remove('on'));
  }

  /* ---------- reveal: fade/rise-in, boot pass + scroll-triggered catch-up ---------- */
  function revealNow(items, opts) {
    opts = opts || {};
    if (!items || !items.length) return;
    if (REDUCE || skipGSAP) { items.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; }); return; }
    gsap.fromTo(items, { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: .65, ease: 'power3.out', stagger: opts.stagger ?? .07, delay: opts.delay ?? 0, overwrite: 'auto' });
  }

  /* ---------- slide-in-from-right: detail-screen takeover transition (ux spec §2) ---------- */
  function enterFromRight(el) {
    if (!el) return;
    if (REDUCE || skipGSAP) { el.style.opacity = '1'; el.style.transform = 'none'; return; }
    gsap.fromTo(el, { opacity: 0, x: 36 }, { opacity: 1, x: 0, duration: .3, ease: 'power3.out' });
  }

  let revealTriggers = [];
  function setupScrollReveals(root) {
    if (REDUCE || skipGSAP || !window.ScrollTrigger) return;
    revealTriggers.forEach(t => t.kill());
    revealTriggers = [];
    (root || document).querySelectorAll('.reveal').forEach(el => {
      revealTriggers.push(ScrollTrigger.create({
        trigger: el, start: 'top 92%',
        onEnter() { if (gsap.getProperty(el, 'opacity') < 1) gsap.to(el, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }); }
      }));
    });
  }

  /* ---------- a11y: give div-based controls real semantics ---------- */
  function upgradeControls(extraSelector) {
    const sel = '.side-btn, .icon-btn, .mini-btn, .row .plus, .row .more, .chip, .comm-view-all, .svc-link, .profile-btn' + (extraSelector ? ', ' + extraSelector : '');
    document.querySelectorAll(sel).forEach(el => {
      if (el.tagName === 'BUTTON' || el.dataset.a11y) return;
      el.dataset.a11y = '1';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      if (!el.getAttribute('aria-label')) {
        const label = el.getAttribute('title') || el.textContent.trim();
        if (label) el.setAttribute('aria-label', label);
      }
      el.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); el.click(); }
      });
    });
  }

  /* ---------- right-side drawer: lightweight/glanceable actions (ux spec §2) ---------- */
  function openDrawer(drawerEl, backdropEl) {
    if (!drawerEl) return;
    drawerEl.classList.add('on');
    if (backdropEl) backdropEl.classList.add('on');
    document.body.style.overflow = 'hidden';
    if (!skipGSAP && !REDUCE) {
      gsap.fromTo(drawerEl, { x: 40 }, { x: 0, duration: .3, ease: 'power3.out' });
    }
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer(drawerEl, backdropEl); };
    drawerEl._escHandler = onKey;
    document.addEventListener('keydown', onKey);
  }
  function closeDrawer(drawerEl, backdropEl) {
    if (!drawerEl) return;
    drawerEl.classList.remove('on');
    if (backdropEl) backdropEl.classList.remove('on');
    document.body.style.overflow = '';
    if (drawerEl._escHandler) { document.removeEventListener('keydown', drawerEl._escHandler); drawerEl._escHandler = null; }
  }

  /* ---------- boot loader → reveal page content ---------- */
  function boot(opts) {
    opts = opts || {};
    const loader = document.getElementById('loader');
    const revealRoot = opts.root ? document.querySelector(opts.root) : document;
    const items = revealRoot ? revealRoot.querySelectorAll('.reveal') : [];

    initTheme();
    initRipples(opts.rippleSelector || '.mini-btn, .row .plus, .btn, .focus-cta, .chip');
    initPressScale(opts.pressSelector || '.btn, .focus-cta, .chip, .mini-btn, .icon-btn, .side-btn');
    initTilt();
    initSpotlight();
    upgradeControls(opts.a11ySelector);

    const finish = () => { setupScrollReveals(revealRoot); if (typeof opts.onReady === 'function') opts.onReady(); };
    const doEnter = () => {
      if (opts.enter === 'slide') enterFromRight(document.querySelector(opts.slideTarget || '.view'));
      else revealNow(items);
    };

    if (skipGSAP) {
      if (loader) loader.style.display = 'none';
      items.forEach(el => { el.style.opacity = '1'; });
      const slideEl = opts.enter === 'slide' && document.querySelector(opts.slideTarget || '.view');
      if (slideEl) { slideEl.style.opacity = '1'; slideEl.style.transform = 'none'; }
      finish();
      return;
    }
    if (REDUCE) {
      if (loader) loader.style.display = 'none';
      doEnter();
      finish();
      return;
    }

    if (!loader) { doEnter(); finish(); return; }

    const tl = gsap.timeline({ onComplete: finish });
    tl.to('#loader .loader-bar i', { xPercent: 150, duration: .7, ease: 'power1.inOut' })
      .to('#loader .loader-mark', { scale: 1.06, duration: .35, ease: 'power2.out' }, '-=.5')
      .to('#loader .loader-mark', { scale: 1, duration: .3, ease: 'power2.inOut' })
      .to('#loader', { opacity: 0, duration: .45, ease: 'power2.inOut', onComplete() { loader.style.display = 'none'; } })
      .add(() => doEnter(), '-=.15');
  }

  global.AtlasUI = { boot, spawnRipple, revealNow, enterFromRight, openDrawer, closeDrawer, setupScrollReveals, initTheme, initTilt, initSpotlight, upgradeControls, REDUCE, skipGSAP };
})(window);
