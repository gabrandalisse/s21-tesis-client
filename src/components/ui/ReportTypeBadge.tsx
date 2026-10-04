import React from 'react'
import { ReportTypeBadgeProps } from '../types/interfaces'

export type { ReportTypeBadgeProps }

/**
 * Visual badge indicating whether a pet report is 'lost' or 'found'.
 * Single responsibility: Only displays the Report Type Badge.
 */
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

  const defaultLabel =
    label ||
    (size === 'sm'
      ? isLost
        ? 'Perdida'
        : 'Encontrada'
      : isLost
      ? 'Mascota Perdida'
      : 'Mascota Encontrada')

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
