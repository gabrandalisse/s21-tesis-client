'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { apiClient } from '@/services/api'

interface PhotoUploadProps {
  onPhotoUploaded: (photoUrl: string) => void
  currentPhoto?: string
  type: 'pet' | 'report'
  className?: string
}

export default function PhotoUpload({ 
  onPhotoUploaded, 
  currentPhoto, 
  type, 
  className = '' 
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhoto || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('El tamaño del archivo debe ser menor a 5MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      let uploadResult
      if (type === 'pet') {
        uploadResult = await apiClient.uploadPetPhoto(file)
      } else {
        uploadResult = await apiClient.uploadReportPhoto(file)
      }

      // Notify parent component
      onPhotoUploaded(uploadResult.url)
    } catch (error) {
      console.error('Upload failed:', error)
      setError(error instanceof Error ? error.message : 'Error al subir archivo')
      setPreviewUrl(currentPhoto || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemovePhoto = () => {
    setPreviewUrl(null)
    setError(null)
    onPhotoUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        {previewUrl ? (
          <div className="relative group">
            <Image
              src={previewUrl}
              alt="Preview"
              width={400}
              height={192}
              className="rounded-lg border-2 border-gray-200 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                <button
                  type="button"
                  onClick={handleClick}
                  disabled={isUploading}
                  className="bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  title="Cambiar foto"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isUploading}
                  className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  title="Eliminar foto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="bg-white p-3 rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-400 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                <span className="text-sm text-gray-600">Subiendo...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Haz clic para subir foto
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, GIF hasta 5MB
                </span>
              </div>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}