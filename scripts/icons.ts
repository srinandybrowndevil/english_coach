// Generate PWA icons by screenshotting an inline SVG with Playwright (no sharp dep).
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const svg = (size: number, pad = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#6366f1"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.32 - pad}" fill="#fff"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui" font-weight="700" font-size="${size * 0.34}" fill="#6366f1">E</text>
</svg>`;

async function main() {
  const browser = await chromium.launch();
  const sizes: [string, number, number][] = [
    ['icon-192.png', 192, 0], ['icon-512.png', 512, 0],
    ['icon-maskable-512.png', 512, 40], ['apple-touch-icon.png', 180, 0],
  ];
  for (const [name, size, pad] of sizes) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(svg(size, pad));
    const buf = await page.locator('svg').screenshot();
    writeFileSync(`public/${name}`, buf);
    await page.close();
    console.log(name);
  }
  await browser.close();
}

void main();
