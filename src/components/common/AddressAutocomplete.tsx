'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface PhotonFeature {
  geometry: {
    coordinates: [number, number] // [longitude, latitude]
  }
  properties: {
    name?: string
    street?: string
    housenumber?: string
    city?: string
    state?: string
    country?: string
    postcode?: string
    osm_type?: string
    osm_id?: number
    extent?: [number, number, number, number]
  }
}

interface PhotonResponse {
  features: PhotonFeature[]
}

interface AddressResult {
  display: string
  coordinates: {
    lat: number
    lng: number
  }
  raw: PhotonFeature
}

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void
  placeholder?: string
  className?: string
  required?: boolean
  defaultCoordinates?: { lat: number; lng: number }
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Enter address...",
  className = "",
  required = false,
  defaultCoordinates
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Format address for display
  const formatAddress = (feature: PhotonFeature): string => {
    const props = feature.properties
    const parts: string[] = []

    // Add house number and street
    if (props.housenumber && props.street) {
      parts.push(`${props.housenumber} ${props.street}`)
    } else if (props.street) {
      parts.push(props.street)
    } else if (props.name) {
      parts.push(props.name)
    }

    // Add city
    if (props.city) {
      parts.push(props.city)
    }

    // Add state/country
    if (props.state && props.country) {
      parts.push(`${props.state}, ${props.country}`)
    } else if (props.country) {
      parts.push(props.country)
    }

    return parts.join(', ') || 'Ubicación desconocida'
  }

  // Search for addresses using Photon API
  const searchAddresses = async (query: string): Promise<AddressResult[]> => {
    if (query.length < 3) return []

    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=en`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }

      const data: PhotonResponse = await response.json()
      
      return data.features.map(feature => ({
        display: formatAddress(feature),
        coordinates: {
          lat: feature.geometry.coordinates[1], // Photon returns [lng, lat]
          lng: feature.geometry.coordinates[0]
        },
        raw: feature
      }))
    } catch (error) {
      console.error('Error fetching address suggestions:', error)
      return []
    }
  }

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}&limit=1&lang=en`
      )
      
      if (!response.ok) {
        throw new Error('Failed to reverse geocode')
      }

      const data: PhotonResponse = await response.json()
      
      if (data.features.length > 0) {
        return formatAddress(data.features[0])
      }
      
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}` // Fallback to coordinates
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}` // Fallback to coordinates
    }
  }

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue) // Update parent immediately for controlled input
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce the API call
    debounceRef.current = setTimeout(async () => {
      if (newValue.length >= 3) {
        setIsLoading(true)
        const results = await searchAddresses(newValue)
        setSuggestions(results)
        setShowSuggestions(true)
        setSelectedIndex(-1)
        setIsLoading(false)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300) // 300ms debounce
  }

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: AddressResult) => {
    onChange(suggestion.display, suggestion.coordinates)
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Load default address from coordinates
  useEffect(() => {
    const loadDefaultAddress = async () => {
      if (defaultCoordinates && !value && defaultCoordinates.lat !== 0 && defaultCoordinates.lng !== 0) {
        setIsLoading(true)
        try {
          const address = await reverseGeocode(defaultCoordinates.lat, defaultCoordinates.lng)
          onChange(address, defaultCoordinates)
        } catch (error) {
          console.error('Error loading default address:', error)
          // Fallback to coordinates if reverse geocoding fails
          onChange(`${defaultCoordinates.lat.toFixed(4)}, ${defaultCoordinates.lng.toFixed(4)}`, defaultCoordinates)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadDefaultAddress()
  }, [defaultCoordinates]) // Remove value and onChange from dependencies to avoid infinite loops

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={isLoading && !value ? "Loading your location..." : placeholder}
          required={required}
          className={`pl-10 pr-10 ${className}`}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {suggestion.display}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {suggestion.coordinates.lat.toFixed(4)}, {suggestion.coordinates.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && suggestions.length === 0 && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No addresses found. Try a different search term.
          </div>
        </div>
      )}
    </div>
  )
}