/* English Mastery OS service worker — v1 */
const VERSION = 'v1';
const SHELL = ['/', '/offline', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/')) return; // never cache API
  if (url.pathname.startsWith('/_next/static')) {
    e.respondWith(caches.match(e.request).then((r) => r ?? fetch(e.request).then((res) => {
      const clone = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, clone));
      return res;
    })));
    return;
  }
  // network-first for pages; fall back to cached copy or /offline
  e.respondWith(
    fetch(e.request).then((res) => {
      if (e.request.mode === 'navigate') {
        const clone = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then((r) => r ?? caches.match('/offline'))),
  );
});
