/* ===========================================================
   Page transitions — ink curtain sweep between pages
   =========================================================== */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FLAG = "pt:navigating";
  const OUT_MS = 560;

  /* ---------- curtain element ---------- */
  const curtain = document.createElement("div");
  curtain.className = "pt-curtain";
  curtain.setAttribute("aria-hidden", "true");
  curtain.innerHTML = '<span class="pt-curtain__mark">MC</span>';
  document.body.appendChild(curtain);

  /* ---------- entry: reveal the new page ---------- */
  // Skip on pages with the intro loader (it already covers the entry),
  // and honour reduced motion.
  const cameFromTransition = sessionStorage.getItem(FLAG);
  sessionStorage.removeItem(FLAG);
  if (cameFromTransition && !reduce && !document.getElementById("loader")) {
    curtain.style.transition = "none";
    curtain.classList.add("is-in");
    document.body.classList.add("pt-entering");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      curtain.style.transition = "";
      curtain.classList.remove("is-in");
      curtain.classList.add("is-out");
      document.body.classList.remove("pt-entering");
      setTimeout(() => curtain.classList.remove("is-out"), OUT_MS + 100);
    }));
  }

  /* ---------- exit: cover, then navigate ---------- */
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const a = e.target.closest("a");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    // same-page hash links glide via Lenis instead
    if (url.pathname === location.pathname && url.hash) return;

    e.preventDefault();
    sessionStorage.setItem(FLAG, "1");
    if (reduce) { location.href = url.href; return; }
    curtain.classList.remove("is-out");
    curtain.classList.add("is-in");
    setTimeout(() => { location.href = url.href; }, OUT_MS);
  });

  /* ---------- back/forward cache: never leave the curtain stuck ---------- */
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) curtain.classList.remove("is-in", "is-out");
  });
})();
