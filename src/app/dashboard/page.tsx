'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePetStore, Report } from '@/store/petStore'
import { useAuthStore } from '@/store/authStore'
import {
  Navigation,
  ProtectedRoute,
  PWAInstallPrompt,
  PWAUpdatePrompt,
  ReportCard,
  LoadingSpinner,
} from '@/components'
import { Search, Filter, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filter, setFilter] = useState<'all' | 'lost' | 'found' | 'resolved'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { 
    loadReports, 
    loadPetTypes, 
    loadReportTypes, 
    isLoading, 
    error, 
    clearError,
    reports: storeReports 
  } = usePetStore()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      loadPetTypes()
      loadReportTypes()
      
      const includeResolved = filter === 'resolved'
      loadReports(includeResolved).catch(console.error)
    }
  }, [isAuthenticated, filter, loadReports, loadPetTypes, loadReportTypes])

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

  if (isLoading && reports.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LoadingSpinner message="Cargando reportes..." size="md" className="py-12" />
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
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </main>

        <PWAInstallPrompt />
        <PWAUpdatePrompt />
      </div>
    </ProtectedRoute>
  )
}