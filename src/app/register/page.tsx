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

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
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
        let errorMessage = 'Unable to get your location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
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
      setLocalError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long')
      return
    }

    if (formData.lat === 0 && formData.long === 0) {
      setLocalError('Location is required. Please allow location access or try again.')
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
          <h2 className="text-3xl font-bold text-gray-900">Create account</h2>
          <p className="mt-2 text-gray-600">Join Pet Finder to help reunite pets with their families</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="card">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input-field"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Location Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  {gettingLocation ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">Getting your location...</span>
                    </div>
                  ) : formData.lat !== 0 && formData.long !== 0 ? (
                    <span className="text-sm text-green-600">Location obtained</span>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm text-red-600">Location required</span>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="text-sm text-primary-600 hover:text-primary-700"
                        disabled={isLoading}
                      >
                        Try again
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
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="input-field pr-10"
                    placeholder="Create a password"
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
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="input-field pr-10"
                    placeholder="Confirm your password"
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
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}