'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { useChatSocket } from '@/hooks'
import { MessageCircle, Send, X, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ChatWidgetProps {
  reportId: string
  reportOwnerId: string
  reportOwnerName: string
  reportOwnerEmail: string
}

export default function ChatWidget({ 
  reportId, 
  reportOwnerId, 
  reportOwnerName, 
  reportOwnerEmail 
}: ChatWidgetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    startChat, 
    getChatById, 
    loadChatById,
    setActiveChat,
    isLoading, 
    error,
    clearError 
  } = useChatStore()

  const { joinChat, leaveChat, sendMessage, markAsRead } = useChatSocket()
  const { user } = useAuthStore()

  const currentChat = currentChatId ? getChatById(currentChatId) : null

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentChat?.messages])

  // Mark messages as read when modal is opened
  useEffect(() => {
    if (isModalOpen && currentChatId && user) {
      markAsRead(currentChatId)
    }
  }, [isModalOpen, currentChatId, user, markAsRead])

  const handleStartChat = async () => {
    if (!user) return

    try {
      const chatId = await startChat(reportId, reportOwnerId)
      setCurrentChatId(chatId)
      const chat = getChatById(chatId)
      setActiveChat(chat || null)
      
      // Join the chat room for real-time updates
      if (chat) {
        joinChat(chat.id)
      }
      
      setIsModalOpen(true)
    } catch (error) {
      console.error('Failed to start chat:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !currentChatId || !user) return

    try {
      await sendMessage(currentChatId, message.trim())
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleOpenChat = async () => {
    if (currentChatId) {
      await loadChatById(currentChatId)
      const chat = getChatById(currentChatId)
      if (chat) {
        setActiveChat(chat)
        joinChat(chat.id)
      }
      setIsModalOpen(true)
    } else {
      await handleStartChat()
    }
  }

  const handleCloseModal = () => {
    if (currentChatId) {
      leaveChat(currentChatId)
    }
    setIsModalOpen(false)
  }

  // Cleanup room subscription on unmount
  useEffect(() => {
    return () => {
      if (currentChatId) {
        leaveChat(currentChatId)
      }
    }
  }, [currentChatId, leaveChat])

  // Don't show chat widget if user is the report owner
  if (user?.id === reportOwnerId) {
    return null
  }

  const unreadCount = currentChat?.messages.filter(msg => 
    msg.senderId !== user?.id && !msg.read
  ).length || 0

  return (
    <>
      {/* Chat Section */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <MessageCircle className="h-8 w-8 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Crees que esta es tu mascota?
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Contacta directamente con <span className="font-medium">{reportOwnerName}</span> para coordinar el reencuentro de forma segura.
            </p>
            <button
              onClick={handleOpenChat}
              disabled={isLoading}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 relative"
            >
              <MessageCircle className="h-5 w-5" />
              <span>
                {currentChat ? 'Continuar Conversación' : 'Iniciar Conversación'}
              </span>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full h-96 flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-primary-500 text-white rounded-t-lg">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="font-medium">Chat con {reportOwnerName}</span>
                </div>
                {currentChat && currentChat.messages && currentChat.messages.length > 0 && (
                  <span className="text-xs text-primary-100 mt-1">
                    Última actividad: {formatDistanceToNow(
                      new Date(currentChat.messages[currentChat.messages.length - 1].timestamp),
                      { addSuffix: true, locale: es }
                    )}
                  </span>
                )}
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2 bg-red-50 border-b">
                <div className="flex items-center justify-between">
                  <p className="text-red-800 text-sm">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                </div>
              ) : currentChat?.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm flex-col">
                  <MessageCircle className="h-8 w-8 mb-2" />
                  <p>¡Inicia la conversación!</p>
                </div>
              ) : (
                currentChat?.messages.map((msg, index) => (
                  <div
                    key={`${msg.id}-${index}`} // Use combination of ID and index to ensure uniqueness
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.senderId === user?.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.senderId === user?.id ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}