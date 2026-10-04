'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePetStore, Pet, Report } from '@/store/petStore'
import { useAuthStore } from '@/store/authStore'
import {
  Navigation,
  ProtectedRoute,
  PetInformationForm,
  type PetFormData,
  LocationPickerMap,
  PetSelectorList,
  LoadingSpinner,
} from '@/components'
import { Camera, AlertCircle } from 'lucide-react'

function CreateReportPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const petId = searchParams.get('petId')

  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [foundPetData, setFoundPetData] = useState<PetFormData | null>(null)
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost')
  const [additionalContacts, setAdditionalContacts] = useState<Array<{ name: string; phone: string }>>([])

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
      const petToUse: Pet = reportType === 'lost' ? selectedPet! : {
        ...foundPetData!,
        id: 'temp_found_pet',
        ownerId: 'unknown',
        isTemporary: true,
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
              {/* Report Type Selection */}
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

              {/* Pet Selection / Form */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {reportType === 'lost' ? 'Selecciona Tu Mascota' : 'Información de la Mascota'}
                </h3>

                {reportType === 'lost' ? (
                  <PetSelectorList
                    pets={userPets}
                    selectedPetId={selectedPet?.id}
                    onSelectPet={handlePetSelection}
                    onAddPet={() => router.push('/my-pets')}
                  />
                ) : (
                  <PetInformationForm 
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
                  {/* Location and Time Presenter */}
                  <LocationPickerMap
                    title={reportType === 'lost' ? 'Última Ubicación Vista' : 'Ubicación Encontrada'}
                    address={formData.location.address}
                    coordinates={formData.location.coordinates}
                    date={formData.date}
                    time={formData.time}
                    onAddressChange={handleAddressChange}
                    onDateChange={(date) => setFormData(prev => ({ ...prev, date }))}
                    onTimeChange={(time) => setFormData(prev => ({ ...prev, time }))}
                    defaultCoordinates={user ? { lat: user.lat || 0, lng: user.long || 0 } : undefined}
                  />

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
        <LoadingSpinner message="Cargando..." size="md" />
      </div>
    }>
      <CreateReportPageContent />
    </Suspense>
  )
}