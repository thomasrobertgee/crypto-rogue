// Progressive Web App Service Worker for Crypto Rogues
const CACHE_NAME = 'crypto-rogues-shell-v1'

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon.svg',
]

// 1. Install lifecycle: Pre-cache core app shell assets & activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CORE_ASSETS).catch((err) => {
          console.warn('[ServiceWorker] Pre-cache partial warning:', err)
        })
      })
      .then(() => self.skipWaiting()),
  )
})

// 2. Activate lifecycle: Clean up older cache versions and take immediate client control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// 3. Fetch lifecycle: Network-first for dynamic navigation, stale-while-revalidate for static assets
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  // Skip browser extension schemes or non-http protocols
  if (!url.protocol.startsWith('http')) return

  // For HTML navigation requests (app root / pages)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone))
          }
          return networkRes
        })
        .catch(() => {
          return caches.match('/index.html').then((cached) => cached || caches.match('/'))
        }),
    )
    return
  }

  // For static assets (images, icons, manifest): Cache first with network background update
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Asynchronously fetch fresh version in the background
        fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkRes))
            }
          })
          .catch(() => {})
        return cachedResponse
      }

      return fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone))
          }
          return networkRes
        })
        .catch((err) => {
          // If offline and requesting an icon, provide SVG fallback
          if (url.pathname.includes('/icons/')) {
            return caches.match('/icons/icon.svg')
          }
          throw err
        })
    }),
  )
})
