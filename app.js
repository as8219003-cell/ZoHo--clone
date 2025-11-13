document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('y');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const bgVideoEl = document.querySelector('.bg-video__media');
  const syncBgVideo = () => {
    if (!bgVideoEl) return;
    if (reduceMotionQuery.matches) {
      try { bgVideoEl.pause(); } catch (e) { }
    } else {
      try { bgVideoEl.play(); } catch (e) { }
    }
  };
  syncBgVideo();
  if (reduceMotionQuery.addEventListener) {
    reduceMotionQuery.addEventListener('change', syncBgVideo);
  } else if (reduceMotionQuery.addListener) {
    reduceMotionQuery.addListener(syncBgVideo);
  }

  if (year) year.textContent = new Date().getFullYear();



  // Story page interactions: video overlay + counters
  (function setupStoryPage() {
    // Video overlay play/pause
    const playBtn = document.querySelector('.js-video-play');
    const video = playBtn && playBtn.previousElementSibling && playBtn.previousElementSibling.tagName === 'VIDEO'
      ? playBtn.previousElementSibling
      : null;

    if (playBtn && video) {
      const showOverlay = () => playBtn.classList.remove('hidden');
      const hideOverlay = () => playBtn.classList.add('hidden');

      playBtn.addEventListener('click', () => {
        try { video.play(); } catch (e) {}
        video.setAttribute('controls', '');
        hideOverlay();
      });
      video.addEventListener('play', hideOverlay);
      video.addEventListener('pause', showOverlay);
      video.addEventListener('ended', showOverlay);
    }

    // Animated counters
    const counters = Array.from(document.querySelectorAll('.counter'));
    if (!counters.length) return;

    const parseMeta = (el) => ({
      target: Number(el.dataset.target || '0'),
      suffix: el.dataset.suffix || ''
    });

    const setVal = (el, v, suffix) => {
      el.textContent = Math.round(v).toString() + (suffix || '');
    };

    const animate = (el) => {
      const { target, suffix } = parseMeta(el);
      if (window.gsap && !prefersReduced) {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => setVal(el, obj.v, suffix)
        });
      } else {
        // fallback requestAnimationFrame
        const start = performance.now();
        const dur = 1600;
        const tick = (t) => {
          const p = Math.min(1, (t - start) / dur);
          setVal(el, target * p, suffix);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    };

    if (prefersReduced) {
      counters.forEach((el) => {
        const { target, suffix } = parseMeta(el);
        setVal(el, target, suffix);
      });
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => io.observe(el));
  })();
});

