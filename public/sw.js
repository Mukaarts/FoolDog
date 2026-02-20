/**
 * FoolDog Service Worker
 * Provides offline support and asset caching for the PWA.
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `fooldog-static-${CACHE_VERSION}`;
const API_CACHE = `fooldog-api-${CACHE_VERSION}`;
const PAGE_CACHE = `fooldog-pages-${CACHE_VERSION}`;

const STATIC_ASSETS_PATTERN = /\/build\//;
const API_PATTERN = /\/api\//;
const ICON_PATTERN = /\/icons\//;

// Offline fallback for when a joke fetch fails
const OFFLINE_JOKES = [
    {
        id: 0,
        content: 'Firwat kann den Hond keen Computer benotzen? Well hien Angst virum Cat-scan huet! 🐾',
        emoji: '🐶',
        author: 'FoolDog Offline',
        createdAt: null
    }
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(PAGE_CACHE).then((cache) =>
            cache.addAll(['/'])
        ).then(() => self.skipWaiting())
    );
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
    const allowedCaches = [STATIC_CACHE, API_CACHE, PAGE_CACHE];
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => !allowedCaches.includes(key))
                    .map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin requests
    if (url.origin !== self.location.origin) return;

    // Static assets (Webpack build artefacts) — cache-first
    if (STATIC_ASSETS_PATTERN.test(url.pathname) || ICON_PATTERN.test(url.pathname)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // API calls — network-first, fall back to cache, then offline stub
    if (API_PATTERN.test(url.pathname)) {
        event.respondWith(networkFirstApi(request));
        return;
    }

    // HTML pages — network-first, fall back to cached page
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirstPage(request));
        return;
    }
});

// ─── Strategies ───────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
    }
    return response;
}

async function networkFirstApi(request) {
    const cache = await caches.open(API_CACHE);

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await cache.match(request);
        if (cached) return cached;

        // Return offline stub for /api/jokes
        if (request.url.includes('/api/jokes')) {
            return new Response(JSON.stringify(OFFLINE_JOKES), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function networkFirstPage(request) {
    const cache = await caches.open(PAGE_CACHE);

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await cache.match(request);
        if (cached) return cached;

        // Last resort: serve cached home page
        return cache.match('/');
    }
}
