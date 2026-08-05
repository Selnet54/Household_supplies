const CACHE_NAME = 'zalihe-v109';

const urlsToCache = [
  '/Household_supplies/',
  '/Household_supplies/index.html',
  '/Household_supplies/script.js',
  '/Household_supplies/productParts.js',
  '/Household_supplies/manifest.json',
  '/Household_supplies/icons/logo.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Keširanje fajlova...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Svi fajlovi keširani');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Greška pri keširanju:', error);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) {
                    console.log('🗑️ Brisanje starog keša:', key);
                    return caches.delete(key);
                }
            }));
        }).then(() => {
            console.log('✅ Service Worker aktiviran');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {
    // IGNORIŠI chrome-extension zahteve
    if (event.request.url.startsWith('chrome-extension')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    })
                    .catch(() => {
                        return caches.match('/Household_supplies/index.html');
                    });
            })
    );
});
