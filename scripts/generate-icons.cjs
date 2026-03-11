/**
 * PWA Icon Generator — renders church-logo.svg via headless Chromium
 * for pixel-perfect PNG icons at all required sizes.
 *
 * Usage:  node scripts/generate-icons.cjs
 * Requires: `playwright` npm package (already installed as devDep)
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const SVG_PATH = path.resolve(
  __dirname,
  "..",
  "frontend",
  "public",
  "church-logo.svg",
);
const OUT_DIR = path.resolve(__dirname, "..", "frontend", "public", "icons");

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Read SVG so we can embed it directly — avoids file:// cross-origin issues
  const svgContent = fs.readFileSync(SVG_PATH, "utf8");
  // Encode for a data URI (Chromium handles large data URIs fine)
  const svgBase64 = Buffer.from(svgContent).toString("base64");
  const dataUri = `data:image/svg+xml;base64,${svgBase64}`;

  const browser = await chromium.launch();

  for (const size of SIZES) {
    const page = await browser.newPage();

    // Set exact viewport — screenshot will be exactly size×size
    await page.setViewportSize({ width: size, height: size });

    // HTML: white background removed (transparent), SVG fills the entire viewport
    await page.setContent(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; }
  img { width: ${size}px; height: ${size}px; display: block; }
</style>
</head>
<body>
  <img src="${dataUri}" width="${size}" height="${size}" />
</body>
</html>`);

    // Wait for image to fully render
    await page.waitForFunction(() => {
      const img = document.querySelector("img");
      return img && img.complete && img.naturalWidth > 0;
    });

    const outPath = path.join(OUT_DIR, `icon-${size}x${size}.png`);
    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: size, height: size },
    });
    await page.close();

    const fileSize = fs.statSync(outPath).size;
    console.log(
      `  icon-${size}x${size}.png  (${Math.round(fileSize / 1024)}KB)`,
    );
  }

  await browser.close();

  // Shortcut icons — self-contained SVG, matching lucide-react icons used in app
  function shortcutIcon(lucidePaths) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="12" fill="#1E40AF"/>
  <svg x="18" y="18" width="60" height="60" viewBox="0 0 24 24"
       fill="none" stroke="white" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    ${lucidePaths}
  </svg>
</svg>`;
  }

  // events: Lucide Calendar
  fs.writeFileSync(
    path.join(OUT_DIR, "events-96x96.svg"),
    shortcutIcon(`<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>`),
  );

  // messages: Lucide Mail
  fs.writeFileSync(
    path.join(OUT_DIR, "messages-96x96.svg"),
    shortcutIcon(`<rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`),
  );

  // announcements: Lucide Bell
  fs.writeFileSync(
    path.join(OUT_DIR, "announcements-96x96.svg"),
    shortcutIcon(`<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>`),
  );

  console.log(
    "  events-96x96.svg, messages-96x96.svg, announcements-96x96.svg",
  );
  console.log("\nDone. All icons written to frontend/public/icons/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
