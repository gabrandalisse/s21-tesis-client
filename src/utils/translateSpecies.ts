/**
 * Translates pet species from English to Spanish.
 */
export function translateSpecies(species: string): string {
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
