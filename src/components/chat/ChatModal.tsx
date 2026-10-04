'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useChatStore } from '@/store/chatStore'
import type { Chat } from '@/store/types/interfaces'
import { usePetStore } from '@/store/petStore'
import { useAuthStore } from '@/store/authStore'
import { useChatSocket } from '@/hooks/useChatSocket'
import { formatMessageTime } from '@/utils/formatDate'
import { X, Send, User, Heart } from 'lucide-react'

interface ChatModalProps {
  chat: Chat
  onClose: () => void
}

export default function ChatModal({ chat, onClose }: ChatModalProps) {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    getChatById, 
    loadChatById,
    isLoading, 
    error,
    clearError 
  } = useChatStore()
  
  const { joinChat, leaveChat, sendMessage, markAsRead } = useChatSocket()
  const { getReportById } = usePetStore()
  const { user } = useAuthStore()

  const currentChat = getChatById(chat.id) || chat
  const report = currentChat.report || chat.report || getReportById(chat.reportId)
  const otherParticipant = chat.participants.find(p => p.id !== user?.id)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentChat?.messages])

  // Mark messages as read when modal is opened
  useEffect(() => {
    if (user) {
      markAsRead(chat.id)
    }
  }, [chat.id, user, markAsRead])

  // Load latest chat data when modal opens and join socket room
  useEffect(() => {
    loadChatById(chat.id)
    joinChat(chat.id)

    return () => {
      leaveChat(chat.id)
    }
  }, [chat.id, loadChatById, joinChat, leaveChat])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !user) return

    try {
      await sendMessage(chat.id, message.trim())
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-md w-full h-96 flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-primary-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            {report?.pet?.photo ? (
              <Image
                src={report.pet.photo}
                alt={report.pet.name || 'Mascota'}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Heart className="h-4 w-4" />
              </div>
            )}
            <div>
              <div className="font-medium">{report?.pet?.name || 'Chat'}</div>
              <div className="text-sm text-primary-100">
                con {otherParticipant?.name || 'Usuario'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
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
              <User className="h-8 w-8 mb-2" />
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
                    {formatMessageTime(msg.timestamp)}
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
  )
}