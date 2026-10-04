import { config } from '@/config'
import {
  ApiResponse,
  LoginResponse,
  ApiUser,
  ApiPet,
  ApiReport,
  ApiPetType,
  ApiPetBreed,
  ApiPetColor,
  ApiPetSize,
  ApiPetSex,
  ApiReportType,
  ApiReportMatch,
  ApiChat,
  ApiChatParticipant,
  ApiMessage,
} from './types/interfaces'

export type {
  ApiResponse,
  LoginResponse,
  ApiUser,
  ApiPet,
  ApiReport,
  ApiPetType,
  ApiPetBreed,
  ApiPetColor,
  ApiPetSize,
  ApiPetSex,
  ApiReportType,
  ApiReportMatch,
  ApiChat,
  ApiChatParticipant,
  ApiMessage,
} from './types/interfaces'

// API configuration and base client
const API_BASE_URL = config.apiUrl

// API client class
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setToken(token: string) {
    this.token = token
  }

  clearToken() {
    this.token = null
  }

  getToken(): string | null {
    return this.token
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
        if (response.status === 401) {
          console.warn('🔒 401 Unauthorized - Token may be expired')

          // Clear token
          this.clearToken()

          // Only redirect if not on login/register pages
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname
            const isAuthPage =
              currentPath === '/login' || currentPath === '/register'

            if (!isAuthPage) {
              setTimeout(() => {
                window.location.href = '/login'
              }, 100)
            }
          }

          throw new Error('Session expired. Please log in again.')
        }

        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
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

  // User endpoints
  async getUsers(): Promise<ApiUser[]> {
    return this.request<ApiUser[]>('/user')
  }

  async getUserById(id: number): Promise<ApiUser> {
    return this.request<ApiUser>(`/user/${id}`)
  }

  async updateUser(id: number, userData: Partial<ApiUser>): Promise<ApiUser> {
    return this.request<ApiUser>(`/user/${id}`, {
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
    age: number
    photoUrl?: string
    distinctiveCharacteristics?: string
  }): Promise<ApiPet> {
    const petDataWithDefaults = {
      ...petData,
      photoUrl: petData.photoUrl || '/api/placeholder/400/300',
      distinctiveCharacteristics: petData.distinctiveCharacteristics || '',
    }

    return this.request<ApiPet>('/pet', {
      method: 'POST',
      body: JSON.stringify(petDataWithDefaults),
    })
  }

  async getPets(): Promise<ApiPet[]> {
    return this.request<ApiPet[]>('/pet')
  }

  async getPetById(id: number): Promise<ApiPet> {
    return this.request<ApiPet>(`/pet/${id}`)
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
  }): Promise<ApiReport> {
    const reportDataWithDefaults = {
      ...reportData,
      photoUrl: reportData.photoUrl || '/api/placeholder/400/300',
    }

    return this.request<ApiReport>('/report', {
      method: 'POST',
      body: JSON.stringify(reportDataWithDefaults),
    })
  }

  async getReports(includeResolved = false): Promise<ApiReport[]> {
    const query = includeResolved ? '?includeResolved=true' : ''
    return this.request<ApiReport[]>(`/report${query}`)
  }

  async getMyReports(includeResolved = false): Promise<ApiReport[]> {
    const query = includeResolved ? '?includeResolved=true' : ''
    return this.request<ApiReport[]>(`/report/user/me${query}`)
  }

  async getRecentReports(): Promise<ApiReport[]> {
    return this.request<ApiReport[]>('/report/public/recent')
  }

  async getReportById(id: number): Promise<ApiReport> {
    return this.request<ApiReport>(`/report/${id}`)
  }

  async updateReport(
    id: number,
    reportData: Partial<ApiReport>
  ): Promise<ApiReport> {
    return this.request<ApiReport>(`/report/${id}`, {
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
  async getPetTypes(withBreeds = false): Promise<ApiPetType[]> {
    const query = withBreeds ? '?withBreeds=true' : ''
    return this.request<ApiPetType[]>(`/pet-type${query}`)
  }

  async getPetBreeds(): Promise<ApiPetBreed[]> {
    return this.request<ApiPetBreed[]>('/pet-breed')
  }

  async getPetColors(): Promise<ApiPetColor[]> {
    return this.request<ApiPetColor[]>('/pet-color')
  }

  async getPetSizes(): Promise<ApiPetSize[]> {
    return this.request<ApiPetSize[]>('/pet-size')
  }

  async getPetSexes(): Promise<ApiPetSex[]> {
    return this.request<ApiPetSex[]>('/pet-sex')
  }

  async getReportTypes(): Promise<ApiReportType[]> {
    return this.request<ApiReportType[]>('/report-type')
  }

  // Report matching
  async getReportMatches(lostReportId: number): Promise<ApiReportMatch[]> {
    return this.request<ApiReportMatch[]>(`/report-match/${lostReportId}`)
  }

  // Chat endpoints
  async createChat(
    reportId: number,
    participantIds: number[]
  ): Promise<ApiChat> {
    return this.request<ApiChat>('/chat', {
      method: 'POST',
      body: JSON.stringify({ reportId, participantIds }),
    })
  }

  async getUserChats(): Promise<ApiChat[]> {
    return this.request<ApiChat[]>('/chat')
  }

  async getChatById(chatId: number): Promise<ApiChat> {
    return this.request<ApiChat>(`/chat/${chatId}`)
  }

  async sendMessage(chatId: number, content: string): Promise<ApiMessage> {
    return this.request<ApiMessage>('/chat/message', {
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
  async uploadPetPhoto(
    file: File
  ): Promise<{ filename: string; originalName: string; size: number; url: string }> {
    const formData = new FormData()
    formData.append('photo', file)

    const url = `${this.baseURL}/uploads/pet`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Pet photo upload failed:', error)
      throw error
    }
  }

  async uploadReportPhoto(
    file: File
  ): Promise<{ filename: string; originalName: string; size: number; url: string }> {
    const formData = new FormData()
    formData.append('photo', file)

    const url = `${this.baseURL}/uploads/report`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Report photo upload failed:', error)
      throw error
    }
  }

  // Device endpoints for push notifications
  async registerDevice(
    userId: number,
    subscription: PushSubscription
  ): Promise<void> {
    const subscriptionJson = subscription.toJSON()

    return this.request('/user-device', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        token: JSON.stringify(subscriptionJson),
        platform: 'web',
      }),
    })
  }

  async unregisterDevice(deviceId: number): Promise<void> {
    return this.request(`/user-device/${deviceId}`, {
      method: 'DELETE',
    })
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL)