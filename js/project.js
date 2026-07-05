/* Populate the case-study page from the slug in the URL */
(() => {
  "use strict";
  const slug = new URLSearchParams(location.search).get("slug");
  const P = window.MC_PROJECTS || {};
  const data = P[slug];
  if (!data) { location.replace("index.html#work"); return; }

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  document.title = "MC — " + data.title;

  // size a tile to the image's real proportions so full extents always show
  const fit = (el, url) => {
    const im = new Image();
    im.onload = () => { if (im.naturalWidth && im.naturalHeight) { el.style.aspectRatio = im.naturalWidth + " / " + im.naturalHeight; el.style.height = "auto"; } };
    im.src = url;
  };
  window.__ppFit = fit; // shared with the edit-mode script

  set("ppTag", data.tag);
  set("ppTitle", data.title);
  set("ppIntro", data.intro);
  const heroEl = document.getElementById("ppHero");
  heroEl.style.backgroundImage = `url("${data.hero}")`;
  fit(heroEl, data.hero);

  document.getElementById("ppScope").innerHTML = data.scope.map((s) => `<li>${s}</li>`).join("");
  document.getElementById("ppOutcomes").innerHTML = data.outcomes
    .map(([b, s]) => `<div class="pp-out"><b>${b}</b><span>${s}</span></div>`).join("");
  document.getElementById("ppGallery").innerHTML = (data.gallery || [])
    .map((u) => `<div style="background-image:url('${u}')"></div>`).join("");
  document.querySelectorAll("#ppGallery > div").forEach((el, i) => fit(el, data.gallery[i]));

  const order = window.MC_PROJECT_ORDER || Object.keys(P);
  const next = P[order[(order.indexOf(slug) + 1) % order.length]];
  const nextA = document.getElementById("ppNext");
  nextA.href = "project.html?slug=" + order[(order.indexOf(slug) + 1) % order.length];
  document.getElementById("ppNextTitle").textContent = next.title;
})();
