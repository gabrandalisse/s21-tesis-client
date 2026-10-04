'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { useAddressSearch } from '@/hooks/useAddressSearch'
import { AddressResult } from '@/hooks/types/interfaces'

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void
  placeholder?: string
  className?: string
  required?: boolean
  defaultCoordinates?: { lat: number; lng: number }
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Enter address...',
  className = '',
  required = false,
  defaultCoordinates,
}: AddressAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isTyping, setIsTyping] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const {
    suggestions,
    isLoading,
    reverseGeocode,
    clearSuggestions,
  } = useAddressSearch(value, { enabled: isTyping })

  // Open suggestions when typing and results arrive
  useEffect(() => {
    if (isTyping && suggestions.length > 0) {
      setShowSuggestions(true)
      setSelectedIndex(-1)
    }
  }, [suggestions, isTyping])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setIsTyping(true)
    onChange(newValue)

    if (newValue.trim().length < 3) {
      clearSuggestions()
      setShowSuggestions(false)
    }
  }

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: AddressResult) => {
    setIsTyping(false)
    onChange(suggestion.display, suggestion.coordinates)
    clearSuggestions()
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const defaultLat = defaultCoordinates?.lat
  const defaultLng = defaultCoordinates?.lng

  // Load default address from coordinates
  useEffect(() => {
    let isCancelled = false

    const loadDefaultAddress = async () => {
      if (
        defaultLat &&
        defaultLng &&
        defaultLat !== 0 &&
        defaultLng !== 0 &&
        !value
      ) {
        try {
          const address = await reverseGeocode(defaultLat, defaultLng)
          if (!isCancelled) {
            onChange(address, { lat: defaultLat, lng: defaultLng })
          }
        } catch (error) {
          console.error('Error loading default address:', error)
          if (!isCancelled) {
            onChange(
              `${defaultLat.toFixed(4)}, ${defaultLng.toFixed(4)}`,
              { lat: defaultLat, lng: defaultLng }
            )
          }
        }
      }
    }

    loadDefaultAddress()

    return () => {
      isCancelled = true
    }
  }, [defaultLat, defaultLng, value, onChange, reverseGeocode])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={isLoading && !value ? 'Loading your location...' : placeholder}
          required={required}
          className={`pl-10 pr-10 ${className}`}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {suggestion.display}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {suggestion.coordinates.lat.toFixed(4)},{' '}
                    {suggestion.coordinates.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && suggestions.length === 0 && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No addresses found. Try a different search term.
          </div>
        </div>
      )}
    </div>
  )
}