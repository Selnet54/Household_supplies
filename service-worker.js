const CACHE_NAME = 'zalihe-v102';

// Sve putanje moraju da vode ka fajlovima koji STVARNO POSTOJE
const urlsToCache = [
  '/Household_supplies/',
  '/Household_supplies/index.html',
  '/Household_supplies/script.js',        // ← PROMENJENO sa app.js
  '/Household_supplies/productParts.js',  // ← DODATO
  '/Household_supplies/manifest.json',
  '/Household_supplies/icons/logo.png',
  '/Household_supplies/icons/icon-192.png',
  '/Household_supplies/icons/jezici/srpski.png',
  '/Household_supplies/icons/jezici/engleski.png',
  '/Household_supplies/icons/jezici/nemacki.png',
  '/Household_supplies/icons/jezici/madjarski.png',
  '/Household_supplies/icons/jezici/ukrajinski.png',
  '/Household_supplies/icons/jezici/ruski.png',
  '/Household_supplies/icons/jezici/mandarinski.png',
  '/Household_supplies/icons/jezici/spanski.png',
  '/Household_supplies/icons/jezici/portugalski.png',
  '/Household_supplies/icons/jezici/francuski.png'
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
                    })
                    .catch(() => {
                        // Ako nema mreže, vrati index.html
                        return caches.match('/Household_supplies/index.html');
                    });
            })
    );
});
