const CACHE_NAME = 'zalihe-v101';

// Sve putanje moraju da vode ka fajlovima
const urlsToCache = [
  '/Household_supplies/',
  '/Household_supplies/index.html',
  '/Household_supplies/app.js',
  '/Household_supplies/style.css',
  '/Household_supplies/manifest.json',
  '/Household_supplies/icons/logo.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Keširanje fajlova...');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) {
                    console.log('Brisanje starog keša:', key);
                    return caches.delete(key);
                }
            }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Ako postoji u kešu, vrati keširano
                if (response) {
                    return response;
                }
                // Ako nema u kešu, idi na mrežu
                return fetch(event.request)
                    .then(response => {
                        // Ako je validan odgovor, sačuvaj u keš
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    });
            })
    );
});
