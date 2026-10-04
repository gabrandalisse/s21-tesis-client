import { StateCreator } from 'zustand'
import { apiClient } from '@/services/api'
import { CatalogSlice, PetStoreState } from './types'

export const createCatalogSlice: StateCreator<
  PetStoreState,
  [],
  [],
  CatalogSlice
> = (set) => ({
  petTypes: [],
  petBreeds: [],
  petColors: [],
  petSizes: [],
  petSexes: [],
  reportTypes: [],

  loadPetTypes: async () => {
    try {
      const petTypes = await apiClient.getPetTypes(true)
      set({ petTypes })
    } catch (error) {
      console.error('Failed to load pet types:', error)
    }
  },

  loadPetBreeds: async () => {
    try {
      const petBreeds = await apiClient.getPetBreeds()
      set({ petBreeds })
    } catch (error) {
      console.error('Failed to load pet breeds:', error)
    }
  },

  loadPetColors: async () => {
    try {
      const petColors = await apiClient.getPetColors()
      set({ petColors })
    } catch (error) {
      console.error('Failed to load pet colors:', error)
    }
  },

  loadPetSizes: async () => {
    try {
      const petSizes = await apiClient.getPetSizes()
      set({ petSizes })
    } catch (error) {
      console.error('Failed to load pet sizes:', error)
    }
  },

  loadPetSexes: async () => {
    try {
      const petSexes = await apiClient.getPetSexes()
      set({ petSexes })
    } catch (error) {
      console.error('Failed to load pet sexes:', error)
    }
  },

  loadReportTypes: async () => {
    try {
      const reportTypes = await apiClient.getReportTypes()
      set({ reportTypes })
    } catch (error) {
      console.error('Failed to load report types:', error)
    }
  },
})
