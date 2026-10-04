import type { PhotonFeature } from './types/interfaces'

/**
 * Format Photon GeoJSON feature into a readable human address string.
 */
export function formatAddress(feature: PhotonFeature): string {
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
