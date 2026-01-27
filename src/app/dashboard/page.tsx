'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePetStore, Report } from '@/store/petStore'
import { useAuthStore } from '@/store/authStore'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import PWAUpdatePrompt from '@/components/PWAUpdatePrompt'
import { MapPin, Clock, MessageCircle, Search, Filter, CheckCircle, Loader2 } from 'lucide-react'
import { translateSpecies, formatPetInfo } from '@/utils/petUtils'

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filter, setFilter] = useState<'all' | 'lost' | 'found' | 'resolved'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { 
    getLatestReports, 
    loadReports, 
    loadPetTypes, 
    loadReportTypes, 
    isLoading, 
    error,
    clearError,
    reports: storeReports // Add this to track store reports changes
  } = usePetStore()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      // Load reference data first
      loadPetTypes()
      loadReportTypes()
      
      // Load reports based on filter - include resolved only when filter is 'resolved'
      const includeResolved = filter === 'resolved'
      loadReports(includeResolved).catch(console.error)
    }
  }, [isAuthenticated, filter, loadReports, loadPetTypes, loadReportTypes])

  // Update local reports when store reports change
  useEffect(() => {
    setReports(storeReports)
  }, [storeReports])

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || 
      (filter === 'resolved' ? report.status === 'resolved' : report.type === filter)
    const matchesSearch = searchTerm === '' || 
      report.pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading && reports.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
                <p className="text-gray-600">Cargando reportes...</p>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ayuda a Reunir Mascotas con sus Familias
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explora los últimos reportes de mascotas perdidas y encontradas en tu área. Cada compartir y visualización ayuda a traer mascotas a casa.
            </p>
            {user && (
              <p className="text-sm text-gray-500 mt-2">
                ¡Bienvenido de vuelta, {user.name}! Mostrando reportes cerca de tu ubicación.
              </p>
            )}
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de mascota, raza o ubicación..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'lost' | 'found' | 'resolved')}
                >
                  <option value="all">Todos los Reportes</option>
                  <option value="lost">Mascotas Perdidas</option>
                  <option value="found">Mascotas Encontradas</option>
                  <option value="resolved">Casos Resueltos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading indicator for additional data */}
          {isLoading && reports.length > 0 && (
            <div className="text-center mb-4">
              <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 text-primary-600" />
              <span className="text-gray-600">Actualizando reportes...</span>
            </div>
          )}

          {/* Reports Grid */}
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron reportes</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filter !== 'all' 
                  ? 'Intenta ajustar tu búsqueda o criterios de filtro.'
                  : 'Sé el primero en reportar una mascota perdida o encontrada en tu área.'
                }
              </p>
              <Link href="/create-report" className="btn-primary">
                Crear Reporte
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Status Badge */}
                  <div className="relative">
                    <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                      {report.pet.photo ? (
                        <img
                          src={report.pet.photo}
                          alt={report.pet.name}
                          className={`w-full h-48 object-cover ${report.status === 'resolved' ? 'opacity-60' : ''}`}
                        />
                      ) : (
                        <div className={`w-full h-48 bg-gray-200 flex items-center justify-center ${report.status === 'resolved' ? 'opacity-60' : ''}`}>
                          <span className="text-gray-400">Sin foto</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        report.type === 'lost' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {report.type === 'lost' ? 'Mascota Perdida' : 'Mascota Encontrada'}
                      </span>
                    </div>
                    {report.status === 'resolved' && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>Resuelto</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {report.pet.name}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {formatPetInfo(report.pet.breed, report.pet.color, report.pet.size, report.pet.sex, report.pet.species)}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{report.location.address}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{report.date} at {report.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Link
                        href={`/report/${report.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        Ver Detalles
                      </Link>
                      {report.status === 'active' ? (
                        <Link
                          href={`/report/${report.id}#chat`}
                          className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">Contactar</span>
                        </Link>
                      ) : (
                        <span className="flex items-center space-x-1 text-blue-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Resuelto</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="bg-primary-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Has perdido o encontrado una mascota?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Crea un reporte para ayudar a reunir mascotas con sus familias. Mientras más detalles proporciones, 
                mejor será la oportunidad de una reunión exitosa.
              </p>
              <Link href="/create-report" className="btn-primary text-lg px-8 py-3">
                Crear Reporte
              </Link>
            </div>
          </div>
        </main>
        
        <PWAInstallPrompt />
        <PWAUpdatePrompt />
      </div>
    </ProtectedRoute>
  )
}