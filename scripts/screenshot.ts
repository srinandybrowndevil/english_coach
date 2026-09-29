// Phase 3 screenshots — sets the sid cookie created during the curl smoke.
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

async function main() {
  const cookieLine = readFileSync('.data/cookies.txt', 'utf8')
    .split('\n').find((l) => l.includes('\tsid\t'));
  if (!cookieLine) throw new Error('no sid cookie in .data/cookies.txt');
  const sid = cookieLine.split('\t').pop()!.trim();

  mkdirSync('.data/screenshots', { recursive: true });

  const browser = await chromium.launch();
  for (const width of [1280, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await ctx.addCookies([{ name: 'sid', value: sid, domain: 'localhost', path: '/', httpOnly: true }]);
    const page = await ctx.newPage();
    for (const route of ['tutor', 'speak', 'fluency']) {
      await page.goto(`http://localhost:3000/${route}`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join('.data/screenshots', `phase3-${route}-${width}.png`), fullPage: true });
      console.log(`phase3-${route}-${width}.png`);
    }
    await ctx.close();
  }
  await browser.close();
}

void main();
