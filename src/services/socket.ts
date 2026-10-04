import { io, Socket } from 'socket.io-client'
import { config } from '@/config'

export interface SocketMessage {
  id: number
  chatId: number
  senderId: number
  senderName: string
  content: string
  createdAt: string
  read: boolean
}

class SocketService {
  private socket: Socket | null = null
  private token: string | null = null

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('🔄 Socket already connected, reusing connection')
      return this.socket
    }

    this.token = token
    const backendUrl = config.backendUrl
    const socketUrl = `${backendUrl}/chat`
    
    console.log('🔌 Connecting to WebSocket at:', socketUrl)
    console.log('🔑 Using token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN')
    
    this.socket = io(socketUrl, {
      auth: {
        token: token
      },
      query: {
        token: token // Also send as query parameter as fallback
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    this.socket.on('connect', () => {
      console.log('✅ Connected to chat server with socket ID:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from chat server:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('🔥 Socket connection error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinChat(chatId: number) {
    if (this.socket && this.socket.connected) {
      console.log('🔗 Joining chat:', chatId)
      this.socket.emit('join_chat', { chatId })
    } else {
      console.warn('⚠️ Socket not connected, cannot join chat')
    }
  }

  leaveChat(chatId: number) {
    if (this.socket) {
      this.socket.emit('leave_chat', { chatId })
    }
  }

  sendMessage(chatId: number, content: string) {
    if (this.socket && this.socket.connected) {
      console.log('📤 Sending message via WebSocket:', { chatId, content })
      this.socket.emit('send_message', { chatId, content })
      return true
    } else {
      console.warn('⚠️ Socket not connected, cannot send message')
      return false
    }
  }

  markAsRead(chatId: number) {
    if (this.socket) {
      this.socket.emit('mark_read', { chatId })
    }
  }

  onNewMessage(callback: (message: SocketMessage) => void) {
    if (this.socket) {
      this.socket.on('new_message', callback)
    }
  }

  onMessagesRead(callback: (data: { chatId: number; userId: number }) => void) {
    if (this.socket) {
      this.socket.on('messages_read', callback)
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off('new_message')
    }
  }

  offMessagesRead() {
    if (this.socket) {
      this.socket.off('messages_read')
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()