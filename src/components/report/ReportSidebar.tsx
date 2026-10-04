'use client'

import { User, Phone, Mail } from 'lucide-react'
import { Report } from '@/store/petStore'
import InfoCard from '@/components/ui/InfoCard'
import { ReportStatusBadge } from '@/components/ui/Badge'

export interface ReportSidebarProps {
  report: Report
}

export default function ReportSidebar({ report }: ReportSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información de Contacto
        </h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-3 text-gray-400" />
            <span className="text-gray-700">{report.contactInfo.name}</span>
          </div>
          {report.contactInfo.phone && (
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-3 text-gray-400" />
              <span className="text-gray-700">{report.contactInfo.phone}</span>
            </div>
          )}
          <div className="flex items-center">
            <Mail className="h-5 w-5 mr-3 text-gray-400" />
            <span className="text-gray-700">{report.contactInfo.email}</span>
          </div>

          {report.contactInfo.additionalContacts &&
            report.contactInfo.additionalContacts.length > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Contactos Adicionales
                </h4>
                {report.contactInfo.additionalContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm text-gray-600 mb-1"
                  >
                    <span>{contact.name}</span>
                    <span>{contact.phone}</span>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Report Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detalles del Reporte
        </h3>
        <div className="space-y-3">
          <InfoCard
            variant="plain"
            label="Reportado por"
            value={report.contactInfo.name}
          />
          <InfoCard
            variant="plain"
            label="Reporte creado"
            value={new Date(report.createdAt).toLocaleDateString('es-ES')}
          />
          <div>
            <span className="text-sm text-gray-600 block mb-1">Estado</span>
            <ReportStatusBadge status={report.status} size="sm" />
          </div>
        </div>
      </div>
    </div>
  )
}
