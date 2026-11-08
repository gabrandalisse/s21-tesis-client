'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { Eye, EyeOff, PawPrint, Loader2, MapPin } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    lat: 0,
    long: 0
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [gettingLocation, setGettingLocation] = useState(false)
  const [localError, setLocalError] = useState('')
  
  const { register, isLoading, error, clearError } = useAuthStore()
  const router = useRouter()

  // Get user's location on component mount
  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getCurrentLocation = () => {
    setGettingLocation(true)
    setLocationError('')

    // iOS/Safari only expose geolocation on secure origins (HTTPS or localhost).
    // On plain http://<ip> it is blocked silently, without ever showing the permission prompt.
    if (!window.isSecureContext) {
      setLocationError(
        'Este sitio no está usando HTTPS, por eso el navegador bloquea la ubicación y no muestra el permiso. Abrí la app desde una dirección https://.'
      )
      setGettingLocation(false)
      return
    }

    if (!navigator.geolocation) {
      setLocationError('La geolocalización no es compatible con este navegador')
      setGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude,
          long: position.coords.longitude
        }))
        setGettingLocation(false)
      },
      (error) => {
        let errorMessage = 'No se pudo obtener tu ubicación'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              'Acceso a la ubicación denegado. En iPhone: Ajustes > Privacidad y seguridad > Localización > Sitios web de Safari (o Petly) > "Al usar la app". Luego volvé y tocá "Intentar de nuevo".'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'La información de ubicación no está disponible.'
            break
          case error.TIMEOUT:
            errorMessage = 'La solicitud de ubicación expiró.'
            break
        }
        setLocationError(errorMessage)
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (formData.lat === 0 && formData.long === 0) {
      setLocalError('La ubicación es requerida. Por favor permite el acceso a la ubicación o intenta de nuevo.')
      return
    }

    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        lat: formData.lat,
        long: formData.long
      })
      
      if (success) {
        router.push('/dashboard')
      }
    } catch (err) {
      // Error is handled by the store
      console.error('Registration error:', err)
    }
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-500 p-3 rounded-full">
              <PawPrint className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Crear cuenta</h2>
          <p className="mt-2 text-gray-600">Únete a Petly para ayudar a reunir mascotas con sus familias</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="card">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Ingresa tu nombre completo"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field"
                  placeholder="Ingresa tu correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de teléfono (Opcional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input-field"
                  placeholder="Ingresa tu número de teléfono"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Location Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  {gettingLocation ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">Obteniendo tu ubicación...</span>
                    </div>
                  ) : formData.lat !== 0 && formData.long !== 0 ? (
                    <span className="text-sm text-green-600">Ubicación obtenida</span>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm text-red-600">Ubicación requerida</span>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="text-sm text-primary-600 hover:text-primary-700"
                        disabled={isLoading}
                      >
                        Intentar de nuevo
                      </button>
                    </div>
                  )}
                </div>
                {locationError && (
                  <p className="text-sm text-red-600 mt-1">{locationError}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="input-field pr-10"
                    placeholder="Crea una contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="input-field pr-10"
                    placeholder="Confirma tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {displayError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-red-800 text-sm">{displayError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setLocalError('')
                        clearError()
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || gettingLocation || (formData.lat === 0 && formData.long === 0)}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}