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
  startChat: (reportId: string, participantId: string, participantName: string, participantEmail: string) => string
  sendMessage: (chatId: string, senderId: string, senderName: string, content: string) => void
  markAsRead: (chatId: string, userId: string) => void
  getChatsByUser: (userId: string) => Chat[]
  getChatById: (id: string) => Chat | undefined
  setActiveChat: (chat: Chat | null) => void
}

// Mock chats data
const mockChats: Chat[] = [
  {
    id: 'chat1',
    reportId: '1',
    participants: [
      { id: '1', name: 'Current User', email: 'user@example.com' },
      { id: 'jane', name: 'Jane Doe', email: 'jane.doe@email.com' }
    ],
    messages: [
      {
        id: 'msg1',
        senderId: '1',
        senderName: 'Current User',
        content: 'Hi! I think this might be my dog Buddy. Can we arrange to meet?',
        timestamp: '2023-10-26T18:00:00Z',
        read: true
      },
      {
        id: 'msg2',
        senderId: 'jane',
        senderName: 'Jane Doe',
        content: 'Hello! Yes, absolutely. He\'s such a sweet dog. When would be a good time for you?',
        timestamp: '2023-10-26T18:15:00Z',
        read: false
      }
    ],
    lastMessage: {
      id: 'msg2',
      senderId: 'jane',
      senderName: 'Jane Doe',
      content: 'Hello! Yes, absolutely. He\'s such a sweet dog. When would be a good time for you?',
      timestamp: '2023-10-26T18:15:00Z',
      read: false
    },
    createdAt: '2023-10-26T18:00:00Z',
    updatedAt: '2023-10-26T18:15:00Z'
  }
]

export const useChatStore = create<ChatState>((set, get) => ({
  chats: mockChats,
  activeChat: null,
  
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
  }
}))