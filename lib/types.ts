// Типы данных для приложения "Мой Остео"

export interface BodyZone {
  id: string
  name: string
  order: number
}

export interface Video {
  id: string
  title: string
  url: string // YouTube/Vimeo URL
  thumbnailUrl?: string
  duration?: number // в секундах
  description?: string
  tags: string[]
  bodyZones: string[] // теперь массив ID зон вместо enum
  createdAt: string
  updatedAt: string
}

export interface Patient {
  id: string
  name: string
  email?: string
  phone?: string
  notes?: string
  accessToken: string // уникальный токен для доступа
  createdAt: string
  updatedAt: string
}

export interface Assignment {
  id: string
  patientId: string
  title: string
  description?: string
  videoIds: string[]
  videoOrder: string[] // порядок видео
  createdAt: string
  expiresAt?: string
  isActive: boolean
}

export interface VideoView {
  id: string
  patientId: string
  assignmentId: string
  videoId: string
  watchedAt: string
  watchDuration?: number // сколько секунд смотрел
  completed: boolean
}

export interface Template {
  id: string
  name: string
  description?: string
  videoIds: string[]
  tags: string[]
  createdAt: string
}

export interface AppData {
  videos: Video[]
  patients: Patient[]
  assignments: Assignment[]
  videoViews: VideoView[]
  templates: Template[]
  bodyZones: BodyZone[] // добавлены динамические зоны тела
}

export const DEFAULT_BODY_ZONES: Omit<BodyZone, "id">[] = [
  { name: "Голова", order: 1 },
  { name: "Шея", order: 2 },
  { name: "Плечи", order: 3 },
  { name: "Лопатки", order: 4 },
  { name: "Грудь", order: 5 },
  { name: "Спина", order: 6 },
  { name: "Поясница", order: 7 },
  { name: "Живот", order: 8 },
  { name: "Таз", order: 9 },
  { name: "Бедра", order: 10 },
  { name: "Колени", order: 11 },
  { name: "Голени", order: 12 },
  { name: "Стопы", order: 13 },
  { name: "Руки", order: 14 },
  { name: "Кисти", order: 15 },
  { name: "Диафрагма", order: 16 },
]
