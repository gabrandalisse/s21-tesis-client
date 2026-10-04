// Generic API response structure
export interface ApiResponse<T> {
  data: T
  message?: string
}

// Authentication API responses
export interface LoginResponse {
  access_token: string
  user: {
    id: number
    email: string
    name: string
    phone?: string
    lat: number
    long: number
  }
}

// User DTO as returned by API
export interface ApiUser {
  id: number
  email: string
  name: string
  phone?: string
  lat?: number
  long?: number
  createdAt: string
}

// Pet Catalogs DTOs
export interface ApiPetType {
  id: number
  name: string
}

export interface ApiPetBreed {
  id: number
  name: string
  typeId: number
}

export interface ApiPetColor {
  id: number
  name: string
}

export interface ApiPetSize {
  id: number
  name: string
}

export interface ApiPetSex {
  id: number
  name: string
}

export interface ApiReportType {
  id: number
  name: string
}

// Pet DTO as returned by API
export interface ApiPet {
  id: number
  name: string
  userId: number
  typeId?: number
  breedId?: number
  colorId?: number
  sizeId?: number
  sexId?: number
  age: number
  photoUrl?: string
  distinctiveCharacteristics?: string
  createdAt: string
  type?: ApiPetType
  breed?: ApiPetBreed
  color?: ApiPetColor
  size?: ApiPetSize
  sex?: ApiPetSex
}

// Report DTO as returned by API
export interface ApiReport {
  id: number
  petId: number
  reportTypeId: number
  description: string
  photoUrl?: string
  lat: number
  long: number
  address?: string
  reportedById: number
  reportedAt: string
  resolvedAt?: string
  resolved: boolean
  type?: string
  pet?: ApiPet
  reportType?: ApiReportType
  reportedBy?: ApiUser
  distanceKm?: number
}

// Report Match DTO as returned by API
export interface ApiReportMatch {
  id: number
  lostReportId: number
  foundReportId: number
  matchScore: number
  distanceKilometers: number
  status: string
  createdAt: string
  foundReport?: ApiReport
}

// Chat Participant DTO as returned by API
export interface ApiChatParticipant {
  id: number
  chatId: number
  userId: number
  joinedAt: string
  user: ApiUser
}

// Message DTO as returned by API
export interface ApiMessage {
  id: number
  chatId: number
  senderId: number
  content: string
  read: boolean
  createdAt: string
  sender: ApiUser
}

// Chat DTO as returned by API
export interface ApiChat {
  id: number
  reportId: number
  createdAt: string
  updatedAt: string
  report?: ApiReport
  participants: ApiChatParticipant[]
  messages: ApiMessage[]
}

// WebSocket Message structure
export interface SocketMessage {
  id: number
  chatId: number
  senderId: number
  senderName: string
  content: string
  createdAt: string
  read: boolean
}

