import type { Coordinates } from './types/interfaces'

/**
 * Convert coordinates to a human-readable address using reverse geocoding.
 * Uses OpenStreetMap's Nominatim service.
 */
export async function reverseGeocode(coordinates: Coordinates): Promise<string> {
  try {
    const { lat, lng } = coordinates

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Petly-App/1.0',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Servicio de geocodificación no disponible')
    }

    const data = await response.json()

    if (data.display_name) {
      const address = data.address || {}
      const parts: string[] = []

      if (address.house_number && address.road) {
        parts.push(`${address.house_number} ${address.road}`)
      } else if (address.road) {
        parts.push(address.road)
      }

      if (address.neighbourhood || address.suburb) {
        parts.push(address.neighbourhood || address.suburb)
      }

      if (address.city || address.town || address.village) {
        parts.push(address.city || address.town || address.village)
      }

      if (address.state) {
        parts.push(address.state)
      }

      return parts.length > 0 ? parts.join(', ') : data.display_name
    }

    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } catch (error) {
    console.error('Error en geocodificación inversa:', error)
    return `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`
  }
}
