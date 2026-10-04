'use client'

import { Report } from '@/store/petStore'
import StatCard from '@/components/ui/StatCard'

export interface ReportStatsCardsProps {
  reports: Report[]
}

export default function ReportStatsCards({ reports }: ReportStatsCardsProps) {
  if (reports.length === 0) return null

  const totalCount = reports.length
  const activeCount = reports.filter((r) => r.status === 'active').length
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length
  const lostCount = reports.filter((r) => r.type === 'lost').length

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard value={totalCount} label="Total Reports" />
      <StatCard value={activeCount} label="Active Reports" valueColor="text-green-600" />
      <StatCard value={resolvedCount} label="Resolved Cases" valueColor="text-blue-600" />
      <StatCard value={lostCount} label="Lost Pet Reports" valueColor="text-purple-600" />
    </div>
  )
}
