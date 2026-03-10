const fs = require("fs");
const path = require("path");

function generateSvgIcon(size) {
  const fontSize = Math.round(size * 0.35);
  const subtitleSize = Math.round(size * 0.1);
  const bgColor = "#1E40AF";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="${bgColor}"/>
  <text x="50%" y="42%" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-weight="bold" font-size="${fontSize}" fill="white">&#x271D;</text>
  <text x="50%" y="72%" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-weight="bold" font-size="${subtitleSize}" fill="white">SBAC</text>
</svg>`;
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const dir = path.join(__dirname, "..", "frontend", "public", "icons");

fs.mkdirSync(dir, { recursive: true });

sizes.forEach((s) => {
  const svg = generateSvgIcon(s);
  fs.writeFileSync(path.join(dir, `icon-${s}x${s}.svg`), svg);
  console.log(`Created icon-${s}x${s}.svg`);
});

// Shortcut icons
["events", "messages", "announcements"].forEach((name) => {
  const svg = generateSvgIcon(96);
  fs.writeFileSync(path.join(dir, `${name}-96x96.svg`), svg);
  console.log(`Created ${name}-96x96.svg`);
});

console.log("Done!");
