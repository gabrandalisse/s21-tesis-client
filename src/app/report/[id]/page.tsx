'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { usePetStore, Report } from '@/store/petStore'
import { useAuthStore } from '@/store/authStore'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import ReportMap from '@/components/ReportMap'
import ChatWidget from '@/components/ChatWidget'
import { apiClient, type ReportMatch } from '@/services/api'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar,
  Info,
  CheckCircle,
  AlertCircle,
  Star,
  Navigation as NavigationIcon,
  User,
  Phone,
  Mail
} from 'lucide-react'
import { translateSpecies } from '@/utils/petUtils'

export default function ReportDetailPage() {
  const params = useParams()
  const reportId = params.id as string
  
  const [report, setReport] = useState<Report | null>(null)
  const [matches, setMatches] = useState<ReportMatch[]>([])
  const [matchedReports, setMatchedReports] = useState<Report[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  
  const { getReportById, updateReportStatus, reports } = usePetStore()
  const { user } = useAuthStore()

  const fetchMatches = useCallback(async (lostReportId: number) => {
    setLoadingMatches(true)
    try {
      const reportMatches = await apiClient.getReportMatches(lostReportId)
      setMatches(reportMatches || [])
      
      // Get the full report data for each matched found report
      if (reportMatches && reportMatches.length > 0) {
        const foundReportIds = reportMatches.map(match => match.foundReportId.toString())
        const foundReports = reports.filter(report => foundReportIds.includes(report.id))
        setMatchedReports(foundReports)
      } else {
        setMatchedReports([])
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
      // If no matches found, set empty arrays instead of showing error
      setMatches([])
      setMatchedReports([])
    } finally {
      setLoadingMatches(false)
    }
  }, [reports])

  useEffect(() => {
    const foundReport = getReportById(reportId)
    setReport(foundReport || null)
    
    // Fetch matches if this is a lost report and user is the owner
    if (foundReport && foundReport.type === 'lost' && user && foundReport.contactInfo.email === user.email) {
      fetchMatches(parseInt(reportId))
    }
  }, [reportId, getReportById, user, fetchMatches])

  const handleStatusChange = () => {
    if (report && user && report.contactInfo.email === user.email) {
      const newStatus = report.status === 'active' ? 'resolved' : 'active'
      updateReportStatus(report.id, newStatus)
      // Update local state
      setReport(prev => prev ? { ...prev, status: newStatus } : null)
    }
  }

  const isReportOwner = report && user && (
    report.reportedById?.toString() === user.id || 
    report.contactInfo.email === user.email
  )

  if (!report) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Reporte no encontrado</h1>
              <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
                ← Volver al dashboard
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Reportes
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Status Badge */}
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                    {report.pet.photo ? (
                      <img
                        src={report.pet.photo}
                        alt={report.pet.name}
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">Sin foto disponible</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      report.type === 'lost' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {report.type === 'lost' ? 'Mascota Perdida' : 'Mascota Encontrada'}
                    </span>
                  </div>
                  {report.status === 'resolved' && (
                    <div className="absolute top-4 right-4">
                      <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Resuelto</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {report.pet.name}
                  </h1>

                  {/* Pet Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Especie</div>
                      <div className="font-medium capitalize">
                        {translateSpecies(report.pet.species)}
                      </div>
                    </div>
                    {report.pet.breed && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Raza</div>
                        <div className="font-medium">{report.pet.breed}</div>
                      </div>
                    )}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Edad</div>
                      <div className="font-medium">{report.pet.age}</div>
                    </div>
                    {report.pet.color && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Color</div>
                        <div className="font-medium">{report.pet.color}</div>
                      </div>
                    )}
                    {report.pet.size && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Tamaño</div>
                        <div className="font-medium">{report.pet.size}</div>
                      </div>
                    )}
                    {report.pet.sex && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Sexo</div>
                        <div className="font-medium">{report.pet.sex}</div>
                      </div>
                    )}
                  </div>

                  {/* Distinguishing Features - Only show if exists */}
                  {report.pet.distinguishingFeatures && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Características Distintivas
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {report.pet.distinguishingFeatures}
                      </p>
                    </div>
                  )}

                  {/* Additional Details - Only show if exists */}
                  {report.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Detalles Adicionales
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                  )}

                  {/* Location and Time */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {report.type === 'lost' ? 'Visto por Última Vez En' : 'Encontrado Sano y Salvo En'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-5 w-5 mr-3 text-primary-500" />
                        <span>{report.date}, {report.time}</span>
                      </div>
                      
                      {/* Map with Address */}
                      <ReportMap
                        coordinates={report.location.coordinates}
                        address={report.location.address}
                        petName={report.pet.name}
                        reportType={report.type}
                      />
                    </div>
                  </div>

                  {/* Chat Widget - Show for non-owners of active reports */}
                  {report && user && !isReportOwner && report.status === 'active' && (
                    <div className="mb-6">
                      <ChatWidget
                        reportId={report.id}
                        reportOwnerId={report.reportedById?.toString() || report.contactInfo.email}
                        reportOwnerName={report.contactInfo.name}
                        reportOwnerEmail={report.contactInfo.email}
                      />
                    </div>
                  )}

                  {/* Matches Section - Only for lost reports and report owner */}
                  {report.type === 'lost' && isReportOwner && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Posibles Coincidencias
                      </h3>
                      {loadingMatches ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                          <p className="text-gray-600 text-sm">Buscando coincidencias...</p>
                        </div>
                      ) : matches.length > 0 ? (
                        <div className="space-y-4">
                          <p className="text-gray-600 text-sm mb-4">
                            Encontramos {matches.length} mascota{matches.length > 1 ? 's' : ''} encontrada{matches.length > 1 ? 's' : ''} que podrían coincidir con tu mascota perdida.
                          </p>
                          {matches.map((match) => {
                            const matchedReport = matchedReports.find(r => r.id === match.foundReportId.toString())
                            if (!matchedReport) return null
                            
                            return (
                              <div key={match.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start space-x-4">
                                  {matchedReport.pet.photo ? (
                                    <img
                                      src={matchedReport.pet.photo}
                                      alt={matchedReport.pet.name}
                                      className="w-16 h-16 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                      <span className="text-gray-400 text-xs">Sin foto</span>
                                    </div>
                                  )}
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-semibold text-gray-900">
                                        {matchedReport.pet.name}
                                      </h4>
                                      <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-1">
                                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                          <span className="text-sm font-medium text-gray-700">
                                            {Math.round(match.matchScore * 100)}% coincidencia
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <NavigationIcon className="h-4 w-4 text-gray-500" />
                                          <span className="text-sm text-gray-600">
                                            {match.distanceKilometers.toFixed(1)} km
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <p className="text-gray-600 text-sm mb-2">
                                      {[matchedReport.pet.breed, matchedReport.pet.color, matchedReport.pet.size, matchedReport.pet.sex]
                                        .filter(Boolean).join(' • ')}
                                    </p>
                                    
                                    <div className="flex items-center text-sm text-gray-600 mb-3">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      <span className="truncate">{matchedReport.location.address}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">
                                        Encontrada el {matchedReport.date}
                                      </span>
                                      <Link
                                        href={`/report/${matchedReport.id}`}
                                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                      >
                                        Ver Detalles
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">
                            No se encontraron coincidencias aún. Seguiremos buscando automáticamente.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status Button for Report Owner */}
                  {isReportOwner && (
                    <div className="border-t pt-6">
                      <button
                        onClick={handleStatusChange}
                        className={`w-full flex items-center justify-center space-x-2 text-lg py-3 rounded-lg font-medium transition-colors ${
                          report.status === 'active'
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                      >
                        {report.status === 'active' ? (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            <span>Marcar como Resuelto</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5" />
                            <span>Reabrir Reporte</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Información de Contacto
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">{report.contactInfo.name}</span>
                  </div>
                  {report.contactInfo.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-3 text-gray-400" />
                      <span className="text-gray-700">{report.contactInfo.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">{report.contactInfo.email}</span>
                  </div>
                  
                  {report.contactInfo.additionalContacts && report.contactInfo.additionalContacts.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Contactos Adicionales</h4>
                      {report.contactInfo.additionalContacts.map((contact, index) => (
                        <div key={index} className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>{contact.name}</span>
                          <span>{contact.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Report Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detalles del Reporte
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Reportado por</span>
                    <p className="font-medium">{report.contactInfo.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Reporte creado</span>
                    <p className="font-medium">
                      {new Date(report.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Estado</span>
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium ${
                        report.status === 'active' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {report.status === 'active' ? 'Activo' : 'Resuelto'}
                      </p>
                      {report.status === 'resolved' && (
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}