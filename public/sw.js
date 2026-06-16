const CACHE = 'quiron-v2'
const STATIC = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', e => {
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {})))
})

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // Pass through non-GET, cross-origin and API requests
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/_next/')) {
    // Cache-first for Next.js static chunks
    e.respondWith(
      caches.match(request).then(r => r ?? fetch(request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(request, res.clone()))
        return res
      }))
    )
    return
  }
  // Network-first for pages (always fresh, fallback to cache offline)
  e.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})
