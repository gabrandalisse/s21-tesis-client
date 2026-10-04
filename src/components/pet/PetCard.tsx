'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Pet } from '@/store/types/interfaces'
import { Edit2, Trash2, Camera } from 'lucide-react'

export interface PetCardProps {
  pet: Pet
  onEdit: (pet: Pet) => void
  onDelete: (pet: Pet) => void
}

export default function PetCard({ pet, onEdit, onDelete }: PetCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-w-16 aspect-h-12 bg-gray-200">
        {pet.photo ? (
          <Image
            src={pet.photo}
            alt={pet.name}
            width={400}
            height={192}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <Camera className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {pet.name}
        </h3>
        <p className="text-gray-600 mb-3">
          {pet.breed} • {pet.color} • {pet.age}
        </p>

        {pet.distinguishingFeatures && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {pet.distinguishingFeatures}
          </p>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => onEdit(pet)}
            className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            <span className="text-sm">Edit</span>
          </button>

          <div className="flex space-x-2">
            <Link
              href={`/create-report?petId=${pet.id}`}
              className="text-sm bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded transition-colors"
            >
              Create Report
            </Link>
            <button
              onClick={() => onDelete(pet)}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
