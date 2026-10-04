'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Report } from '@/store/types/interfaces'
import { useAuthStore } from '@/store/authStore'
import { MapPin, Clock, MessageCircle } from 'lucide-react'
import { formatPetInfo } from '@/utils/formatPetInfo'
import { formatRelativeTime, formatFullDate } from '@/utils/formatDate'
import { ReportTypeBadge } from '@/components/ui/ReportTypeBadge'
import { ReportStatusBadge } from '@/components/ui/ReportStatusBadge'

export interface ReportCardProps {
  report: Report
}

export default function ReportCard({ report }: ReportCardProps) {
  const { user } = useAuthStore()

  const isOwner = Boolean(
    user && (
      (user.id && report.pet?.ownerId && String(report.pet.ownerId) === String(user.id)) ||
      (user.id && report.reportedById && String(report.reportedById) === String(user.id)) ||
      (user.email && report.contactInfo?.email && report.contactInfo.email.toLowerCase() === user.email.toLowerCase())
    )
  )

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Photo & Badges */}
      <div className="relative">
        <div className="aspect-w-16 aspect-h-12 bg-gray-200">
          {report.pet.photo ? (
            <Image
              src={report.pet.photo}
              alt={report.pet.name}
              width={400}
              height={192}
              className={`w-full h-48 object-cover ${
                report.status === 'resolved' ? 'opacity-60' : ''
              }`}
            />
          ) : (
            <div
              className={`w-full h-48 bg-gray-200 flex items-center justify-center ${
                report.status === 'resolved' ? 'opacity-60' : ''
              }`}
            >
              <span className="text-gray-400">Sin foto</span>
            </div>
          )}
        </div>
        <div className="absolute top-4 left-4">
          <ReportTypeBadge type={report.type} size="md" />
        </div>
        {report.status === 'resolved' && (
          <div className="absolute top-4 right-4">
            <ReportStatusBadge status="resolved" size="md" />
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {report.pet.name}
        </h3>
        <p className="text-gray-600 mb-3">
          {formatPetInfo(
            report.pet.breed,
            report.pet.color,
            report.pet.size,
            report.pet.sex,
            report.pet.species
          )}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{report.location.address}</span>
          </div>
          {report.distanceKm !== undefined && (
            <div className="flex items-center text-sm text-primary-600 font-medium">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>a {report.distanceKm.toFixed(1)} km de distancia</span>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span title={report.createdAt ? formatFullDate(report.createdAt) : `${report.date} a las ${report.time}`}>
              {report.createdAt ? formatRelativeTime(report.createdAt) : `${report.date} a las ${report.time}`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/report/${report.id}`}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Ver Detalles
          </Link>
          {!isOwner && report.status === 'active' ? (
            <Link
              href={`/report/${report.id}#chat`}
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">Contactar</span>
            </Link>
          ) : isOwner ? (
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
              Tu reporte
            </span>
          ) : (
            <span
              className="text-xs text-gray-500"
              title={report.createdAt ? formatFullDate(report.createdAt) : undefined}
            >
              Reportado {report.createdAt ? formatRelativeTime(report.createdAt) : 'recientemente'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
