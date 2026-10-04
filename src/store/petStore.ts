import { create } from 'zustand'
import { PetStoreState } from './slices/types'
import { createCommonSlice } from './slices/createCommonSlice'
import { createCatalogSlice } from './slices/createCatalogSlice'
import { createPetSlice } from './slices/createPetSlice'
import { createReportSlice } from './slices/createReportSlice'

// Re-export types and helpers for 100% backward compatibility
export type {
  Pet,
  Report,
  CommonSlice,
  CatalogSlice,
  PetSlice,
  ReportSlice,
  PetStoreState,
} from './slices/types'

export {
  convertApiPetToStorePet,
  convertApiReportToStoreReport,
} from './slices/types'

// Re-export slice creators
export { createCommonSlice } from './slices/createCommonSlice'
export { createCatalogSlice } from './slices/createCatalogSlice'
export { createPetSlice } from './slices/createPetSlice'
export { createReportSlice } from './slices/createReportSlice'

// Unified Root Store combining all slices via the Zustand Slice Pattern
export const usePetStore = create<PetStoreState>()((...a) => ({
  ...createCommonSlice(...a),
  ...createCatalogSlice(...a),
  ...createPetSlice(...a),
  ...createReportSlice(...a),
}))