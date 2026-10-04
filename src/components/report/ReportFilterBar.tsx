'use client'

import { Search, Filter } from 'lucide-react'

export interface ReportFilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: 'all' | 'active' | 'resolved'
  onStatusFilterChange: (value: 'all' | 'active' | 'resolved') => void
  typeFilter: 'all' | 'lost' | 'found'
  onTypeFilterChange: (value: 'all' | 'lost' | 'found') => void
}

export default function ReportFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
}: ReportFilterBarProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar reportes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as 'all' | 'active' | 'resolved')
            }
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Activos</option>
            <option value="resolved">Resueltos</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={typeFilter}
            onChange={(e) =>
              onTypeFilterChange(e.target.value as 'all' | 'lost' | 'found')
            }
          >
            <option value="all">Todos los Tipos</option>
            <option value="lost">Mascotas Perdidas</option>
            <option value="found">Mascotas Encontradas</option>
          </select>
        </div>
      </div>
    </div>
  )
}
