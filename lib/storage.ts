import type { AppData, Video, Patient, Assignment, VideoView, Template, BodyZone } from "./types"
import { DEFAULT_BODY_ZONES } from "./types"

const STORAGE_KEY = "osteo-app-data"

const defaultData: AppData = {
  videos: [],
  patients: [],
  assignments: [],
  videoViews: [],
  templates: [],
  bodyZones: [], // добавлено
}

// Получить все данные
export function getData(): AppData {
  if (typeof window === "undefined") return defaultData

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return defaultData

  try {
    const data = JSON.parse(stored) as AppData
    if (!data.bodyZones) {
      data.bodyZones = []
    }
    return data
  } catch {
    return defaultData
  }
}

// Сохранить все данные
export function saveData(data: AppData): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Генерация уникального ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Генерация токена доступа для пациента
export function generateAccessToken(): string {
  return Array.from({ length: 32 }, () => Math.random().toString(36).charAt(2)).join("")
}

export function addBodyZone(zone: Omit<BodyZone, "id">): BodyZone {
  const data = getData()
  const newZone: BodyZone = {
    ...zone,
    id: generateId(),
  }
  data.bodyZones.push(newZone)
  saveData(data)
  return newZone
}

export function updateBodyZone(id: string, updates: Partial<BodyZone>): BodyZone | null {
  const data = getData()
  const index = data.bodyZones.findIndex((z) => z.id === id)
  if (index === -1) return null

  data.bodyZones[index] = {
    ...data.bodyZones[index],
    ...updates,
  }
  saveData(data)
  return data.bodyZones[index]
}

export function deleteBodyZone(id: string): boolean {
  const data = getData()
  const index = data.bodyZones.findIndex((z) => z.id === id)
  if (index === -1) return false

  data.bodyZones.splice(index, 1)
  // Удаляем эту зону из всех видео
  data.videos.forEach((video) => {
    video.bodyZones = video.bodyZones.filter((zoneId) => zoneId !== id)
  })
  saveData(data)
  return true
}

export function getBodyZones(): BodyZone[] {
  const data = getData()
  return [...data.bodyZones].sort((a, b) => a.order - b.order)
}

// CRUD для видео
export function addVideo(video: Omit<Video, "id" | "createdAt" | "updatedAt">): Video {
  const data = getData()
  const newVideo: Video = {
    ...video,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  data.videos.push(newVideo)
  saveData(data)
  return newVideo
}

export function updateVideo(id: string, updates: Partial<Video>): Video | null {
  const data = getData()
  const index = data.videos.findIndex((v) => v.id === id)
  if (index === -1) return null

  data.videos[index] = {
    ...data.videos[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  saveData(data)
  return data.videos[index]
}

export function deleteVideo(id: string): boolean {
  const data = getData()
  const index = data.videos.findIndex((v) => v.id === id)
  if (index === -1) return false

  data.videos.splice(index, 1)
  saveData(data)
  return true
}

// CRUD для пациентов
export function addPatient(patient: Omit<Patient, "id" | "accessToken" | "createdAt" | "updatedAt">): Patient {
  const data = getData()
  const newPatient: Patient = {
    ...patient,
    id: generateId(),
    accessToken: generateAccessToken(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  data.patients.push(newPatient)
  saveData(data)
  return newPatient
}

export function updatePatient(id: string, updates: Partial<Patient>): Patient | null {
  const data = getData()
  const index = data.patients.findIndex((p) => p.id === id)
  if (index === -1) return null

  data.patients[index] = {
    ...data.patients[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  saveData(data)
  return data.patients[index]
}

export function deletePatient(id: string): boolean {
  const data = getData()
  const index = data.patients.findIndex((p) => p.id === id)
  if (index === -1) return false

  data.patients.splice(index, 1)
  // Удаляем связанные назначения
  data.assignments = data.assignments.filter((a) => a.patientId !== id)
  saveData(data)
  return true
}

export function getPatientByToken(token: string): Patient | null {
  const data = getData()
  return data.patients.find((p) => p.accessToken === token) || null
}

// CRUD для назначений
export function addAssignment(assignment: Omit<Assignment, "id" | "createdAt">): Assignment {
  const data = getData()
  const newAssignment: Assignment = {
    ...assignment,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  data.assignments.push(newAssignment)
  saveData(data)
  return newAssignment
}

export function updateAssignment(id: string, updates: Partial<Assignment>): Assignment | null {
  const data = getData()
  const index = data.assignments.findIndex((a) => a.id === id)
  if (index === -1) return null

  data.assignments[index] = {
    ...data.assignments[index],
    ...updates,
  }
  saveData(data)
  return data.assignments[index]
}

export function deleteAssignment(id: string): boolean {
  const data = getData()
  const index = data.assignments.findIndex((a) => a.id === id)
  if (index === -1) return false

  data.assignments.splice(index, 1)
  saveData(data)
  return true
}

export function getAssignmentsByPatient(patientId: string): Assignment[] {
  const data = getData()
  return data.assignments.filter((a) => a.patientId === patientId)
}

// Просмотры видео
export function recordVideoView(view: Omit<VideoView, "id">): VideoView {
  const data = getData()
  const newView: VideoView = {
    ...view,
    id: generateId(),
  }
  data.videoViews.push(newView)
  saveData(data)
  return newView
}

export function getVideoViewsByPatient(patientId: string): VideoView[] {
  const data = getData()
  return data.videoViews.filter((v) => v.patientId === patientId)
}

// CRUD для шаблонов
export function addTemplate(template: Omit<Template, "id" | "createdAt">): Template {
  const data = getData()
  const newTemplate: Template = {
    ...template,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  data.templates.push(newTemplate)
  saveData(data)
  return newTemplate
}

export function updateTemplate(id: string, updates: Partial<Template>): Template | null {
  const data = getData()
  const index = data.templates.findIndex((t) => t.id === id)
  if (index === -1) return null

  data.templates[index] = {
    ...data.templates[index],
    ...updates,
  }
  saveData(data)
  return data.templates[index]
}

export function deleteTemplate(id: string): boolean {
  const data = getData()
  const index = data.templates.findIndex((t) => t.id === id)
  if (index === -1) return false

  data.templates.splice(index, 1)
  saveData(data)
  return true
}

// Экспорт/Импорт данных
export function exportData(): string {
  return JSON.stringify(getData(), null, 2)
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as AppData
    // Валидация структуры
    if (!data.videos || !data.patients || !data.assignments) {
      return false
    }
    if (!data.bodyZones) {
      data.bodyZones = []
    }
    saveData(data)
    return true
  } catch {
    return false
  }
}

export function initializeSeedData(): boolean {
  if (typeof window === "undefined") return false

  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) {
    // Проверяем, есть ли зоны тела, если нет - добавляем дефолтные
    const data = JSON.parse(existing) as AppData
    if (!data.bodyZones || data.bodyZones.length === 0) {
      data.bodyZones = DEFAULT_BODY_ZONES.map((zone) => ({
        ...zone,
        id: generateId(),
      }))
      saveData(data)
    }
    return false
  }

  // Импортируем динамически, чтобы избежать циклических зависимостей
  import("./seed-data").then(({ getSeedData }) => {
    const seedData = getSeedData()
    saveData(seedData)
  })

  return true
}
