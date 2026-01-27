// API configuration and base client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Types for API responses
export interface ApiResponse<T> {
  data: T
  message?: string
}

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

export interface User {
  id: number
  email: string
  name: string
  phone?: string
  lat?: number
  long?: number
  createdAt: string
}

export interface Pet {
  id: number
  name: string
  userId: number
  typeId?: number
  breedId?: number
  colorId?: number
  sizeId?: number
  sexId?: number
  age: number // Changed from string to number based on schema
  photoUrl?: string
  distinctiveCharacteristics?: string
  createdAt: string
  type?: PetType
  breed?: PetBreed
  color?: PetColor
  size?: PetSize
  sex?: PetSex
}

export interface Report {
  id: number
  petId: number
  reportTypeId: number
  description: string
  photoUrl?: string
  lat: number
  long: number
  reportedById: number
  reportedAt: string // Changed from createdAt/updatedAt
  resolvedAt?: string
  resolved: boolean
  type?: string // The actual API returns type as a string directly
  pet?: Pet
  reportType?: ReportType
  reportedBy?: User
}

export interface PetType {
  id: number
  name: string
}

export interface PetBreed {
  id: number
  name: string
  typeId: number
}

export interface PetColor {
  id: number
  name: string
}

export interface PetSize {
  id: number
  name: string
}

export interface PetSex {
  id: number
  name: string
}

export interface ReportType {
  id: number
  name: string
}

export interface ReportMatch {
  id: number
  lostReportId: number
  foundReportId: number
  matchScore: number
  distanceKilometers: number
  status: string
  createdAt: string
  foundReport?: Report // Will be populated when fetching matches
}

export interface Chat {
  id: number
  reportId: number
  createdAt: string
  updatedAt: string
  report?: Report
  participants: ChatParticipant[]
  messages: Message[]
}

export interface ChatParticipant {
  id: number
  chatId: number
  userId: number
  joinedAt: string
  user: User
}

export interface Message {
  id: number
  chatId: number
  senderId: number
  content: string
  read: boolean
  createdAt: string
  sender: User
}

// API client class
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Try to get token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          this.clearToken()
          // Trigger logout in auth store if available
          if (typeof window !== 'undefined') {
            // Clear persisted auth state
            localStorage.removeItem('auth-storage')
            // Redirect to login page
            window.location.href = '/login'
          }
          throw new Error('Session expired. Please log in again.')
        }
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    email: string
    name: string
    password: string
    phone?: string
    lat: number
    long: number
  }): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
    })
    this.clearToken()
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile')
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/user')
  }

  async getUserById(id: number): Promise<User> {
    return this.request<User>(`/user/${id}`)
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/user/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: number): Promise<void> {
    return this.request(`/user/${id}`, {
      method: 'DELETE',
    })
  }

  // Pet endpoints
  async createPet(petData: {
    name: string
    typeId: number
    breedId: number
    colorId: number
    sizeId: number
    sexId: number
    age: number // Changed from string to number
    photoUrl?: string
    distinctiveCharacteristics?: string
  }): Promise<Pet> {
    // Provide default photoUrl if not provided
    const petDataWithDefaults = {
      ...petData,
      photoUrl: petData.photoUrl || '/api/placeholder/400/300', // Default placeholder image
      distinctiveCharacteristics: petData.distinctiveCharacteristics || ''
    }
    
    return this.request<Pet>('/pet', {
      method: 'POST',
      body: JSON.stringify(petDataWithDefaults),
    })
  }

  async getPets(): Promise<Pet[]> {
    return this.request<Pet[]>('/pet')
  }

  async getPetById(id: number): Promise<Pet> {
    return this.request<Pet>(`/pet/${id}`)
  }

  async deletePet(id: number): Promise<void> {
    return this.request(`/pet/${id}`, {
      method: 'DELETE',
    })
  }

  // Report endpoints
  async createReport(reportData: {
    petId: number
    reportTypeId: number
    description: string
    photoUrl?: string
    lat: number
    long: number
  }): Promise<Report> {
    // Provide default photoUrl if not provided
    const reportDataWithDefaults = {
      ...reportData,
      photoUrl: reportData.photoUrl || '/api/placeholder/400/300', // Default placeholder image
    }
    
    return this.request<Report>('/report', {
      method: 'POST',
      body: JSON.stringify(reportDataWithDefaults),
    })
  }

  async getReports(includeResolved = false): Promise<Report[]> {
    const query = includeResolved ? '?includeResolved=true' : ''
    return this.request<Report[]>(`/report${query}`)
  }

  async getReportById(id: number): Promise<Report> {
    return this.request<Report>(`/report/${id}`)
  }

  async updateReport(id: number, reportData: Partial<Report>): Promise<Report> {
    return this.request<Report>(`/report/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(reportData),
    })
  }

  async deleteReport(id: number): Promise<void> {
    return this.request(`/report/${id}`, {
      method: 'DELETE',
    })
  }

  // Pet reference data endpoints
  async getPetTypes(withBreeds = false): Promise<PetType[]> {
    const query = withBreeds ? '?withBreeds=true' : ''
    return this.request<PetType[]>(`/pet-type${query}`)
  }

  async getPetBreeds(): Promise<PetBreed[]> {
    return this.request<PetBreed[]>('/pet-breed')
  }

  async getPetColors(): Promise<PetColor[]> {
    return this.request<PetColor[]>('/pet-color')
  }

  async getPetSizes(): Promise<PetSize[]> {
    return this.request<PetSize[]>('/pet-size')
  }

  async getPetSexes(): Promise<PetSex[]> {
    return this.request<PetSex[]>('/pet-sex')
  }

  async getReportTypes(): Promise<ReportType[]> {
    return this.request<ReportType[]>('/report-type')
  }

  // Report matching
  async getReportMatches(lostReportId: number): Promise<ReportMatch[]> {
    return this.request<ReportMatch[]>(`/report-match/${lostReportId}`)
  }

  // Chat endpoints
  async createChat(reportId: number, participantIds: number[]): Promise<Chat> {
    return this.request<Chat>('/chat', {
      method: 'POST',
      body: JSON.stringify({ reportId, participantIds }),
    })
  }

  async getUserChats(): Promise<Chat[]> {
    return this.request<Chat[]>('/chat')
  }

  async getChatById(chatId: number): Promise<Chat> {
    return this.request<Chat>(`/chat/${chatId}`)
  }

  async sendMessage(chatId: number, content: string): Promise<Message> {
    return this.request<Message>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ chatId, content }),
    })
  }

  async markMessagesAsRead(chatId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/chat/${chatId}/read`, {
      method: 'PATCH',
    })
  }

  // File upload methods
  async uploadPetPhoto(file: File): Promise<{ filename: string; originalName: string; size: number; url: string }> {
    const formData = new FormData()
    formData.append('photo', file)

    const url = `${this.baseURL}/uploads/pet`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Pet photo upload failed:', error)
      throw error
    }
  }

  async uploadReportPhoto(file: File): Promise<{ filename: string; originalName: string; size: number; url: string }> {
    const formData = new FormData()
    formData.append('photo', file)

    const url = `${this.baseURL}/uploads/report`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Report photo upload failed:', error)
      throw error
    }
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL)