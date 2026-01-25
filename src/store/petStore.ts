import { create } from 'zustand'

export interface Pet {
  id: string
  name: string
  species: 'dog' | 'cat' | 'bird' | 'other'
  breed: string
  age: string
  color: string
  distinguishingFeatures: string
  photo?: string
  ownerId: string
}

export interface Report {
  id: string
  type: 'lost' | 'found'
  pet: Pet
  location: {
    address: string
    coordinates: { lat: number; lng: number }
  }
  date: string
  time: string
  description: string
  contactInfo: {
    name: string
    phone: string
    email: string
    additionalContacts?: Array<{name: string, phone: string}>
  }
  status: 'active' | 'resolved'
  createdAt: string
  updatedAt: string
}

interface PetState {
  pets: Pet[]
  reports: Report[]
  addPet: (pet: Omit<Pet, 'id'>) => string
  updatePet: (id: string, pet: Partial<Pet>) => void
  deletePet: (id: string) => void
  addReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateReport: (id: string, report: Partial<Report>) => void
  updateReportStatus: (id: string, status: 'active' | 'resolved') => void
  getReportsByUser: (userId: string) => Report[]
  getLatestReports: () => Report[]
  getReportById: (id: string) => Report | undefined
}

// Mock data
const mockReports: Report[] = [
  {
    id: '1',
    type: 'found',
    pet: {
      id: 'pet1',
      name: 'Buddy',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 'Approx. 2 years',
      color: 'Golden',
      distinguishingFeatures: 'Very friendly and responds to his name. He was found wearing a blue nylon collar with a small bell, but no ID tag. He has a distinctive white spot on his chest.',
      photo: '/api/placeholder/400/300',
      ownerId: 'unknown'
    },
    location: {
      address: 'Near Central Park West & 81st St',
      coordinates: { lat: 40.7829, lng: -73.9654 }
    },
    date: 'October 26, 2023',
    time: 'around 5:30 PM',
    description: 'Found this friendly Golden Retriever near Central Park. He seems well-cared for and is not aggressive.',
    contactInfo: {
      name: 'Jane Doe',
      phone: '+1 (555) 123-4567',
      email: 'jane.doe@email.com'
    },
    status: 'active',
    createdAt: '2023-10-26T17:30:00Z',
    updatedAt: '2023-10-26T17:30:00Z'
  },
  {
    id: '2',
    type: 'lost',
    pet: {
      id: 'pet2',
      name: 'Luna',
      species: 'cat',
      breed: 'Siamese',
      age: '3 years',
      color: 'Cream and brown',
      distinguishingFeatures: 'Blue eyes, very vocal, responds to her name. Has a small scar on her left ear.',
      photo: '/api/placeholder/400/300',
      ownerId: 'user2'
    },
    location: {
      address: 'Brooklyn Heights Promenade',
      coordinates: { lat: 40.6962, lng: -73.9969 }
    },
    date: 'October 25, 2023',
    time: 'morning around 8:00 AM',
    description: 'My cat Luna escaped through an open window. She is very shy with strangers but responds to her name.',
    contactInfo: {
      name: 'Mike Johnson',
      phone: '+1 (555) 987-6543',
      email: 'mike.johnson@email.com'
    },
    status: 'active',
    createdAt: '2023-10-25T08:00:00Z',
    updatedAt: '2023-10-25T08:00:00Z'
  }
]

// Mock chats data
const mockChats = [
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

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  reports: mockReports,
  
  addPet: (petData) => {
    const id = Date.now().toString()
    const newPet: Pet = { ...petData, id }
    set(state => ({ pets: [...state.pets, newPet] }))
    return id
  },
  
  updatePet: (id, petData) => {
    set(state => ({
      pets: state.pets.map(pet => 
        pet.id === id ? { ...pet, ...petData } : pet
      )
    }))
  },
  
  deletePet: (id) => {
    set(state => ({
      pets: state.pets.filter(pet => pet.id !== id)
    }))
  },
  
  addReport: (reportData) => {
    const id = Date.now().toString()
    const now = new Date().toISOString()
    const newReport: Report = {
      ...reportData,
      id,
      createdAt: now,
      updatedAt: now
    }
    set(state => ({ reports: [newReport, ...state.reports] }))
    return id
  },
  
  updateReport: (id, reportData) => {
    set(state => ({
      reports: state.reports.map(report =>
        report.id === id 
          ? { ...report, ...reportData, updatedAt: new Date().toISOString() }
          : report
      )
    }))
  },
  
  updateReportStatus: (id: string, status: 'active' | 'resolved') => {
    set(state => ({
      reports: state.reports.map(report =>
        report.id === id 
          ? { ...report, status, updatedAt: new Date().toISOString() }
          : report
      )
    }))
  },
  
  getReportsByUser: (userId) => {
    return get().reports.filter(report => report.contactInfo.email === userId)
  },
  
  getLatestReports: () => {
    return get().reports
      .filter(report => report.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  },
  
  getReportById: (id) => {
    return get().reports.find(report => report.id === id)
  }
}))