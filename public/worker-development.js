/******/ (() => { // webpackBootstrap
// Push notification handlers for service worker
// This file is imported by the main service worker

self.addEventListener('push', function (event) {
  console.log('[Worker] Push notification received:', event);
  if (!event.data) {
    console.log('[Worker] Push event but no data');
    return;
  }
  try {
    const data = event.data.json();
    console.log('[Worker] Push data:', data);
    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-72x72.png',
      data: data.data,
      tag: data.tag,
      requireInteraction: data.requireInteraction || false,
      vibrate: [200, 100, 200]
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
    console.log('[Worker] Notification shown:', data.title);
  } catch (error) {
    console.error('[Worker] Error handling push notification:', error);
  }
});
self.addEventListener('notificationclick', function (event) {
  var _event$notification$d;
  console.log('[Worker] Notification clicked:', event);
  event.notification.close();
  if (event.action === 'close') {
    return;
  }
  const urlToOpen = ((_event$notification$d = event.notification.data) === null || _event$notification$d === void 0 ? void 0 : _event$notification$d.url) || '/';
  event.waitUntil(clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(function (clientList) {
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if ('focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen);
    }
  }));
});
self.addEventListener('notificationclose', function (event) {
  console.log('[Worker] Notification closed:', event);
});
console.log('[Worker] Push notification handlers registered');
/******/ })()
;