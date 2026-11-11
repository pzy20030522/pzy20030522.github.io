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
    if (card.dataset.single) return [card.dataset.single];
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

  var C_GREEN = [143, 211, 164], C_CREAM = [255, 240, 220], C_PINK = [255, 143, 177];
  function lerp3(a, b, k) {
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  }
  function fieldColor(p, t) {
    var k = p + 0.11 * Math.sin(t * 0.17 + p * 2.1);
    k = k - Math.floor(k);
    var c = k < 0.5 ? lerp3(C_GREEN, C_CREAM, k * 2) : lerp3(C_CREAM, C_PINK, (k - 0.5) * 2);
    var lift = 10 * Math.sin(t * 0.45 + p * 3.1);
    return [Math.min(255, c[0] + lift), Math.min(255, c[1] + lift), Math.min(255, c[2] + lift)];
  }

  function ribbon(i, n, t, step) {
    var p = i / (n - 1);
    var c0 = fieldColor(p, t);
    var c1 = fieldColor((p + 0.06) % 1, t + 0.6);
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
    g.addColorStop(0, 'rgba(' + (c1[0] | 0) + ',' + (c1[1] | 0) + ',' + (c1[2] | 0) + ',0.58)');
    g.addColorStop(0.5, 'rgba(' + (c0[0] | 0) + ',' + (c0[1] | 0) + ',' + (c0[2] | 0) + ',0.80)');
    g.addColorStop(1, 'rgba(' + (c1[0] | 0) + ',' + (c1[1] | 0) + ',' + (c1[2] | 0) + ',0.58)');
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
    vg.addColorStop(0, 'rgba(255,250,246,0.30)');
    vg.addColorStop(0.55, 'rgba(255,250,246,0.02)');
    vg.addColorStop(1, 'rgba(255,250,246,0.46)');
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

/* ============================================================
   横向作品条：两侧悬停自动滚动 + 拖拽 + 左右翻页按钮
   ============================================================ */
(function () {
  var rails = document.querySelectorAll('[data-rail]');

  Array.prototype.forEach.call(rails, function (rail) {
    var sc = rail.querySelector('.rail-scroll');
    if (!sc) return;
    var btnL = rail.querySelector('.rail-btn-l');
    var btnR = rail.querySelector('.rail-btn-r');

    var dir = 0, raf = null;
    var dragging = false, startX = 0, startLeft = 0, moved = 0;

    function step() {
      if (!dir) { raf = null; return; }
      sc.scrollLeft += dir;
      raf = requestAnimationFrame(step);
    }

    function updateBtns() {
      var max = sc.scrollWidth - sc.clientWidth - 2;
      if (btnL) btnL.disabled = sc.scrollLeft <= 2;
      if (btnR) btnR.disabled = sc.scrollLeft >= max;
    }

    rail.addEventListener('mousemove', function (e) {
      if (dragging) return;
      var r = rail.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var v = 0;
      if (x > 0.78) v = Math.pow((x - 0.78) / 0.22, 1.4) * 20;
      else if (x < 0.22) v = -Math.pow((0.22 - x) / 0.22, 1.4) * 20;
      dir = v;
      if (dir && !raf) raf = requestAnimationFrame(step);
    });

    rail.addEventListener('mouseleave', function () { dir = 0; });

    sc.addEventListener('mousedown', function (e) {
      dragging = true; moved = 0;
      startX = e.clientX; startLeft = sc.scrollLeft;
      sc.style.cursor = 'grabbing';
    });

    sc.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var d = e.clientX - startX;
      moved = Math.max(moved, Math.abs(d));
      sc.scrollLeft = startLeft - d;
    });

    window.addEventListener('mouseup', function () {
      if (!dragging) return;
      dragging = false;
      sc.style.cursor = '';
    });

    sc.addEventListener('click', function (e) {
      if (moved > 8) { e.stopPropagation(); e.preventDefault(); moved = 0; }
    }, true);

    function page(sign) {
      var card = sc.querySelector('.case');
      var w = card ? card.offsetWidth + 26 : sc.clientWidth * 0.8;
      var target = sc.scrollLeft + sign * w * 2;
      sc.scrollTo({ left: target, behavior: 'smooth' });
    }

    if (btnL) btnL.addEventListener('click', function () { page(-1); });
    if (btnR) btnR.addEventListener('click', function () { page(1); });

    sc.addEventListener('scroll', updateBtns, { passive: true });
    window.addEventListener('resize', updateBtns);
    setTimeout(updateBtns, 120);
  });
})();
