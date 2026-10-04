/**
 * Application Configuration Module
 * Sanitizes and centralizes environment variables for API, WebSocket, and PWA services.
 */

// Helper to remove trailing slashes
const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '')

// Base API URL sanitized from environment
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const apiUrl = trimTrailingSlash(rawApiUrl)

// Base backend origin URL (without /api suffix)
const backendUrl = apiUrl.replace(/\/api$/, '')

export const config = {
  apiUrl,
  backendUrl,
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',

  /**
   * Transforms a relative or partial photo/upload URL into an absolute URL
   */
  resolveUploadUrl: (photoUrl?: string): string | undefined => {
    if (!photoUrl) return undefined

    // If it's already an absolute URL, return as is
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl
    }

    // If it's a relative URL, prepend backendUrl
    const cleanPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`
    return `${backendUrl}${cleanPath}`
  },
} as const

export default config
