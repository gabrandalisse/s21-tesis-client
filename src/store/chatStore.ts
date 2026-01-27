import { create } from 'zustand'
import { apiClient, type Chat as ApiChat, type Message as ApiMessage } from '@/services/api'
import { socketService, type SocketMessage } from '@/services/socket'

export interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  read: boolean
}

export interface Chat {
  id: string
  reportId: string
  participants: {
    id: string
    name: string
    email: string
  }[]
  messages: Message[]
  lastMessage?: Message
  createdAt: string
  updatedAt: string
}

interface ChatState {
  chats: Chat[]
  activeChat: Chat | null
  isLoading: boolean
  error: string | null
  isConnected: boolean
  
  // Chat actions
  startChat: (reportId: string, participantId: string) => Promise<string>
  sendMessage: (chatId: string, content: string) => Promise<void>
  markAsRead: (chatId: string) => Promise<void>
  loadChats: () => Promise<void>
  loadChatById: (chatId: string) => Promise<void>
  
  // WebSocket actions
  connectSocket: (token: string) => void
  disconnectSocket: () => void
  joinChat: (chatId: string) => void
  leaveChat: (chatId: string) => void
  
  // Query methods
  getChatsByUser: (userId: string) => Chat[]
  getChatById: (id: string) => Chat | undefined
  setActiveChat: (chat: Chat | null) => void
  getCurrentUser: () => { id: string; name: string } | null
  
  // Utility
  clearError: () => void
}

// Helper function to convert API chat to store chat format
const convertApiChatToStoreChat = (apiChat: ApiChat): Chat => {
  return {
    id: apiChat.id.toString(),
    reportId: apiChat.reportId.toString(),
    participants: apiChat.participants.map(p => ({
      id: p.userId.toString(),
      name: p.user.name,
      email: p.user.email,
    })),
    messages: apiChat.messages.map(convertApiMessageToStoreMessage),
    lastMessage: apiChat.messages.length > 0 
      ? convertApiMessageToStoreMessage(apiChat.messages[apiChat.messages.length - 1])
      : undefined,
    createdAt: apiChat.createdAt,
    updatedAt: apiChat.updatedAt,
  }
}

// Helper function to convert API message to store message format
const convertApiMessageToStoreMessage = (apiMessage: ApiMessage): Message => {
  return {
    id: apiMessage.id.toString(),
    senderId: apiMessage.senderId.toString(),
    senderName: apiMessage.sender.name,
    content: apiMessage.content,
    timestamp: apiMessage.createdAt,
    read: apiMessage.read,
  }
}

