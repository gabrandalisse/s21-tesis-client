'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import UserAvatar from '@/components/Avatar'
import { User, Mail, Phone, Edit2, Save, X, Bell, BellOff } from 'lucide-react'
import { checkPushSubscription, subscribeToPushNotifications, unsubscribeFromPushNotifications } from '@/utils/pwa'
import { apiClient } from '@/services/api'

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [checkingNotifications, setCheckingNotifications] = useState(true)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  useEffect(() => {
    checkNotificationStatus()
  }, [])

  const checkNotificationStatus = async () => {
    try {
      const subscription = await checkPushSubscription()
      setNotificationsEnabled(!!subscription)
    } catch (error) {
      console.error('Failed to check notification status:', error)
    } finally {
      setCheckingNotifications(false)
    }
  }

  const handleToggleNotifications = async () => {
    try {
      if (notificationsEnabled) {
        // Unsubscribe
        const success = await unsubscribeFromPushNotifications()
        if (success) {
          setNotificationsEnabled(false)
          // TODO: Remove device from backend
        }
      } else {
        // Subscribe
        const subscription = await subscribeToPushNotifications()
        if (subscription && user) {
          await apiClient.registerDevice(parseInt(user.id), subscription)
          setNotificationsEnabled(true)
        }
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error)
      alert('Error al cambiar las notificaciones. Por favor, intenta de nuevo.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = () => {
    updateProfile(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    })
    setIsEditing(false)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <UserAvatar name={user?.name || 'User'} size={64} />
                  <div>
                    <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
                    <p className="text-primary-100">Administra la información de tu cuenta</p>
                  </div>
                </div>
                
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Editar Perfil</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Guardar</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-2" />
                    Nombre completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Ingresa tu nombre completo"
                    />
                  ) : (
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <p className="text-gray-900">{user?.name || 'No proporcionado'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Correo electrónico
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Ingresa tu correo electrónico"
                    />
                  ) : (
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <p className="text-gray-900">{user?.email || 'No proporcionado'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Número de teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Ingresa tu número de teléfono"
                    />
                  ) : (
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <p className="text-gray-900">{user?.phone || 'No proporcionado'}</p>
                    </div>
                  )}
                </div>

                {/* Notification Settings */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones</h2>
                  
                  <div className="bg-gray-50 px-4 py-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {notificationsEnabled ? (
                          <Bell className="h-5 w-5 text-blue-600" />
                        ) : (
                          <BellOff className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            Notificaciones Push
                          </p>
                          <p className="text-sm text-gray-600">
                            {notificationsEnabled 
                              ? 'Recibirás notificaciones sobre mascotas cerca de ti y coincidencias'
                              : 'Activa las notificaciones para recibir alertas importantes'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleToggleNotifications}
                        disabled={checkingNotifications}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                        } ${checkingNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {!checkingNotifications && !notificationsEnabled && (
                    <p className="mt-2 text-sm text-gray-500">
                      💡 Tip: Activa las notificaciones para no perderte ninguna mascota reportada cerca de ti
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}