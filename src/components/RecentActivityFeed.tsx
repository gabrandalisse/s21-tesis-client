'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient, type Report as ApiReport } from '@/services/api'
import { MapPin, Clock, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function RecentActivityFeed() {
  const [reports, setReports] = useState<ApiReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentReports = async () => {
      try {
        setIsLoading(true)
        const recentReports = await apiClient.getRecentReports()
        setReports(recentReports.slice(0, 6)) // Show only 6 most recent
      } catch (err) {
        console.error('Error fetching recent reports:', err)
        setError('No se pudieron cargar los reportes recientes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentReports()
  }, [])

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
        <p className="text-gray-600">Cargando actividad reciente...</p>
      </div>
    )
  }

  if (error || reports.length === 0) {
    return null // Don't show anything if there's an error or no reports
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Actividad Reciente
      </h2>
      <p className="text-gray-600 mb-6">
        Últimos reportes de mascotas perdidas y encontradas en la comunidad
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              {report.photoUrl ? (
                <img
                  src={report.photoUrl}
                  alt={report.pet?.name || 'Pet'}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Sin foto</span>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.type === 'lost'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {report.type === 'lost' ? 'Perdida' : 'Encontrada'}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                {report.pet?.name || 'Mascota'}
              </h3>
              
              <div className="space-y-1 mb-3">
                {report.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{report.address}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span>
                    {formatDistanceToNow(new Date(report.reportedAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
              </div>

              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Inicia sesión para ver más →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/register"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
        >
          Únete para Ver Todos los Reportes
        </Link>
      </div>
    </div>
  )
}
