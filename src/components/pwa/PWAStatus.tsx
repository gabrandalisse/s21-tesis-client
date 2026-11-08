'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { registerSW } from '@/utils/pwa'

export default function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // next-pwa only auto-registers the service worker for the Pages Router,
    // so with the App Router it has to be registered explicitly (production builds only,
    // since next-pwa is disabled in development and /sw.js does not exist there).
    if (process.env.NODE_ENV === 'production') {
      registerSW()
    }

    // Check if app is running in standalone mode (installed as PWA)
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    setIsOnline(navigator.onLine)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Only show status when offline or in standalone mode
  if (isOnline && !isStandalone) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {!isOnline && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff size={16} />
            <span>Sin conexión - Usando datos guardados</span>
          </div>
        </div>
      )}
      {isStandalone && isOnline && (
        <div className="bg-green-500 text-white px-4 py-1 text-center text-xs">
          <div className="flex items-center justify-center space-x-1">
            <Wifi size={12} />
            <span>Aplicación instalada</span>
          </div>
        </div>
      )}
    </div>
  )
}