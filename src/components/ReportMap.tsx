'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

// Fix Leaflet marker icons
let DefaultIcon: any
let L: any

if (typeof window !== 'undefined') {
  L = require('leaflet')
  
  DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
  
  L.Marker.prototype.options.icon = DefaultIcon
}

interface ReportMapProps {
  coordinates: {
    lat: number
    lng: number
  }
  address?: string
  petName: string
  reportType: 'lost' | 'found'
  className?: string
}

export default function ReportMap({ 
  coordinates, 
  address, 
  petName, 
  reportType, 
  className = '' 
}: ReportMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [resolvedAddress, setResolvedAddress] = useState<string>(address || '')

  useEffect(() => {
    setIsClient(true)
    
    // If no address is provided, reverse geocode the coordinates
    if (!address && coordinates.lat !== 0 && coordinates.lng !== 0) {
      reverseGeocode(coordinates.lat, coordinates.lng)
    }
  }, [address, coordinates])

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}&limit=1&lang=en`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.features && data.features.length > 0) {
          const feature = data.features[0]
          const props = feature.properties
          const parts: string[] = []

          // Build address from components
          if (props.housenumber && props.street) {
            parts.push(`${props.housenumber} ${props.street}`)
          } else if (props.street) {
            parts.push(props.street)
          } else if (props.name) {
            parts.push(props.name)
          }

          if (props.city) {
            parts.push(props.city)
          }

          if (props.state && props.country) {
            parts.push(`${props.state}, ${props.country}`)
          } else if (props.country) {
            parts.push(props.country)
          }

          const formattedAddress = parts.join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          setResolvedAddress(formattedAddress)
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      setResolvedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    }
  }

  // Don't render on server side
  if (!isClient) {
    return (
      <div className={`bg-gray-200 h-48 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p>Loading map...</p>
        </div>
      </div>
    )
  }

  // Show fallback if coordinates are invalid
  if (!coordinates.lat || !coordinates.lng || coordinates.lat === 0 || coordinates.lng === 0) {
    return (
      <div className={`bg-gray-200 h-48 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p>Location not available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Address Display */}
      {resolvedAddress && (
        <div className="flex items-center text-gray-700">
          <MapPin className="h-5 w-5 mr-3 text-primary-500 flex-shrink-0" />
          <span>{resolvedAddress}</span>
        </div>
      )}
      
      {/* Map */}
      <div className="h-48 rounded-lg overflow-hidden border border-gray-200 relative z-0">
        <MapContainer
          center={[coordinates.lat, coordinates.lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker 
            position={[coordinates.lat, coordinates.lng]}
            icon={DefaultIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>{petName}</strong>
                <br />
                {reportType === 'lost' ? 'Last seen here' : 'Found here'}
                {resolvedAddress && (
                  <>
                    <br />
                    <span className="text-sm text-gray-600">{resolvedAddress}</span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      
      {/* Coordinates for reference */}
      <div className="text-xs text-gray-500 text-center">
        {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
      </div>
    </div>
  )
}