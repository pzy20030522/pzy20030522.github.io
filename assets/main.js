/* 潘梓怡 · 作品集 — 交互脚本 */

(function () {
  'use strict';

  /* ---------- 开场动画 ---------- */
  var intro = document.getElementById('intro');
  if (intro) {
    document.body.style.overflow = 'hidden';
    var release = function () {
      intro.classList.add('done');
      document.body.style.overflow = '';
      window.setTimeout(function () {
        if (intro.parentNode) intro.parentNode.removeChild(intro);
      }, 1100);
    };
    window.setTimeout(release, 1350);
    /* 兜底：无论脚本状态如何，2.6 秒后一定放行 */
    window.setTimeout(function () {
      document.body.style.overflow = '';
      if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    }, 2600);
  }

  /* ---------- 滚动进度条 ---------- */
  var bar = document.getElementById('progress-bar');
  function updateProgress() {
    if (!bar) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    bar.style.transform = 'scaleX(' + p + ')';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* ---------- 导航栏滚动状态 ---------- */
  var nav = document.getElementById('nav');
  var lastState = false;

  function onScroll() {
    var scrolled = window.scrollY > 24;
    if (scrolled !== lastState) {
      nav.classList.toggle('scrolled', scrolled);
      lastState = scrolled;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 滚动渐显 ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 作品卡片依次入场 ---------- */
  document.querySelectorAll('.works .case').forEach(function (card, i) {
    card.style.setProperty('--d', (i * 0.09) + 's');
  });

  /* ---------- 导航高亮当前区块 ---------- */
  var sections = ['works', 'about', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  var links = {};
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = links[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].style.color = ''; });
          link.style.color = 'var(--ink)';
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ============================================================
     作品灯箱
     ============================================================ */
  var lb = document.getElementById('lb');
  var lbStack = document.getElementById('lb-stack');
  var lbScroll = document.getElementById('lb-scroll');
  var lbTitle = document.getElementById('lb-title');
  var lbCat = document.getElementById('lb-cat');
  var lbIdx = document.getElementById('lb-idx');
  var lbPrev = document.getElementById('lb-prev');
  var lbNext = document.getElementById('lb-next');

  var current = null;

  function pad(num, len) {
    var s = String(num);
    while (s.length < len) s = '0' + s;
    return s;
  }

  /* 生成某个项目的所有图片地址 */
  function imagesOf(card) {
    var key = card.dataset.key;
    var n = parseInt(card.dataset.n, 10) || 1;
    var p = parseInt(card.dataset.pad, 10) || 1;
    var start = parseInt(card.dataset.start, 10) || 0;
    var list = [];
    for (var i = 0; i < n; i++) {
      list.push('assets/works/' + key + '-' + pad(start + i, p) + '.webp');
    }
    return list;
  }

  function render(images, index, longDoc) {
    lbStack.innerHTML = '';
    // 长图项目（详情页 / 品牌长图）一次性全部堆叠；多图项目只渲染当前一张
    var showAll = !!longDoc;
    var list = showAll ? images : [images[index]];

    list.forEach(function (src, i) {
      var img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';
      lbStack.appendChild(img);
    });

    lbIdx.textContent = showAll
      ? '长图'
      : (images.length > 1 ? pad(index + 1, 2) + ' / ' + pad(images.length, 2) : '01');

    var multi = images.length > 1 && !showAll;
    lbPrev.hidden = !multi;
    lbNext.hidden = !multi;
    lbScroll.scrollTop = 0;
  }

  function open(card) {
    current = { images: imagesOf(card), index: 0, long: card.dataset.long === '1' };
    lbTitle.textContent = card.dataset.title || '';
    lbCat.textContent = card.dataset.cat || '';
    render(current.images, 0, current.long);
    lb.classList.toggle('long', !!current.long);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lb-open');
  }

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lb-open');
    setTimeout(function () {
      if (!lb.classList.contains('open')) lbStack.innerHTML = '';
    }, 380);
  }

  function step(dir) {
    if (!current) return;
    var n = current.images.length;
    if (n <= 1) return;
    current.index = (current.index + dir + n) % n;
    render(current.images, current.index, current.long);
  }

  document.querySelectorAll('.case-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      open(btn.closest('.case'));
    });
  });

  document.getElementById('lb-close').addEventListener('click', close);
  lbPrev.addEventListener('click', function () { step(-1); });
  lbNext.addEventListener('click', function () { step(1); });

  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target === lbScroll) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
})();

/* ============================================================
   首屏动态渐变装置（Canvas）
   ============================================================ */
(function () {
  var canvas = document.getElementById('flow');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var freeze = /(\?|&)freeze/.test(location.search);
  var rafId = null;
  var visible = true;
  var lastDraw = 0;
  var t0 = performance.now();

  function resize() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function ribbon(i, n, t, step) {
    var p = i / (n - 1);
    var hue = (188 + p * 168 + Math.sin(t * 0.16) * 26 + t * 5) % 360;
    var sat = 66 + Math.sin(p * Math.PI) * 20;
    var lig = 72 + Math.sin(p * Math.PI * 1.2 + t * 0.5) * 8;
    var a1 = H * 0.075, a2 = H * 0.028;
    var segs = 22;
    var x0 = i * step - step * 0.32;
    var wdt = step * 1.65;

    ctx.beginPath();
    for (var k = 0; k <= segs; k++) {
      var y = H * k / segs;
      var off = a1 * Math.sin(y * 0.0115 + t * 1.05 + i * 0.11)
              + a2 * Math.sin(y * 0.0042 - t * 0.62 + i * 0.05);
      var x = x0 + off;
      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    for (var k2 = segs; k2 >= 0; k2--) {
      var y2 = H * k2 / segs;
      var off2 = a1 * Math.sin(y2 * 0.0115 + t * 1.05 + i * 0.11)
               + a2 * Math.sin(y2 * 0.0042 - t * 0.62 + i * 0.05);
      ctx.lineTo(x0 + wdt + off2, y2);
    }
    ctx.closePath();

    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'hsla(' + hue + ',' + sat + '%,' + (lig + 8) + '%,0.46)');
    g.addColorStop(0.45, 'hsla(' + ((hue + 16) % 360) + ',' + sat + '%,' + lig + '%,0.66)');
    g.addColorStop(1, 'hsla(' + ((hue + 34) % 360) + ',' + sat + '%,' + (lig + 5) + '%,0.46)');
    ctx.fillStyle = g;
    ctx.fill();
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    if (!visible) return;
    if (now - lastDraw < 33) return;
    lastDraw = now;
    var t = (now - t0) / 1000;
    render(t);
  }

  function render(t) {
    ctx.clearRect(0, 0, W, H);
    var n = W < 460 ? 52 : 92;
    var step = W / n;
    for (var i = 0; i < n; i++) ribbon(i, n, t, step);

    var vg = ctx.createRadialGradient(W * 0.34, H * 0.42, 0, W * 0.34, H * 0.42, Math.max(W, H) * 0.95);
    vg.addColorStop(0, 'rgba(255,255,255,0.34)');
    vg.addColorStop(0.55, 'rgba(255,255,255,0.05)');
    vg.addColorStop(1, 'rgba(255,255,255,0.50)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  resize();
  render(1.6);

  if (!reduce && !freeze) {
    rafId = requestAnimationFrame(frame);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
      }, { threshold: 0.05 });
      io.observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden && visible;
    });
  }

  var rt = null;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); render(3.2); }, 160);
  });
})();
