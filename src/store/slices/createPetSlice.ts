import { StateCreator } from 'zustand'
import { apiClient } from '@/services/api'
import { PetStoreState } from '../types/types'
import { PetSlice } from '../types/interfaces'
import { convertApiPetToStorePet } from '../utils/converters'

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

      const typeId = petTypes.find((t) => t.name.toLowerCase() === petData.species)?.id || 1
      const breedId = petBreeds.find((b) => b.name === petData.breed)?.id || 1
      const colorId = petColors.find((c) => c.name === petData.color)?.id || 1
      const sizeId = petSizes.find((s) => s.name === petData.size)?.id || 1
      const sexId = petSexes.find((s) => s.name === petData.sex)?.id || 1

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
