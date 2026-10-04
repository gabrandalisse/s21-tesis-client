'use client'

import { MapPin, Calendar, Clock } from 'lucide-react'
import AddressAutocomplete from '@/components/common/AddressAutocomplete'

export interface LocationPickerMapProps {
  title?: string
  address: string
  coordinates: { lat: number; lng: number }
  date: string
  time: string
  onAddressChange: (address: string, coordinates?: { lat: number; lng: number }) => void
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  defaultCoordinates?: { lat: number; lng: number }
}

export default function LocationPickerMap({
  title = 'Ubicación y Fecha',
  address,
  coordinates,
  date,
  time,
  onAddressChange,
  onDateChange,
  onTimeChange,
  defaultCoordinates,
}: LocationPickerMapProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="inline h-4 w-4 mr-1" />
            Dirección
          </label>
          <AddressAutocomplete
            value={address}
            onChange={onAddressChange}
            placeholder="Comienza a escribir una dirección..."
            className="input-field"
            required
            defaultCoordinates={defaultCoordinates}
          />
          {coordinates.lat !== 0 && coordinates.lng !== 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Coordenadas: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              Fecha
            </label>
            <input
              type="date"
              required
              className="input-field"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="inline h-4 w-4 mr-1" />
              Hora (aproximada)
            </label>
            <input
              type="time"
              required
              className="input-field"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
