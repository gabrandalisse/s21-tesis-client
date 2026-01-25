'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import UserAvatar from '@/components/Avatar'
import { User, Mail, Phone, Edit2, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

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
                    <Mail className="inline h-4 w-4 mr-2" />
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
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}