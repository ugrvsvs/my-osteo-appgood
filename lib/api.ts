const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface Video {
  id: string
  title: string
  url: string
  description: string | null
  thumbnailUrl: string | null
  duration: number | null
  tags: string[]
  bodyZones: string[]
  createdAt: string
  updatedAt: string
}

export interface Patient {
  id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  publicToken: string
  createdAt: string
  updatedAt: string
}

export interface Assignment {
  id: string
  patientId: string
  title: string
  description: string | null
  videoIds: string[]
  videoOrder: string[]
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

export interface Template {
  id: string
  name: string
  description: string | null
  videoIds: string[]
  tags: string[]
  createdAt: string
}

// Videos API
export const videosApi = {
  async getAll(): Promise<Video[]> {
    const res = await fetch(`${API_URL}/videos`)
    if (!res.ok) throw new Error('Failed to fetch videos')
    return res.json()
  },

  async getById(id: string): Promise<Video> {
    const res = await fetch(`${API_URL}/videos/${id}`)
    if (!res.ok) throw new Error('Failed to fetch video')
    return res.json()
  },

  async create(video: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<Video> {
    const res = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video),
    })
    if (!res.ok) throw new Error('Failed to create video')
    return res.json()
  },

  async update(id: string, video: Partial<Video>): Promise<Video> {
    const res = await fetch(`${API_URL}/videos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video),
    })
    if (!res.ok) throw new Error('Failed to update video')
    return res.json()
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/videos/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete video')
  },
}

// Patients API
export const patientsApi = {
  async getAll(): Promise<Patient[]> {
    const res = await fetch(`${API_URL}/patients`)
    if (!res.ok) throw new Error('Failed to fetch patients')
    return res.json()
  },

  async getById(id: string): Promise<Patient> {
    const res = await fetch(`${API_URL}/patients/${id}`)
    if (!res.ok) throw new Error('Failed to fetch patient')
    return res.json()
  },

  async getByToken(token: string): Promise<Patient> {
    const res = await fetch(`${API_URL}/patients/token/${token}`)
    if (!res.ok) throw new Error('Failed to fetch patient')
    return res.json()
  },

  async create(patient: Omit<Patient, 'id' | 'publicToken' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const res = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    })
    if (!res.ok) throw new Error('Failed to create patient')
    return res.json()
  },

  async update(id: string, patient: Partial<Patient>): Promise<Patient> {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    })
    if (!res.ok) throw new Error('Failed to update patient')
    return res.json()
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/patients/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete patient')
  },
}

// Assignments API
export const assignmentsApi = {
  async getAll(): Promise<Assignment[]> {
    const res = await fetch(`${API_URL}/assignments`)
    if (!res.ok) throw new Error('Failed to fetch assignments')
    return res.json()
  },

  async getByPatientId(patientId: string): Promise<Assignment[]> {
    const res = await fetch(`${API_URL}/assignments/patient/${patientId}`)
    if (!res.ok) throw new Error('Failed to fetch assignments')
    return res.json()
  },

  async create(assignment: Omit<Assignment, 'id' | 'createdAt'>): Promise<Assignment> {
    const res = await fetch(`${API_URL}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignment),
    })
    if (!res.ok) throw new Error('Failed to create assignment')
    return res.json()
  },

  async update(id: string, assignment: Partial<Assignment>): Promise<Assignment> {
    const res = await fetch(`${API_URL}/assignments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignment),
    })
    if (!res.ok) throw new Error('Failed to update assignment')
    return res.json()
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/assignments/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete assignment')
  },
}

// Templates API
export const templatesApi = {
  async getAll(): Promise<Template[]> {
    const res = await fetch(`${API_URL}/templates`)
    if (!res.ok) throw new Error('Failed to fetch templates')
    return res.json()
  },

  async create(template: Omit<Template, 'id' | 'createdAt'>): Promise<Template> {
    const res = await fetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    })
    if (!res.ok) throw new Error('Failed to create template')
    return res.json()
  },

  async update(id: string, template: Partial<Template>): Promise<Template> {
    const res = await fetch(`${API_URL}/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    })
    if (!res.ok) throw new Error('Failed to update template')
    return res.json()
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/templates/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete template')
  },
}
