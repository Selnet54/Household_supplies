const CACHE_NAME = 'zalihe-v100'; // Ovde svaki put povećaj broj (npr. v101, v102...)

self.addEventListener('install', event => {
    self.skipWaiting(); // Forsiraj instalaciju odmah
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
    );
    self.clients.claim(); // Preuzmi kontrolu nad svim tabovima odmah
});

self.addEventListener('fetch', event => {
    // Samo mreža, zaobiđi keš skroz dok ovo ne proradi
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});