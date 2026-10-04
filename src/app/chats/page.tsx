'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useChatStore, Chat } from '@/store/chatStore'
import { usePetStore } from '@/store/petStore'
import { useAuthStore } from '@/store/authStore'
import { Navigation, ProtectedRoute, ChatModal } from '@/components'
import { 
  MessageCircle, 
  Search, 
  User,
  ArrowRight,
  Heart
} from 'lucide-react'

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const { loadChats, chats: storeChats, isLoading, error, clearError } = useChatStore()
  const { getReportById } = usePetStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      loadChats().catch(console.error)
    }
  }, [user, loadChats])

  useEffect(() => {
    // Sort chats by last message timestamp
    const sortedChats = [...storeChats].sort((a: Chat, b: Chat) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : new Date(a.createdAt).getTime()
      const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : new Date(b.createdAt).getTime()
      return bTime - aTime
    })
    setChats(sortedChats)
  }, [storeChats])

  const filteredChats = chats.filter(chat => {
    const report = chat.report || getReportById(chat.reportId)
    
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase()
    const matchesPetName = report?.pet?.name?.toLowerCase().includes(searchLower) || false
    const matchesParticipant = chat.participants.some(p => p.name.toLowerCase().includes(searchLower))

    return matchesPetName || matchesParticipant
  })

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const getUnreadCount = (chat: Chat) => {
    if (!user) return 0
    return chat.messages.filter(message => 
      message.senderId !== user.id && !message.read
    ).length
  }

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat)
  }

  const handleCloseChat = () => {
    setSelectedChat(null)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-600">
              Stay connected with pet owners and helpers in your area
            </p>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Chats List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading conversations...</p>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <MessageCircle className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {chats.length === 0 ? 'Aún no hay conversaciones' : 'No se encontraron conversaciones'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {chats.length === 0 
                    ? 'Start chatting with pet owners by contacting them through their reports.'
                    : 'Try adjusting your search terms.'
                  }
                </p>
                {chats.length === 0 && (
                  <Link href="/dashboard" className="btn-primary">
                    Browse Reports
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredChats.map((chat) => {
                  const report = chat.report || getReportById(chat.reportId)
                  const unreadCount = getUnreadCount(chat)
                  const otherParticipant = chat.participants.find(p => p.id !== user?.id)
                  const petName = report?.pet?.name || otherParticipant?.name || 'Mascota'
                  const petPhoto = report?.pet?.photo

                  return (
                    <button
                      key={chat.id}
                      onClick={() => handleChatClick(chat)}
                      className="w-full text-left block hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-6">
                        <div className="flex items-center space-x-4">
                          {/* Pet Photo */}
                          <div className="flex-shrink-0">
                            {petPhoto ? (
                              <img
                                src={petPhoto}
                                alt={petName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <Heart className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Chat Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {petName}
                                </h3>
                                {report && (
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    report.type === 'lost' 
                                      ? 'bg-red-100 text-red-700' 
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {report.type === 'lost' ? 'Perdida' : 'Encontrada'}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {chat.lastMessage && (
                                  <span className="text-xs text-gray-500">
                                    {formatTime(chat.lastMessage.timestamp)}
                                  </span>
                                )}
                                {unreadCount > 0 && (
                                  <span className="bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount}
                                  </span>
                                )}
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-2">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {otherParticipant?.name || 'Usuario Desconocido'}
                              </span>
                            </div>

                            {chat.lastMessage ? (
                              <p className="text-sm text-gray-600 truncate">
                                <span className="font-medium">
                                  {chat.lastMessage.senderId === user?.id ? 'Tú: ' : ''}
                                </span>
                                {chat.lastMessage.content}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                No hay mensajes aún
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {chats.length > 0 && (
            <div className="mt-8 bg-primary-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center space-x-2 bg-white border border-primary-200 text-primary-700 px-4 py-3 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <Search className="h-5 w-5" />
                  <span>Ver Más Reportes</span>
                </Link>
                <Link
                  href="/create-report"
                  className="flex items-center justify-center space-x-2 bg-primary-500 text-white px-4 py-3 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Crear Nuevo Reporte</span>
                </Link>
              </div>
            </div>
          )}
        </main>

        {/* Chat Modal */}
        {selectedChat && (
          <ChatModal
            chat={selectedChat}
            onClose={handleCloseChat}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}