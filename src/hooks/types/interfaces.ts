import { Report } from '@/store/types/interfaces'
import { ApiReportMatch } from '@/services/types/interfaces'
import { PhotonFeature, PhotonResponse, AddressResult } from '@/utils/types/interfaces'

export type { PhotonFeature, PhotonResponse, AddressResult }

export interface UseReportDetailReturn {
  report: Report | null
  loadingReport: boolean
  matches: ApiReportMatch[]
  matchedReports: Report[]
  loadingMatches: boolean
  showCelebration: boolean
  isReportOwner: boolean
  setShowCelebration: (show: boolean) => void
  handleStatusChange: () => void
  handlePrint: () => void
  refetchMatches: () => Promise<void>
}

export interface UseChatSocketReturn {
  isConnected: boolean
  connect: (authToken: string) => void
  disconnect: () => void
  joinChat: (chatId: number | string) => void
  leaveChat: (chatId: number | string) => void
  sendMessage: (chatId: number | string, content: string) => Promise<void>
  markAsRead: (chatId: number | string) => Promise<void>
}

export interface UseAddressSearchOptions {
  debounceMs?: number
  minChars?: number
  limit?: number
  lang?: string
  enabled?: boolean
}

export interface UseAddressSearchReturn {
  suggestions: AddressResult[]
  isLoading: boolean
  error: string | null
  searchAddresses: (searchQuery: string) => Promise<AddressResult[]>
  reverseGeocode: (lat: number, lng: number) => Promise<string>
  clearSuggestions: () => void
}