// Helper function to convert socket message to store message format
const convertSocketMessageToStoreMessage = (socketMessage: SocketMessage): Message => {
  return {
    id: socketMessage.id.toString(),
    senderId: socketMessage.senderId.toString(),
    senderName: socketMessage.senderName,
    content: socketMessage.content,
    timestamp: socketMessage.createdAt,
    read: socketMessage.read,
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  isLoading: false,
  error: null,
  isConnected: false,
  
  connectSocket: (token: string) => {
    try {
      console.log('🔌 Connecting to chat socket...')
      socketService.connect(token)
      
      // Set up message listeners
      socketService.onNewMessage((socketMessage: SocketMessage) => {
        console.log('📨 Received new message:', socketMessage)
        const message = convertSocketMessageToStoreMessage(socketMessage)
        
        set(state => {
          const updateChat = (chat: Chat) => {
            // Check if this message already exists (by ID or by content+sender+timestamp similarity)
            const messageExists = chat.messages.some(existingMsg => 
              existingMsg.id === message.id || 
              (existingMsg.senderId === message.senderId && 
               existingMsg.content === message.content &&
               Math.abs(new Date(existingMsg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000) // Within 5 seconds
            )
            
            if (messageExists) {
              console.log('🚫 Message already exists, skipping:', message.id)
              return chat
            }
            
            // Remove any temporary messages with same content from same sender
            const filteredMessages = chat.messages.filter(msg => 
              !(msg.id.startsWith('temp_') && 
                msg.senderId === message.senderId && 
                msg.content === message.content)
            )
            
            return {
              ...chat,
              messages: [...filteredMessages, message],
              lastMessage: message,
              updatedAt: new Date().toISOString(),
            }
          }
          
          return {
            chats: state.chats.map(chat =>
              chat.id === socketMessage.chatId.toString() ? updateChat(chat) : chat
            ),
            activeChat: state.activeChat?.id === socketMessage.chatId.toString()
              ? updateChat(state.activeChat)
              : state.activeChat,
          }
        })
      })

      socketService.onMessagesRead(({ chatId, userId }) => {
        console.log('👁️ Messages marked as read:', { chatId, userId })
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId.toString()
              ? {
                  ...chat,
                  messages: chat.messages.map(msg =>
                    msg.senderId !== userId.toString() ? { ...msg, read: true } : msg
                  ),
                }
              : chat
          ),
          activeChat: state.activeChat?.id === chatId.toString()
            ? {
                ...state.activeChat,
                messages: state.activeChat.messages.map(msg =>
                  msg.senderId !== userId.toString() ? { ...msg, read: true } : msg
                ),
              }
            : state.activeChat,
        }))
      })

      set({ isConnected: true })
    } catch (error) {
      console.error('❌ Failed to connect to socket:', error)
      set({ error: 'Failed to connect to chat server' })
    }
  },

  disconnectSocket: () => {
    socketService.disconnect()
    set({ isConnected: false })
  },

  joinChat: (chatId: string) => {
    socketService.joinChat(parseInt(chatId))
  },

  leaveChat: (chatId: string) => {
    socketService.leaveChat(parseInt(chatId))
  },
  
  startChat: async (reportId, participantId) => {
    set({ isLoading: true, error: null })
    try {
      console.log('🚀 Starting chat for report:', reportId, 'with participant:', participantId)
      const apiChat = await apiClient.createChat(parseInt(reportId), [parseInt(participantId)])
      const chat = convertApiChatToStoreChat(apiChat)
      
      set(state => ({ 
        chats: [chat, ...state.chats.filter(c => c.id !== chat.id)],
        isLoading: false 
      }))
      
      // Automatically join the chat room for real-time updates
      console.log('🔗 Joining chat room:', chat.id)
      get().joinChat(chat.id)
      
      return chat.id
    } catch (error) {
      console.error('❌ Failed to start chat:', error)
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to start chat' 
      })
      throw error
    }
  },
  
  sendMessage: async (chatId, content) => {
    set({ error: null })
    
    // Get current user info for optimistic update
    const currentUser = get().getCurrentUser()
    
    try {
      console.log('📤 Attempting to send message:', { chatId, content })
      
      // Try WebSocket first for real-time delivery
      if (socketService.isConnected()) {
        console.log('🔌 WebSocket is connected, sending via WebSocket...')
        
        // Optimistically add the message to sender's UI immediately
        if (currentUser) {
          const tempId = `temp_${currentUser.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const optimisticMessage: Message = {
            id: tempId,
            senderId: currentUser.id,
            senderName: currentUser.name,
            content,
            timestamp: new Date().toISOString(),
            read: true,
          }
          
          console.log('✨ Adding optimistic message for sender:', optimisticMessage)
          
          // Add message to current chat immediately for sender
          set(state => ({
            chats: state.chats.map(chat =>
              chat.id === chatId
                ? {
                    ...chat,
                    messages: [...chat.messages, optimisticMessage],
                    lastMessage: optimisticMessage,
                    updatedAt: new Date().toISOString(),
                  }
                : chat
            ),
            activeChat: state.activeChat?.id === chatId
              ? {
                  ...state.activeChat,
                  messages: [...state.activeChat.messages, optimisticMessage],
                  lastMessage: optimisticMessage,
                  updatedAt: new Date().toISOString(),
                }
              : state.activeChat,
          }))
        }
        
        const success = socketService.sendMessage(parseInt(chatId), content)
        if (success) {
          console.log('✅ Message sent via WebSocket')
          return
        } else {
          console.warn('⚠️ WebSocket send failed, falling back to HTTP')
        }
      } else {
        console.warn('⚠️ WebSocket not connected, using HTTP API')
      }
      
      // Fallback to HTTP API if WebSocket is not connected or failed
      console.log('📡 Falling back to HTTP API for message sending')
      await apiClient.sendMessage(parseInt(chatId), content)
      console.log('✅ Message sent via HTTP API')
      
      // Reload the chat to get the new message (only for HTTP fallback)
      await get().loadChatById(chatId)
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send message' 
      })
      throw error
    }
  },
  
  markAsRead: async (chatId) => {
    try {
      if (socketService.isConnected()) {
        socketService.markAsRead(parseInt(chatId))
      } else {
        await apiClient.markMessagesAsRead(parseInt(chatId))
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  },
  
  loadChats: async () => {
    set({ isLoading: true, error: null })
    try {
      const apiChats = await apiClient.getUserChats()
      const chats = apiChats.map(convertApiChatToStoreChat)
      set({ chats, isLoading: false })
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load chats' 
      })
    }
  },

  loadChatById: async (chatId: string) => {
    set({ isLoading: true, error: null })
    try {
      const apiChat = await apiClient.getChatById(parseInt(chatId))
      const newChat = convertApiChatToStoreChat(apiChat)
      
      set(state => {
        const mergeMessages = (existingChat: Chat | null, newChat: Chat) => {
          if (!existingChat) return newChat
          
          // Create a map of existing messages by ID for quick lookup
          const existingMessagesMap = new Map(existingChat.messages.map(msg => [msg.id, msg]))
          
          // Merge messages, keeping existing ones and adding new ones
          const mergedMessages = [...existingChat.messages]
          
          newChat.messages.forEach(newMsg => {
            if (!existingMessagesMap.has(newMsg.id)) {
              // Only add if message doesn't already exist
              mergedMessages.push(newMsg)
            }
          })
          
          // Sort messages by timestamp
          mergedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          
          return {
            ...newChat,
            messages: mergedMessages,
          }
        }
        
        const existingChat = state.chats.find(c => c.id === chatId)
        const mergedChat = mergeMessages(existingChat || null, newChat)
        
        return {
          chats: state.chats.map(c => c.id === chatId ? mergedChat : c),
          activeChat: state.activeChat?.id === chatId ? mergedChat : state.activeChat,
          isLoading: false
        }
      })
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load chat' 
      })
    }
  },
  
  getChatsByUser: (userId) => {
    return get().chats.filter(chat => 
      chat.participants.some(p => p.id === userId)
    )
  },
  
  getChatById: (id) => {
    return get().chats.find(chat => chat.id === id)
  },

  setActiveChat: (chat) => {
    set({ activeChat: chat })
    if (chat) {
      get().joinChat(chat.id)
    }
  },

  getCurrentUser: () => {
    // This is a simple way to get user info without circular dependency
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage)
          return parsed.state?.user || null
        } catch {
          return null
        }
      }
    }
    return null
  },
  
  clearError: () => {
    set({ error: null })
  }
}))