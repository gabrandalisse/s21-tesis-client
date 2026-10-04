import { config } from '@/config'

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

// Push notification utilities
export const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  try {
    console.log('🔔 Starting push notification subscription...')
    
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.error('Service Worker not supported')
      alert('Tu navegador no soporta notificaciones push')
      return null
    }

    if (!('PushManager' in window)) {
      console.error('Push notifications not supported')
      alert('Tu navegador no soporta notificaciones push')
      return null
    }

    // Request notification permission first
    console.log('🔔 Requesting notification permission...')
    const permission = await requestNotificationPermission()
    console.log('Permission result:', permission)
    
    if (permission !== 'granted') {
      console.log('❌ Notification permission denied')
      alert('Necesitas permitir las notificaciones para continuar')
      return null
    }

    // Register service worker if not already registered
    console.log('⏳ Checking service worker registration...')
    let registration = await navigator.serviceWorker.getRegistration()
    
    if (!registration) {
      console.log('📝 Registering service worker...')
      registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      console.log('✅ Service worker registered')
      
      // Wait for it to be ready
      await navigator.serviceWorker.ready
      console.log('✅ Service worker ready')
    } else {
      console.log('✅ Service worker already registered')
      // Make sure it's ready
      registration = await navigator.serviceWorker.ready
    }
    
    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription()
    if (existingSubscription) {
      console.log('✅ Already subscribed to push notifications')
      return existingSubscription
    }

    // Get VAPID public key from configuration
    const vapidPublicKey = config.vapidPublicKey
    if (!vapidPublicKey) {
      console.error('❌ VAPID public key not configured')
      alert('Error de configuración: VAPID key no encontrada')
      return null
    }

    console.log('🔑 VAPID key found, subscribing...')

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
    })

    console.log('✅ Successfully subscribed to push notifications')
    return subscription
  } catch (error) {
    console.error('❌ Failed to subscribe to push notifications:', error)
    alert(`Error al suscribirse: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    return null
  }
}

export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      console.log('✅ Unsubscribed from push notifications')
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error)
    return false
  }
}

export const checkPushSubscription = async (): Promise<PushSubscription | null> => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null
    }

    const registration = await navigator.serviceWorker.ready
    return await registration.pushManager.getSubscription()
  } catch (error) {
    console.error('Failed to check push subscription:', error)
    return null
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
