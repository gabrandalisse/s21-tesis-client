'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useReportDetail } from '@/hooks'
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
import { ArrowLeft } from 'lucide-react'

export default function ReportDetailPage() {
  const params = useParams()
  const reportId = params.id as string

  const {
    report,
    loadingReport,
    matches,
    matchedReports,
    loadingMatches,
    showCelebration,
    isReportOwner,
    setShowCelebration,
    handleStatusChange,
    handlePrint,
  } = useReportDetail(reportId)

  const { user } = useAuthStore()

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