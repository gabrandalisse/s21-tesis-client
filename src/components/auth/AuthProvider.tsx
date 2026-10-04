'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { initialize, isInitialized } = useAuthStore()

  // Ensure we're on the client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && !isInitialized) {
      initialize()
    }
  }, [isMounted, isInitialized, initialize])

  // Show loading screen until mounted and initialized
  if (!isMounted || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Petly</h2>
          <p className="text-gray-600">
            {!isMounted ? 'Cargando...' : 'Iniciando aplicación...'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}