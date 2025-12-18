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
    const videos = await res.json()
    return videos.map((v: any) => ({
      ...v,
      thumbnailUrl: v.thumbnail_url,
      bodyZones: v.body_zones,
      createdAt: v.created_at,
      updatedAt: v.updated_at,
    }))
  },

  async getById(id: string): Promise<Video> {
    const res = await fetch(`${API_URL}/videos/${id}`)
    if (!res.ok) throw new Error('Failed to fetch video')
    const v = await res.json()
    return {
      ...v,
      thumbnailUrl: v.thumbnail_url,
      bodyZones: v.body_zones,
      createdAt: v.created_at,
      updatedAt: v.updated_at,
    }
  },

  async create(video: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<Video> {
    const res = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...video,
        thumbnail_url: video.thumbnailUrl,
        body_zones: video.bodyZones,
      }),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      console.error('Failed to create video:', error)
      throw new Error(error?.error || `Failed to create video: ${res.status}`)
    }
    const v = await res.json()
    return {
      ...v,
      thumbnailUrl: v.thumbnail_url,
      bodyZones: v.body_zones,
      createdAt: v.created_at,
      updatedAt: v.updated_at,
    }
  },

  async update(id: string, video: Partial<Video>): Promise<Video> {
    const res = await fetch(`${API_URL}/videos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...video,
        thumbnail_url: video.thumbnailUrl,
        body_zones: video.bodyZones,
      }),
    })
    if (!res.ok) throw new Error('Failed to update video')
    const v = await res.json()
    return {
      ...v,
      thumbnailUrl: v.thumbnail_url,
      bodyZones: v.body_zones,
      createdAt: v.created_at,
      updatedAt: v.updated_at,
    }
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
    const patients = await res.json()
    return patients.map((p: any) => ({
      ...p,
      publicToken: p.public_token,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }))
  },

  async getById(id: string): Promise<Patient> {
    const res = await fetch(`${API_URL}/patients/${id}`)
    if (!res.ok) throw new Error('Failed to fetch patient')
    const p = await res.json()
    return {
      ...p,
      publicToken: p.public_token,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }
  },

  async getByToken(token: string): Promise<Patient> {
    const res = await fetch(`${API_URL}/patients/token/${token}`)
    if (!res.ok) throw new Error('Failed to fetch patient')
    const p = await res.json()
    return {
      ...p,
      publicToken: p.public_token,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }
  },

  async create(patient: Omit<Patient, 'id' | 'publicToken' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const res = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    })
    if (!res.ok) throw new Error('Failed to create patient')
    const p = await res.json()
    return {
      ...p,
      publicToken: p.public_token,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }
  },

  async update(id: string, patient: Partial<Patient>): Promise<Patient> {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    })
    if (!res.ok) throw new Error('Failed to update patient')
    const p = await res.json()
    return {
      ...p,
      publicToken: p.public_token,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }
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
    const assignments = await res.json()
    return assignments.map((a: any) => ({
      ...a,
      patientId: a.patient_id,
      videoIds: a.video_ids,
      videoOrder: a.video_order,
      isActive: Boolean(a.is_active),
      expiresAt: a.expires_at,
      createdAt: a.created_at,
    }))
  },

  async getByPatientId(patientId: string): Promise<Assignment[]> {
    const res = await fetch(`${API_URL}/assignments/patient/${patientId}`)
    if (!res.ok) throw new Error('Failed to fetch assignments')
    const assignments = await res.json()
    return assignments.map((a: any) => ({
      ...a,
      patientId: a.patient_id,
      videoIds: a.video_ids,
      videoOrder: a.video_order,
      isActive: Boolean(a.is_active),
      expiresAt: a.expires_at,
      createdAt: a.created_at,
    }))
  },

  async create(assignment: Omit<Assignment, 'id' | 'createdAt'>): Promise<Assignment> {
    const res = await fetch(`${API_URL}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...assignment,
        patient_id: assignment.patientId,
        video_ids: assignment.videoIds,
        video_order: assignment.videoOrder,
        is_active: assignment.isActive,
        expires_at: assignment.expiresAt,
      }),
    })
    if (!res.ok) throw new Error('Failed to create assignment')
    const a = await res.json()
    return {
      ...a,
      patientId: a.patient_id,
      videoIds: a.video_ids,
      videoOrder: a.video_order,
      isActive: Boolean(a.is_active),
      expiresAt: a.expires_at,
      createdAt: a.created_at,
    }
  },

  async update(id: string, assignment: Partial<Assignment>): Promise<Assignment> {
    const res = await fetch(`${API_URL}/assignments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...assignment,
        patient_id: assignment.patientId,
        video_ids: assignment.videoIds,
        video_order: assignment.videoOrder,
        is_active: assignment.isActive,
        expires_at: assignment.expiresAt,
      }),
    })
    if (!res.ok) throw new Error('Failed to update assignment')
    const a = await res.json()
    return {
      ...a,
      patientId: a.patient_id,
      videoIds: a.video_ids,
      videoOrder: a.video_order,
      isActive: Boolean(a.is_active),
      expiresAt: a.expires_at,
      createdAt: a.created_at,
    }
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
    const templates = await res.json()
    return templates.map((t: any) => ({
      ...t,
      videoIds: t.video_ids,
      createdAt: t.created_at,
    }))
  },

  async create(template: Omit<Template, 'id' | 'createdAt'>): Promise<Template> {
    const res = await fetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...template,
        video_ids: template.videoIds,
      }),
    })
    if (!res.ok) throw new Error('Failed to create template')
    const t = await res.json()
    return {
      ...t,
      videoIds: t.video_ids,
      createdAt: t.created_at,
    }
  },

  async update(id: string, template: Partial<Template>): Promise<Template> {
    const res = await fetch(`${API_URL}/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...template,
        video_ids: template.videoIds,
      }),
    })
    if (!res.ok) throw new Error('Failed to update template')
    const t = await res.json()
    return {
      ...t,
      videoIds: t.video_ids,
      createdAt: t.created_at,
    }
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/templates/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete template')
  },
}
