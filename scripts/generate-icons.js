const fs = require("fs");
const path = require("path");

/**
 * PWA Icon Generation Script (legacy — shortcut SVGs only)
 *
 * Main icons (PNG): generated via headless Chromium from church-logo.svg.
 *   Run:  node scripts/generate-icons.cjs
 *
 * This file only handles shortcut icons and is kept for reference.
 *
 * To regenerate PNG icons, run from the repo root:
 *   pwsh scripts/generate-icons.ps1
 *
 * Shortcut icons use Lucide icon paths (matching lucide-react used in the app):
 *   events:        Calendar icon
 *   messages:      Mail icon
 *   announcements: Bell icon
 */

/** events-96x96.svg — Lucide Calendar */
function generateEventsIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="12" fill="#1E40AF"/>
  <svg x="18" y="18" width="60" height="60" viewBox="0 0 24 24"
       fill="none" stroke="white" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
</svg>`;
}

/** messages-96x96.svg — Lucide Mail */
function generateMessagesIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="12" fill="#1E40AF"/>
  <svg x="18" y="18" width="60" height="60" viewBox="0 0 24 24"
       fill="none" stroke="white" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
</svg>`;
}

/** announcements-96x96.svg — Lucide Bell */
function generateAnnouncementsIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="12" fill="#1E40AF"/>
  <svg x="18" y="18" width="60" height="60" viewBox="0 0 24 24"
       fill="none" stroke="white" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
</svg>`;
}

// ── Output directory ───────────────────────────────────────────────────────
const dir = path.join(__dirname, "..", "frontend", "public", "icons");
fs.mkdirSync(dir, { recursive: true });

// NOTE: PNG main icons (72, 96, 128, 144, 152, 192, 384, 512) are generated
// by scripts/generate-icons.ps1 using PowerShell System.Drawing from
// frontend/public/church-logo.png. Run that script to regenerate them.

// Shortcut icons — self-contained SVG, no external refs
fs.writeFileSync(path.join(dir, "events-96x96.svg"), generateEventsIcon());
console.log("Created events-96x96.svg");

fs.writeFileSync(path.join(dir, "messages-96x96.svg"), generateMessagesIcon());
console.log("Created messages-96x96.svg");

fs.writeFileSync(
  path.join(dir, "announcements-96x96.svg"),
  generateAnnouncementsIcon(),
);
console.log("Created announcements-96x96.svg");

console.log("Done!");
