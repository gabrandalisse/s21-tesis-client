import { StateCreator } from 'zustand'
import { CommonSlice, PetStoreState } from './types'

export const createCommonSlice: StateCreator<
  PetStoreState,
  [],
  [],
  CommonSlice
> = (set) => ({
  isLoading: false,
  error: null,

  clearError: () => {
    set({ error: null })
  },
})
