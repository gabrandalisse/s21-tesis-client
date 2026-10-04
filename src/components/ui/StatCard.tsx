import React from 'react'

export interface StatCardProps {
  value: number | string
  label: string
  valueColor?: string
  className?: string
}

export default function StatCard({
  value,
  label,
  valueColor = 'text-gray-900',
  className = '',
}: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}
