// Utility functions for geocoding and reverse geocoding

export interface Coordinates {
  lat: number
  lng: number
}

export interface Address {
  formatted: string
  city?: string
  state?: string
  country?: string
}

/**
 * Convert coordinates to a human-readable address using reverse geocoding
 * Uses OpenStreetMap's Nominatim service (free, no API key required)
 */
export async function reverseGeocode(coordinates: Coordinates): Promise<string> {
  try {
    const { lat, lng } = coordinates
    
    // Use Nominatim (OpenStreetMap) reverse geocoding service
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Petly-App/1.0' // Required by Nominatim
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('Servicio de geocodificación no disponible')
    }
    
    const data = await response.json()
    
    if (data.display_name) {
      // Extract relevant parts of the address
      const address = data.address || {}
      const parts = []
      
      // Add street info if available
      if (address.house_number && address.road) {
        parts.push(`${address.house_number} ${address.road}`)
      } else if (address.road) {
        parts.push(address.road)
      }
      
      // Add neighborhood or suburb
      if (address.neighbourhood || address.suburb) {
        parts.push(address.neighbourhood || address.suburb)
      }
      
      // Add city
      if (address.city || address.town || address.village) {
        parts.push(address.city || address.town || address.village)
      }
      
      // Add state/province
      if (address.state) {
        parts.push(address.state)
      }
      
      // Return formatted address or fall back to display_name
      return parts.length > 0 ? parts.join(', ') : data.display_name
    }
    
    // Fallback to coordinates if no address found
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } catch (error) {
    console.error('Error en geocodificación inversa:', error)
    // Fallback to coordinates
    return `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`
  }
}

/**
 * Convert an address string to coordinates using forward geocoding
 */
export async function geocode(address: string): Promise<Coordinates | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Petly-App/1.0'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('Servicio de geocodificación no disponible')
    }
    
    const data = await response.json()
    
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    }
    
    return null
  } catch (error) {
    console.error('Error en geocodificación:', error)
    return null
  }
}