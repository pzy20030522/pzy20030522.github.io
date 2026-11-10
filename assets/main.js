/* 潘梓怡 · 作品集 — 交互脚本 */

(function () {
  'use strict';

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

  /* ---------- 釉盘视差（仅桌面） ---------- */
  var plate = document.querySelector('.plate');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (plate && isFine && !reduce) {
    var raf = null;
    window.addEventListener('mousemove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var x = (e.clientX / window.innerWidth - 0.5) * 10;
        var y = (e.clientY / window.innerHeight - 0.5) * 10;
        plate.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
        raf = null;
      });
    }, { passive: true });
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

  function render(images, index) {
    lbStack.innerHTML = '';
    // 长图项目（详情页）一次性全部堆叠；多图项目只渲染当前一张
    var showAll = images.length > 8;
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
    current = { images: imagesOf(card), index: 0 };
    lbTitle.textContent = card.dataset.title || '';
    lbCat.textContent = card.dataset.cat || '';
    render(current.images, 0);
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
    render(current.images, current.index);
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
