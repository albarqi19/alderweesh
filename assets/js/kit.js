/* ==========================================================================
   قالب مواقع المكاتب — الحركة والتفاعل (GSAP + ScrollTrigger + Lenis محلية)
   افتتاحية الشعار: كل مكون يرسم محيطه ثم يمتلئ، من اليمين إلى اليسار، ثم ينتقل الشعار إلى الترويسة.
   ========================================================================== */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  root.classList.add('ready');
  var RM = root.classList.contains('rm');
  var HAS = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var ANIM = HAS && !RM;
  if (!HAS && !RM) root.classList.add('static');
  var KEY = body.getAttribute('data-key') || 'kit';
  var page = (body.className.match(/\bp-([\w-]+)/) || [])[1] || '';
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lenis = null, bootT = Date.now();
  var D0 = root.classList.contains('is-arriving') ? 0.6 : 0.1;
  var d0 = function () { return Date.now() - bootT < 1500 ? D0 : 0; };

  year(); menu(); header(); transitions(); composer();
  if (!ANIM) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  lenis = smooth();
  anchors();
  splitHeadings();
  if (page === 'home') heroIntro();
  reveals();
  var fontsReady = doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve();
  fontsReady.then(function () { ScrollTrigger.refresh(); });

  function year() { $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); }); }
  function header() {
    var h = $('.hdr'), bar = $('.hdr__progress'), q = false;
    if (!h) return;
    function update() {
      q = false;
      var y = window.scrollY || root.scrollTop;
      h.classList.toggle('is-solid', y > 12);
      if (bar) { var max = root.scrollHeight - window.innerHeight; bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')'; }
    }
    window.addEventListener('scroll', function () { if (!q) { q = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }
  function menu() {
    var btn = $('.burger'), m = $('#menu');
    if (!btn || !m) return;
    function set(open) {
      root.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
      if (open) m.removeAttribute('inert'); else m.setAttribute('inert', '');
      if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    }
    btn.addEventListener('click', function () { set(!root.classList.contains('menu-open')); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) { set(false); btn.focus(); } });
    $$('a', m).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
  }
  function transitions() {
    if (RM) return;
    doc.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || /^(mailto|tel):/i.test(href)) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      try { sessionStorage.setItem(KEY + '-nav', '1'); } catch (err) { /* بلا ستارة */ }
      root.classList.add('is-leaving');
      setTimeout(function () { location.href = url.href; }, 600);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) root.classList.remove('is-leaving', 'is-arriving'); });
  }
  function composer() {
    var f = $('#wa-form');
    if (!f) return;
    var bubble = $('#wa-bubble', f), hidden = $('#wa-text', f), base = hidden.value;
    function build() {
      var name = $('#wa-name', f).value.trim(), msg = $('#wa-msg', f).value.trim(), pick = $('input[name="svc"]:checked', f);
      var text = 'السلام عليكم،';
      if (name) text += '\nمعكم ' + name + '.';
      text += pick ? '\nأرغب في استشارة بخصوص: ' + pick.value + '.' : '\nأرغب في الحصول على استشارة قانونية.';
      if (msg) text += '\n' + msg;
      return (name || msg || pick) ? text : base;
    }
    function update() { var t = build(); bubble.textContent = t; hidden.value = t; }
    f.addEventListener('input', update); f.addEventListener('change', update);
    f.addEventListener('submit', function (e) { e.preventDefault(); update(); window.open(f.getAttribute('action') + '?text=' + encodeURIComponent(hidden.value), '_blank', 'noopener'); });
  }
  function smooth() {
    if (typeof window.Lenis === 'undefined') return null;
    var l = new window.Lenis({ duration: 1.1, smoothWheel: true });
    l.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { l.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.__lenis = l;
    return l;
  }
  function anchors() {
    doc.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href*="#"]') : null;
      if (!a || e.defaultPrevented) return;
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      var id = decodeURIComponent(url.hash.slice(1));
      var t = id === 'top' ? 0 : doc.getElementById(id);
      if (t === null) return;
      e.preventDefault();
      var off = ($('.hdr') ? $('.hdr').offsetHeight : 80) + 18;
      if (lenis) lenis.scrollTo(t, { offset: t === 0 ? 0 : -off, duration: 1.3 }); else window.scrollTo(0, t === 0 ? 0 : t.getBoundingClientRect().top + window.scrollY - off);
    });
  }
  function wrapWords(el, cls, inner) {
    var walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var frag = doc.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(part)); return; }
        var w = doc.createElement('span'); w.className = cls;
        if (inner) { var i = doc.createElement('span'); i.className = inner; i.textContent = part; w.appendChild(i); } else w.textContent = part;
        frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return $$(inner ? '.' + inner : '.' + cls, el);
  }
  function splitHeadings() {
    $$('[data-words]').forEach(function (el) { var w = wrapWords(el, 'w', 'wi'); gsap.set(w, { yPercent: 115 }); el.style.visibility = 'visible'; });
  }
  function reveals() {
    var outside = function (el) { return !el.closest('.hero'); };
    ScrollTrigger.batch($$('[data-rise]').filter(outside), { start: 'top 90%', once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.09, delay: d0(), overwrite: true }); } });
    $$('[data-words]').filter(outside).forEach(function (el) {
      var w = $$('.wi', el);
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { gsap.to(w, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.05, delay: d0() }); } });
    });
    $$('[data-stagger]').forEach(function (g) {
      ScrollTrigger.create({ trigger: g, start: 'top 85%', once: true, onEnter: function () {
        gsap.to(g.children, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: d0() });
        var icons = $$('.svc__ico use', g);
        if (icons.length) gsap.to(icons, { strokeDashoffset: 0, autoRound: false, duration: 1.3, ease: 'power2.inOut', stagger: 0.08, delay: d0() + 0.2 });
      } });
    });
    $$('.ftr__logo').forEach(function (el) { ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () { el.classList.add('is-in'); } }); });
  }

  /* افتتاحية الشعار ثم الانتقال إلى الترويسة */
  function heroIntro() {
    var fly = $('.fly'), svg = fly ? $('svg', fly) : null, slot = $('.hero__slot'), brand = $('.hdr .brand__logo'), hdr = $('.hdr');
    if (!svg || !slot || !brand) return;
    var comps = $$('.kl', svg), rises = $$('.hero [data-rise]');
    var seen = root.classList.contains('intro-seen') || window.scrollY > 40;
    var base = { left: 0, top: 0, w: 1 };
    function place() {
      var r = slot.getBoundingClientRect();
      base = { left: r.left, top: r.top + window.scrollY, w: r.width };
      fly.style.width = r.width + 'px'; fly.style.height = r.height + 'px'; fly.style.left = r.left + 'px'; fly.style.top = base.top + 'px';
    }
    place();
    root.classList.add('fly-on');
    ScrollTrigger.addEventListener('refreshInit', function () { gsap.set(fly, { x: 0, y: 0, scale: 1 }); place(); });
    var dock = ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: function () { return '+=' + Math.max(240, window.innerHeight * 0.55); }, onUpdate: dockTo, onRefresh: dockTo });
    function dockTo(self) {
      var st = self || dock, p = st.progress, e = p < 0.5 ? 2 * p * p : 1 - Math.pow(2 - 2 * p, 2) / 2;
      var s = clamp(window.scrollY - st.start, 0, st.end - st.start), b = brand.getBoundingClientRect();
      gsap.set(fly, { x: base.left * (1 - e) + b.left * e - base.left, y: (base.top - s) * (1 - e) + b.top * e - base.top, scale: 1 - e + e * b.width / base.w });
    }
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onComplete: finish });
    if (!seen) {
      var n = comps.length, step = Math.min(0.12, 2.4 / Math.max(n, 1));
      gsap.set(comps, { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 });
      comps.forEach(function (c, i) {
        var big = parseFloat(c.getAttribute('data-a') || '0.5'), t = 0.15 + i * step;
        if (big < 0.015) {                                   /* النقاط والزخارف الصغيرة: تظهر بلا رسم */
          gsap.set(c, { strokeOpacity: 0 });
          tl.fromTo(c, { fillOpacity: 0, scale: 0.3, transformOrigin: '50% 50%' }, { fillOpacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, t + 0.35);
          return;
        }
        var d = 0.55 + big * 0.9;
        tl.to(c, { strokeDashoffset: 0, duration: d, ease: 'power1.inOut', autoRound: false }, t)
          .to(c, { fillOpacity: 1, duration: 0.55, ease: 'power1.out' }, t + d * 0.72)
          .to(c, { strokeOpacity: 0, duration: 0.6 }, t + d * 0.95);
      });
      var end = 0.15 + n * step + 1.2;
      tl.to(rises, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, Math.min(end - 0.6, 3.4))
        .to(hdr, { opacity: 1, duration: 0.8, ease: 'power1.out' }, Math.min(end, 3.9));
      var evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
      var skip = function () { tl.timeScale(5); evs.forEach(function (ev) { window.removeEventListener(ev, skip); }); };
      evs.forEach(function (ev) { window.addEventListener(ev, skip, { passive: true }); });
    } else {
      gsap.set(comps, { strokeOpacity: 0 });
      tl.fromTo(svg, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9 }, 0.05).to(rises, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.25).set(hdr, { opacity: 1 }, 0);
    }
    function finish() {
      gsap.set(comps, { strokeOpacity: 0, fillOpacity: 1, clearProps: 'transform' });
      dockTo();
      try { sessionStorage.setItem(KEY + '-intro', '1'); } catch (e) { /* تعاد */ }
    }
    var fr = doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve();
    Promise.race([fr, new Promise(function (r) { setTimeout(r, 700); })]).then(function () {
      place();
      gsap.delayedCall(root.classList.contains('is-arriving') ? 0.55 : 0, function () { tl.play(); });
    });
  }
})();
