// PWA utility functions

export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

export const isOnline = (): boolean => {
  return navigator.onLine
}

export const registerSW = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered successfully:', registration)
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }
  return null
}

export const checkForUpdates = async (registration: ServiceWorkerRegistration): Promise<boolean> => {
  try {
    await registration.update()
    return registration.waiting !== null
  } catch (error) {
    console.error('Failed to check for updates:', error)
    return false
  }
}

export const skipWaiting = (registration: ServiceWorkerRegistration): void => {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

// Cache management utilities
export const clearCache = async (): Promise<void> => {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    )
  }
}

export const getCacheSize = async (): Promise<number> => {
  if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return estimate.usage || 0
  }
  return 0
}

// Notification utilities
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if ('Notification' in window) {
    return await Notification.requestPermission()
  }
  return 'denied'
}

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    })
  }
}

// Share API utilities
export const canShare = (): boolean => {
  return 'share' in navigator
}

export const shareContent = async (data: ShareData): Promise<boolean> => {
  if (canShare()) {
    try {
      await navigator.share(data)
      return true
    } catch (error) {
      console.error('Error sharing:', error)
      return false
    }
  }
  return false
}