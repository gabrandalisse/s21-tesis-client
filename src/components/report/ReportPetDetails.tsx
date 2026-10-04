'use client'

import { ReactNode } from 'react'
import { Calendar } from 'lucide-react'
import type { Report } from '@/store/types/interfaces'
import { translateSpecies } from '@/utils/translateSpecies'
import InfoCard from '@/components/ui/InfoCard'
import { ReportTypeBadge } from '@/components/ui/ReportTypeBadge'
import { ReportStatusBadge } from '@/components/ui/ReportStatusBadge'
import ReportMap from './ReportMap'

export interface ReportPetDetailsProps {
  report: Report
  children?: ReactNode
}

export default function ReportPetDetails({ report, children }: ReportPetDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Status Badge & Photo */}
      <div className="relative">
        <div className="aspect-w-16 aspect-h-12 bg-gray-200">
          {report.pet.photo ? (
            <img
              src={report.pet.photo}
              alt={report.pet.name}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-lg">Sin foto disponible</span>
            </div>
          )}
        </div>
        <div className="absolute top-4 left-4">
          <ReportTypeBadge type={report.type} size="lg" />
        </div>
        {report.status === 'resolved' && (
          <div className="absolute top-4 right-4">
            <ReportStatusBadge status="resolved" size="lg" />
          </div>
        )}
      </div>

      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{report.pet.name}</h1>

        {/* Pet Specs Grid with Generic InfoCard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <InfoCard label="Especie" value={translateSpecies(report.pet.species)} capitalize />
          <InfoCard label="Raza" value={report.pet.breed} />
          <InfoCard label="Edad" value={report.pet.age} />
          <InfoCard label="Color" value={report.pet.color} />
          <InfoCard label="Tamaño" value={report.pet.size} />
          <InfoCard label="Sexo" value={report.pet.sex} />
        </div>

        {/* Distinguishing Features */}
        {report.pet.distinguishingFeatures && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Características Distintivas
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {report.pet.distinguishingFeatures}
            </p>
          </div>
        )}

        {/* Additional Details */}
        {report.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Detalles Adicionales
            </h3>
            <p className="text-gray-700 leading-relaxed">{report.description}</p>
          </div>
        )}

        {/* Location and Time */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {report.type === 'lost'
              ? 'Visto por Última Vez En'
              : 'Encontrado Sano y Salvo En'}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <Calendar className="h-5 w-5 mr-3 text-primary-500" />
              <span>
                {report.date}, {report.time}
              </span>
            </div>

            <ReportMap
              coordinates={report.location.coordinates}
              address={report.location.address}
              petName={report.pet.name}
              reportType={report.type}
            />
          </div>
        </div>

        {/* Dynamic section slots: Chat, Matches, Actions */}
        {children}
      </div>
    </div>
  )
}
