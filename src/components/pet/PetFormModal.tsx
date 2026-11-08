'use client'

import { useState } from 'react'
import type { Pet } from '@/store/types/interfaces'
import PhotoUpload from '@/components/common/PhotoUpload'

export interface PetFormModalProps {
  pet?: Pet
  onSave: (petData: Omit<Pet, 'id' | 'ownerId'>) => void
  onCancel: () => void
  petTypes?: Array<{ id: number; name: string }>
  petBreeds?: Array<{ id: number; name: string; typeId: number }>
  petColors?: Array<{ id: number; name: string }>
  petSizes?: Array<{ id: number; name: string }>
  petSexes?: Array<{ id: number; name: string }>
}

export default function PetFormModal({
  pet,
  onSave,
  onCancel,
  petTypes = [],
  petBreeds = [],
  petColors = [],
  petSizes = [],
  petSexes = [],
}: PetFormModalProps) {
  const [formData, setFormData] = useState({
    name: pet?.name || '',
    species: pet?.species || '',
    breed: pet?.breed || '',
    age: pet?.age || 1,
    color: pet?.color || '',
    size: pet?.size || '',
    sex: pet?.sex || '',
    distinguishingFeatures: pet?.distinguishingFeatures || '',
    photo: pet?.photo || '',
    typeId: pet?.typeId as number | undefined,
    breedId: pet?.breedId as number | undefined,
    colorId: pet?.colorId as number | undefined,
    sizeId: pet?.sizeId as number | undefined,
    sexId: pet?.sexId as number | undefined,
  })

  // Breeds come straight from the backend, filtered by the selected type id
  const getBreedOptions = () => {
    if (!formData.typeId) return []
    return petBreeds.filter((breed) => breed.typeId === formData.typeId)
  }

  const nameById = (list: Array<{ id: number; name: string }>, id?: number) =>
    list.find((item) => item.id === id)?.name || ''

  const toId = (value: string) => (value ? parseInt(value) : undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {pet ? 'Editar Mascota' : 'Agregar Mascota'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Mascota
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="ej. Buddy"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especie
              </label>
              <select
                required
                className="input-field"
                value={formData.typeId || ''}
                onChange={(e) => {
                  const typeId = toId(e.target.value)
                  setFormData((prev) => ({
                    ...prev,
                    typeId,
                    species: nameById(petTypes, typeId),
                    breedId: undefined,
                    breed: '',
                  }))
                }}
              >
                <option value="">Seleccionar especie</option>
                {petTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raza
              </label>
              <select
                required
                className="input-field"
                value={formData.breedId || ''}
                disabled={!formData.typeId}
                onChange={(e) => {
                  const breedId = toId(e.target.value)
                  setFormData((prev) => ({
                    ...prev,
                    breedId,
                    breed: nameById(petBreeds, breedId),
                  }))
                }}
              >
                <option value="">Seleccionar raza</option>
                {getBreedOptions().map((breed) => (
                  <option key={breed.id} value={breed.id}>
                    {breed.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edad (años)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  required
                  className="input-field"
                  placeholder="ej. 2"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, age: parseInt(e.target.value) || 1 }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.colorId || ''}
                  onChange={(e) => {
                    const colorId = toId(e.target.value)
                    setFormData((prev) => ({
                      ...prev,
                      colorId,
                      color: nameById(petColors, colorId),
                    }))
                  }}
                >
                  <option value="">Seleccionar color</option>
                  {petColors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamaño
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.sizeId || ''}
                  onChange={(e) => {
                    const sizeId = toId(e.target.value)
                    setFormData((prev) => ({
                      ...prev,
                      sizeId,
                      size: nameById(petSizes, sizeId),
                    }))
                  }}
                >
                  <option value="">Seleccionar tamaño</option>
                  {petSizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sexo
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.sexId || ''}
                  onChange={(e) => {
                    const sexId = toId(e.target.value)
                    setFormData((prev) => ({
                      ...prev,
                      sexId,
                      sex: nameById(petSexes, sexId),
                    }))
                  }}
                >
                  <option value="">Seleccionar sexo</option>
                  {petSexes.map((sex) => (
                    <option key={sex.id} value={sex.id}>
                      {sex.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Características Distintivas
              </label>
              <textarea
                className="input-field h-24 resize-none"
                placeholder="ej. Mancha negra en su oreja izquierda"
                value={formData.distinguishingFeatures}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    distinguishingFeatures: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto de la Mascota
              </label>
              <PhotoUpload
                type="pet"
                currentPhoto={formData.photo}
                onPhotoUploaded={(photoUrl) =>
                  setFormData((prev) => ({ ...prev, photo: photoUrl }))
                }
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button type="submit" className="flex-1 btn-primary">
                {pet ? 'Actualizar Mascota' : 'Agregar Mascota'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 btn-outline"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
