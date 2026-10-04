import type { Coordinates } from './types/interfaces'

/**
 * Convert an address string to coordinates using forward geocoding.
 */
export async function geocode(address: string): Promise<Coordinates | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1`,
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

    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      }
    }

    return null
  } catch (error) {
    console.error('Error en geocodificación:', error)
    return null
  }
}
