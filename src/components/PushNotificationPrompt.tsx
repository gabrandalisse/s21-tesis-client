'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const { isAuthenticated, registerPushNotifications } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) return

    // Check if notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.log('Notifications not supported')
      return
    }

    // Check current permission
    const currentPermission = Notification.permission
    setPermission(currentPermission)

    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem('notification-prompt-dismissed')
    if (dismissed) {
      return
    }

    // Show prompt if permission is default (not asked yet)
    if (currentPermission === 'default') {
      // Wait a bit before showing the prompt
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated])

  const handleEnable = async () => {
    try {
      console.log('🔔 User clicked enable notifications')
      await registerPushNotifications()
      setPermission(Notification.permission)
      setShowPrompt(false)
    } catch (error) {
      console.error('Failed to enable notifications:', error)
      alert('Error al activar las notificaciones. Por favor, verifica los permisos del navegador.')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Remember dismissal for this session
    sessionStorage.setItem('notification-prompt-dismissed', 'true')
  }

  if (!showPrompt || permission !== 'default') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            Recibe notificaciones
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Te avisaremos cuando haya mascotas reportadas cerca de ti o cuando encontremos coincidencias para tus reportes.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Activar
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
