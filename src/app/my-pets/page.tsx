'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePetStore, Pet } from '@/store/petStore'
import { useAuthStore } from '@/store/authStore'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import PhotoUpload from '@/components/PhotoUpload'
import ConfirmModal from '@/components/ConfirmModal'
import { Plus, Edit2, Trash2, Heart, Camera } from 'lucide-react'

export default function MyPetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null)
  const { 
    pets: storePets, 
    addPet, 
    updatePet, 
    deletePet,
    loadPets,
    petSizes,
    petSexes,
    petTypes,
    petBreeds,
    petColors,
    loadPetSizes,
    loadPetSexes,
    loadPetTypes,
    loadPetBreeds,
    loadPetColors,
    error,
    clearError
  } = usePetStore()
  const { user } = useAuthStore()

  useEffect(() => {
    // Load all reference data
    loadPetSizes()
    loadPetSexes()
    loadPetTypes()
    loadPetBreeds()
    loadPetColors()
    
    // Load pets when user is available
    if (user) {
      loadPets()
    }
  }, [loadPetSizes, loadPetSexes, loadPetTypes, loadPetBreeds, loadPetColors, loadPets, user])

  useEffect(() => {
    if (user) {
      console.log('Filtering pets for user:', user.id)
      console.log('All pets in store:', storePets.length)
      const userPets = storePets.filter(pet => pet.ownerId === user.id)
      console.log('User pets after filtering:', userPets.length)
      console.log('User pets:', userPets.map(p => `${p.id}: ${p.name} (owner: ${p.ownerId})`))
      setPets(userPets)
    }
  }, [storePets, user])

  const PetForm = ({ pet, onSave, onCancel }: {
    pet?: Pet
    onSave: (petData: Omit<Pet, 'id' | 'ownerId'>) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      name: pet?.name || '',
      species: pet?.species || 'dog' as const,
      breed: pet?.breed || '',
      age: pet?.age || 1, // Changed to number
      color: pet?.color || '',
      size: pet?.size || '',
      sex: pet?.sex || '',
      distinguishingFeatures: pet?.distinguishingFeatures || '',
      photo: pet?.photo || ''
    })

    // Map species to typeId for filtering breeds (English names only)
    const getTypeIdForSpecies = (species: string) => {
      const typeMap: Record<string, string> = {
        'dog': 'Dog',
        'cat': 'Cat', 
        'bird': 'Bird',
        'other': 'Other'
      }
      const typeName = typeMap[species]
      return petTypes.find(type => type.name === typeName)?.id
    }

    // Get breeds filtered by selected species
    const getBreedOptions = () => {
      const typeId = getTypeIdForSpecies(formData.species)
      if (!typeId) return []
      return petBreeds.filter(breed => breed.typeId === typeId)
    }

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
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especie
                </label>
                <select
                  className="input-field"
                  value={formData.species}
                  onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value as Pet['species'] }))}
                >
                  <option value="dog">Perro</option>
                  <option value="cat">Gato</option>
                  <option value="bird">Ave</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raza
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.breed}
                  onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                >
                  <option value="">Seleccionar raza</option>
                  {getBreedOptions().map(breed => (
                    <option key={breed.id} value={breed.name}>{breed.name}</option>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  >
                    <option value="">Seleccionar color</option>
                    {petColors.map(color => (
                      <option key={color.id} value={color.name}>{color.name}</option>
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
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  >
                    <option value="">Seleccionar tamaño</option>
                    {petSizes.map(size => (
                      <option key={size.id} value={size.name}>{size.name}</option>
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
                    value={formData.sex}
                    onChange={(e) => setFormData(prev => ({ ...prev, sex: e.target.value }))}
                  >
                    <option value="">Seleccionar sexo</option>
                    {petSexes.map(sex => (
                      <option key={sex.id} value={sex.name}>{sex.name}</option>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, distinguishingFeatures: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto de la Mascota
                </label>
                <PhotoUpload
                  type="pet"
                  currentPhoto={formData.photo}
                  onPhotoUploaded={(photoUrl) => setFormData(prev => ({ ...prev, photo: photoUrl }))}
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

  const handleAddPet = (petData: Omit<Pet, 'id' | 'ownerId'>) => {
    if (user) {
      addPet({ ...petData, ownerId: user.id })
      setShowAddForm(false)
    }
  }

  const handleUpdatePet = (petData: Omit<Pet, 'id' | 'ownerId'>) => {
    if (editingPet) {
      updatePet(editingPet.id, petData)
      setEditingPet(null)
    }
  }

  const handleDeletePet = (petId: string) => {
    setDeletingPet(null)
    deletePet(petId).catch((error) => {
      // Error is already set in the store, just log it
      console.error('Failed to delete pet:', error)
    })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Pets</h1>
              <p className="text-gray-600 mt-2">
                Manage your pet profiles to quickly create reports when needed
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Pet</span>
            </button>
          </div>

          {/* Pets Grid */}
          {pets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Heart className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pets added yet</h3>
              <p className="text-gray-600 mb-6">
                Add your pet profiles to quickly create reports if they ever go missing.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Add Your First Pet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <div key={pet.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                    {pet.photo ? (
                      <Image
                        src={pet.photo}
                        alt={pet.name}
                        width={320}
                        height={192}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {pet.name}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {pet.breed} • {pet.color} • {pet.age}
                    </p>
                    
                    {pet.distinguishingFeatures && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {pet.distinguishingFeatures}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setEditingPet(pet)}
                        className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="text-sm">Edit</span>
                      </button>
                      
                      <div className="flex space-x-2">
                        <Link
                          href={`/create-report?petId=${pet.id}`}
                          className="text-sm bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded transition-colors"
                        >
                          Create Report
                        </Link>
                        <button
                          onClick={() => setDeletingPet(pet)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Pet Form Modal */}
          {showAddForm && (
            <PetForm
              onSave={handleAddPet}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* Edit Pet Form Modal */}
          {editingPet && (
            <PetForm
              pet={editingPet}
              onSave={handleUpdatePet}
              onCancel={() => setEditingPet(null)}
            />
          )}

          {/* Delete Confirmation Modal */}
          <ConfirmModal
            isOpen={deletingPet !== null}
            title="Delete Pet Profile"
            message={`Are you sure you want to delete ${deletingPet?.name}'s profile? This action cannot be undone. Note: You cannot delete a pet that has associated reports.`}
            confirmText="Delete"
            cancelText="Cancel"
            variant="danger"
            onConfirm={() => deletingPet && handleDeletePet(deletingPet.id)}
            onCancel={() => setDeletingPet(null)}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
}