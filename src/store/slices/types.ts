import { 
  type Pet as ApiPet, 
  type Report as ApiReport, 
  type PetType, 
  type PetBreed, 
  type PetColor, 
  type PetSize, 
  type PetSex, 
  type ReportType 
} from '@/services/api'

export interface Pet {
  id: string
  name: string
  species: 'dog' | 'cat' | 'bird' | 'other'
  breed: string
  age: number
  color: string
  size: string
  sex: string
  distinguishingFeatures: string
  photo?: string
  ownerId: string
  isTemporary?: boolean
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
    additionalContacts?: Array<{ name: string; phone: string }>
  }
  status: 'active' | 'resolved'
  createdAt: string
  updatedAt: string
  reportTypeId?: number
  reportedById?: number
  distanceKm?: number
}

// Slice Interfaces
export interface CommonSlice {
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export interface CatalogSlice {
  petTypes: PetType[]
  petBreeds: PetBreed[]
  petColors: PetColor[]
  petSizes: PetSize[]
  petSexes: PetSex[]
  reportTypes: ReportType[]

  loadPetTypes: () => Promise<void>
  loadPetBreeds: () => Promise<void>
  loadPetColors: () => Promise<void>
  loadPetSizes: () => Promise<void>
  loadPetSexes: () => Promise<void>
  loadReportTypes: () => Promise<void>
}

export interface PetSlice {
  pets: Pet[]

  addPet: (pet: Omit<Pet, 'id'>) => Promise<string>
  updatePet: (id: string, pet: Partial<Pet>) => Promise<void>
  deletePet: (id: string) => Promise<void>
  loadPets: () => Promise<void>
}

export interface ReportSlice {
  reports: Report[]
  userReports: Report[]

  addReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateReport: (id: string, report: Partial<Report>) => Promise<void>
  updateReportStatus: (id: string, status: 'active' | 'resolved') => Promise<void>
  loadReports: (includeResolved?: boolean) => Promise<void>
  loadUserReports: (includeResolved?: boolean) => Promise<Report[]>
  loadReportById: (id: string) => Promise<Report | null>

  getReportsByUser: (userId: string) => Report[]
  getLatestReports: () => Report[]
  getReportById: (id: string) => Report | undefined
}

export type PetStoreState = CommonSlice & CatalogSlice & PetSlice & ReportSlice

// Helper function to convert API pet to store pet format
export const convertApiPetToStorePet = (apiPet: ApiPet): Pet => {
  const getSpecies = (typeName?: string): 'dog' | 'cat' | 'bird' | 'other' => {
    if (!typeName) return 'other'
    const lowerType = typeName.toLowerCase()
    if (['dog', 'cat', 'bird'].includes(lowerType)) {
      return lowerType as 'dog' | 'cat' | 'bird'
    }
    return 'other'
  }

  const getAbsolutePhotoUrl = (photoUrl?: string): string | undefined => {
    if (!photoUrl) return undefined

    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl
    }

    if (photoUrl.startsWith('/api/uploads/')) {
      const backendUrl = 'http://localhost:3001'
      return `${backendUrl}${photoUrl}`
    }

    return photoUrl
  }

  return {
    id: apiPet.id.toString(),
    name: apiPet.name,
    species: getSpecies(apiPet.type?.name),
    breed: apiPet.breed?.name || '',
    age: apiPet.age,
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
      phone: apiReport.reportedBy?.phone || '',
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
