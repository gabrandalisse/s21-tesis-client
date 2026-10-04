'use client'

import { CheckCircle, AlertCircle, Printer } from 'lucide-react'

export interface ReportActionsBarProps {
  status: 'active' | 'resolved'
  onStatusChange: () => void
  onPrint: () => void
}

export default function ReportActionsBar({
  status,
  onStatusChange,
  onPrint,
}: ReportActionsBarProps) {
  return (
    <div className="border-t pt-6 space-y-3">
      <button
        type="button"
        onClick={onStatusChange}
        className={`w-full flex items-center justify-center space-x-2 text-lg py-3 rounded-lg font-medium transition-colors ${
          status === 'active'
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        {status === 'active' ? (
          <>
            <CheckCircle className="h-5 w-5" />
            <span>¡Mascota Encontrada!</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5" />
            <span>Reabrir Reporte</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onPrint}
        className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700 print:hidden"
      >
        <Printer className="h-5 w-5" />
        <span>Imprimir Póster</span>
      </button>
    </div>
  )
}
