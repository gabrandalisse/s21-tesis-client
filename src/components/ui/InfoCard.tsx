import React from 'react'

export interface InfoCardProps {
  label: string
  value?: React.ReactNode | string | number | null
  capitalize?: boolean
  variant?: 'card' | 'plain'
  className?: string
  labelClassName?: string
  valueClassName?: string
}

export default function InfoCard({
  label,
  value,
  capitalize = false,
  variant = 'card',
  className = '',
  labelClassName = '',
  valueClassName = '',
}: InfoCardProps) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (variant === 'plain') {
    return (
      <div className={className}>
        <span className={`text-sm text-gray-600 ${labelClassName}`}>{label}</span>
        <p className={`font-medium ${capitalize ? 'capitalize' : ''} ${valueClassName}`}>
          {value}
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-gray-50 p-3 rounded-lg ${className}`}>
      <div className={`text-sm text-gray-600 ${labelClassName}`}>{label}</div>
      <div className={`font-medium ${capitalize ? 'capitalize' : ''} ${valueClassName}`}>
        {value}
      </div>
    </div>
  )
}
