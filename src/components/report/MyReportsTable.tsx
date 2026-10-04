'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Report } from '@/store/types/interfaces'
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Loader2 
} from 'lucide-react'
import { ReportTypeBadge } from '@/components/ui/ReportTypeBadge'
import { ReportStatusBadge } from '@/components/ui/ReportStatusBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export interface MyReportsTableProps {
  reports: Report[]
  totalReportsCount: number
  isLoading: boolean
  updatingStatus: string | null
  onStatusToggle: (reportId: string, currentStatus: 'active' | 'resolved') => void
}

export default function MyReportsTable({
  reports,
  totalReportsCount,
  isLoading,
  updatingStatus,
  onStatusToggle,
}: MyReportsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading && totalReportsCount === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <LoadingSpinner message="Cargando tus reportes..." size="lg" />
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {totalReportsCount === 0 ? 'Aún no has creado reportes' : 'Ningún reporte coincide con los filtros'}
        </h3>
        <p className="text-gray-600 mb-6">
          {totalReportsCount === 0 
            ? 'Crea tu primer reporte para ayudar a encontrar mascotas perdidas o reportar encontradas.'
            : 'Intenta ajustar tus criterios de búsqueda o filtros.'
          }
        </p>
        {totalReportsCount === 0 && (
          <Link href="/create-report" className="btn-primary">
            Crear Tu Primer Reporte
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mascota y Reporte
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {report.pet.photo ? (
                      <Image
                        className="h-10 w-10 rounded-full object-cover"
                        src={report.pet.photo}
                        alt={report.pet.name}
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {report.pet.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.pet.breed} • {report.pet.color}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ReportTypeBadge type={report.type} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="truncate max-w-32" title={report.location.address}>
                      {report.location.address}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {formatDate(report.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ReportStatusBadge status={report.status} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    href={`/report/${report.id}`}
                    className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Link>
                  <button
                    onClick={() => onStatusToggle(report.id, report.status)}
                    disabled={updatingStatus === report.id}
                    className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      report.status === 'active'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                    }`}
                  >
                    {updatingStatus === report.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Actualizando...
                      </>
                    ) : report.status === 'active' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Marcar Resuelto
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Reabrir
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {reports.map((report) => (
          <div key={report.id} className="p-6 border-b border-gray-200 last:border-b-0">
            <div className="flex items-start space-x-4">
              {report.pet.photo ? (
                <Image
                  className="h-12 w-12 rounded-full object-cover"
                  src={report.pet.photo}
                  alt={report.pet.name}
                  width={48}
                  height={48}
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {report.pet.name}
                  </h3>
                  <div className="flex space-x-2">
                    <ReportTypeBadge type={report.type} size="sm" />
                    <ReportStatusBadge status={report.status} size="sm" />
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {report.pet.breed} • {report.pet.color}
                </p>

                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="truncate">{report.location.address}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(report.createdAt)}
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/report/${report.id}`}
                    className="flex-1 btn-outline text-center flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalles
                  </Link>
                  <button
                    onClick={() => onStatusToggle(report.id, report.status)}
                    disabled={updatingStatus === report.id}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                      report.status === 'active'
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {updatingStatus === report.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Actualizando...
                      </>
                    ) : report.status === 'active' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolver
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Reabrir
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
