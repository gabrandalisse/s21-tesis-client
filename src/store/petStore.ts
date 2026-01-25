import { create } from 'zustand'
import { apiClient, type Pet as ApiPet, type Report as ApiReport, type PetType, type PetBreed, type PetColor, type PetSize, type PetSex, type ReportType } from '@/services/api'

export interface Pet {
  id: string
  name: string
  species: 'dog' | 'cat' | 'bird' | 'other'
  breed: string
  age: string
  color: string
  distinguishingFeatures: string
  photo?: string
  ownerId: string
  // Additional fields from API
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
}

interface PetState {
  pets: Pet[]
  reports: Report[]
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
  loadReports: () => Promise<void>
  
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
const convertApiPetToStorePet = (apiPet: ApiPet): Pet => {
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
    breed: apiPet.breed?.name || 'Unknown',
    age: `${apiPet.age} years`, // Convert number back to string format for UI
    color: apiPet.color?.name || 'Unknown',
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
const convertApiReportToStoreReport = (apiReport: ApiReport): Report => ({
  id: apiReport.id.toString(),
  type: apiReport.reportType?.name.toLowerCase() as 'lost' | 'found' || 'lost',
  pet: apiReport.pet ? convertApiPetToStorePet(apiReport.pet) : {} as Pet,
  location: {
    address: '', // This would need to be reverse geocoded from lat/lng
    coordinates: { lat: apiReport.lat, lng: apiReport.long }
  },
  date: new Date(apiReport.reportedAt).toLocaleDateString(),
  time: new Date(apiReport.reportedAt).toLocaleTimeString(),
  description: apiReport.description,
  contactInfo: {
    name: apiReport.reportedBy?.name || '',
    phone: '', // Not available in API response
    email: apiReport.reportedBy?.email || '',
  },
  status: apiReport.resolved ? 'resolved' : 'active',
  createdAt: apiReport.reportedAt,
  updatedAt: apiReport.resolvedAt || apiReport.reportedAt,
  reportTypeId: apiReport.reportTypeId,
  reportedById: apiReport.reportedById,
})

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  reports: [],
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
      const sizeId = petSizes[0]?.id || 1 // Default to first size
      const sexId = petSexes[0]?.id || 1 // Default to first sex
      
      // Convert age string to number (extract number from string like "2 years" -> 2)
      const ageNumber = parseInt(petData.age.match(/\d+/)?.[0] || '1')
      
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
      set(state => ({ 
        pets: [...state.pets, newPet],
        isLoading: false 
      }))
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
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete pet' 
      })
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
      // First, create the pet if it doesn't exist
      let petId: number
      if (reportData.pet.id && reportData.pet.id !== 'unknown') {
        petId = parseInt(reportData.pet.id)
      } else {
        // Create a new pet for this report
        const { petTypes, reportTypes } = get()
        const typeId = petTypes.find(t => t.name.toLowerCase() === reportData.pet.species)?.id || 1
        
        const apiPet = await apiClient.createPet({
          name: reportData.pet.name,
          typeId,
          breedId: 1, // Default values
          colorId: 1,
          sizeId: 1,
          sexId: 1,
          age: reportData.pet.age,
          photoUrl: reportData.pet.photo,
          distinctiveCharacteristics: reportData.pet.distinguishingFeatures,
        })
        petId = apiPet.id
      }
      
      // Find report type ID
      const { reportTypes } = get()
      const reportTypeId = reportTypes.find(rt => rt.name.toLowerCase() === reportData.type)?.id || 1
      
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
    // For now, update locally since API doesn't have status field
    set(state => ({
      reports: state.reports.map(report =>
        report.id === id 
          ? { ...report, status, updatedAt: new Date().toISOString() }
          : report
      )
    }))
  },
  
  loadReports: async () => {
    set({ isLoading: true, error: null })
    try {
      const apiReports = await apiClient.getReports()
      const reports = apiReports.map(convertApiReportToStoreReport)
      set({ reports, isLoading: false })
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load reports' 
      })
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
    return get().reports.filter(report => report.contactInfo.email === userId)
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