// Utility functions for pet-related operations

/**
 * Translates pet species from English to Spanish
 */
export const translateSpecies = (species: string): string => {
  switch (species.toLowerCase()) {
    case 'dog':
      return 'Perro'
    case 'cat':
      return 'Gato'
    case 'bird':
      return 'Ave'
    case 'other':
      return 'Otro'
    default:
      return species
  }
}

/**
 * Formats pet information for display (breed, color, size, sex)
 */
export const formatPetInfo = (breed?: string, color?: string, size?: string, sex?: string, species?: string): string => {
  const info = [breed, color, size, sex].filter(Boolean)
  
  if (info.length > 0) {
    return info.join(' • ')
  }
  
  // Fallback to species if no other info available
  return species ? translateSpecies(species) : 'Información no disponible'
}