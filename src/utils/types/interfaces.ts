export interface Coordinates {
  lat: number
  lng: number
}

export interface Address {
  formatted: string
  city?: string
  state?: string
  country?: string
}

export interface PhotonFeatureProperties {
  name?: string
  street?: string
  housenumber?: string
  city?: string
  state?: string
  country?: string
  postcode?: string
  osm_type?: string
  osm_id?: number
  extent?: [number, number, number, number]
}

export interface PhotonFeature {
  geometry: {
    coordinates: [number, number] // [lng, lat]
  }
  properties: PhotonFeatureProperties
}

export interface PhotonResponse {
  features: PhotonFeature[]
}

export interface AddressResult {
  display: string
  coordinates: Coordinates
  raw: PhotonFeature
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}
