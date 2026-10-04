import React from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { ReportStatusBadgeProps } from '../types/interfaces'

export type { ReportStatusBadgeProps }

/**
 * Visual badge indicating whether a pet report is 'active' or 'resolved'.
 * Single responsibility: Only displays the Report Status Badge.
 */
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

  const defaultLabel = label || (isActive ? 'Activo' : 'Resuelto')

  const colorClasses = isActive
    ? 'bg-green-100 text-green-800'
    : 'bg-blue-100 text-blue-800'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${colorClasses} ${className}`}
    >
      {withIcon &&
        (isActive ? (
          <AlertCircle className={iconSizes[size]} />
        ) : (
          <CheckCircle className={iconSizes[size]} />
        ))}
      <span>{defaultLabel}</span>
    </span>
  )
}
