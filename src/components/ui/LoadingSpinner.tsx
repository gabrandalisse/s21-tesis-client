import React from 'react'
import { Loader2 } from 'lucide-react'

export interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({
  message,
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={`text-center py-8 ${className}`}>
      <Loader2
        className={`${iconSizes[size]} animate-spin text-primary-600 mx-auto ${
          message ? 'mb-3' : ''
        }`}
      />
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  )
}
