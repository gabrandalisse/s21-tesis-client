// UI Components
export { default as InfoCard } from './ui/InfoCard'
export type { InfoCardProps } from './ui/InfoCard'
export { default as StatCard } from './ui/StatCard'
export type { StatCardProps } from './ui/StatCard'
export { ReportTypeBadge, ReportStatusBadge } from './ui/Badge'
export type { ReportTypeBadgeProps, ReportStatusBadgeProps } from './ui/Badge'
export { default as LoadingSpinner } from './ui/LoadingSpinner'
export type { LoadingSpinnerProps } from './ui/LoadingSpinner'
export { default as UserAvatar } from './ui/Avatar'
export { default as ConfirmModal } from './ui/ConfirmModal'

// Auth Components
export { default as AuthProvider } from './auth/AuthProvider'
export { default as ProtectedRoute } from './auth/ProtectedRoute'

// Layout Components
export { default as Navigation } from './layout/Navigation'

// Pet Components
export { default as PetCard } from './pet/PetCard'
export { default as PetFormModal } from './pet/PetFormModal'
export { default as PetInformationForm } from './pet/PetInformationForm'
export type { PetFormData } from './pet/PetInformationForm'
export { default as PetSelectorList } from './pet/PetSelectorList'

// Report Components
export { default as ReportPetDetails } from './report/ReportPetDetails'
export { default as ReportCard } from './report/ReportCard'
export { default as ReportSidebar } from './report/ReportSidebar'
export { default as ReportActionsBar } from './report/ReportActionsBar'
export { default as ReportFilterBar } from './report/ReportFilterBar'
export { default as ReportStatsCards } from './report/ReportStatsCards'
export { default as MatchListCard } from './report/MatchListCard'
export { default as MyReportsTable } from './report/MyReportsTable'
export { default as ReportMap } from './report/ReportMap'
export { default as LocationPickerMap } from './report/LocationPickerMap'

// Chat Components
export { default as ChatModal } from './chat/ChatModal'
export { default as ChatWidget } from './chat/ChatWidget'

// PWA Components
export { default as PWAInstallPrompt } from './pwa/PWAInstallPrompt'
export { default as PWAStatus } from './pwa/PWAStatus'
export { default as PWAUpdatePrompt } from './pwa/PWAUpdatePrompt'
export { default as PushNotificationPrompt } from './pwa/PushNotificationPrompt'

// Common Components
export { default as AddressAutocomplete } from './common/AddressAutocomplete'
export { default as PhotoUpload } from './common/PhotoUpload'
export { default as RecentActivityFeed } from './common/RecentActivityFeed'
export { default as SuccessCelebration } from './common/SuccessCelebration'
