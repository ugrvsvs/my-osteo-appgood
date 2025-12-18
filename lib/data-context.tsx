"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { AppData, Video, Patient, Assignment, VideoView, Template, BodyZone } from "./types"
import * as storage from "./storage"

interface DataContextType {
  data: AppData
  isLoading: boolean
  // Videos
  addVideo: (video: Omit<Video, "id" | "createdAt" | "updatedAt">) => Video
  updateVideo: (id: string, updates: Partial<Video>) => Video | null
  deleteVideo: (id: string) => boolean
  // Patients
  addPatient: (patient: Omit<Patient, "id" | "accessToken" | "createdAt" | "updatedAt">) => Patient
  updatePatient: (id: string, updates: Partial<Patient>) => Patient | null
  deletePatient: (id: string) => boolean
  getPatientByToken: (token: string) => Patient | null
  // Assignments
  addAssignment: (assignment: Omit<Assignment, "id" | "createdAt">) => Assignment
  updateAssignment: (id: string, updates: Partial<Assignment>) => Assignment | null
  deleteAssignment: (id: string) => boolean
  getAssignmentsByPatient: (patientId: string) => Assignment[]
  // Video Views
  recordVideoView: (view: Omit<VideoView, "id">) => VideoView
  getVideoViewsByPatient: (patientId: string) => VideoView[]
  // Templates
  addTemplate: (template: Omit<Template, "id" | "createdAt">) => Template
  updateTemplate: (id: string, updates: Partial<Template>) => Template | null
  deleteTemplate: (id: string) => boolean
  addBodyZone: (zone: Omit<BodyZone, "id">) => BodyZone
  updateBodyZone: (id: string, updates: Partial<BodyZone>) => BodyZone | null
  deleteBodyZone: (id: string) => boolean
  getBodyZones: () => BodyZone[]
  getBodyZoneName: (id: string) => string
  // Export/Import
  exportData: () => string
  importData: (json: string) => boolean
  refresh: () => void
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

  const refresh = useCallback(() => {
    setData(storage.getData())
  }, [])

  useEffect(() => {
    storage.initializeSeedData()
    // Небольшая задержка для загрузки seed данных
    setTimeout(() => {
      refresh()
      setIsLoading(false)
    }, 100)
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
    addVideo: (video) => {
      const result = storage.addVideo(video)
      refresh()
      return result
    },
    updateVideo: (id, updates) => {
      const result = storage.updateVideo(id, updates)
      refresh()
      return result
    },
    deleteVideo: (id) => {
      const result = storage.deleteVideo(id)
      refresh()
      return result
    },
    addPatient: (patient) => {
      const result = storage.addPatient(patient)
      refresh()
      return result
    },
    updatePatient: (id, updates) => {
      const result = storage.updatePatient(id, updates)
      refresh()
      return result
    },
    deletePatient: (id) => {
      const result = storage.deletePatient(id)
      refresh()
      return result
    },
    getPatientByToken: storage.getPatientByToken,
    addAssignment: (assignment) => {
      const result = storage.addAssignment(assignment)
      refresh()
      return result
    },
    updateAssignment: (id, updates) => {
      const result = storage.updateAssignment(id, updates)
      refresh()
      return result
    },
    deleteAssignment: (id) => {
      const result = storage.deleteAssignment(id)
      refresh()
      return result
    },
    getAssignmentsByPatient: storage.getAssignmentsByPatient,
    recordVideoView: (view) => {
      const result = storage.recordVideoView(view)
      refresh()
      return result
    },
    getVideoViewsByPatient: storage.getVideoViewsByPatient,
    addTemplate: (template) => {
      const result = storage.addTemplate(template)
      refresh()
      return result
    },
    updateTemplate: (id, updates) => {
      const result = storage.updateTemplate(id, updates)
      refresh()
      return result
    },
    deleteTemplate: (id) => {
      const result = storage.deleteTemplate(id)
      refresh()
      return result
    },
    addBodyZone: (zone) => {
      const result = storage.addBodyZone(zone)
      refresh()
      return result
    },
    updateBodyZone: (id, updates) => {
      const result = storage.updateBodyZone(id, updates)
      refresh()
      return result
    },
    deleteBodyZone: (id) => {
      const result = storage.deleteBodyZone(id)
      refresh()
      return result
    },
    getBodyZones: storage.getBodyZones,
    getBodyZoneName,
    exportData: storage.exportData,
    importData: (json) => {
      const result = storage.importData(json)
      if (result) refresh()
      return result
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
