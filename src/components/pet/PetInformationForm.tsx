'use client'

import { useState, useEffect } from 'react'
import { Pet } from '@/store/petStore'
import PhotoUpload from '@/components/common/PhotoUpload'

export interface PetFormData extends Omit<Pet, 'id' | 'ownerId'> {
  typeId?: number
  breedId?: number
  colorId?: number
  sizeId?: number
  sexId?: number
}

export interface PetInformationFormProps {
  onPetDataChange: (data: PetFormData) => void
  petSizes?: Array<{ id: number; name: string }>
  petSexes?: Array<{ id: number; name: string }>
  petTypes?: Array<{ id: number; name: string }>
  petBreeds?: Array<{ id: number; name: string; typeId: number }>
  petColors?: Array<{ id: number; name: string }>
  initialData?: Partial<PetFormData>
}

export default function PetInformationForm({
  onPetDataChange,
  petSizes = [],
  petSexes = [],
  petTypes = [],
  petBreeds = [],
  petColors = [],
  initialData,
}: PetInformationFormProps) {
  const [petData, setPetData] = useState<PetFormData>({
    name: initialData?.name || '',
    species: initialData?.species || 'dog',
    breed: initialData?.breed || '',
    age: initialData?.age ?? 1,
    color: initialData?.color || '',
    size: initialData?.size || '',
    sex: initialData?.sex || '',
    distinguishingFeatures: initialData?.distinguishingFeatures || '',
    photo: initialData?.photo || '',
    typeId: initialData?.typeId,
    breedId: initialData?.breedId,
    colorId: initialData?.colorId,
    sizeId: initialData?.sizeId,
    sexId: initialData?.sexId,
  })

  // Initialize with default data on mount
  useEffect(() => {
    onPetDataChange(petData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Get breeds filtered by selected typeId
  const getBreedOptions = () => {
    if (!petData.typeId) return []
    return petBreeds.filter((breed) => breed.typeId === petData.typeId)
  }

  const handleChange = (field: keyof PetFormData, value: string | number | undefined) => {
    const newData: PetFormData = { ...petData, [field]: value }

    // When type changes, reset breed
    if (field === 'typeId') {
      newData.breedId = undefined
      newData.breed = ''
    }

    // Update display names based on selected IDs
    if (field === 'typeId') {
      const selectedType = petTypes.find((t) => t.id === value)
      newData.species = (selectedType?.name.toLowerCase() as 'dog' | 'cat' | 'bird' | 'other') || 'other'
    }
    if (field === 'breedId') {
      const selectedBreed = petBreeds.find((b) => b.id === value)
      newData.breed = selectedBreed?.name || ''
    }
    if (field === 'colorId') {
      const selectedColor = petColors.find((c) => c.id === value)
      newData.color = selectedColor?.name || ''
    }
    if (field === 'sizeId') {
      const selectedSize = petSizes.find((s) => s.id === value)
      newData.size = selectedSize?.name || ''
    }
    if (field === 'sexId') {
      const selectedSex = petSexes.find((s) => s.id === value)
      newData.sex = selectedSex?.name || ''
    }

    setPetData(newData)
    onPetDataChange(newData)
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la mascota
          </label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="ej. Desconocido"
            value={petData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Especie
          </label>
          <select
            required
            className="input-field"
            value={petData.typeId || ''}
            onChange={(e) => handleChange('typeId', parseInt(e.target.value))}
          >
            <option value="">Seleccionar especie</option>
            {petTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Raza (si se conoce)
          </label>
          <select
            className="input-field"
            value={petData.breedId || ''}
            onChange={(e) => handleChange('breedId', parseInt(e.target.value))}
            disabled={!petData.typeId}
          >
            <option value="">Seleccionar raza</option>
            {getBreedOptions().map((breed) => (
              <option key={breed.id} value={breed.id}>
                {breed.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Edad aproximada (años)
          </label>
          <input
            type="number"
            min="0"
            max="30"
            className="input-field"
            placeholder="ej. 2"
            value={petData.age}
            onChange={(e) => handleChange('age', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color/Marcas
        </label>
        <select
          required
          className="input-field"
          value={petData.colorId || ''}
          onChange={(e) => handleChange('colorId', parseInt(e.target.value))}
        >
          <option value="">Seleccionar color</option>
          {petColors.map((color) => (
            <option key={color.id} value={color.id}>
              {color.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tamaño
          </label>
          <select
            className="input-field"
            value={petData.sizeId || ''}
            onChange={(e) => handleChange('sizeId', parseInt(e.target.value))}
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
            className="input-field"
            value={petData.sexId || ''}
            onChange={(e) => handleChange('sexId', parseInt(e.target.value))}
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
          placeholder="Describe cualquier característica única, comportamiento o artículos que llevaba la mascota..."
          value={petData.distinguishingFeatures}
          onChange={(e) => handleChange('distinguishingFeatures', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Foto de la Mascota (Opcional)
        </label>
        <PhotoUpload
          type="report"
          currentPhoto={petData.photo}
          onPhotoUploaded={(photoUrl) => handleChange('photo', photoUrl)}
        />
      </div>
    </div>
  )
}
