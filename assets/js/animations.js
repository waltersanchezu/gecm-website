/**
 * GECM Consulting — Scroll Animations Engine
 * Uses IntersectionObserver (GPU-only: transform + opacity)
 * - Scroll down  → entrance animation (anim--visible)
 * - Scroll up    → subtle exit from top (anim--exit), keeps content readable
 * - Mobile       → exit class disabled (no content disappears)
 */
(function () {
  'use strict';

  // ── Respect prefers-reduced-motion ──────────────────────────────
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── 1. Hero on-load entrance ─────────────────────────────────────
  const hero = document.querySelector('.hero');
  if (hero) {
    // Trigger after first paint so CSS transition fires
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add('hero--loaded');
      });
    });
  }

  // ── 2. Scroll-driven observer for [data-anim] elements ──────────
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  const animEls = document.querySelectorAll('[data-anim]');
  if (!animEls.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;

        if (entry.isIntersecting) {
          // Element entered viewport — play entrance
          el.classList.add('anim--visible');
          el.classList.remove('anim--exit');
        } else {
          // Element left viewport
          var rect = el.getBoundingClientRect();

          if (rect.bottom < 0) {
            // Element scrolled above viewport top — apply exit (desktop only)
            if (!isMobile) {
              el.classList.add('anim--exit');
            }
            el.classList.remove('anim--visible');
          } else {
            // Element is still below viewport — reset so it can re-animate
            el.classList.remove('anim--visible');
            el.classList.remove('anim--exit');
          }
        }
      });
    },
    {
      threshold: 0.10,
      rootMargin: '-40px 0px -40px 0px'
    }
  );

  animEls.forEach(function (el) {
    observer.observe(el);
  });

})();
