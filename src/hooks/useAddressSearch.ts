import { useState, useEffect, useRef, useCallback } from 'react'

export interface PhotonFeature {
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

export interface PhotonResponse {
  features: PhotonFeature[]
}

export interface AddressResult {
  display: string
  coordinates: {
    lat: number
    lng: number
  }
  raw: PhotonFeature
}

export interface UseAddressSearchOptions {
  debounceMs?: number
  minChars?: number
  limit?: number
  lang?: string
  enabled?: boolean
}

export interface UseAddressSearchReturn {
  suggestions: AddressResult[]
  isLoading: boolean
  error: string | null
  searchAddresses: (searchQuery: string) => Promise<AddressResult[]>
  reverseGeocode: (lat: number, lng: number) => Promise<string>
  clearSuggestions: () => void
}

/**
 * Format Photon feature into readable human address
 */
export const formatAddress = (feature: PhotonFeature): string => {
  const props = feature.properties
  const parts: string[] = []

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

  return parts.join(', ') || 'Ubicación desconocida'
}

/**
 * Custom hook to encapsulate address search, Photon API querying,
 * debouncing, and reverse geocoding.
 */
export function useAddressSearch(
  query: string = '',
  options: UseAddressSearchOptions = {}
): UseAddressSearchReturn {
  const {
    debounceMs = 300,
    minChars = 3,
    limit = 5,
    lang = 'en',
    enabled = true,
  } = options

  const [suggestions, setSuggestions] = useState<AddressResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const searchAddresses = useCallback(
    async (searchQuery: string): Promise<AddressResult[]> => {
      if (searchQuery.trim().length < minChars) {
        setSuggestions([])
        return []
      }

      // Cancel previous pending search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      setIsLoading(true)
      setError(null)

      try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
          searchQuery
        )}&limit=${limit}&lang=${lang}`

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error('Error al buscar sugerencias de dirección')
        }

        const data: PhotonResponse = await response.json()

        const results: AddressResult[] = data.features.map((feature) => ({
          display: formatAddress(feature),
          coordinates: {
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
          },
          raw: feature,
        }))

        setSuggestions(results)
        return results
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return []
        }
        console.error('Error fetching address suggestions:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setSuggestions([])
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [minChars, limit, lang]
  )

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      try {
        const response = await fetch(
          `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}&limit=1&lang=${lang}`
        )

        if (!response.ok) {
          throw new Error('Failed to reverse geocode')
        }

        const data: PhotonResponse = await response.json()

        if (data.features.length > 0) {
          return formatAddress(data.features[0])
        }

        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      } catch (err) {
        console.error('Error reverse geocoding:', err)
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      }
    },
    [lang]
  )

  const clearSuggestions = useCallback(() => {
    setSuggestions([])
  }, [])

  // Debounced auto-search when query changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (enabled && query.trim().length >= minChars) {
      debounceTimerRef.current = setTimeout(() => {
        searchAddresses(query)
      }, debounceMs)
    } else if (!enabled) {
      // Do not clear if disabled externally unless query was empty
    } else {
      setSuggestions([])
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, enabled, debounceMs, minChars, searchAddresses])

  return {
    suggestions,
    isLoading,
    error,
    searchAddresses,
    reverseGeocode,
    clearSuggestions,
  }
}
