import { StateCreator } from 'zustand'
import { apiClient } from '@/services/api'
import { Report, ReportSlice, PetStoreState } from '../types/interfaces'
import { convertApiReportToStoreReport } from '../utils/convertApiReportToStoreReport'

export const createReportSlice: StateCreator<
  PetStoreState,
  [],
  [],
  ReportSlice
> = (set, get) => ({
  reports: [],
  userReports: [],

  addReport: async (reportData) => {
    set({ isLoading: true, error: null })
    try {
      // Ensure reference data is loaded before proceeding
      const { petTypes, petBreeds, petColors, petSizes, petSexes, reportTypes } = get()

      if (
        petTypes.length === 0 ||
        petBreeds.length === 0 ||
        petColors.length === 0 ||
        petSizes.length === 0 ||
        petSexes.length === 0 ||
        reportTypes.length === 0
      ) {
        throw new Error(
          'Los datos de referencia no están cargados. Por favor, recarga la página e intenta de nuevo.'
        )
      }

      // First, create the pet if it doesn't exist (for found pets)
      let petId: number

      const isExistingPet = Boolean(
        reportData.pet.id &&
        reportData.pet.id !== 'unknown' &&
        !reportData.pet.id.toString().startsWith('temp_') &&
        !reportData.pet.isTemporary &&
        reportData.type !== 'found'
      )

      if (isExistingPet) {
        // This is an existing pet (lost pet case)
        petId = parseInt(reportData.pet.id)
      } else {
        // Create a new pet for this report (found pet case)
        if (!reportData.pet.typeId || !reportData.pet.colorId) {
          throw new Error(
            'Faltan datos requeridos del formulario. Por favor, selecciona al menos la especie y el color.'
          )
        }

        const apiPet = await apiClient.createPet({
          name: reportData.pet.name || 'Desconocido',
          typeId: reportData.pet.typeId,
          breedId:
            reportData.pet.breedId ||
            petBreeds.find((b) => b.typeId === reportData.pet.typeId)?.id ||
            petBreeds[0]?.id,
          colorId: reportData.pet.colorId,
          sizeId: reportData.pet.sizeId || petSizes[0]?.id,
          sexId: reportData.pet.sexId || petSexes[0]?.id,
          age: reportData.pet.age || 1,
          photoUrl: reportData.pet.photo,
          distinctiveCharacteristics: reportData.pet.distinguishingFeatures || '',
        })
        petId = apiPet.id
      }

      // Find report type ID
      const reportTypeMatch = reportTypes.find(
        (rt) => rt.name.toLowerCase() === reportData.type.toLowerCase()
      )
      const reportTypeId = reportTypeMatch?.id

      if (!reportTypeId) {
        throw new Error(
          `Tipo de reporte '${reportData.type}' no encontrado. Tipos disponibles: ${reportTypes
            .map((rt) => rt.name)
            .join(', ')}`
        )
      }

      const apiReport = await apiClient.createReport({
        petId,
        reportTypeId,
        description: reportData.description,
        photoUrl: reportData.pet.photo,
        lat: reportData.location.coordinates.lat,
        long: reportData.location.coordinates.lng,
      })

      const newReport = convertApiReportToStoreReport(apiReport)
      set((state) => ({
        reports: [newReport, ...state.reports],
        isLoading: false,
      }))
      return newReport.id
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add report',
      })
      throw error
    }
  },

  updateReport: async (id, reportData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedReport = await apiClient.updateReport(parseInt(id), reportData as any)
      const report = convertApiReportToStoreReport(updatedReport)

      set((state) => ({
        reports: state.reports.map((r) => (r.id === id ? report : r)),
        isLoading: false,
      }))
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update report',
      })
    }
  },

  updateReportStatus: async (id: string, status: 'active' | 'resolved') => {
    set({ isLoading: true, error: null })
    try {
      const resolved = status === 'resolved'
      await apiClient.updateReport(parseInt(id), { resolved })

      set((state) => ({
        reports: state.reports.map((r) => (r.id === id ? { ...r, status } : r)),
        userReports: state.userReports.map((r) => (r.id === id ? { ...r, status } : r)),
        isLoading: false,
      }))
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to update report status',
      })
      throw error
    }
  },

  loadReports: async (includeResolved = false) => {
    set({ isLoading: true, error: null })
    try {
      const apiReports = await apiClient.getReports(includeResolved)
      const reports = apiReports.map(convertApiReportToStoreReport)
      set({ reports, isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load reports',
      })
    }
  },

  loadUserReports: async (includeResolved = true): Promise<Report[]> => {
    set({ isLoading: true, error: null })
    try {
      const apiReports = await apiClient.getMyReports(includeResolved)
      const userReports = apiReports.map(convertApiReportToStoreReport)

      set((state) => {
        const userReportIds = new Set(userReports.map((r) => r.id))
        const remainingReports = state.reports.filter((r) => !userReportIds.has(r.id))
        return {
          userReports,
          reports: [...userReports, ...remainingReports],
          isLoading: false,
        }
      })
      return userReports
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to load user reports',
      })
      return []
    }
  },

  loadReportById: async (id: string): Promise<Report | null> => {
    set({ isLoading: true, error: null })
    try {
      const apiReport = await apiClient.getReportById(parseInt(id))
      const report = convertApiReportToStoreReport(apiReport)
      set((state) => {
        const exists = state.reports.some((r) => r.id === id)
        const updatedReports = exists
          ? state.reports.map((r) => (r.id === id ? report : r))
          : [report, ...state.reports]
        return {
          reports: updatedReports,
          isLoading: false,
        }
      })
      return report
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Error al cargar el reporte',
      })
      return null
    }
  },

  getReportsByUser: (userId) => {
    const list = get().userReports.length > 0 ? get().userReports : get().reports
    return list.filter(
      (report) =>
        report.contactInfo.email === userId ||
        report.reportedById?.toString() === userId
    )
  },

  getLatestReports: () => {
    return get()
      .reports.filter((report) => report.status === 'active')
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10)
  },

  getReportById: (id) => {
    return get().reports.find((report) => report.id === id)
  },
})
