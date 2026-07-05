# MC — BIM Technician & Civil Engineer Portfolio

A premium, single-page, fully-animated portfolio. No build step, no framework — just
`index.html`, `css/styles.css`, and `js/main.js`. Drop it on any static host
(Netlify, Vercel, GitHub Pages, S3) and it runs.

## Run it on any computer (Windows / Mac / Linux)

The whole `civil-portfolio` folder is self-contained and portable — copy it anywhere.

1. Install **Node.js** (nodejs.org) — one time.
2. Open a terminal **in this folder** (on Windows: right-click the folder → "Open in Terminal",
   or `cd` into it in Command Prompt / PowerShell).
3. Run:  `node server.js`
4. Open **http://localhost:4599** in your browser.

`server.js` is path-independent (uses its own folder), so it works identically on every OS and
powers the Edit Mode **Save** button. If you don't need Save, any static server works too
(`npx serve`, VS Code "Live Server", `python -m http.server 4599`).

## Design system
- **Style:** Liquid-glass / atmospheric editorial
- **Type:** Archivo (display) + Space Grotesk (body) — via Google Fonts
- **Palette:** near-black `#09090B` / paper `#F7F7F5` / electric blue `#2563EB`

## Motion choreography (as specced)
| # | Effect | Where |
|---|--------|-------|
| 1 | **Pinned hero scroll-sequence** — a tall (`240vh`) hero with a `position: sticky` stage. Scroll progress `p` (0→1) drives the whole choreography in `render()` | `.hero`, `.hero__stage` |
| 1 | **Full-bleed building + zoom** — the `MC` render fills the page; it zooms in (`BUILD_ZOOM`) as you scroll, with drifting clouds feathering the top & bottom edges | `#heroBuilding`, `.hero__clouds` |
| 1 | **Title rise + cloud reveal** — "MC / Build with me" lifts and fades, clouds roll up and fill the frame, then the brand word **BUILD** forms out of the building image (background-clipped text) over white — blending straight into the next section | `#heroContent`, `#heroReveal` |
| 2 | **Staggered fade-and-rise** — `+30px → 0`, opacity `0 → 1`, `cubic-bezier(.25,1,.5,1)` 0.8s, triggered at bottom 20% of viewport | `.reveal` + `IntersectionObserver` |
| 3 | **Chevron sequence** — `>>>` masks reveal left→right with staggered delay; hover scales image 1.05× and sharpens contrast | `.chevron` |
| 4 | **Magnetic button arrows** — arrow nudges right on hover + pointer pull | `.btn`, magnetic handler in `main.js` |
| 4 | **Testimonial pagination** — old quote fades out left, new fades in from right, soft cross-fade | `#quoteStage` / `.pagination` |

Plus: scroll progress bar, glass nav that frosts on scroll, animated stat counters.

**Accessibility:** all motion is disabled under `prefers-reduced-motion: reduce`,
focus states are visible, the masked word keeps a real text label, and there's no
horizontal scroll from 375px up.

## Make it yours
1. **Content** — names, projects, stats, testimonials live as plain text in `index.html`.
2. **Hero building** — replace `img/hero-building.jpg` with your own render (keep the
   same filename). Portrait orientation works best; the top of the photo's sky is
   auto-faded into the clouds via a CSS mask so it "emerges" from the haze.
3. **Other images** — the project/process/about photos are placeholder Unsplash URLs on
   `background-image`s. Replace with the technician's real project photos.
4. **Contact** — update the `mailto:`, `tel:` and location in the contact section.

## Edit Mode (edit text & images in the browser)

A lightweight, built-in editor for changing copy and images without touching code.

- **Open it:** press **⌘/Ctrl + E**, or add `#edit` to the URL.
- **Edit text:** click any headline, paragraph or label and type.
- **Replace an image:** click any project / process / about image and pick a file.
  Use the **Building image** toolbar button to swap the hero render.
- **Reveal text:** the toolbar **Reveal text** button surfaces the big BIM / role lines so you can edit them.
- **Save (💾):** writes your edits to `content-overrides.json` on disk via the local server, so they
  **load every time you open the site** — on any browser, even after clearing browser storage.
  *(Requires the local `serve.js` server running. Click Save after making changes.)*
- **Publish:** `content-overrides.json` travels with the site, so a static host will show your saved
  edits too. Or click **Export HTML** to bake everything into a clean standalone `index.html`.
- Project case-study pages have their own **Save** (stored per slug in the same file).
- **Reset:** the **Reset** button discards all local edits and restores the original.

> Edit Mode is a drafting tool — edits live in your browser until you Export. To remove the editor
> entirely for the public site, delete the `css/editor.css` and `js/editor.js` includes (Export already does this).

## Before you launch (2-minute checklist)

1. **Contact form** — create a free form at [formspree.io](https://formspree.io), then set the
   `action` on `#contactForm` in `index.html` to your endpoint (`https://formspree.io/f/XXXX`).
   Until then the form falls back to opening the visitor's email app.
2. **Domain** — find-and-replace `https://your-domain.com` in `index.html` (OG/canonical/JSON-LD),
   `sitemap.xml` and `robots.txt` with your real URL.
3. **Remove Edit Mode** for the public build (optional) — delete the `css/editor.css` and
   `js/editor.js` includes (the in-editor **Export HTML** already strips them).

## What's in here

| Area | Files |
|------|-------|
| Home page | `index.html`, `css/styles.css`, `js/main.js` |
| Smooth scroll + intro loader | `js/intro.js` (Lenis via CDN) |
| Cursor spotlight | `js/fx.js` |
| Contact form | `js/form.js` |
| Edit Mode | `css/editor.css`, `js/editor.js` |
| Case-study pages | `project.html`, `css/project.css`, `js/project.js`, `js/projects-data.js` |
| Launch kit | `favicon.svg`, `site.webmanifest`, `404.html`, `robots.txt`, `sitemap.xml` |

**Project case studies:** all content lives in `js/projects-data.js` — edit titles, copy, stats and
image URLs there; each entry powers `project.html?slug=<slug>` and its home-page card.

**Hero image:** optimised to ~185 KB JPEG (`img/hero-building.jpg`); the original upload is kept as
`img/hero-building-original.png`.

## Run locally
Any static server works, e.g. `npx serve civil-portfolio` then open the printed URL.
