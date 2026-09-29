// Phase 5 screenshots — sets the sid cookie created during the curl smoke.
import { mkdirSync, readFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

async function main() {
  const cookieLine = readFileSync('.data/cookies.txt', 'utf8')
    .split('\n').find((l) => l.includes('\tsid\t'));
  if (!cookieLine) throw new Error('no sid cookie in .data/cookies.txt');
  const sid = cookieLine.split('\t').pop()!.trim();

  mkdirSync('.data/screenshots', { recursive: true });
  mkdirSync('qa-shots', { recursive: true });

  const routes: [string, string][] = [
    ['mistakes', 'mistakes'], ['grammar/lesson-past-simple', 'grammar-lesson'],
    ['vocabulary/review', 'vocabulary-review'], ['pronunciation', 'pronunciation'],
    ['tongue-twisters', 'tongue-twisters'], ['listening', 'listening'],
  ];

  const browser = await chromium.launch();
  for (const width of [1280, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await ctx.addCookies([{ name: 'sid', value: sid, domain: 'localhost', path: '/', httpOnly: true }]);
    const page = await ctx.newPage();
    for (const [route, name] of routes) {
      await page.goto(`http://localhost:3000/${route}`, { waitUntil: 'networkidle' });
      const f = `phase5-${name}-${width}.png`;
      await page.screenshot({ path: path.join('.data/screenshots', f), fullPage: true });
      copyFileSync(path.join('.data/screenshots', f), path.join('qa-shots', f));
      console.log(f);
    }
    await ctx.close();
  }
  await browser.close();
}

void main();
