'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePetStore, Pet, Report } from '@/store/petStore'
import { useAuthStore } from '@/store/authStore'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import PhotoUpload from '@/components/PhotoUpload'
import { MapPin, Calendar, Clock, Camera, AlertCircle, Plus } from 'lucide-react'

// Found Pet Form Component - moved outside to prevent re-creation
const FoundPetForm = ({ onPetDataChange }: { onPetDataChange: (data: Omit<Pet, 'id' | 'ownerId'>) => void }) => {
  const [petData, setPetData] = useState({
    name: '',
    species: 'dog' as const,
    breed: '',
    age: '',
    color: '',
    distinguishingFeatures: '',
    photo: ''
  })

  // Initialize with default data on mount
  useEffect(() => {
    onPetDataChange(petData)
  }, []) // Only run on mount

  // Predefined options
  const dogBreeds = [
    'Mixed Breed', 'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog',
    'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund', 'Siberian Husky',
    'Boxer', 'Border Collie', 'Chihuahua', 'Shih Tzu', 'Boston Terrier', 'Pomeranian',
    'Australian Shepherd', 'Cocker Spaniel', 'French Bulldog', 'Other'
  ]

  const catBreeds = [
    'Mixed Breed', 'Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'British Shorthair',
    'Abyssinian', 'Russian Blue', 'American Shorthair', 'Scottish Fold', 'Sphynx',
    'Bengal', 'Birman', 'Oriental Shorthair', 'Burmese', 'Norwegian Forest Cat', 'Other'
  ]

  const birdTypes = [
    'Parakeet', 'Canary', 'Cockatiel', 'Lovebird', 'Finch', 'Parrot', 'Cockatoo',
    'Macaw', 'Conure', 'Budgie', 'Other'
  ]

  const ages = [
    'Puppy/Kitten (0-1 year)', 'Young (1-3 years)', 'Adult (3-7 years)', 
    'Senior (7+ years)', 'Unknown'
  ]

  const colors = [
    'Black', 'White', 'Brown', 'Golden', 'Gray', 'Cream', 'Red', 'Blue', 
    'Silver', 'Tan', 'Chocolate', 'Blonde', 'Multi-colored', 'Black and White',
    'Brown and White', 'Gray and White', 'Other'
  ]

  const getBreedOptions = () => {
    switch (petData.species) {
      case 'dog': return dogBreeds
      case 'cat': return catBreeds
      case 'bird': return birdTypes
      default: return ['Mixed', 'Unknown', 'Other']
    }
  }

  const handleChange = (field: string, value: string) => {
    const newData = { ...petData, [field]: value }
    setPetData(newData)
    onPetDataChange(newData)
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pet's Name
          </label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="e.g. Unknown"
            value={petData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Species
          </label>
          <select
            className="input-field"
            value={petData.species}
            onChange={(e) => handleChange('species', e.target.value)}
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Breed (if known)
          </label>
          <select
            className="input-field"
            value={petData.breed}
            onChange={(e) => handleChange('breed', e.target.value)}
          >
            <option value="">Select breed</option>
            {getBreedOptions().map(breed => (
              <option key={breed} value={breed}>{breed}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Approximate Age
          </label>
          <select
            className="input-field"
            value={petData.age}
            onChange={(e) => handleChange('age', e.target.value)}
          >
            <option value="">Select age</option>
            {ages.map(age => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color/Markings
        </label>
        <select
          required
          className="input-field"
          value={petData.color}
          onChange={(e) => handleChange('color', e.target.value)}
        >
          <option value="">Select color</option>
          {colors.map(color => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Distinguishing Features
        </label>
        <textarea
          className="input-field h-24 resize-none"
          placeholder="Describe any unique features, behavior, or items the pet was wearing..."
          value={petData.distinguishingFeatures}
          onChange={(e) => handleChange('distinguishingFeatures', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pet Photo (Optional)
        </label>
        <PhotoUpload
          type="report"
          currentPhoto={petData.photo}
          onPhotoUploaded={(photoUrl) => handleChange('photo', photoUrl)}
        />
      </div>
    </div>
  )
}

export default function CreateReportPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const petId = searchParams.get('petId')
  
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [foundPetData, setFoundPetData] = useState<Omit<Pet, 'id' | 'ownerId'> | null>(null)
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost')
  const [additionalContacts, setAdditionalContacts] = useState<Array<{name: string, phone: string}>>([])
  
  // Get current date and time
  const now = new Date()
  const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD format
  const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
  
  const [formData, setFormData] = useState({
    location: {
      address: '',
      coordinates: { lat: 0, lng: 0 }
    },
    date: currentDate,
    time: currentTime,
    description: '',
    contactInfo: {
      name: '',
      phone: ''
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { pets, addReport } = usePetStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          name: user.name,
          phone: user.phone || ''
        }
      }))
    }
  }, [user])

  useEffect(() => {
    if (petId && user) {
      const pet = pets.find(p => p.id === petId && p.ownerId === user.id)
      if (pet) {
        setSelectedPet(pet)
      }
    }
  }, [petId, pets, user])

  const handleAddressChange = (address: string, coordinates?: { lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      location: {
        address,
        coordinates: coordinates || { lat: 0, lng: 0 }
      }
    }))
  }

  const handlePetSelection = (pet: Pet) => {
    setSelectedPet(pet)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // For lost pets, we need a selected pet. For found pets, we need foundPetData with at least a name and color
    if (reportType === 'lost' && !selectedPet) return
    if (reportType === 'found' && (!foundPetData || !foundPetData.name || !foundPetData.color)) {
      alert('Please fill in at least the pet name and color for found pets.')
      return
    }
    
    // Validate that coordinates are provided
    if (!formData.location.coordinates.lat || !formData.location.coordinates.lng) {
      alert('Please select a valid address from the autocomplete suggestions.')
      return
    }
    
    if (!user) return

    setIsSubmitting(true)

    try {
      const petToUse = reportType === 'lost' ? selectedPet! : {
        ...foundPetData!,
        id: Date.now().toString(),
        ownerId: 'unknown'
      }

      const reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'> = {
        type: reportType,
        pet: petToUse,
        location: formData.location,
        date: formData.date,
        time: formData.time,
        description: formData.description,
        contactInfo: {
          ...formData.contactInfo,
          email: user.email, // Always use user's email from auth
          additionalContacts
        },
        status: 'active'
      }

      const reportId = await addReport(reportData)
      router.push(`/report/${reportId}`)
    } catch (error) {
      console.error('Error creating report:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const userPets = user ? pets.filter(pet => pet.ownerId === user.id) : []

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
              <h1 className="text-3xl font-bold text-white mb-2">Create Report</h1>
              <p className="text-primary-100">
                Help reunite pets with their families by creating a detailed report
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Report Type */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Type</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setReportType('lost')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      reportType === 'lost'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium">Lost Pet</div>
                    <div className="text-sm text-gray-600">My pet is missing</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportType('found')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      reportType === 'found'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Camera className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium">Found Pet</div>
                    <div className="text-sm text-gray-600">I found a pet</div>
                  </button>
                </div>
              </div>

              {/* Pet Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {reportType === 'lost' ? 'Select Your Pet' : 'Pet Information'}
                </h3>
                
                {reportType === 'lost' ? (
                  userPets.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 mb-4">
                        You haven't added any pets yet. Add a pet profile first.
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push('/my-pets')}
                        className="btn-primary"
                      >
                        Add Pet Profile
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userPets.map((pet) => (
                        <button
                          key={pet.id}
                          type="button"
                          onClick={() => handlePetSelection(pet)}
                          className={`p-4 rounded-lg border-2 text-left transition-colors ${
                            selectedPet?.id === pet.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            {pet.photo ? (
                              <img
                                src={pet.photo}
                                alt={pet.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Camera className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{pet.name}</div>
                              <div className="text-sm text-gray-600">
                                {pet.breed} • {pet.color}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <FoundPetForm onPetDataChange={setFoundPetData} />
                )}
              </div>

              {((reportType === 'lost' && selectedPet) || reportType === 'found') && (
                <>
                  {/* Location and Time */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {reportType === 'lost' ? 'Last Seen Location' : 'Found Location'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <MapPin className="inline h-4 w-4 mr-1" />
                          Address
                        </label>
                        <AddressAutocomplete
                          value={formData.location.address}
                          onChange={handleAddressChange}
                          placeholder="Start typing an address..."
                          className="input-field"
                          required
                          defaultCoordinates={user ? { lat: user.lat || 0, lng: user.long || 0 } : undefined}
                        />
                        {formData.location.coordinates.lat !== 0 && formData.location.coordinates.lng !== 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Coordinates: {formData.location.coordinates.lat.toFixed(4)}, {formData.location.coordinates.lng.toFixed(4)}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Date
                          </label>
                          <input
                            type="date"
                            required
                            className="input-field"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              date: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Clock className="inline h-4 w-4 mr-1" />
                            Time (approximate)
                          </label>
                          <input
                            type="time"
                            required
                            className="input-field"
                            value={formData.time}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              time: e.target.value
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Additional Details
                    </h3>
                    <textarea
                      className="input-field h-32 resize-none"
                      placeholder={`Provide any additional information that might help... ${
                        reportType === 'lost' 
                          ? 'What was your pet doing when last seen? Any unusual behavior?'
                          : 'How did you find this pet? What condition were they in?'
                      }`}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                    />
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            disabled
                            className="input-field bg-gray-100 cursor-not-allowed"
                            value={formData.contactInfo.name}
                            title="Name is taken from your profile"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Name is taken from your profile
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            disabled
                            className="input-field bg-gray-100 cursor-not-allowed"
                            value={formData.contactInfo.phone}
                            title="Phone is taken from your profile"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Phone is taken from your profile
                          </p>
                        </div>
                      </div>

                      {/* Additional Contacts */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Additional Contacts (Optional)
                          </label>
                          <button
                            type="button"
                            onClick={() => setAdditionalContacts(prev => [...prev, { name: '', phone: '' }])}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            + Add Contact
                          </button>
                        </div>
                        
                        {additionalContacts.map((contact, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Name"
                              className="input-field flex-1"
                              value={contact.name}
                              onChange={(e) => {
                                const updated = [...additionalContacts]
                                updated[index].name = e.target.value
                                setAdditionalContacts(updated)
                              }}
                            />
                            <input
                              type="tel"
                              placeholder="Phone"
                              className="input-field flex-1"
                              value={contact.phone}
                              onChange={(e) => {
                                const updated = [...additionalContacts]
                                updated[index].phone = e.target.value
                                setAdditionalContacts(updated)
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setAdditionalContacts(prev => prev.filter((_, i) => i !== index))}
                              className="px-3 py-2 text-red-600 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Creating Report...' : 'Create Report'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}