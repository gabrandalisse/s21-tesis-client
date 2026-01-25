'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { usePetStore, Report } from '@/store/petStore'
import { useChatStore, Chat, Message } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import ReportMap from '@/components/ReportMap'
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  MessageCircle, 
  Send,
  User,
  Calendar,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { translateSpecies } from '@/utils/petUtils'

export default function ReportDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const reportId = params.id as string
  
  const [report, setReport] = useState<Report | null>(null)
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { getReportById, updateReportStatus } = usePetStore()
  const { startChat, sendMessage, getChatById, setActiveChat: setStoreChatActive, getChatsByUser } = useChatStore()
  const { user } = useAuthStore()

  useEffect(() => {
    const foundReport = getReportById(reportId)
    setReport(foundReport || null)
    
    // Check if there's an existing chat for this report
    if (foundReport && user) {
      const userChats = getChatsByUser(user.id)
      const existingChat = userChats.find(chat => chat.reportId === reportId)
      if (existingChat) {
        setActiveChat(existingChat)
        setStoreChatActive(existingChat)
      }
    }
    
    // Open chat if hash is present (client-side only)
    if (typeof window !== 'undefined' && window.location.hash === '#chat') {
      setShowChat(true)
    }
  }, [reportId, getReportById, user, getChatsByUser, setStoreChatActive])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeChat?.messages])

  const handleStartChat = () => {
    if (report && user) {
      let chatId: string
      
      // Check if chat already exists
      if (activeChat) {
        chatId = activeChat.id
      } else {
        chatId = startChat(
          report.id,
          user.id,
          user.name,
          user.email
        )
      }
      
      const chat = getChatById(chatId)
      if (chat) {
        setActiveChat(chat)
        setStoreChatActive(chat)
        setShowChat(true)
      }
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && activeChat && user) {
      sendMessage(activeChat.id, user.id, user.name, newMessage.trim())
      setNewMessage('')
      // Refresh chat data
      const updatedChat = getChatById(activeChat.id)
      if (updatedChat) {
        setActiveChat(updatedChat)
      }
    }
  }

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleStatusChange = () => {
    if (report && user && report.contactInfo.email === user.email) {
      const newStatus = report.status === 'active' ? 'resolved' : 'active'
      updateReportStatus(report.id, newStatus)
      // Update local state
      setReport(prev => prev ? { ...prev, status: newStatus } : null)
    }
  }

  const isReportOwner = report && user && report.contactInfo.email === user.email

  if (!report) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Reporte no encontrado</h1>
              <Link href="/" className="text-primary-600 hover:text-primary-700">
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Reportes
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Status Badge */}
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                    {report.pet.photo ? (
                      <img
                        src={report.pet.photo}
                        alt={report.pet.name}
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">No photo available</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      report.type === 'lost' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {report.type === 'lost' ? 'Mascota Perdida' : 'Mascota Encontrada'}
                    </span>
                  </div>
                  {report.status === 'resolved' && (
                    <div className="absolute top-4 right-4">
                      <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Resuelto</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {report.pet.name}
                  </h1>

                  {/* Pet Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Especie</div>
                      <div className="font-medium capitalize">
                        {translateSpecies(report.pet.species)}
                      </div>
                    </div>
                    {report.pet.breed && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Raza</div>
                        <div className="font-medium">{report.pet.breed}</div>
                      </div>
                    )}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Edad</div>
                      <div className="font-medium">{report.pet.age}</div>
                    </div>
                    {report.pet.color && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Color</div>
                        <div className="font-medium">{report.pet.color}</div>
                      </div>
                    )}
                    {report.pet.size && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Tamaño</div>
                        <div className="font-medium">{report.pet.size}</div>
                      </div>
                    )}
                    {report.pet.sex && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Sexo</div>
                        <div className="font-medium">{report.pet.sex}</div>
                      </div>
                    )}
                  </div>

                  {/* Distinguishing Features - Only show if exists */}
                  {report.pet.distinguishingFeatures && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Características Distintivas
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {report.pet.distinguishingFeatures}
                      </p>
                    </div>
                  )}

                  {/* Additional Details - Only show if exists */}
                  {report.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Detalles Adicionales
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                  )}

                  {/* Location and Time */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {report.type === 'lost' ? 'Visto por Última Vez En' : 'Encontrado Sano y Salvo En'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-5 w-5 mr-3 text-primary-500" />
                        <span>{report.date}, {report.time}</span>
                      </div>
                      
                      {/* Map with Address */}
                      <ReportMap
                        coordinates={report.location.coordinates}
                        address={report.location.address}
                        petName={report.pet.name}
                        reportType={report.type}
                      />
                    </div>
                  </div>

                  {/* Contact Button or Status Button */}
                  <div className="border-t pt-6">
                    {isReportOwner ? (
                      <button
                        onClick={handleStatusChange}
                        className={`w-full flex items-center justify-center space-x-2 text-lg py-3 rounded-lg font-medium transition-colors ${
                          report.status === 'active'
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                      >
                        {report.status === 'active' ? (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            <span>Mark as Resolved</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5" />
                            <span>Reopen Report</span>
                          </>
                        )}
                      </button>
                    ) : report.status === 'active' ? (
                      <button
                        onClick={handleStartChat}
                        className="w-full btn-secondary flex items-center justify-center space-x-2 text-lg py-3"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span>
                          {activeChat ? 'Continuar Chat' : '¡Creo que esta es mi mascota!'}
                        </span>
                      </button>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-600 text-lg">This report has been resolved</p>
                        <p className="text-gray-500 text-sm mt-1">The pet has been reunited with their family</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">{report.contactInfo.name}</span>
                  </div>
                  {report.contactInfo.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-3 text-gray-400" />
                      <span className="text-gray-700">{report.contactInfo.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-gray-700">{report.contactInfo.email}</span>
                  </div>
                  
                  {report.contactInfo.additionalContacts && report.contactInfo.additionalContacts.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Contacts</h4>
                      {report.contactInfo.additionalContacts.map((contact, index) => (
                        <div key={index} className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>{contact.name}</span>
                          <span>{contact.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Report Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Report Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Reported by</span>
                    <p className="font-medium">{report.contactInfo.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Report created</span>
                    <p className="font-medium">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status</span>
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium ${
                        report.status === 'active' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {report.status === 'active' ? 'Active' : 'Resolved'}
                      </p>
                      {report.status === 'resolved' && (
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Modal */}
          {showChat && activeChat && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 modal-overlay">
              <div className="bg-white rounded-lg max-w-md w-full h-96 flex flex-col modal-content">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Chat with {report.contactInfo.name}</h3>
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeChat.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Start the conversation!</p>
                    </div>
                  ) : (
                    activeChat.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            message.senderId === user?.id
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user?.id ? 'text-primary-100' : 'text-gray-500'
                          }`}>
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="btn-primary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}