import { create } from 'zustand'
import { apiClient, type Pet as ApiPet, type Report as ApiReport, type PetType, type PetBreed, type PetColor, type PetSize, type PetSex, type ReportType } from '@/services/api'

export interface Pet {
  id: string
  name: string
  species: 'dog' | 'cat' | 'bird' | 'other'
  breed: string
  age: number // Changed to number
  color: string
  size: string
  sex: string
  distinguishingFeatures: string
  photo?: string
  ownerId: string
  isTemporary?: boolean
  // Additional fields from API - these should be set by the form
  typeId?: number
  breedId?: number
  colorId?: number
  sizeId?: number
  sexId?: number
}

export interface Report {
  id: string
  type: 'lost' | 'found'
  pet: Pet
  location: {
    address: string
    coordinates: { lat: number; lng: number }
  }
  date: string
  time: string
  description: string
  contactInfo: {
    name: string
    phone: string
    email: string
    additionalContacts?: Array<{name: string, phone: string}>
  }
  status: 'active' | 'resolved'
  createdAt: string
  updatedAt: string
  // Additional fields from API
  reportTypeId?: number
  reportedById?: number
  distanceKm?: number
}

interface PetState {
  pets: Pet[]
  reports: Report[]
  userReports: Report[]
  petTypes: PetType[]
  petBreeds: PetBreed[]
  petColors: PetColor[]
  petSizes: PetSize[]
  petSexes: PetSex[]
  reportTypes: ReportType[]
  isLoading: boolean
  error: string | null
  
  // Pet actions
  addPet: (pet: Omit<Pet, 'id'>) => Promise<string>
  updatePet: (id: string, pet: Partial<Pet>) => Promise<void>
  deletePet: (id: string) => Promise<void>
  loadPets: () => Promise<void>
  
  // Report actions
  addReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateReport: (id: string, report: Partial<Report>) => Promise<void>
  updateReportStatus: (id: string, status: 'active' | 'resolved') => Promise<void>
  loadReports: (includeResolved?: boolean) => Promise<void>
  loadUserReports: (includeResolved?: boolean) => Promise<Report[]>
  loadReportById: (id: string) => Promise<Report | null>
  
  // Reference data actions
  loadPetTypes: () => Promise<void>
  loadPetBreeds: () => Promise<void>
  loadPetColors: () => Promise<void>
  loadPetSizes: () => Promise<void>
  loadPetSexes: () => Promise<void>
  loadReportTypes: () => Promise<void>
  
  // Query methods
  getReportsByUser: (userId: string) => Report[]
  getLatestReports: () => Report[]
  getReportById: (id: string) => Report | undefined
  
  // Utility
  clearError: () => void
}

// Helper function to convert API pet to store pet format
export const convertApiPetToStorePet = (apiPet: ApiPet): Pet => {
  // Helper function to safely get species from type name
  const getSpecies = (typeName?: string): 'dog' | 'cat' | 'bird' | 'other' => {
    if (!typeName) return 'other'
    const lowerType = typeName.toLowerCase()
    if (['dog', 'cat', 'bird'].includes(lowerType)) {
      return lowerType as 'dog' | 'cat' | 'bird'
    }
    return 'other'
  }

  // Helper function to ensure photo URL is absolute
  const getAbsolutePhotoUrl = (photoUrl?: string): string | undefined => {
    if (!photoUrl) return undefined
    
    // If it's already an absolute URL, return as is
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl
    }
    
    // If it's a relative URL starting with /api/uploads, make it absolute
    if (photoUrl.startsWith('/api/uploads/')) {
      // Use the same base URL as the API client
      const backendUrl = 'http://localhost:3001' // This should match the backend port
      return `${backendUrl}${photoUrl}`
    }
    
    return photoUrl
  }

  return {
    id: apiPet.id.toString(),
    name: apiPet.name,
    species: getSpecies(apiPet.type?.name),
    breed: apiPet.breed?.name || '',
    age: apiPet.age, // Keep as number
    color: apiPet.color?.name || '',
    size: apiPet.size?.name || '',
    sex: apiPet.sex?.name || '',
    distinguishingFeatures: apiPet.distinctiveCharacteristics || '',
    photo: getAbsolutePhotoUrl(apiPet.photoUrl),
    ownerId: apiPet.userId.toString(),
    typeId: apiPet.typeId,
    breedId: apiPet.breedId,
    colorId: apiPet.colorId,
    sizeId: apiPet.sizeId,
    sexId: apiPet.sexId,
  }
}

