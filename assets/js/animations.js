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

  // ── 3. Number Counter Animation ──────────────────────────────────
  const counterEls = document.querySelectorAll('.counter-anim');
  if (counterEls.length) {
    const counterObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          const duration = 2000; // 2 seconds
          const frameRate = 1000 / 60; // 60fps
          const totalFrames = Math.round(duration / frameRate);
          let frame = 0;

          const counter = setInterval(function() {
            frame++;
            const progress = frame / totalFrames;
            // ease-out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * easeOutProgress);
            
            el.textContent = current;

            if (frame >= totalFrames) {
              clearInterval(counter);
              el.textContent = target;
            }
          }, frameRate);
          
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counterEls.forEach(function(el) {
      counterObserver.observe(el);
    });
  }

})();
