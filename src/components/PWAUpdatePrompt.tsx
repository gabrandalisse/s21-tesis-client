'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, X } from 'lucide-react'

export default function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)
        
        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdatePrompt(true)
              }
            })
          }
        })
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setShowUpdatePrompt(true)
        }
      })
    }
  }, [])

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      setShowUpdatePrompt(false)
      window.location.reload()
    }
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
  }

  if (!showUpdatePrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50 max-w-sm mx-auto">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">
            Actualización Disponible
          </h3>
          <p className="text-sm text-blue-100 mb-3">
            Una nueva versión de Petly está disponible
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="flex items-center gap-2 bg-white text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              <RefreshCw size={16} />
              Actualizar
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-sm text-blue-100 hover:text-white transition-colors"
            >
              Después
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-200 hover:text-white transition-colors ml-2"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}