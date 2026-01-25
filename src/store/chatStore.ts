import { create } from 'zustand'

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
  
  // Chat actions
  startChat: (reportId: string, participantId: string, participantName: string, participantEmail: string) => string
  sendMessage: (chatId: string, senderId: string, senderName: string, content: string) => void
  markAsRead: (chatId: string, userId: string) => void
  loadChats: () => Promise<void>
  
  // Query methods
  getChatsByUser: (userId: string) => Chat[]
  getChatById: (id: string) => Chat | undefined
  setActiveChat: (chat: Chat | null) => void
  
  // Utility
  clearError: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [], // No more mock data
  activeChat: null,
  isLoading: false,
  error: null,
  
  startChat: (reportId, participantId, participantName, participantEmail) => {
    const existingChat = get().chats.find(chat => 
      chat.reportId === reportId && 
      chat.participants.some(p => p.id === participantId)
    )
    
    if (existingChat) {
      return existingChat.id
    }
    
    const chatId = Date.now().toString()
    const now = new Date().toISOString()
    
    const newChat: Chat = {
      id: chatId,
      reportId,
      participants: [
        {
          id: participantId,
          name: participantName,
          email: participantEmail
        }
      ],
      messages: [],
      createdAt: now,
      updatedAt: now
    }
    
    set(state => ({ chats: [...state.chats, newChat] }))
    return chatId
  },
  
  sendMessage: (chatId, senderId, senderName, content) => {
    const messageId = Date.now().toString()
    const now = new Date().toISOString()
    
    const newMessage: Message = {
      id: messageId,
      senderId,
      senderName,
      content,
      timestamp: now,
      read: false
    }
    
    set(state => ({
      chats: state.chats.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: newMessage,
              updatedAt: now
            }
          : chat
      )
    }))
    
    // TODO: Send message to backend API when chat endpoints are implemented
    // await apiClient.sendMessage(chatId, { senderId, content })
  },
  
  markAsRead: (chatId, userId) => {
    set(state => ({
      chats: state.chats.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              messages: chat.messages.map(message =>
                message.senderId !== userId
                  ? { ...message, read: true }
                  : message
              )
            }
          : chat
      )
    }))
    
    // TODO: Mark messages as read in backend API when endpoints are implemented
    // await apiClient.markMessagesAsRead(chatId, userId)
  },
  
  loadChats: async () => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Load chats from backend API when endpoints are implemented
      // const chats = await apiClient.getChats()
      // set({ chats, isLoading: false })
      
      // For now, just clear loading state
      set({ isLoading: false })
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load chats' 
      })
    }
  },
  
  getChatsByUser: (userId) => {
    return get().chats.filter(chat =>
      chat.participants.some(p => p.id === userId)
    ).sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : new Date(a.createdAt).getTime()
      const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : new Date(b.createdAt).getTime()
      return bTime - aTime
    })
  },
  
  getChatById: (id) => {
    return get().chats.find(chat => chat.id === id)
  },
  
  setActiveChat: (chat) => {
    set({ activeChat: chat })
  },
  
  clearError: () => {
    set({ error: null })
  }
}))