self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Basic network-first handler for navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/')))
  }
})

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { body: event.data ? event.data.text() : '' }
  }

  const title = typeof payload.title === 'string' && payload.title ? payload.title : 'Panthera crew update'
  const body = typeof payload.body === 'string' ? payload.body : ''
  const path = typeof payload.url === 'string' && payload.url.startsWith('/') && !payload.url.startsWith('//') && !payload.url.includes('\\')
    ? payload.url
    : '/'

  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const visibleClient = clients.find((client) => client.visibilityState === 'visible')
    if (visibleClient) {
      visibleClient.postMessage({ type: 'PUSH_ALERT', title, body, url: path })
      return
    }
    return self.registration.showNotification(title, {
      body,
      icon: '/scout.png',
      badge: '/scout.png',
      data: { path }
    })
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const destination = new URL(event.notification.data?.path || '/', self.location.origin)
  const path = destination.origin === self.location.origin ? destination.href : `${self.location.origin}/`

  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const existing = clients.find((client) => new URL(client.url).origin === self.location.origin)
    if (existing) return existing.navigate(path).then((client) => client?.focus())
    return self.clients.openWindow(path)
  }))
})
