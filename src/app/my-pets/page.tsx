'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePetStore, Pet } from '@/store/petStore'
import { useAuthStore } from '@/store/authStore'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Plus, Edit2, Trash2, Heart, Camera } from 'lucide-react'

export default function MyPetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const { pets: storePets, addPet, updatePet, deletePet } = usePetStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      const userPets = storePets.filter(pet => pet.ownerId === user.id)
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
      age: pet?.age || '',
      color: pet?.color || '',
      distinguishingFeatures: pet?.distinguishingFeatures || '',
      photo: pet?.photo || ''
    })

    // Predefined options
    const dogBreeds = [
      'Mixed Breed', 'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog',
      'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund', 'Siberian Husky',
      'Boxer', 'Border Collie', 'Chihuahua', 'Shih Tzu', 'Boston Terrier', 'Pomeranian',
      'Australian Shepherd', 'Cocker Spaniel', 'French Bulldog', 'Other'
    ]

    const catBreeds = [
      'Mixed Breed', 'Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'British Shorthair',
      'Abyssinian', 'Russian Blue', 'American Shorthair', 'Scottish Fold', 'Sphynx',
      'Bengal', 'Birman', 'Oriental Shorthair', 'Burmese', 'Norwegian Forest Cat', 'Other'
    ]

    const birdTypes = [
      'Parakeet', 'Canary', 'Cockatiel', 'Lovebird', 'Finch', 'Parrot', 'Cockatoo',
      'Macaw', 'Conure', 'Budgie', 'Other'
    ]

    const ages = [
      'Puppy/Kitten (0-1 year)', 'Young (1-3 years)', 'Adult (3-7 years)', 
      'Senior (7+ years)', 'Unknown'
    ]

    const colors = [
      'Black', 'White', 'Brown', 'Golden', 'Gray', 'Cream', 'Red', 'Blue', 
      'Silver', 'Tan', 'Chocolate', 'Blonde', 'Multi-colored', 'Black and White',
      'Brown and White', 'Gray and White', 'Other'
    ]

    const getBreedOptions = () => {
      switch (formData.species) {
        case 'dog': return dogBreeds
        case 'cat': return catBreeds
        case 'bird': return birdTypes
        default: return ['Mixed', 'Unknown', 'Other']
      }
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
              {pet ? 'Edit Pet' : 'Add Pet'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pet's Name
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Buddy"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Species
                </label>
                <select
                  className="input-field"
                  value={formData.species}
                  onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value as Pet['species'] }))}
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.breed}
                  onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                >
                  <option value="">Select breed</option>
                  {getBreedOptions().map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  >
                    <option value="">Select age</option>
                    {ages.map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
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
                    <option value="">Select color</option>
                    {colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distinguishing Features
                </label>
                <textarea
                  className="input-field h-24 resize-none"
                  placeholder="e.g. Black spot on his left ear"
                  value={formData.distinguishingFeatures}
                  onChange={(e) => setFormData(prev => ({ ...prev, distinguishingFeatures: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo URL (Optional)
                </label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.photo}
                  onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  {pet ? 'Update Pet' : 'Add Pet'}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 btn-outline"
                >
                  Cancel
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
    if (confirm('Are you sure you want to delete this pet profile?')) {
      deletePet(petId)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      <img
                        src={pet.photo}
                        alt={pet.name}
                        className="w-full h-48 object-cover"
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
                          onClick={() => handleDeletePet(pet.id)}
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
        </main>
      </div>
    </ProtectedRoute>
  )
}