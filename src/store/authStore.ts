import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>
  logout: () => void
  updateProfile: (userData: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        // Mock authentication - replace with real API
        if (email && password) {
          const mockUser: User = {
            id: '1',
            email,
            name: email.split('@')[0],
          }
          set({ user: mockUser, isAuthenticated: true })
          return true
        }
        return false
      },
      
      register: async (userData) => {
        // Mock registration - replace with real API
        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
        }
        set({ user: newUser, isAuthenticated: true })
        return true
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
      
      updateProfile: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)