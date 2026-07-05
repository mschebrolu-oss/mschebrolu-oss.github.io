/* ===========================================================
   Portable local server for the MC portfolio.
   Works on Windows, macOS and Linux — no paths to edit.

   Run it from inside this folder:
       node server.js
   Then open:  http://localhost:4599

   Serves the site AND powers the Edit Mode "Save" button
   (writes your edits to content-overrides.json).
   =========================================================== */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;                                   // this folder — portable
const OVERRIDES = path.join(ROOT, "content-overrides.json");
const PORT = process.env.PORT || 4599;
const TYPES = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".ico": "image/x-icon", ".gif": "image/gif", ".woff2": "font/woff2",
};

http.createServer((req, res) => {
  // ---- Edit Mode: save edits to disk ----
  if (req.method === "POST" && req.url === "/__save") {
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 60 * 1024 * 1024) req.destroy(); });
    req.on("end", () => {
      try {
        const incoming = JSON.parse(body);
        let data = { text: {}, img: {}, proj: {} };
        try { data = JSON.parse(fs.readFileSync(OVERRIDES, "utf8")); } catch {}
        data.text = data.text || {}; data.img = data.img || {}; data.proj = data.proj || {};
        if (incoming.scope === "proj" && incoming.slug) {
          data.proj[incoming.slug] = { text: incoming.text || {}, img: incoming.img || {} };
        } else {
          data.text = { ...data.text, ...(incoming.text || {}) };
          data.img = { ...data.img, ...(incoming.img || {}) };
        }
        fs.writeFileSync(OVERRIDES, JSON.stringify(data));
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end('{"ok":true}');
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end('{"ok":false}');
      }
    });
    return;
  }

  // ---- static files ----
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end("forbidden"); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  });
}).listen(PORT, () => console.log(`MC portfolio running →  http://localhost:${PORT}`));
