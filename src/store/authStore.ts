import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient, type User as ApiUser, type LoginResponse } from '@/services/api'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  lat?: number
  long?: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Omit<User, 'id'> & { password: string; lat: number; long: number }) => Promise<boolean>
  logout: () => void
  updateProfile: (userData: Partial<User>) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response: LoginResponse = await apiClient.login(email, password)
          
          // Set the token in the API client
          apiClient.setToken(response.access_token)
          
          // Convert API user to store user format
          const user: User = {
            id: response.user.id.toString(),
            email: response.user.email,
            name: response.user.name,
            phone: response.user.phone,
            lat: response.user.lat,
            long: response.user.long,
          }
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })
          return true
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Login failed' 
          })
          return false
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response: LoginResponse = await apiClient.register({
            email: userData.email,
            name: userData.name,
            password: userData.password,
            phone: userData.phone,
            lat: userData.lat,
            long: userData.long,
          })
          
          // Set the token in the API client
          apiClient.setToken(response.access_token)
          
          // Convert API user to store user format
          const user: User = {
            id: response.user.id.toString(),
            email: response.user.email,
            name: response.user.name,
            phone: response.user.phone,
            lat: response.user.lat,
            long: response.user.long,
          }
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })
          return true
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Registration failed' 
          })
          return false
        }
      },
      
      logout: () => {
        apiClient.logout().catch(console.error)
        apiClient.clearToken()
        set({ user: null, isAuthenticated: false, error: null })
      },
      
      updateProfile: async (userData) => {
        const currentUser = get().user
        if (currentUser) {
          try {
            set({ isLoading: true, error: null })
            
            // Convert store user data to API format
            const apiUserData = {
              ...userData,
              id: userData.id ? parseInt(userData.id) : undefined
            }
            
            const updatedUser = await apiClient.updateUser(parseInt(currentUser.id), apiUserData)
            
            // Convert API user back to store format
            const user: User = {
              id: updatedUser.id.toString(),
              email: updatedUser.email,
              name: updatedUser.name,
              phone: updatedUser.phone,
              lat: updatedUser.lat,
              long: updatedUser.long,
            }
            
            set({ user, isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Error al actualizar perfil' 
            })
          }
        }
      },
      
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)