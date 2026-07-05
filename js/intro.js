/* ===========================================================
   Intro loader + smooth (inertia) scrolling
   =========================================================== */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- intro loader ---------- */
  const loader = document.getElementById("loader");
  if (loader) {
    const countEl = document.getElementById("loaderCount");
    const fill = document.getElementById("loaderFill");
    const dur = reduce ? 250 : 1150;
    const start = performance.now();
    let done = false;

    const finish = () => {
      if (done) return; done = true;
      loader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      setTimeout(() => loader.remove(), 700);
    };
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const n = Math.round(p * 100);
      if (countEl) countEl.textContent = n;
      if (fill) fill.style.width = p * 100 + "%";
      if (p < 1) requestAnimationFrame(step); else finish();
    };
    requestAnimationFrame(step);
    // hard safety net in case rAF is throttled
    setTimeout(finish, dur + 1500);
  }

  /* ---------- smooth scroll (Lenis) ---------- */
  if (window.Lenis && !reduce) {
    const lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1, touchMultiplier: 1.5,
    });
    let lastRaf = 0;
    const raf = (time) => { lastRaf = time; lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    // rAF is paused in hidden/embedded tabs — heartbeat keeps scrolling alive there
    setInterval(() => { if (performance.now() - lastRaf > 200) lenis.raf(performance.now()); }, 100);

    // anchor links glide instead of jump
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length > 1) {
          const el = document.querySelector(id);
          if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: 0 }); }
        }
      });
    });
    window.__lenis = lenis;
  }
})();
