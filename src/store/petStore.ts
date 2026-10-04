import { create } from 'zustand'
import { PetStoreState } from './types/interfaces'
import { createCommonSlice } from './slices/createCommonSlice'
import { createCatalogSlice } from './slices/createCatalogSlice'
import { createPetSlice } from './slices/createPetSlice'
import { createReportSlice } from './slices/createReportSlice'

export const usePetStore = create<PetStoreState>()((...a) => ({
  ...createCommonSlice(...a),
  ...createCatalogSlice(...a),
  ...createPetSlice(...a),
  ...createReportSlice(...a),
}))