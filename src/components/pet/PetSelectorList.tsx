'use client'

import { Pet } from '@/store/petStore'
import { Camera } from 'lucide-react'

export interface PetSelectorListProps {
  pets: Pet[]
  selectedPetId?: string
  onSelectPet: (pet: Pet) => void
  onAddPet: () => void
}

export default function PetSelectorList({
  pets,
  selectedPetId,
  onSelectPet,
  onAddPet,
}: PetSelectorListProps) {
  if (pets.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-4">
          Aún no has agregado ninguna mascota. Agrega primero un perfil de mascota.
        </p>
        <button
          type="button"
          onClick={onAddPet}
          className="btn-primary"
        >
          Agregar Perfil de Mascota
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {pets.map((pet) => (
        <button
          key={pet.id}
          type="button"
          onClick={() => onSelectPet(pet)}
          className={`p-4 rounded-lg border-2 text-left transition-colors ${
            selectedPetId === pet.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-4">
            {pet.photo ? (
              <img
                src={pet.photo}
                alt={pet.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <Camera className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900">{pet.name}</div>
              <div className="text-sm text-gray-600">
                {[pet.breed, pet.color, pet.size, pet.sex].filter(Boolean).join(' • ')}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
