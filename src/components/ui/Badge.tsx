import React from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'

export interface ReportTypeBadgeProps {
  type?: 'lost' | 'found' | string
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

export function ReportTypeBadge({
  type = 'lost',
  size = 'md',
  label,
  className = '',
}: ReportTypeBadgeProps) {
  const isLost = type?.toLowerCase() === 'lost'

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-sm',
  }

  const defaultLabel = label || (
    size === 'sm'
      ? (isLost ? 'Lost' : 'Found')
      : (isLost ? 'Mascota Perdida' : 'Mascota Encontrada')
  )

  const colorClasses = isLost
    ? 'bg-red-100 text-red-800'
    : 'bg-green-100 text-green-800'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${colorClasses} ${className}`}
    >
      {defaultLabel}
    </span>
  )
}

export interface ReportStatusBadgeProps {
  status?: 'active' | 'resolved' | string
  size?: 'sm' | 'md' | 'lg'
  withIcon?: boolean
  label?: string
  className?: string
}

export function ReportStatusBadge({
  status = 'active',
  size = 'md',
  withIcon = true,
  label,
  className = '',
}: ReportStatusBadgeProps) {
  const isActive = status?.toLowerCase() === 'active'

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-sm',
  }

  const iconSizes = {
    sm: 'w-3 h-3 mr-1',
    md: 'w-4 h-4 mr-1',
    lg: 'w-4 h-4 mr-1.5',
  }

  const defaultLabel = label || (
    isActive ? 'Activo' : 'Resuelto'
  )

  const colorClasses = isActive
    ? 'bg-green-100 text-green-800'
    : 'bg-blue-100 text-blue-800'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${colorClasses} ${className}`}
    >
      {withIcon && (
        isActive ? (
          <AlertCircle className={iconSizes[size]} />
        ) : (
          <CheckCircle className={iconSizes[size]} />
        )
      )}
      <span>{defaultLabel}</span>
    </span>
  )
}
