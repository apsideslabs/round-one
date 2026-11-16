/* Round One — offline shell. Cache-first for the app, network-first for nothing else. */
const CACHE = 'round-one-v2'
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  // Navigations: network first, so a new deploy is picked up on the next visit.
  // A cached shell pointing at asset hashes that no longer exist is a blank page.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put('./index.html', copy)).catch(() => {})
          return res
        })
        .catch(() => caches.match('./index.html').then((hit) => hit ?? caches.match('./')))
    )
    return
  }

  // Hashed assets never change under the same name: cache first is safe.
  event.respondWith(
    caches.match(event.request).then((hit) => {
      if (hit) return hit
      return fetch(event.request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {})
          return res
        })
        .catch(() => undefined)
    })
  )
})
