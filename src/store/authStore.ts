import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient, type ApiUser, type LoginResponse } from '@/services/api'
import { useChatStore } from './chatStore'
import {User, AuthState} from './types/interfaces'

// Create auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response: LoginResponse = await apiClient.login(email, password)
          
          const user: User = {
            id: response.user.id.toString(),
            email: response.user.email,
            name: response.user.name || 'Unknown User',
            phone: response.user.phone,
            lat: response.user.lat,
            long: response.user.long,
          }
          
          set({ 
            user, 
            token: response.access_token,
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })

          apiClient.setToken(response.access_token)

          // Connect to chat socket and sync user
          try {
            useChatStore.getState().setCurrentUser(user)
            useChatStore.getState().connectSocket(response.access_token)
          } catch (socketError) {
            console.warn('Chat socket connection failed:', socketError)
          }

          // Register for push notifications
          setTimeout(() => {
            get().registerPushNotifications().catch((error) => {
              console.warn('Push notification registration failed:', error)
            })
          }, 1000)
          
          return true
        } catch (error) {
          console.error('❌ Login failed:', error)
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Login failed' 
          })
          return false
        }
      },

      // Register action
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
            token: response.access_token,
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })

          apiClient.setToken(response.access_token)

          // Connect to chat socket and sync user
          try {
            useChatStore.getState().setCurrentUser(user)
            useChatStore.getState().connectSocket(response.access_token)
          } catch (socketError) {
            console.warn('Chat socket connection failed:', socketError)
          }

          // Register for push notifications
          setTimeout(() => {
            get().registerPushNotifications().catch((error) => {
              console.warn('Push notification registration failed:', error)
            })
          }, 1000)
          
          return true
        } catch (error) {
          console.error('❌ Registration failed:', error)
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Registration failed' 
          })
          return false
        }
      },

      // Logout action
      logout: () => {
        try {
          useChatStore.getState().disconnectSocket()
          useChatStore.getState().setCurrentUser(null)
        } catch (error) {
          console.warn('Failed to disconnect from chat socket:', error)
        }

        apiClient.logout().catch(console.error)
        apiClient.clearToken()
        
        set({ 
          user: null, 
          token: null,
          isAuthenticated: false, 
          error: null 
        })
      },

      // Update profile action
      updateProfile: async (userData) => {
        const currentUser = get().user
        if (!currentUser) return

        try {
          set({ isLoading: true, error: null })
          
          const apiUserData = {
            ...userData,
            id: userData.id ? parseInt(userData.id) : undefined
          }
          
          const updatedUser = await apiClient.updateUser(parseInt(currentUser.id), apiUserData)
          
          const user: User = {
            id: updatedUser.id.toString(),
            email: updatedUser.email,
            name: updatedUser.name,
            phone: updatedUser.phone,
            lat: updatedUser.lat,
            long: updatedUser.long,
          }
          
          set({ user, isLoading: false })
          try {
            useChatStore.getState().setCurrentUser(user)
          } catch {}
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Error al actualizar perfil' 
          })
        }
      },

      // Clear error action
      clearError: () => {
        set({ error: null })
      },

      // Internal method to hydrate from storage synchronously
      _hydrateFromStorage: () => {
        const state = get()

        if (state.token) {
          apiClient.setToken(state.token)
        }
      },

      // Initialize authentication
      initialize: async () => {
        get()._hydrateFromStorage()
        
        const state = get()
        
        if (state.user && state.token && state.isAuthenticated) {
          try {
            const profile = await apiClient.getProfile()
            
            const freshUser: User = {
              id: profile.id.toString(),
              email: profile.email,
              name: profile.name,
              phone: profile.phone,
              lat: profile.lat,
              long: profile.long,
            }
            
            set({ 
              user: freshUser, 
              token: state.token,
              isAuthenticated: true,
              isInitialized: true
            })
            
            try {
              useChatStore.getState().setCurrentUser(freshUser)
              useChatStore.getState().connectSocket(state.token)
            } catch (socketError) {
              console.warn('Chat socket connection failed:', socketError)
            }
            
          } catch (apiError) {
            set({ 
              isInitialized: true
            })
          }
        } else {
          set({ isInitialized: true })
        }
      },

      // Register for push notifications
      registerPushNotifications: async () => {
        const user = get().user
        if (!user) {
          return
        }

        try {
          const { subscribeToPushNotifications } = await import('@/utils/pwa')
          const subscription = await subscribeToPushNotifications()
          
          if (subscription) {
            await apiClient.registerDevice(parseInt(user.id), subscription)
          }
        } catch (error) {
          console.error('Failed to register push notifications:', error)
        }
      },
    }),
    {
      name: 'petly-auth-store',
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null
          const str = localStorage.getItem(name)
          if (!str) return null
          try {
            return JSON.parse(str)
          } catch {
            return null
          }
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return
          localStorage.removeItem(name)
        },
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('❌ Zustand rehydration failed:', error)
          return
        }

        if (state?.token) {
          apiClient.setToken(state.token)
        }
        if (state?.user) {
          try {
            useChatStore.getState().setCurrentUser(state.user)
          } catch {}
        }
      },
    }
  )
)
