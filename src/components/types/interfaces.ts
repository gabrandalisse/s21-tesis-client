import React from 'react'
import { Pet, Report, Chat } from '@/store/types/interfaces'
import { ApiReportMatch } from '@/services/types/interfaces'

// UI Components Props
export interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  iconBgColor?: string
  iconColor?: string
  description?: string
  trend?: {
    value: string
    isPositive: boolean
  }
}

export interface InfoCardProps {
  label: string
  value?: string | number | null
  fallback?: string
  icon?: React.ReactNode
  className?: string
  valueClassName?: string
}

export interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface ReportTypeBadgeProps {
  type?: 'lost' | 'found' | string
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

export interface ReportStatusBadgeProps {
  status?: 'active' | 'resolved' | string
  size?: 'sm' | 'md' | 'lg'
  withIcon?: boolean
  label?: string
  className?: string
}

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
}

export interface UserAvatarProps {
  name: string
  avatarUrl?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// Auth Components Props
export interface ProtectedRouteProps {
  children: React.ReactNode
}

export interface AuthProviderProps {
  children: React.ReactNode
}

// Chat Components Props
export interface ChatWidgetProps {
  reportId: string
  reportOwnerId: string
  reportOwnerName: string
  reportOwnerEmail: string
}

export interface ChatModalProps {
  chat: Chat
  onClose: () => void
}

// Common Components Props
export interface RecentActivityFeedProps {
  reports: Report[]
}

export interface SuccessCelebrationProps {
  show: boolean
  onClose: () => void
  petName?: string
}

export interface PhotoUploadProps {
  onPhotoSelected: (file: File) => void
  initialPhotoUrl?: string
  className?: string
  isTemporary?: boolean
}

export interface AddressAutocompleteProps {
  value: string
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void
  placeholder?: string
  className?: string
  required?: boolean
  defaultCoordinates?: { lat: number; lng: number }
}

// Pet Components Props
export interface PetFormData extends Omit<Pet, 'id' | 'ownerId'> {
  id?: string
  isTemporary?: boolean
}

export interface PetInformationFormProps {
  petData: PetFormData
  onChange: (field: string, value: any) => void
  photoUrl?: string
  onPhotoSelected: (file: File) => void
  isExistingPet?: boolean
}

export interface PetCardProps {
  pet: Pet
  onEdit: (pet: Pet) => void
  onDelete: (petId: string) => void
}

export interface PetFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  petData: PetFormData
  setPetData: React.Dispatch<React.SetStateAction<PetFormData>>
  editingPet: Pet | null
  isSubmitting: boolean
  onPhotoSelected: (file: File) => void
}

export interface PetSelectorListProps {
  pets: Pet[]
  selectedPetId: string
  onSelectPet: (petId: string) => void
  isSubmitting?: boolean
}

// Report Components Props
export interface ReportStatsCardsProps {
  totalLost: number
  totalFound: number
  totalResolved: number
}

export interface ReportFilterBarProps {
  activeTab: 'all' | 'lost' | 'found' | 'resolved'
  onTabChange: (tab: 'all' | 'lost' | 'found' | 'resolved') => void
  counts: {
    all: number
    lost: number
    found: number
    resolved: number
  }
}

export interface MyReportsTableProps {
  reports: Report[]
  loading: boolean
  onStatusChange: (id: string, currentStatus: string) => void
  onDeleteReport: (id: string) => void
}

export interface ReportSidebarProps {
  report: Report
}

export interface ReportCardProps {
  report: Report
  showActions?: boolean
  onStatusChange?: (id: string, currentStatus: string) => void
  onDelete?: (id: string) => void
}

export interface ReportPetDetailsProps {
  report: Report
  children?: React.ReactNode
}

export interface LocationPickerMapProps {
  coordinates: { lat: number; lng: number }
  address: string
  onLocationChange: (coords: { lat: number; lng: number }) => void
}

export interface MatchListCardProps {
  matches: ApiReportMatch[]
  matchedReports: Report[]
  isLoading?: boolean
}

export interface ReportActionsBarProps {
  status: 'active' | 'resolved'
  onStatusChange: () => void
  onPrint: () => void
}

export interface ReportMapProps {
  reports: Report[]
  userLocation?: { lat: number; lng: number }
  selectedReport?: Report | null
  onReportSelect?: (report: Report) => void
  className?: string
}
