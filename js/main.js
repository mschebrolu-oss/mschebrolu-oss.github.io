/* ===========================================================
   Marcus Hale Portfolio — motion choreography
   - Hero dispersal on scroll  (fog breaks, FIND word lifts)
   - Cloud parallax (rAF, transform only)
   - Staggered fade-and-rise reveals (IntersectionObserver)
   - Chevron sequential reveal
   - Counter animation
   - Testimonial cross-fade pagination
   - Nav stuck state + scroll progress
   =========================================================== */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ----------------------------------------------------------
     1. SCROLL STATE  (single rAF loop drives the cheap stuff)
     ---------------------------------------------------------- */
  const nav = document.getElementById("nav");
  const progress = document.getElementById("progress");
  const hero = document.getElementById("top");
  const heroBuilding = document.getElementById("heroBuilding");
  const heroBuildingImg = heroBuilding ? heroBuilding.querySelector("img") : null;
  const heroContent = document.getElementById("heroContent");
  const heroClouds = document.getElementById("heroClouds");
  const heroReveal = document.getElementById("heroReveal");
  const heroRevealWord = heroReveal ? heroReveal.querySelector(".hero__reveal-word") : null;
  const heroScroll = document.getElementById("heroScroll");
  const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));

  // how much the full-bleed building zooms across the whole pinned sequence
  const BUILD_ZOOM = 0.26;
  // map a 0..1 progress onto a sub-range [a,b]
  const range = (v, a, b) => clamp((v - a) / (b - a), 0, 1);

  let targetY = window.scrollY;
  let renderY = window.scrollY;
  let ticking = false;

  function onScroll() {
    targetY = window.scrollY;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  function render() {
    // smooth-follow so parallax feels weighty, not jittery
    renderY = reduceMotion ? targetY : lerp(renderY, targetY, 0.16);
    const y = renderY;

    // --- scroll progress bar ---
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (clamp(y / docH, 0, 1) * 100) + "%";

    // --- nav stuck ---
    if (nav) nav.classList.toggle("is-stuck", y > 40);

    // --- HERO: pinned scroll sequence ---
    // p = how far through the tall hero we are (0 at top, 1 at hero bottom)
    const vh = window.innerHeight;
    const span = hero ? Math.max(1, hero.offsetHeight - vh) : vh;
    const p = hero ? clamp((y - hero.offsetTop) / span, 0, 1) : 0;

    if (!reduceMotion) {
      // 1) whole building always visible — gentle zoom-in across the sequence
      if (heroBuilding) {
        const zp = range(p, 0, 0.9);
        const e = 1 - Math.pow(1 - zp, 2);               // easeOut zoom
        const s = 0.92 + 0.22 * e;                       // 0.92 -> 1.14
        heroBuilding.style.transform = `scale(${s})`;
      }
      // 2) title lifts + fades from the very first scroll
      if (heroContent) {
        const tp = range(p, 0, 0.30);
        heroContent.style.transform = `translateY(${-tp * 170}px) scale(${1 - tp * 0.05})`;
        heroContent.style.opacity = `${1 - tp}`;
      }
      // scroll cue fades almost immediately
      if (heroScroll) heroScroll.style.opacity = `${1 - range(p, 0, 0.12)}`;
      // 3) bottom clouds roll up and thicken (held back so the facade reads first)
      if (heroClouds) {
        const cp = range(p, 0.30, 0.86);
        heroClouds.style.transform = `translateY(${(1 - cp) * 18}px) scaleY(${1 + cp * 0.9})`;
        heroClouds.style.opacity = `${0.6 + cp * 0.4}`;
      }
      // 4) clouds fill the frame and the brand word forms out of the building (later, so
      //    you get a clean look at the whole building first)
      if (heroReveal) {
        const rp = range(p, 0.56, 0.9);
        heroReveal.style.opacity = `${rp}`;
        if (heroRevealWord) heroRevealWord.style.transform = `scale(${1.12 - rp * 0.12})`;
      }
      // gentle cloud drift (kept small — the stage is pinned)
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
        el.style.transform = `translate3d(0, ${-p * vh * speed}px, 0)`;
      });
    }

    if (Math.abs(targetY - renderY) > 0.4 && !reduceMotion) {
      requestAnimationFrame(render);
    } else {
      ticking = false;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  if (heroBuildingImg && !heroBuildingImg.complete) heroBuildingImg.addEventListener("load", onScroll);
  render();

  /* ----------------------------------------------------------
     2. STAGGERED FADE-AND-RISE REVEALS
        Trigger when element enters bottom 20% of viewport.
     ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  const chevronWrap = document.getElementById("chevrons");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          // light stagger for siblings revealed in the same frame
          const el = entry.target;
          const delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
          setTimeout(() => el.classList.add("is-in"), delay);
          obs.unobserve(el);
        }
      });
    }, { rootMargin: "0px 0px -20% 0px", threshold: 0.1 });

    revealEls.forEach((el) => io.observe(el));

    // chevrons reveal as a group (their own staggered transition-delay)
    if (chevronWrap) {
      const cio = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("is-in"); obs.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -15% 0px", threshold: 0.15 });
      cio.observe(chevronWrap);
    }
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
    if (chevronWrap) chevronWrap.classList.add("is-in");
  }

  // hidden/embedded tabs throttle IntersectionObserver — show everything so no section looks empty
  if (document.visibilityState === "hidden") {
    revealEls.forEach((el) => el.classList.add("is-in"));
    if (chevronWrap) chevronWrap.classList.add("is-in");
  }

  /* ----------------------------------------------------------
     3. COUNTER ANIMATION
     ---------------------------------------------------------- */
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    const cObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || "";
        if (reduceMotion || target === 0) {
          el.textContent = (target === 0 ? "0" : target) + (suffix ? " " + suffix : "");
          obs.unobserve(el); return;
        }
        const dur = 1400; const start = performance.now();
        const tick = (now) => {
          const t = clamp((now - start) / dur, 0, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(eased * target) + (suffix ? " " + suffix : "");
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => cObs.observe(c));
  }

  /* ----------------------------------------------------------
     4. TESTIMONIAL CROSS-FADE PAGINATION
        click -> current fades out left, new fades in from right
     ---------------------------------------------------------- */
  const stage = document.getElementById("quoteStage");
  const dots = Array.from(document.querySelectorAll(".pagination__dot"));
  if (stage && dots.length) {
    const quotes = Array.from(stage.querySelectorAll(".quote"));
    let current = 0;
    let busy = false;

    // init first
    quotes[0].removeAttribute("hidden");
    quotes[0].classList.add("is-active");

    function go(next) {
      if (next === current || busy) return;
      busy = true;
      const out = quotes[current];
      const incoming = quotes[next];

      out.classList.add("is-leaving");
      out.classList.remove("is-active");

      incoming.removeAttribute("hidden");
      // start off-screen right, then snap to active next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => incoming.classList.add("is-active"));
      });

      setTimeout(() => {
        out.classList.remove("is-leaving");
        out.setAttribute("hidden", "");
        busy = false;
      }, 520);

      dots[current].classList.remove("is-active");
      dots[current].setAttribute("aria-selected", "false");
      dots[next].classList.add("is-active");
      dots[next].setAttribute("aria-selected", "true");
      current = next;
    }

    dots.forEach((dot) => dot.addEventListener("click", () => go(parseInt(dot.dataset.go, 10))));

    // gentle autoplay (pauses on hover)
    let timer = null;
    const play = () => { if (reduceMotion) return; timer = setInterval(() => go((current + 1) % quotes.length), 6000); };
    const stop = () => clearInterval(timer);
    play();
    stage.addEventListener("mouseenter", stop);
    stage.addEventListener("mouseleave", play);
    dots.forEach((d) => d.addEventListener("click", () => { stop(); play(); }));
  }

  /* ----------------------------------------------------------
     5. MAGNETIC BUTTON ARROWS (subtle pointer pull on desktop)
     ---------------------------------------------------------- */
  if (window.matchMedia("(hover: hover)").matches && !reduceMotion) {
    document.querySelectorAll(".btn").forEach((btn) => {
      const arrow = btn.querySelector(".btn__arrow");
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        btn.style.transform = `translate(${dx * 6}px, 0)`;
        if (arrow) arrow.style.transform = `translateX(${4 + dx * 6}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
        if (arrow) arrow.style.transform = "";
      });
    });
  }
})();
