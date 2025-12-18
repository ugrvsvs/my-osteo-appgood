"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { AppData, Video, Patient, Assignment, VideoView, Template, BodyZone } from "./types"
import * as storage from "./storage"
import * as api from "./api"

interface DataContextType {
  data: AppData
  isLoading: boolean
  // Videos
  addVideo: (video: Omit<Video, "id" | "createdAt" | "updatedAt">) => Promise<Video>
  updateVideo: (id: string, updates: Partial<Video>) => Promise<Video | null>
  deleteVideo: (id: string) => Promise<boolean>
  // Patients
  addPatient: (patient: Omit<Patient, "id" | "accessToken" | "createdAt" | "updatedAt">) => Promise<Patient>
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<Patient | null>
  deletePatient: (id: string) => Promise<boolean>
  getPatientByToken: (token: string) => Patient | null
  // Assignments
  addAssignment: (assignment: Omit<Assignment, "id" | "createdAt">) => Promise<Assignment>
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<Assignment | null>
  deleteAssignment: (id: string) => Promise<boolean>
  getAssignmentsByPatient: (patientId: string) => Assignment[]
  // Video Views
  recordVideoView: (view: Omit<VideoView, "id">) => VideoView
  getVideoViewsByPatient: (patientId: string) => VideoView[]
  // Templates
  addTemplate: (template: Omit<Template, "id" | "createdAt">) => Promise<Template>
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<Template | null>
  deleteTemplate: (id: string) => Promise<boolean>
  addBodyZone: (zone: Omit<BodyZone, "id">) => BodyZone
  updateBodyZone: (id: string, updates: Partial<BodyZone>) => BodyZone | null
  deleteBodyZone: (id: string) => boolean
  getBodyZones: () => BodyZone[]
  getBodyZoneName: (id: string) => string
  // Export/Import
  exportData: () => string
  importData: (json: string) => boolean
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>({
    videos: [],
    patients: [],
    assignments: [],
    videoViews: [],
    templates: [],
    bodyZones: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  // Загрузить видео с API
  const loadVideos = useCallback(async () => {
    try {
      const videos = await api.videosApi.getAll()
      setData(prev => ({ 
        ...prev, 
        videos: videos.map(v => ({
          ...v,
          thumbnailUrl: v.thumbnailUrl || undefined,
          duration: v.duration || undefined,
          description: v.description || undefined,
        }))
      }))
    } catch (error) {
      console.error('Failed to load videos:', error)
      // Fallback to localStorage
      const stored = storage.getData()
      setData(prev => ({ ...prev, videos: stored.videos }))
    }
  }, [])

  // Загрузить пациентов с API
  const loadPatients = useCallback(async () => {
    try {
      const patients = await api.patientsApi.getAll()
      setData(prev => ({ 
        ...prev, 
        patients: patients.map(p => ({
          ...p,
          email: p.email || undefined,
          phone: p.phone || undefined,
          notes: p.notes || undefined,
        }))
      }))
    } catch (error) {
      console.error('Failed to load patients:', error)
      const stored = storage.getData()
      setData(prev => ({ ...prev, patients: stored.patients }))
    }
  }, [])

  // Загрузить шаблоны с API
  const loadTemplates = useCallback(async () => {
    try {
      const templates = await api.templatesApi.getAll()
      setData(prev => ({ 
        ...prev, 
        templates: templates.map(t => ({
          ...t,
          description: t.description || undefined,
        }))
      }))
    } catch (error) {
      console.error('Failed to load templates:', error)
      const stored = storage.getData()
      setData(prev => ({ ...prev, templates: stored.templates }))
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      await Promise.all([loadVideos(), loadPatients(), loadTemplates()])
    } finally {
      setIsLoading(false)
    }
  }, [loadVideos, loadPatients, loadTemplates])

  useEffect(() => {
    storage.initializeSeedData()
    refresh()
  }, [refresh])

  const getBodyZoneName = useCallback(
    (id: string): string => {
      const zone = data.bodyZones.find((z) => z.id === id)
      return zone?.name || id
    },
    [data.bodyZones],
  )

  const contextValue: DataContextType = {
    data,
    isLoading,
    addVideo: async (video) => {
      try {
        const result = await api.videosApi.create(video)
        await loadVideos()
        return result
      } catch (error) {
        console.error('Failed to add video:', error)
        throw error
      }
    },
    updateVideo: async (id, updates) => {
      try {
        const result = await api.videosApi.update(id, updates)
        await loadVideos()
        return result
      } catch (error) {
        console.error('Failed to update video:', error)
        return null
      }
    },
    deleteVideo: async (id) => {
      try {
        await api.videosApi.delete(id)
        await loadVideos()
        return true
      } catch (error) {
        console.error('Failed to delete video:', error)
        return false
      }
    },
    addPatient: async (patient) => {
      try {
        const result = await api.patientsApi.create(patient)
        await loadPatients()
        return result
      } catch (error) {
        console.error('Failed to add patient:', error)
        throw error
      }
    },
    updatePatient: async (id, updates) => {
      try {
        const result = await api.patientsApi.update(id, updates)
        await loadPatients()
        return result
      } catch (error) {
        console.error('Failed to update patient:', error)
        return null
      }
    },
    deletePatient: async (id) => {
      try {
        await api.patientsApi.delete(id)
        await loadPatients()
        return true
      } catch (error) {
        console.error('Failed to delete patient:', error)
        return false
      }
    },
    getPatientByToken: (token) => {
      return data.patients.find((p) => p.accessToken === token) || null
    },
    addAssignment: async (assignment) => {
      try {
        const result = await api.assignmentsApi.create(assignment)
        setData(prev => ({ 
          ...prev, 
          assignments: [...prev.assignments, result]
        }))
        return result
      } catch (error) {
        console.error('Failed to add assignment:', error)
        throw error
      }
    },
    updateAssignment: async (id, updates) => {
      try {
        const result = await api.assignmentsApi.update(id, updates)
        setData(prev => ({
          ...prev,
          assignments: prev.assignments.map(a => a.id === id ? result : a)
        }))
        return result
      } catch (error) {
        console.error('Failed to update assignment:', error)
        return null
      }
    },
    deleteAssignment: async (id) => {
      try {
        await api.assignmentsApi.delete(id)
        setData(prev => ({
          ...prev,
          assignments: prev.assignments.filter(a => a.id !== id)
        }))
        return true
      } catch (error) {
        console.error('Failed to delete assignment:', error)
        return false
      }
    },
    getAssignmentsByPatient: (patientId) => {
      return data.assignments.filter((a) => a.patientId === patientId)
    },
    recordVideoView: (view) => {
      const result = storage.recordVideoView(view)
      setData(prev => ({ ...prev, videoViews: [...prev.videoViews, result] }))
      return result
    },
    getVideoViewsByPatient: (patientId) => {
      return data.videoViews.filter((v) => v.patientId === patientId)
    },
    addTemplate: async (template) => {
      try {
        const result = await api.templatesApi.create(template)
        await loadTemplates()
        return result
      } catch (error) {
        console.error('Failed to add template:', error)
        throw error
      }
    },
    updateTemplate: async (id, updates) => {
      try {
        const result = await api.templatesApi.update(id, updates)
        await loadTemplates()
        return result
      } catch (error) {
        console.error('Failed to update template:', error)
        return null
      }
    },
    deleteTemplate: async (id) => {
      try {
        await api.templatesApi.delete(id)
        await loadTemplates()
        return true
      } catch (error) {
        console.error('Failed to delete template:', error)
        return false
      }
    },
    addBodyZone: (zone) => {
      const result = storage.addBodyZone(zone)
      setData(prev => ({ ...prev, bodyZones: [...prev.bodyZones, result] }))
      return result
    },
    updateBodyZone: (id, updates) => {
      const result = storage.updateBodyZone(id, updates)
      if (result) {
        setData(prev => ({
          ...prev,
          bodyZones: prev.bodyZones.map(z => z.id === id ? result : z)
        }))
      }
      return result
    },
    deleteBodyZone: (id) => {
      const result = storage.deleteBodyZone(id)
      if (result) {
        setData(prev => ({
          ...prev,
          bodyZones: prev.bodyZones.filter(z => z.id !== id)
        }))
      }
      return result
    },
    getBodyZones: () => data.bodyZones,
    getBodyZoneName,
    exportData: () => JSON.stringify(data, null, 2),
    importData: (json) => {
      try {
        const imported = JSON.parse(json)
        setData(imported)
        return true
      } catch (error) {
        console.error('Failed to import data:', error)
        return false
      }
    },
    refresh,
  }

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within DataProvider")
  }
  return context
}
