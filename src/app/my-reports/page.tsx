'use client'

import { useState, useEffect } from 'react'
import { usePetStore, Report } from '@/store/petStore'
import { useAuthStore } from '@/store/authStore'
import {
  Navigation,
  ProtectedRoute,
  ReportStatsCards,
  ReportFilterBar,
  MyReportsTable,
} from '@/components'

export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const { userReports, updateReportStatus, loadUserReports, isLoading } = usePetStore()
  const { isAuthenticated } = useAuthStore()

  // Load user reports without geographic restriction
  useEffect(() => {
    if (isAuthenticated) {
      loadUserReports(true)
    }
  }, [isAuthenticated, loadUserReports])

  useEffect(() => {
    setReports(userReports)
  }, [userReports])

  useEffect(() => {
    let filtered = reports

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter)
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter)
    }

    setFilteredReports(filtered)
  }, [reports, searchTerm, statusFilter, typeFilter])

  const handleStatusToggle = async (reportId: string, currentStatus: 'active' | 'resolved') => {
    const newStatus = currentStatus === 'active' ? 'resolved' : 'active'
    setUpdatingStatus(reportId)

    try {
      await updateReportStatus(reportId, newStatus)
      setReports(prev =>
        prev.map(report =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      )
    } catch (error) {
      console.error('Failed to update report status:', error)
    } finally {
      setUpdatingStatus(null)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header & Summary Stats */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reports</h1>
            <p className="text-gray-600 mb-6">
              Manage all your lost and found pet reports in one place
            </p>
            <ReportStatsCards reports={reports} />
          </div>

          {/* Filter Bar */}
          <ReportFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
          />

          {/* Reports Table / Card List */}
          <MyReportsTable
            reports={filteredReports}
            totalReportsCount={reports.length}
            isLoading={isLoading}
            updatingStatus={updatingStatus}
            onStatusToggle={handleStatusToggle}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
}