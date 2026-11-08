import { StateCreator } from 'zustand'
import { apiClient } from '@/services/api'
import { PetStoreState, PetSlice } from '../types/interfaces'
import { convertApiPetToStorePet } from '../utils/convertApiPetToStorePet'

export const createPetSlice: StateCreator<
  PetStoreState,
  [],
  [],
  PetSlice
> = (set, get) => ({
  pets: [],

  addPet: async (petData) => {
    set({ isLoading: true, error: null })
    try {
      const { petTypes, petBreeds, petColors, petSizes, petSexes } = get()

      const typeId = petData.typeId ?? petTypes.find((t) => t.name === petData.species)?.id
      const breedId = petData.breedId ?? petBreeds.find((b) => b.name === petData.breed && b.typeId === typeId)?.id
      const colorId = petData.colorId ?? petColors.find((c) => c.name === petData.color)?.id
      const sizeId = petSizes.find((s) => s.id === petData.sizeId)?.id ?? petSizes.find((s) => s.name === petData.size)?.id
      const sexId = petSexes.find((s) => s.id === petData.sexId)?.id ?? petSexes.find((s) => s.name === petData.sex)?.id

      if (!typeId || !breedId || !colorId || !sizeId || !sexId) {
        throw new Error('Faltan datos del catálogo: seleccioná especie, raza, color, tamaño y sexo.')
      }

      const ageNumber =
        typeof petData.age === 'number'
          ? petData.age
          : (typeof petData.age === 'string' ? parseInt(petData.age) : 1) || 1

      const apiPet = await apiClient.createPet({
        name: petData.name,
        typeId,
        breedId,
        colorId,
        sizeId,
        sexId,
        age: ageNumber,
        photoUrl: petData.photo,
        distinctiveCharacteristics: petData.distinguishingFeatures,
      })

      const newPet = convertApiPetToStorePet(apiPet)
      set((state) => ({
        pets: [...state.pets, newPet],
        isLoading: false,
      }))

      return newPet.id
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add pet',
      })
      throw error
    }
  },

  updatePet: async (id, petData) => {
    set({ isLoading: true, error: null })
    try {
      set((state) => ({
        pets: state.pets.map((pet) =>
          pet.id === id ? { ...pet, ...petData } : pet
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update pet',
      })
    }
  },

  deletePet: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deletePet(parseInt(id))
      set((state) => ({
        pets: state.pets.filter((pet) => pet.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete pet'
      set({
        isLoading: false,
        error: errorMessage,
      })
      throw error
    }
  },

  loadPets: async () => {
    set({ isLoading: true, error: null })
    try {
      const apiPets = await apiClient.getPets()
      const pets = apiPets.map(convertApiPetToStorePet)
      set({ pets, isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load pets',
      })
    }
  },
})
