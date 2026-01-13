// Service Worker pour TeacherTrack PWA
const CACHE_NAME = 'teachertrack-v2';
const STATIC_ASSETS = [
    './',
    './index.html',
    './tailwind.css',
    './fontawesome.min.css',
    './vue.global.js',
    './xlsx.full.min.js',
    './manifest.json',
    './Logo-TeacherTrack-Transparent.png'
];

// Installer le Service Worker et mettre en cache les fichiers statiques
self.addEventListener('install', (event) => {
    console.log('[SW] Installation du Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Mise en cache des fichiers statiques...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Tous les fichiers sont mis en cache');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Erreur lors de la mise en cache:', error);
            })
    );
});

// Activer le Service Worker et nettoyer les anciens caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activation du Service Worker...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Suppression de l\'ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Claiming clients...');
                return self.clients.claim();
            })
    );
});

// Stratégie de cache pour les requêtes
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Ignorer les requêtes Blob URLs (utilisées pour les téléchargements)
    if (url.protocol === 'blob:') {
        console.log('[SW] Ignorée (Blob URL):', event.request.url);
        return;
    }

    // Ignorer les requêtes vers d'autres domaines (CDN externes)
    if (url.origin !== location.origin) {
        console.log('[SW] Ignorée ( origine externe):', url.origin);
        return;
    }

    // Stratégie: Network First, avec fallback sur le cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si la requête réseau réussit, mettre à jour le cache
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                }
                return response;
            })
            .catch(() => {
                // Si pas de réseau, essayer le cache
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('[SW] Servi depuis le cache:', event.request.url);
                            return cachedResponse;
                        }

                        // Si c'est une navigation et rien en cache, retourner la page d'accueil
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }

                        console.log('[SW] Pas de cache pour:', event.request.url);
                        return new Response('Hors ligne', { status: 503, statusText: 'Service Unavailable' });
                    });
            })
    );
});

// Message depuis l'application principale
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
