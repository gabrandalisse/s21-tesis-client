// Push notification handlers for service worker
// This file is imported by the main service worker

self.addEventListener('push', function(event) {
  console.log('[Worker] Push notification received:', event)

  if (!event.data) {
    console.log('[Worker] Push event but no data')
    return
  }

  try {
    let data;
    try {
      data = event.data.json()
    } catch (e) {
      data = {
        title: 'Petly Test',
        body: event.data.text() || 'Notificación de prueba recibida'
      }
    }
    console.log('[Worker] Push data:', data)

    const options = {
      body: data.body || 'Nueva notificación de Petly',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-72x72.png',
      data: data.data || {},
      tag: data.tag || 'petly-notification',
      requireInteraction: data.requireInteraction || false,
      vibrate: [200, 100, 200]
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'Petly', options)
    )
    
    console.log('[Worker] Notification shown:', data.title || 'Petly')
  } catch (error) {
    console.error('[Worker] Error handling push notification:', error)
  }
})

self.addEventListener('notificationclick', function(event) {
  console.log('[Worker] Notification clicked:', event)

  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if ('focus' in client) {
            return client.focus()
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

self.addEventListener('notificationclose', function(event) {
  console.log('[Worker] Notification closed:', event)
})

console.log('[Worker] Push notification handlers registered')
