'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Navigation as NavigationIcon, Info } from 'lucide-react'
import type { ApiReportMatch } from '@/services/types/interfaces'
import type { Report } from '@/store/types/interfaces'

import LoadingSpinner from '@/components/ui/LoadingSpinner'

export interface MatchListCardProps {
  matches: ApiReportMatch[]
  matchedReports: Report[]
  isLoading?: boolean
}

export default function MatchListCard({
  matches,
  matchedReports,
  isLoading = false,
}: MatchListCardProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Posibles Coincidencias
      </h3>
      {isLoading ? (
        <LoadingSpinner message="Buscando coincidencias..." size="sm" className="py-4" />
      ) : matches.length > 0 ? (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm mb-4">
            Encontramos {matches.length} mascota{matches.length > 1 ? 's' : ''} encontrada{matches.length > 1 ? 's' : ''} que podrían coincidir con tu mascota perdida.
          </p>
          {matches.map((match) => {
            const matchedReport = matchedReports.find(
              (r) => r.id === match.foundReportId.toString()
            )
            if (!matchedReport) return null

            return (
              <div
                key={match.id}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex items-start space-x-4">
                  {matchedReport.pet.photo ? (
                    <Image
                      src={matchedReport.pet.photo}
                      alt={matchedReport.pet.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Sin foto</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {matchedReport.pet.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-700">
                            {Math.round(match.matchScore * 100)}% coincidencia
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <NavigationIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {match.distanceKilometers.toFixed(1)} km
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-2">
                      {[
                        matchedReport.pet.breed,
                        matchedReport.pet.color,
                        matchedReport.pet.size,
                        matchedReport.pet.sex,
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>

                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="truncate">{matchedReport.location.address}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Encontrada el {matchedReport.date}
                      </span>
                      <Link
                        href={`/report/${matchedReport.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">
            No se encontraron coincidencias aún. Seguiremos buscando automáticamente.
          </p>
        </div>
      )}
    </div>
  )
}
