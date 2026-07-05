/* ===========================================================
   In-browser Edit Mode — drafting tool (local to this browser)
   • Toggle with Cmd/Ctrl + E, or load the page with #edit
   • Click any text to edit it · click an image to replace it
   • Changes persist in localStorage (this browser only)
   • "Export HTML" downloads a ready-to-publish index.html with
     your text edits applied and uploaded images inlined
   =========================================================== */
(() => {
  "use strict";
  const TKEY = "mc-edit:text:v1";
  const IKEY = "mc-edit:img:v1";

  // text elements that become editable
  const TEXT_SELECTORS = [
    ".nav__name", ".hero__eyebrow", ".hero__brand", ".hero__tagline", ".hero__reveal-word",
    ".statement__lead span", ".statement__num", ".statement__label",
    ".section-kicker", ".section-title", ".section-desc",
    ".chevron__step", ".chevron__body h3", ".chevron__body p",
    ".card__tag", ".card__title", ".card__meta",
    ".lab__kicker", ".lab__title", ".lab__desc",
    ".tool__tag", ".tool__title", ".tool__desc", ".tool__tech",
    ".about__title", ".about__text", ".about__skills li", ".about__badge span", ".about__badge small",
    ".quote__text", ".quote__who",
    ".contact__title", ".contact__sub", ".contact__details", ".footer span"
  ];

  const loadMap = (k) => { try { return JSON.parse(localStorage.getItem(k) || "{}"); } catch { return {}; } };
  const saveMap = (k, m) => {
    try { localStorage.setItem(k, JSON.stringify(m)); return true; }
    catch { alert("This browser's storage is full — large images can't be saved locally. They still show now, but won't survive a reload. Use Export HTML to keep them."); return false; }
  };

  const eachText = (doc, cb) => {
    TEXT_SELECTORS.forEach((sel) => {
      doc.querySelectorAll(sel).forEach((el, i) => cb(sel + "#" + i, el));
    });
  };

  /* ---- apply saved overrides to a document (used on load + on export) ---- */
  function applyText(doc, map) {
    eachText(doc, (key, el) => { if (map[key] != null) el.innerHTML = map[key]; });
  }
  function applyImages(doc, map) {
    if (map["hero-building"]) {
      const u = map["hero-building"];
      doc.querySelectorAll(".hero__building-img").forEach((i) => i.setAttribute("src", u));
      const rw = doc.querySelector(".hero__reveal-word");
      // keep the dark wash so the reveal words stay legible on light images
      if (rw) rw.style.backgroundImage = `linear-gradient(rgba(9,9,11,0.72), rgba(9,9,11,0.72)), url("${u}")`;
    }
    doc.querySelectorAll(".card__img").forEach((el, i) => { if (map["card#" + i]) el.style.backgroundImage = `url("${map["card#" + i]}")`; });
    doc.querySelectorAll(".chevron__media").forEach((el, i) => { if (map["chev#" + i]) el.style.backgroundImage = `url("${map["chev#" + i]}")`; });
    const ab = doc.querySelector(".about__img");
    if (ab && map["about"]) ab.style.backgroundImage = `url("${map["about"]}")`;
  }

  /* ---- size each work card to its image's real proportions (no empty bands) ---- */
  function fitCards() {
    document.querySelectorAll(".card").forEach((card) => {
      const imgEl = card.querySelector(".card__img");
      if (!imgEl) return;
      const bg = imgEl.style.backgroundImage || getComputedStyle(imgEl).backgroundImage;
      const m = /url\(["']?(.*?)["']?\)/.exec(bg);
      if (!m || !m[1]) return;
      const im = new Image();
      im.onload = () => { if (im.naturalWidth && im.naturalHeight) card.style.aspectRatio = im.naturalWidth + " / " + im.naturalHeight; };
      im.src = m[1];
    });
  }

  // apply this browser's saved edits on every load
  applyText(document, loadMap(TKEY));
  applyImages(document, loadMap(IKEY));
  fitCards();

  // also load edits saved to disk (survive browser/session resets), local edits win
  fetch("content-overrides.json", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d) return;
      const mt = { ...(d.text || {}), ...loadMap(TKEY) };
      const mi = { ...(d.img || {}), ...loadMap(IKEY) };
      try { localStorage.setItem(TKEY, JSON.stringify(mt)); localStorage.setItem(IKEY, JSON.stringify(mi)); } catch {}
      applyText(document, mt);
      applyImages(document, mi);
      fitCards();
    })
    .catch(() => {});

  /* ---- build the editor UI ---- */
  const bar = document.createElement("div");
  bar.className = "mc-editbar";
  bar.innerHTML =
    '<span class="mc-editbar__brand">✎ Edit mode</span>' +
    '<span class="mc-editbar__hint">Click text to edit · click an image to replace it</span>' +
    '<button data-act="building">⤓ Building image</button>' +
    '<button data-act="reveal">Reveal text</button>' +
    '<button data-act="reset">Reset</button>' +
    '<button data-act="export">⤓ Export HTML</button>' +
    '<button data-act="save" class="mc-primary">💾 Save</button>' +
    '<button data-act="done">Done</button>' +
    '<span class="mc-editbar__status" id="mcSaveStatus"></span>';
  document.body.appendChild(bar);

  const fileInput = document.createElement("input");
  fileInput.type = "file"; fileInput.accept = "image/*"; fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  let editing = false;
  let currentImgKey = null;

  const imgKeyFor = (el) => {
    if (el.classList.contains("card__img")) return "card#" + [...document.querySelectorAll(".card__img")].indexOf(el);
    if (el.classList.contains("chevron__media")) return "chev#" + [...document.querySelectorAll(".chevron__media")].indexOf(el);
    if (el.classList.contains("about__img")) return "about";
    return null;
  };
  // whole card/chevron gets the affordance (the text overlay sits above the image)
  const imgEls = () => [...document.querySelectorAll(".card, .chevron, .about__img")];

  function enable() {
    editing = true;
    document.body.classList.add("mc-editing");
    eachText(document, (key, el) => { el.dataset.ek = key; el.setAttribute("contenteditable", "true"); el.spellcheck = false; el.classList.add("mc-ed"); });
    imgEls().forEach((el) => el.classList.add("mc-imgedit"));
    if (location.hash !== "#edit") history.replaceState(null, "", "#edit");
  }
  function disable() {
    editing = false;
    document.body.classList.remove("mc-editing", "mc-reveal-edit");
    document.querySelectorAll("[data-ek]").forEach((el) => { el.removeAttribute("contenteditable"); el.classList.remove("mc-ed"); });
    imgEls().forEach((el) => el.classList.remove("mc-imgedit"));
    if (location.hash === "#edit") history.replaceState(null, "", location.pathname);
  }
  const toggle = () => (editing ? disable() : enable());

  /* ---- text edits autosave ---- */
  let saveT;
  document.addEventListener("input", (e) => {
    if (!editing) return;
    const el = e.target.closest("[data-ek]");
    if (!el) return;
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      const m = loadMap(TKEY); m[el.dataset.ek] = el.innerHTML; saveMap(TKEY, m);
    }, 300);
  });

  /* ---- image replace (click a card / chevron / about image to swap it) ---- */
  document.addEventListener("click", (e) => {
    if (!editing) return;
    const cardOrChev = e.target.closest(".card, .chevron");
    const aboutImg = e.target.closest(".about__img");
    if (!cardOrChev && !aboutImg) return;

    // stop link cards from navigating away while editing
    if (e.target.closest("a.card")) e.preventDefault();

    // if the click landed on editable text, let them edit it (don't open the picker)
    if (e.target.closest("[data-ek]")) return;

    const host = aboutImg || (cardOrChev && cardOrChev.querySelector(".card__img, .chevron__media"));
    if (!host) return;

    e.preventDefault(); e.stopPropagation();
    currentImgKey = imgKeyFor(host);
    fileInput.value = ""; fileInput.click();
  }, true);

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file || !currentImgKey) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      const m = loadMap(IKEY); m[currentImgKey] = url; saveMap(IKEY, m);
      applyImages(document, { [currentImgKey]: url });
      fitCards();
      currentImgKey = null;
    };
    reader.readAsDataURL(file);
  });

  /* ---- toolbar actions ---- */
  bar.addEventListener("click", (e) => {
    const act = e.target.closest("button") && e.target.closest("button").dataset.act;
    if (!act) return;
    if (act === "done") return disable();
    if (act === "reset") {
      if (confirm("Discard all local edits and restore the original content?")) {
        localStorage.removeItem(TKEY); localStorage.removeItem(IKEY); location.reload();
      }
      return;
    }
    if (act === "building") { currentImgKey = "hero-building"; fileInput.value = ""; fileInput.click(); return; }
    if (act === "reveal") {
      document.body.classList.toggle("mc-reveal-edit");
      e.target.closest("button").classList.toggle("mc-on");
      return;
    }
    if (act === "export") exportHTML();
    if (act === "save") saveToDisk();
  });

  /* ---- save edits to disk via the local server (persists across reloads/browsers) ---- */
  async function saveToDisk() {
    const status = document.getElementById("mcSaveStatus");
    if (status) { status.textContent = "Saving…"; status.className = "mc-editbar__status"; }
    try {
      const res = await fetch("/__save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "home", text: loadMap(TKEY), img: loadMap(IKEY) }),
      });
      if (!res.ok) throw new Error();
      if (status) { status.textContent = "Saved ✓ — your changes will load every time now"; status.className = "mc-editbar__status is-ok"; }
    } catch {
      if (status) { status.textContent = "Save failed — local server not reachable. Use Export HTML instead."; status.className = "mc-editbar__status is-err"; }
    }
  }

  /* ---- export a clean, publishable index.html with edits baked in ---- */
  async function exportHTML() {
    try {
      const res = await fetch(location.pathname.endsWith("/") ? location.pathname + "index.html" : location.pathname, { cache: "no-store" });
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      applyText(doc, loadMap(TKEY));
      applyImages(doc, loadMap(IKEY));
      doc.querySelectorAll('script[src*="editor.js"], link[href*="editor.css"]').forEach((n) => n.remove());
      const out = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
      const blob = new Blob([out], { type: "text/html" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "index.html"; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    } catch (err) {
      alert("Export failed: " + err.message);
    }
  }

  /* ---- activation: Cmd/Ctrl+E, or #edit in the URL ---- */
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "e" || e.key === "E")) { e.preventDefault(); toggle(); }
  });
  if (location.hash === "#edit") enable();
})();
