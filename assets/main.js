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

  /* ---------- 作品卡片依次入场的细微延迟 ---------- */
  document.querySelectorAll('.works .card').forEach(function (card, i) {
    card.style.setProperty('--d', (i * 0.08) + 's');
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
          Object.keys(links).forEach(function (k) {
            links[k].style.color = '';
          });
          link.style.color = 'var(--ink)';
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 釉盘的轻微视差（仅桌面端） ---------- */
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
})();