// Helper function to convert API report to store report format
export const convertApiReportToStoreReport = (apiReport: ApiReport): Report => {
  // Use address from API if available, otherwise use coordinates as fallback
  const address = apiReport.address || (apiReport.lat != null && apiReport.long != null ? `${apiReport.lat.toFixed(4)}, ${apiReport.long.toFixed(4)}` : '')
  const rawType = (apiReport.type || apiReport.reportType?.name || 'lost').toLowerCase()
  const reportType: 'lost' | 'found' = (rawType.includes('found') || rawType.includes('encontrad')) ? 'found' : 'lost'

  return {
    id: apiReport.id.toString(),
    type: reportType,
    pet: apiReport.pet ? convertApiPetToStorePet(apiReport.pet) : {} as Pet,
    location: {
      address,
      coordinates: { lat: apiReport.lat ?? 0, lng: apiReport.long ?? 0 }
    },
    date: apiReport.reportedAt ? new Date(apiReport.reportedAt).toLocaleDateString() : '',
    time: apiReport.reportedAt ? new Date(apiReport.reportedAt).toLocaleTimeString() : '',
    description: apiReport.description || '',
    contactInfo: {
      name: apiReport.reportedBy?.name || '',
      phone: apiReport.reportedBy?.phone || '', // Now available from the fixed backend
      email: apiReport.reportedBy?.email || '',
    },
    status: apiReport.resolved ? 'resolved' : 'active',
    createdAt: apiReport.reportedAt || new Date().toISOString(),
    updatedAt: apiReport.resolvedAt || apiReport.reportedAt || new Date().toISOString(),
    reportTypeId: apiReport.reportTypeId,
    reportedById: apiReport.reportedById,
    distanceKm: apiReport.distanceKm,
  }
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  reports: [],
  userReports: [],
  petTypes: [],
  petBreeds: [],
  petColors: [],
  petSizes: [],
  petSexes: [],
  reportTypes: [],
  isLoading: false,
  error: null,
  
  addPet: async (petData) => {
    set({ isLoading: true, error: null })
    try {
      // Find the appropriate IDs for the pet data
      const { petTypes, petBreeds, petColors, petSizes, petSexes } = get()
      
      const typeId = petTypes.find(t => t.name.toLowerCase() === petData.species)?.id || 1
      const breedId = petBreeds.find(b => b.name === petData.breed)?.id || 1
      const colorId = petColors.find(c => c.name === petData.color)?.id || 1
      const sizeId = petSizes.find(s => s.name === petData.size)?.id || 1
      const sexId = petSexes.find(s => s.name === petData.sex)?.id || 1
      
      // Convert age to number if it's a string
      const ageNumber = typeof petData.age === 'number' ? petData.age : (typeof petData.age === 'string' ? parseInt(petData.age) : 1) || 1
      
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
      console.log('Adding new pet to store:', newPet)
      console.log('Current pets before adding:', get().pets.length)
      
      set(state => ({ 
        pets: [...state.pets, newPet],
        isLoading: false 
      }))
      
      console.log('Pets after adding:', get().pets.length)
      return newPet.id
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to add pet' 
      })
      throw error
    }
  },
  
  updatePet: async (id, petData) => {
    set({ isLoading: true, error: null })
    try {
      // Note: API doesn't have update pet endpoint, so we'll update locally for now
      set(state => ({
        pets: state.pets.map(pet => 
          pet.id === id ? { ...pet, ...petData } : pet
        ),
        isLoading: false
      }))
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to update pet' 
      })
    }
  },
  
  deletePet: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deletePet(parseInt(id))
      set(state => ({
        pets: state.pets.filter(pet => pet.id !== id),
        isLoading: false
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete pet'
      set({ 
        isLoading: false, 
        error: errorMessage
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
        error: error instanceof Error ? error.message : 'Failed to load pets' 
      })
    }
  },
  
  addReport: async (reportData) => {
    set({ isLoading: true, error: null })
    try {
      // Ensure reference data is loaded before proceeding
      const { petTypes, petBreeds, petColors, petSizes, petSexes, reportTypes } = get()
      
      if (petTypes.length === 0 || petBreeds.length === 0 || petColors.length === 0 || 
          petSizes.length === 0 || petSexes.length === 0 || reportTypes.length === 0) {
        throw new Error('Los datos de referencia no están cargados. Por favor, recarga la página e intenta de nuevo.')
      }
      
      // First, create the pet if it doesn't exist (for found pets)
      let petId: number
      const isExistingPet = Boolean(
        reportData.pet.id &&
        reportData.pet.id !== 'unknown' &&
        !reportData.pet.id.toString().startsWith('temp_') &&
        !reportData.pet.isTemporary &&
        reportData.type !== 'found'
      )

      if (isExistingPet) {
        // This is an existing pet (lost pet case)
        petId = parseInt(reportData.pet.id)
        console.log('Using existing pet with ID:', petId)
      } else {
        // Create a new pet for this report (found pet case)
        
        // Validate that we have the required IDs from the form
        if (!reportData.pet.typeId || !reportData.pet.colorId) {
          throw new Error('Faltan datos requeridos del formulario. Por favor, selecciona al menos la especie y el color.')
        }
        
        console.log('Creating new pet for found report with data:', {
          name: reportData.pet.name,
          typeId: reportData.pet.typeId,
          colorId: reportData.pet.colorId,
          age: reportData.pet.age
        })
        
        const apiPet = await apiClient.createPet({
          name: reportData.pet.name || 'Desconocido',
          typeId: reportData.pet.typeId,
          breedId: reportData.pet.breedId || petBreeds.find(b => b.typeId === reportData.pet.typeId)?.id || petBreeds[0]?.id,
          colorId: reportData.pet.colorId,
          sizeId: reportData.pet.sizeId || petSizes[0]?.id,
          sexId: reportData.pet.sexId || petSexes[0]?.id,
          age: reportData.pet.age || 1, // Now expecting a number
          photoUrl: reportData.pet.photo,
          distinctiveCharacteristics: reportData.pet.distinguishingFeatures || '',
        })
        petId = apiPet.id
        console.log('Created new pet with ID:', petId)
      }
      
      // Find report type ID
      const reportTypeMatch = reportTypes.find(rt => rt.name.toLowerCase() === reportData.type.toLowerCase())
      const reportTypeId = reportTypeMatch?.id
      
      if (!reportTypeId) {
        console.error('Report type lookup failed:', {
          searchType: reportData.type,
          availableTypes: reportTypes.map(rt => rt.name)
        })
        throw new Error(`Tipo de reporte '${reportData.type}' no encontrado. Tipos disponibles: ${reportTypes.map(rt => rt.name).join(', ')}`)
      }
      
      console.log('Creating report with petId:', petId, 'reportTypeId:', reportTypeId)
      
      const apiReport = await apiClient.createReport({
        petId,
        reportTypeId,
        description: reportData.description,
        photoUrl: reportData.pet.photo,
        lat: reportData.location.coordinates.lat,
        long: reportData.location.coordinates.lng,
      })
      
      const newReport = convertApiReportToStoreReport(apiReport)
      set(state => ({ 
        reports: [newReport, ...state.reports],
        isLoading: false 
      }))
      return newReport.id
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to add report' 
      })
      throw error
    }
  },
  
  updateReport: async (id, reportData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedReport = await apiClient.updateReport(parseInt(id), reportData as any)
      const report = convertApiReportToStoreReport(updatedReport)
      
      set(state => ({
        reports: state.reports.map(r =>
          r.id === id ? report : r
        ),
        isLoading: false
      }))
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to update report' 
      })
    }
  },
  
  updateReportStatus: async (id: string, status: 'active' | 'resolved') => {
    set({ isLoading: true, error: null })
    try {
      // Convert status to API format - only send resolved field
      const resolved = status === 'resolved'
      
      // Update via API - only send the resolved field
      await apiClient.updateReport(parseInt(id), { resolved })
      
      // Update local state in place to preserve all reports (both geo and user reports)
      set(state => ({
        reports: state.reports.map(r => r.id === id ? { ...r, status } : r),
        userReports: state.userReports.map(r => r.id === id ? { ...r, status } : r),
        isLoading: false,
      }))
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to update report status' 
      })
      throw error
    }
  },
  
  loadReports: async (includeResolved = false) => {
    set({ isLoading: true, error: null })
    try {
      const apiReports = await apiClient.getReports(includeResolved)
      const reports = apiReports.map(convertApiReportToStoreReport)
      set({ reports, isLoading: false })
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load reports' 
      })
    }
  },

  loadUserReports: async (includeResolved = true): Promise<Report[]> => {
    set({ isLoading: true, error: null })
    try {
      const apiReports = await apiClient.getMyReports(includeResolved)
      const userReports = apiReports.map(convertApiReportToStoreReport)
      
      set(state => {
        // Merge into reports so getReportById and other lookups find them
        const userReportIds = new Set(userReports.map(r => r.id))
        const remainingReports = state.reports.filter(r => !userReportIds.has(r.id))
        return {
          userReports,
          reports: [...userReports, ...remainingReports],
          isLoading: false,
        }
      })
      return userReports
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load user reports' 
      })
      return []
    }
  },
  
  loadReportById: async (id: string): Promise<Report | null> => {
    set({ isLoading: true, error: null })
    try {
      const apiReport = await apiClient.getReportById(parseInt(id))
      const report = convertApiReportToStoreReport(apiReport)
      set(state => {
        const exists = state.reports.some(r => r.id === id)
        const updatedReports = exists
          ? state.reports.map(r => r.id === id ? report : r)
          : [report, ...state.reports]
        return {
          reports: updatedReports,
          isLoading: false
        }
      })
      return report
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Error al cargar el reporte' 
      })
      return null
    }
  },
  
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
  
  getReportsByUser: (userId) => {
    const list = get().userReports.length > 0 ? get().userReports : get().reports
    return list.filter(report => report.contactInfo.email === userId || report.reportedById?.toString() === userId)
  },
  
  getLatestReports: () => {
    return get().reports
      .filter(report => report.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  },
  
  getReportById: (id) => {
    return get().reports.find(report => report.id === id)
  },
  
  clearError: () => {
    set({ error: null })
  }
}))