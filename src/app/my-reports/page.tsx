'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePetStore, Report } from '@/store/petStore'
import { useAuthStore } from '@/store/authStore'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  MapPin,
  Search,
  Filter,
  ExternalLink
} from 'lucide-react'

export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all')
  
  const { reports: allReports, updateReportStatus } = usePetStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      const userReports = allReports.filter(report => report.contactInfo.email === user.email)
      setReports(userReports)
    }
  }, [allReports, user])

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

  const handleStatusToggle = (reportId: string, currentStatus: 'active' | 'resolved') => {
    const newStatus = currentStatus === 'active' ? 'resolved' : 'active'
    updateReportStatus(reportId, newStatus)
    
    // Update local state
    setReports(prev => prev.map(report =>
      report.id === reportId ? { ...report, status: newStatus } : report
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: 'active' | 'resolved') => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Resolved
        </span>
      )
    }
  }

  const getTypeBadge = (type: 'lost' | 'found') => {
    if (type === 'lost') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Lost
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Found
        </span>
      )
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reports</h1>
            <p className="text-gray-600 mb-6">
              Manage all your lost and found pet reports in one place
            </p>

            {/* Summary Stats */}
            {reports.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
                  <div className="text-sm text-gray-600">Total Reports</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-2xl font-bold text-green-600">
                    {reports.filter(r => r.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Active Reports</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {reports.filter(r => r.status === 'resolved').length}
                  </div>
                  <div className="text-sm text-gray-600">Resolved Cases</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-2xl font-bold text-purple-600">
                    {reports.filter(r => r.type === 'lost').length}
                  </div>
                  <div className="text-sm text-gray-600">Lost Pet Reports</div>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'resolved')}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'all' | 'lost' | 'found')}
                >
                  <option value="all">All Types</option>
                  <option value="lost">Lost Pets</option>
                  <option value="found">Found Pets</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {reports.length === 0 ? 'No reports created yet' : 'No reports match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {reports.length === 0 
                  ? 'Create your first report to help find lost pets or report found ones.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {reports.length === 0 && (
                <Link href="/create-report" className="btn-primary">
                  Create Your First Report
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pet & Report
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {report.pet.photo ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={report.pet.photo}
                                alt={report.pet.name}
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
                          {getTypeBadge(report.type)}
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
                          {getStatusBadge(report.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link
                            href={`/report/${report.id}`}
                            className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                          <button
                            onClick={() => handleStatusToggle(report.id, report.status)}
                            className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium transition-colors ${
                              report.status === 'active'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                            }`}
                          >
                            {report.status === 'active' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mark Resolved
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Reopen
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
                {filteredReports.map((report) => (
                  <div key={report.id} className="p-6 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      {report.pet.photo ? (
                        <img
                          className="h-12 w-12 rounded-full object-cover"
                          src={report.pet.photo}
                          alt={report.pet.name}
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
                            {getTypeBadge(report.type)}
                            {getStatusBadge(report.status)}
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
                            View Details
                          </Link>
                          <button
                            onClick={() => handleStatusToggle(report.id, report.status)}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                              report.status === 'active'
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                            }`}
                          >
                            {report.status === 'active' ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Reopen
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
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}