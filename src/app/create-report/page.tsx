'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePetStore, Pet, Report } from '@/store/petStore'
import { useAuthStore } from '@/store/authStore'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import PhotoUpload from '@/components/PhotoUpload'
import { MapPin, Calendar, Clock, Camera, AlertCircle } from 'lucide-react'

// Found Pet Form Component - moved outside to prevent re-creation
const FoundPetForm = ({ 
  onPetDataChange, 
  petSizes = [], 
  petSexes = [],
  petTypes = [],
  petBreeds = [],
  petColors = []
}: { 
  onPetDataChange: (data: Omit<Pet, 'id' | 'ownerId'>) => void
  petSizes?: Array<{id: number, name: string}>
  petSexes?: Array<{id: number, name: string}>
  petTypes?: Array<{id: number, name: string}>
  petBreeds?: Array<{id: number, name: string, typeId: number}>
  petColors?: Array<{id: number, name: string}>
}) => {
  const [petData, setPetData] = useState({
    name: '',
    species: 'dog' as 'dog' | 'cat' | 'bird' | 'other',
    breed: '',
    age: 1, // Changed to number
    color: '',
    size: '',
    sex: '',
    distinguishingFeatures: '',
    photo: '',
    // Add ID fields
    typeId: undefined as number | undefined,
    breedId: undefined as number | undefined,
    colorId: undefined as number | undefined,
    sizeId: undefined as number | undefined,
    sexId: undefined as number | undefined,
  })

  // Initialize with default data on mount
  useEffect(() => {
    onPetDataChange(petData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get breeds filtered by selected typeId
  const getBreedOptions = () => {
    if (!petData.typeId) return []
    return petBreeds.filter(breed => breed.typeId === petData.typeId)
  }

  const handleChange = (field: string, value: string | number) => {
    const newData = { ...petData, [field]: value }
    
    // When type changes, reset breed
    if (field === 'typeId') {
      newData.breedId = undefined
      newData.breed = ''
    }
    
    // Update display names based on selected IDs
    if (field === 'typeId') {
      const selectedType = petTypes.find(t => t.id === value)
      newData.species = selectedType?.name.toLowerCase() as 'dog' | 'cat' | 'bird' | 'other' || 'other'
    }
    if (field === 'breedId') {
      const selectedBreed = petBreeds.find(b => b.id === value)
      newData.breed = selectedBreed?.name || ''
    }
    if (field === 'colorId') {
      const selectedColor = petColors.find(c => c.id === value)
      newData.color = selectedColor?.name || ''
    }
    if (field === 'sizeId') {
      const selectedSize = petSizes.find(s => s.id === value)
      newData.size = selectedSize?.name || ''
    }
    if (field === 'sexId') {
      const selectedSex = petSexes.find(s => s.id === value)
      newData.sex = selectedSex?.name || ''
    }
    
    setPetData(newData)
    onPetDataChange(newData)
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la mascota
          </label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="ej. Desconocido"
            value={petData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Especie
          </label>
          <select
            required
            className="input-field"
            value={petData.typeId || ''}
            onChange={(e) => handleChange('typeId', parseInt(e.target.value))}
          >
            <option value="">Seleccionar especie</option>
            {petTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Raza (si se conoce)
          </label>
          <select
            className="input-field"
            value={petData.breedId || ''}
            onChange={(e) => handleChange('breedId', parseInt(e.target.value))}
            disabled={!petData.typeId}
          >
            <option value="">Seleccionar raza</option>
            {getBreedOptions().map(breed => (
              <option key={breed.id} value={breed.id}>{breed.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Edad aproximada (años)
          </label>
          <input
            type="number"
            min="0"
            max="30"
            className="input-field"
            placeholder="ej. 2"
            value={petData.age}
            onChange={(e) => handleChange('age', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color/Marcas
        </label>
        <select
          required
          className="input-field"
          value={petData.colorId || ''}
          onChange={(e) => handleChange('colorId', parseInt(e.target.value))}
        >
          <option value="">Seleccionar color</option>
          {petColors.map(color => (
            <option key={color.id} value={color.id}>{color.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tamaño
          </label>
          <select
            className="input-field"
            value={petData.sizeId || ''}
            onChange={(e) => handleChange('sizeId', parseInt(e.target.value))}
          >
            <option value="">Seleccionar tamaño</option>
            {petSizes.map(size => (
              <option key={size.id} value={size.id}>{size.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sexo
          </label>
          <select
            className="input-field"
            value={petData.sexId || ''}
            onChange={(e) => handleChange('sexId', parseInt(e.target.value))}
          >
            <option value="">Seleccionar sexo</option>
            {petSexes.map(sex => (
              <option key={sex.id} value={sex.id}>{sex.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Características Distintivas
        </label>
        <textarea
          className="input-field h-24 resize-none"
          placeholder="Describe cualquier característica única, comportamiento o artículos que llevaba la mascota..."
          value={petData.distinguishingFeatures}
          onChange={(e) => handleChange('distinguishingFeatures', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Foto de la Mascota (Opcional)
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

function CreateReportPageContent() {
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
  
  const { 
    pets, 
    addReport, 
    petSizes, 
    petSexes,
    petTypes,
    petBreeds,
    petColors,
    loadPetSizes, 
    loadPetSexes,
    loadPetTypes,
    loadPetBreeds,
    loadPetColors,
    loadReportTypes,
    isLoading: storeLoading
  } = usePetStore()
  const { user } = useAuthStore()

  useEffect(() => {
    // Load all reference data
    loadPetSizes()
    loadPetSexes()
    loadPetTypes()
    loadPetBreeds()
    loadPetColors()
    loadReportTypes()
  }, [loadPetSizes, loadPetSexes, loadPetTypes, loadPetBreeds, loadPetColors, loadReportTypes])

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
    
    // For lost pets, we need a selected pet. For found pets, we need foundPetData with required fields
    if (reportType === 'lost' && !selectedPet) return
    if (reportType === 'found' && (!foundPetData || !foundPetData.name || !foundPetData.typeId || !foundPetData.colorId || !foundPetData.age)) {
      alert('Please fill in at least the pet name, species, color, and age for found pets.')
      return
    }
    
    // Validate that coordinates are provided
    if (!formData.location.coordinates.lat || !formData.location.coordinates.lng) {
      alert('Please select a valid address from the autocomplete suggestions.')
      return
    }
    
    // Check if reference data is loaded
    if (petTypes.length === 0 || petBreeds.length === 0 || petColors.length === 0 || 
        petSizes.length === 0 || petSexes.length === 0) {
      alert('Los datos de referencia aún se están cargando. Por favor, espera un momento e intenta de nuevo.')
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

      console.log('Submitting report with type:', reportType)
      console.log('Report data:', reportData)

      console.log('Submitting report with type:', reportType)
      console.log('Report data:', reportData)

      const reportId = await addReport(reportData)
      router.push(`/report/${reportId}`)
    } catch (error) {
      console.error('Error creating report:', error)
      alert(error instanceof Error ? error.message : 'Error creating report. Please try again.')
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
              <h1 className="text-3xl font-bold text-white mb-2">Crear Reporte</h1>
              <p className="text-primary-100">
                Ayuda a reunir mascotas con sus familias creando un reporte detallado
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Report Type */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Reporte</h3>
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
                    <div className="font-medium">Mascota Perdida</div>
                    <div className="text-sm text-gray-600">Mi mascota está perdida</div>
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
                    <div className="font-medium">Mascota Encontrada</div>
                    <div className="text-sm text-gray-600">Encontré una mascota</div>
                  </button>
                </div>
              </div>

              {/* Pet Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {reportType === 'lost' ? 'Selecciona Tu Mascota' : 'Información de la Mascota'}
                </h3>
                
                {reportType === 'lost' ? (
                  userPets.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 mb-4">
                        Aún no has agregado ninguna mascota. Agrega primero un perfil de mascota.
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push('/my-pets')}
                        className="btn-primary"
                      >
                        Agregar Perfil de Mascota
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
                              <Image
                                src={pet.photo}
                                alt={pet.name}
                                width={64}
                                height={64}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Camera className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{pet.name}</div>
                              <div className="text-sm text-gray-600">
                                {[pet.breed, pet.color, pet.size, pet.sex].filter(Boolean).join(' • ')}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <FoundPetForm 
                    onPetDataChange={setFoundPetData} 
                    petSizes={petSizes}
                    petSexes={petSexes}
                    petTypes={petTypes}
                    petBreeds={petBreeds}
                    petColors={petColors}
                  />
                )}
              </div>

              {((reportType === 'lost' && selectedPet) || reportType === 'found') && (
                <>
                  {/* Location and Time */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {reportType === 'lost' ? 'Última Ubicación Vista' : 'Ubicación Encontrada'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <MapPin className="inline h-4 w-4 mr-1" />
                          Dirección
                        </label>
                        <AddressAutocomplete
                          value={formData.location.address}
                          onChange={handleAddressChange}
                          placeholder="Comienza a escribir una dirección..."
                          className="input-field"
                          required
                          defaultCoordinates={user ? { lat: user.lat || 0, lng: user.long || 0 } : undefined}
                        />
                        {formData.location.coordinates.lat !== 0 && formData.location.coordinates.lng !== 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Coordenadas: {formData.location.coordinates.lat.toFixed(4)}, {formData.location.coordinates.lng.toFixed(4)}
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
                            Hora (aproximada)
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
                      Detalles Adicionales
                    </h3>
                    <textarea
                      className="input-field h-32 resize-none"
                      placeholder={`Proporciona cualquier información adicional que pueda ayudar... ${
                        reportType === 'lost' 
                          ? '¿Qué estaba haciendo tu mascota cuando la viste por última vez? ¿Algún comportamiento inusual?'
                          : '¿Cómo encontraste a esta mascota? ¿En qué condición estaba?'
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
                      disabled={isSubmitting || storeLoading || petTypes.length === 0}
                      className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Creando Reporte...' : 
                       storeLoading || petTypes.length === 0 ? 'Cargando datos...' : 
                       'Crear Reporte'}
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

export default function CreateReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <CreateReportPageContent />
    </Suspense>
  )
}