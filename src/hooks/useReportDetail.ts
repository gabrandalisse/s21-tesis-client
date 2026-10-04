import { useState, useEffect, useCallback } from 'react'
import { usePetStore } from '@/store/petStore'
import { Report } from '@/store/types/interfaces'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/services/api'
import { ApiReportMatch } from '@/services/types/interfaces'
import { UseReportDetailReturn } from './types/interfaces'

/**
 * Custom hook to manage the full lifecycle, data hydration,
 * match calculation, ownership checks, and status actions for a report.
 */
export function useReportDetail(reportId: string): UseReportDetailReturn {
  const [report, setReport] = useState<Report | null>(null)
  const [loadingReport, setLoadingReport] = useState(true)
  const [matches, setMatches] = useState<ApiReportMatch[]>([])
  const [matchedReports, setMatchedReports] = useState<Report[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const { getReportById, updateReportStatus, reports, loadReportById, loadReports } = usePetStore()
  const { user } = useAuthStore()

  const fetchMatches = useCallback(
    async (lostReportId: number) => {
      setLoadingMatches(true)
      try {
        const reportMatches = await apiClient.getReportMatches(lostReportId)
        setMatches(reportMatches || [])

        if (reportMatches && reportMatches.length > 0) {
          const foundReportIds = reportMatches.map((match) => match.foundReportId.toString())

          let currentReports = reports
          if (currentReports.length === 0) {
            await loadReports(true)
            currentReports = usePetStore.getState().reports
          }

          const foundReports = currentReports.filter((r) => foundReportIds.includes(r.id))
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
    },
    [reports, loadReports]
  )

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
        const isOwner =
          user &&
          (cachedReport.reportedById?.toString() === user.id ||
            cachedReport.contactInfo.email === user.email)
        if (cachedReport.type === 'lost' && isOwner) {
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
        const isOwner =
          fetchedReport &&
          user &&
          (fetchedReport.reportedById?.toString() === user.id ||
            fetchedReport.contactInfo.email === user.email)
        if (fetchedReport && fetchedReport.type === 'lost' && isOwner) {
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
    if (
      report &&
      user &&
      (report.reportedById?.toString() === user.id ||
        report.contactInfo.email === user.email)
    ) {
      const newStatus = report.status === 'active' ? 'resolved' : 'active'

      if (newStatus === 'resolved') {
        setShowCelebration(true)
      }

      updateReportStatus(report.id, newStatus)
      setReport((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const refetchMatches = async () => {
    if (reportId) {
      await fetchMatches(parseInt(reportId))
    }
  }

  const isReportOwner = Boolean(
    report &&
      user &&
      (report.reportedById?.toString() === user.id ||
        report.contactInfo.email === user.email)
  )

  return {
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
    refetchMatches,
  }
}
