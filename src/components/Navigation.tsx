'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Heart, Home, User, PlusCircle, Menu, X, LogOut, MessageCircle, FileText, PawPrint } from 'lucide-react'
import UserAvatar from './Avatar'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/chats', label: 'Chats', icon: MessageCircle },
    { href: '/my-reports', label: 'Mis Reportes', icon: FileText },
    { href: '/profile', label: 'Perfil', icon: User },
    { href: '/my-pets', label: 'Mis Mascotas', icon: Heart },
    { href: '/create-report', label: 'Reportar', icon: PlusCircle },
  ]

  if (!isAuthenticated) {
    return null
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="bg-primary-500 p-2 rounded-lg">
                <PawPrint className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Petly</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
              <div className="flex items-center space-x-3">
                <UserAvatar name={user?.name || 'User'} size={32} />
                <span className="text-sm text-gray-700">Hola, {user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Cerrar sesión</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="px-3 py-2 flex items-center space-x-3">
                <UserAvatar name={user?.name || 'User'} size={24} />
                <p className="text-sm text-gray-700">Hola, {user?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}