'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { usePetStore, Report } from '@/store/petStore'
import { useAuthStore } from '@/store/authStore'
import {
  Navigation,
  ProtectedRoute,
  ChatWidget,
  SuccessCelebration,
  ReportPetDetails,
  ReportSidebar,
  MatchListCard,
  ReportActionsBar,
  LoadingSpinner,
} from '@/components'
import { apiClient, type ReportMatch } from '@/services/api'
import { ArrowLeft } from 'lucide-react'

export default function ReportDetailPage() {
  const params = useParams()
  const reportId = params.id as string

  const [report, setReport] = useState<Report | null>(null)
  const [loadingReport, setLoadingReport] = useState(true)
  const [matches, setMatches] = useState<ReportMatch[]>([])
  const [matchedReports, setMatchedReports] = useState<Report[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const { getReportById, updateReportStatus, reports, loadReportById, loadReports } = usePetStore()
  const { user } = useAuthStore()

  const fetchMatches = useCallback(async (lostReportId: number) => {
    setLoadingMatches(true)
    try {
      const reportMatches = await apiClient.getReportMatches(lostReportId)
      setMatches(reportMatches || [])

      if (reportMatches && reportMatches.length > 0) {
        const foundReportIds = reportMatches.map(match => match.foundReportId.toString())

        let currentReports = reports
        if (currentReports.length === 0) {
          await loadReports(true)
          currentReports = usePetStore.getState().reports
        }

        const foundReports = currentReports.filter(r => foundReportIds.includes(r.id))
        setMatchedReports(foundReports)
      } else {
        setMatchedReports([])
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
      setMatches([])
      setMatchedReports([])
    } finally {
      setLoadingMatches(false)
    }
  }, [reports, loadReports])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (!reportId) return

      // 1. Try from in-memory store first
      const cachedReport = getReportById(reportId)
      if (cachedReport) {
        if (isMounted) {
          setReport(cachedReport)
          setLoadingReport(false)
        }
        if (cachedReport.type === 'lost' && user && cachedReport.contactInfo.email === user.email) {
          fetchMatches(parseInt(reportId))
        }
        return
      }

      // 2. Hydrate on demand from API
      setLoadingReport(true)
      try {
        const fetchedReport = await loadReportById(reportId)
        if (isMounted) {
          setReport(fetchedReport)
          setLoadingReport(false)
        }
        if (fetchedReport && fetchedReport.type === 'lost' && user && fetchedReport.contactInfo.email === user.email) {
          fetchMatches(parseInt(reportId))
        }
      } catch (err) {
        console.error('Error al cargar reporte por ID:', err)
        if (isMounted) {
          setReport(null)
          setLoadingReport(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [reportId, getReportById, loadReportById, user, fetchMatches])

  const handleStatusChange = () => {
    if (report && user && report.contactInfo.email === user.email) {
      const newStatus = report.status === 'active' ? 'resolved' : 'active'

      if (newStatus === 'resolved') {
        setShowCelebration(true)
      }

      updateReportStatus(report.id, newStatus)
      setReport(prev => prev ? { ...prev, status: newStatus } : null)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const isReportOwner = Boolean(
    report && user && (
      report.reportedById?.toString() === user.id ||
      report.contactInfo.email === user.email
    )
  )

  if (loadingReport) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <LoadingSpinner message="Obteniendo los detalles de la mascota..." size="lg" />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

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
              <ReportPetDetails report={report}>
                {/* Chat Widget - Show for non-owners of active reports */}
                {user && !isReportOwner && report.status === 'active' && (
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
                  <MatchListCard
                    matches={matches}
                    matchedReports={matchedReports}
                    isLoading={loadingMatches}
                  />
                )}

                {/* Status and Print Actions for Report Owner */}
                {isReportOwner && (
                  <ReportActionsBar
                    status={report.status}
                    onStatusChange={handleStatusChange}
                    onPrint={handlePrint}
                  />
                )}
              </ReportPetDetails>
            </div>

            {/* Sidebar */}
            <ReportSidebar report={report} />
          </div>
        </main>

        <SuccessCelebration
          show={showCelebration}
          onClose={() => setShowCelebration(false)}
          petName={report.pet.name}
        />

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            nav, .print\\:hidden, button:not(.print\\:block) {
              display: none !important;
            }
            body, .bg-gray-50 {
              background: white !important;
            }
            main {
              max-width: 100% !important;
              padding: 20px !important;
            }
            img {
              max-width: 100%;
              page-break-inside: avoid;
            }
            .page-break {
              page-break-after: always;
            }
            h1, h2, h3 {
              page-break-after: avoid;
            }
            .contact-info {
              border: 2px solid #000;
              padding: 15px;
              margin-top: 20px;
            }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  )
}