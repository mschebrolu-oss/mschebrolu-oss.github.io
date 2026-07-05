/* ===========================================================
   Edit Mode for case-study pages (project.html).
   Scoped per project slug so each page saves separately.
   • Toggle: Cmd/Ctrl + E, or open with #edit
   • Click text to edit · click the hero or a gallery image to replace
   • Saves to this browser (localStorage), per slug
   • "Copy data" copies this project's text as JSON to paste into
     js/projects-data.js (to make it permanent)
   Runs AFTER project.js has populated the page.
   =========================================================== */
(() => {
  "use strict";
  const slug = new URLSearchParams(location.search).get("slug") || "unknown";
  const TKEY = `mc-proj:${slug}:text`;
  const IKEY = `mc-proj:${slug}:img`;
  const TEXT_SELECTORS = [".pp-tag", ".pp-title", ".pp-intro", ".pp-meta__v", ".pp-scope li", ".pp-out b", ".pp-out span"];

  const loadMap = (k) => { try { return JSON.parse(localStorage.getItem(k) || "{}"); } catch { return {}; } };
  const saveMap = (k, m) => { try { localStorage.setItem(k, JSON.stringify(m)); return true; } catch { alert("This browser's storage is full — that image is too large to keep locally. Host it and set the URL in js/projects-data.js instead."); return false; } };
  const eachText = (cb) => { TEXT_SELECTORS.forEach((sel) => document.querySelectorAll(sel).forEach((el, i) => cb(sel + "#" + i, el))); };

  function applyText(map) { eachText((key, el) => { if (map[key] != null) el.innerHTML = map[key]; }); }
  // size a tile to the image's real proportions so full extents always show
  const fit = window.__ppFit || ((el, url) => {
    const im = new Image();
    im.onload = () => { if (im.naturalWidth && im.naturalHeight) { el.style.aspectRatio = im.naturalWidth + " / " + im.naturalHeight; el.style.height = "auto"; } };
    im.src = url;
  });
  function applyImages(map) {
    if (map.hero) { const h = document.getElementById("ppHero"); if (h) { h.style.backgroundImage = `url("${map.hero}")`; fit(h, map.hero); } }
    document.querySelectorAll(".pp-gallery div").forEach((el, i) => { if (map["g" + i]) { el.style.backgroundImage = `url("${map["g" + i]}")`; fit(el, map["g" + i]); } });
  }
  // re-apply this browser's saved edits on every load
  applyText(loadMap(TKEY));
  applyImages(loadMap(IKEY));

  // also load edits saved to disk for this project (survive browser/session resets)
  fetch("content-overrides.json", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      const p = d && d.proj && d.proj[slug];
      if (!p) return;
      const mt = { ...(p.text || {}), ...loadMap(TKEY) };
      const mi = { ...(p.img || {}), ...loadMap(IKEY) };
      try { localStorage.setItem(TKEY, JSON.stringify(mt)); localStorage.setItem(IKEY, JSON.stringify(mi)); } catch {}
      applyText(mt); applyImages(mi);
    })
    .catch(() => {});

  /* toolbar */
  const bar = document.createElement("div");
  bar.className = "mc-editbar";
  bar.innerHTML =
    '<span class="mc-editbar__brand">✎ Edit mode</span>' +
    '<span class="mc-editbar__hint">Click text to edit · click the hero or a gallery image to replace</span>' +
    '<button data-act="hero">⤓ Hero image</button>' +
    '<button data-act="reset">Reset page</button>' +
    '<button data-act="copy">⧉ Copy data</button>' +
    '<button data-act="save" class="mc-primary">💾 Save</button>' +
    '<button data-act="done">Done</button>' +
    '<span class="mc-editbar__status" id="mcSaveStatus"></span>';
  document.body.appendChild(bar);

  const fileInput = document.createElement("input");
  fileInput.type = "file"; fileInput.accept = "image/*"; fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  let editing = false, curImg = null;

  function enable() {
    editing = true;
    document.body.classList.add("mc-editing");
    eachText((key, el) => { el.dataset.ek = key; el.setAttribute("contenteditable", "true"); el.spellcheck = false; el.classList.add("mc-ed"); });
    document.querySelectorAll("#ppHero, .pp-gallery div").forEach((el) => el.classList.add("mc-imgedit"));
  }
  function disable() {
    editing = false;
    document.body.classList.remove("mc-editing");
    document.querySelectorAll("[data-ek]").forEach((el) => { el.removeAttribute("contenteditable"); el.classList.remove("mc-ed"); });
    document.querySelectorAll(".mc-imgedit").forEach((el) => el.classList.remove("mc-imgedit"));
  }
  const toggle = () => (editing ? disable() : enable());

  /* text autosave */
  let t;
  document.addEventListener("input", (e) => {
    if (!editing) return;
    const el = e.target.closest("[data-ek]");
    if (!el) return;
    clearTimeout(t);
    t = setTimeout(() => { const m = loadMap(TKEY); m[el.dataset.ek] = el.innerHTML; saveMap(TKEY, m); }, 300);
  });

  /* image replace */
  document.addEventListener("click", (e) => {
    if (!editing) return;
    const hero = e.target.closest("#ppHero");
    const g = e.target.closest(".pp-gallery div");
    if (!hero && !g) return;
    if (e.target.closest("[data-ek]")) return;
    e.preventDefault(); e.stopPropagation();
    curImg = hero ? "hero" : "g" + [...document.querySelectorAll(".pp-gallery div")].indexOf(g);
    fileInput.value = ""; fileInput.click();
  }, true);

  fileInput.addEventListener("change", () => {
    const f = fileInput.files && fileInput.files[0];
    if (!f || curImg == null) return;
    const r = new FileReader();
    r.onload = () => { const m = loadMap(IKEY); m[curImg] = r.result; saveMap(IKEY, m); applyImages({ [curImg]: r.result }); curImg = null; };
    r.readAsDataURL(f);
  });

  /* toolbar actions */
  bar.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const act = b.dataset.act;
    if (act === "done") return disable();
    if (act === "hero") { curImg = "hero"; fileInput.value = ""; fileInput.click(); return; }
    if (act === "reset") {
      if (confirm("Discard local edits for this project page?")) { localStorage.removeItem(TKEY); localStorage.removeItem(IKEY); location.reload(); }
      return;
    }
    if (act === "copy") copyData();
    if (act === "save") saveToDisk();
  });

  async function saveToDisk() {
    const status = document.getElementById("mcSaveStatus");
    if (status) { status.textContent = "Saving…"; status.className = "mc-editbar__status"; }
    try {
      const res = await fetch("/__save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "proj", slug, text: loadMap(TKEY), img: loadMap(IKEY) }),
      });
      if (!res.ok) throw new Error();
      if (status) { status.textContent = "Saved ✓ — loads every time now"; status.className = "mc-editbar__status is-ok"; }
    } catch {
      if (status) { status.textContent = "Save failed — local server not reachable."; status.className = "mc-editbar__status is-err"; }
    }
  }

  function copyData() {
    const text = (id) => { const el = document.getElementById(id); return el ? el.textContent.trim() : ""; };
    const meta = {};
    document.querySelectorAll(".pp-meta div").forEach((d) => {
      const k = (d.querySelector(".pp-meta__k") || {}).textContent;
      const v = (d.querySelector(".pp-meta__v") || {}).textContent;
      if (k && v) meta[k.trim().toLowerCase()] = v.trim();
    });
    const scope = [...document.querySelectorAll(".pp-scope li")].map((li) => li.textContent.trim());
    const outcomes = [...document.querySelectorAll(".pp-out")].map((o) => [
      (o.querySelector("b") || {}).textContent.trim(),
      (o.querySelector("span") || {}).textContent.trim(),
    ]);
    const entry = {
      [slug]: {
        title: text("ppTitle"), tag: text("ppTag"),
        role: meta.role || "", location: meta.location || "", year: meta.year || "", value: meta.value || "",
        intro: text("ppIntro"),
        scope, outcomes,
        "// images": "set hero + gallery URLs here (host the files in /img or paste links)",
      },
    };
    const out = JSON.stringify(entry, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(out).then(
        () => alert("Copied this project's content as JSON.\nPaste it into js/projects-data.js (replacing the matching slug), then add your hero/gallery image URLs."),
        () => window.prompt("Copy this into js/projects-data.js:", out)
      );
    } else { window.prompt("Copy this into js/projects-data.js:", out); }
  }

  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "e" || e.key === "E")) { e.preventDefault(); toggle(); }
  });
  if (location.hash === "#edit") enable();
})();
