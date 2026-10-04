'use client'

import { useState, useEffect } from 'react'
import { usePetStore } from '@/store/petStore'
import type { Pet } from '@/store/types/interfaces'
import { useAuthStore } from '@/store/authStore'
import Navigation from '@/components/layout/Navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ConfirmModal from '@/components/ui/ConfirmModal'
import PetCard from '@/components/pet/PetCard'
import PetFormModal from '@/components/pet/PetFormModal'
import { Plus, Heart } from 'lucide-react'

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
      const userPets = storePets.filter(pet => pet.ownerId === user.id)
      setPets(userPets)
    }
  }, [storePets, user])

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
    deletePet(petId).catch((err) => {
      console.error('Failed to delete pet:', err)
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
              <h1 className="text-3xl font-bold text-gray-900">Mis Mascotas</h1>
              <p className="text-gray-600 mt-2">
                Administra los perfiles de tus mascotas para crear reportes rápidamente cuando sea necesario
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Agregar Mascota</span>
            </button>
          </div>

          {/* Pets Grid */}
          {pets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Heart className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no has agregado mascotas</h3>
              <p className="text-gray-600 mb-6">
                Agrega perfiles de tus mascotas para crear reportes de forma inmediata si alguna vez se extravían.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Agregar Tu Primera Mascota
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  onEdit={(p) => setEditingPet(p)}
                  onDelete={(p) => setDeletingPet(p)}
                />
              ))}
            </div>
          )}

          {/* Add Pet Form Modal */}
          {showAddForm && (
            <PetFormModal
              onSave={handleAddPet}
              onCancel={() => setShowAddForm(false)}
              petTypes={petTypes}
              petBreeds={petBreeds}
              petColors={petColors}
              petSizes={petSizes}
              petSexes={petSexes}
            />
          )}

          {/* Edit Pet Form Modal */}
          {editingPet && (
            <PetFormModal
              pet={editingPet}
              onSave={handleUpdatePet}
              onCancel={() => setEditingPet(null)}
              petTypes={petTypes}
              petBreeds={petBreeds}
              petColors={petColors}
              petSizes={petSizes}
              petSexes={petSexes}
            />
          )}

          {/* Delete Confirmation Modal */}
          <ConfirmModal
            isOpen={deletingPet !== null}
            title="Eliminar Perfil de Mascota"
            message={`¿Estás seguro de que deseas eliminar el perfil de ${deletingPet?.name}? Esta acción no se puede deshacer. Nota: No puedes eliminar una mascota que tenga reportes asociados.`}
            confirmText="Eliminar"
            cancelText="Cancelar"
            variant="danger"
            onConfirm={() => deletingPet && handleDeletePet(deletingPet.id)}
            onCancel={() => setDeletingPet(null)}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
}