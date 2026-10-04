import { translateSpecies } from './translateSpecies'

/**
 * Formats pet information for display (breed, color, size, sex).
 */
export function formatPetInfo(
  breed?: string,
  color?: string,
  size?: string,
  sex?: string,
  species?: string
): string {
  const info = [breed, color, size, sex].filter(Boolean)

  if (info.length > 0) {
    return info.join(' • ')
  }

  // Fallback to species if no other info available
  return species ? translateSpecies(species) : 'Información no disponible'
}
