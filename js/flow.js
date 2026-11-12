/* Scroll-driven Lab rows, key words and project stack.
   - Key words (.sweep) wash from ink to blue as they rise (--f, 0 to 1).
   - Lab: each row's big word fills with blue as the row crosses the
     screen (--f on the row, 0 to 1), and the row's lines come in once the
     fill has started.
   - Projects: as the next panel slides over a pinned one, the one beneath
     eases back (--s scale, --b brightness).
   Without this script, or with reduced motion, everything shows as is. */
(() => {
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const lab = document.querySelector(".lab");
  const rows = lab ? [...lab.querySelectorAll(".lab-row")] : [];
  const cards = [...document.querySelectorAll(".card--stack")];
  const sweeps = [...document.querySelectorAll(".sweep")];
  if (lab) lab.classList.add("js-on");

  const clamp = (v) => Math.max(0, Math.min(1, v));
  let queued = false;

  function update() {
    queued = false;
    const vh = innerHeight;

    // The fill starts as a row's top passes 80% of the screen height and
    // completes by the time it reaches 30%, so it tracks the reader's eye.
    rows.forEach((row) => {
      const top = row.getBoundingClientRect().top;
      const f = clamp((vh * 0.8 - top) / (vh * 0.5));
      row.style.setProperty("--f", f.toFixed(4));
      if (f > 0.12) row.classList.add("is-in");
    });

    // Key words elsewhere on the page take the same wash, a little later
    // and over a shorter distance so each one finishes while it is in view.
    sweeps.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      el.style.setProperty("--f", clamp((vh * 0.82 - top) / (vh * 0.36)).toFixed(4));
    });

    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      const a = card.getBoundingClientRect();
      const b = next.getBoundingClientRect();
      // 0 while the next panel is below this one, 1 once it fully covers it
      const t = clamp((a.bottom - b.top) / a.height);
      card.style.setProperty("--s", (1 - t * 0.06).toFixed(4));
      card.style.setProperty("--b", (1 - t * 0.12).toFixed(4));
    });
  }

  const request = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request);
  update();
})();
