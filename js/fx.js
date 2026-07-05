/* ===========================================================
   Cursor spotlight — soft brand-tinted glow that trails the
   pointer and swells over interactive elements.
   Desktop pointers only · respects prefers-reduced-motion.
   =========================================================== */
(() => {
  "use strict";
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduce) return;

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.appendChild(glow);

  const lerp = (a, b, t) => a + (b - a) * t;
  let tx = innerWidth / 2, ty = innerHeight / 2;
  let x = tx, y = ty;
  let scale = 1, tScale = 1;
  let on = false, raf = null;

  function loop() {
    x = lerp(x, tx, 0.16);
    y = lerp(y, ty, 0.16);
    scale = lerp(scale, tScale, 0.12);
    glow.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    const settled = Math.abs(tx - x) < 0.4 && Math.abs(ty - y) < 0.4 && Math.abs(tScale - scale) < 0.01;
    raf = settled ? null : requestAnimationFrame(loop);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  window.addEventListener("pointermove", (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!on) { on = true; glow.classList.add("is-on"); }
    // swell over interactive things
    tScale = e.target.closest("a, button, .card, .chevron, .pagination__dot, [contenteditable]") ? 1.5 : 1;
    kick();
  }, { passive: true });

  document.addEventListener("mouseleave", () => { on = false; glow.classList.remove("is-on"); });
  window.addEventListener("blur", () => { on = false; glow.classList.remove("is-on"); });
})();
