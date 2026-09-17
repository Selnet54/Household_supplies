const CACHE_NAME = 'zalihe-v1';

self.addEventListener('install', (e) => {
  console.log('📦 SW install');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('📦 SW activate');
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // 🔥 OVO POKRIVA SVE PUTANJE
  e.respondWith(fetch(e.request));
});
