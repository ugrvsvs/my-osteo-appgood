import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { dbRun, dbGet, dbAll } from '../utils/db.js'

const router = express.Router()

// GET все видео
router.get('/', async (req, res, next) => {
  try {
    const videos = await dbAll('SELECT * FROM videos ORDER BY created_at DESC')
    const parsed = videos.map(v => {
      try {
        const tags = typeof v.tags === 'string' ? JSON.parse(v.tags || '[]') : (Array.isArray(v.tags) ? v.tags : [])
        const bodyZones = typeof v.body_zones === 'string' ? JSON.parse(v.body_zones || '[]') : (Array.isArray(v.body_zones) ? v.body_zones : [])
        
        return {
          ...v,
          tags: tags,
          bodyZones: bodyZones
        }
      } catch (e) {
        console.error('Error parsing video JSON:', v)
        return {
          ...v,
          tags: [],
          bodyZones: []
        }
      }
    })
    res.json(parsed)
  } catch (err) {
    next(err)
  }
})

// GET видео по ID
router.get('/:id', async (req, res, next) => {
  try {
    const video = await dbGet('SELECT * FROM videos WHERE id = ?', [req.params.id])
    if (!video) return res.status(404).json({ error: 'Video not found' })
    
    try {
      video.tags = typeof video.tags === 'string' ? JSON.parse(video.tags || '[]') : (Array.isArray(video.tags) ? video.tags : [])
      video.bodyZones = typeof video.body_zones === 'string' ? JSON.parse(video.body_zones || '[]') : (Array.isArray(video.body_zones) ? video.body_zones : [])
    } catch (e) {
      console.error('Error parsing video JSON:', video)
      video.tags = []
      video.bodyZones = []
    }
    
    res.json(video)
  } catch (err) {
    next(err)
  }
})

// POST новое видео
router.post('/', async (req, res, next) => {
  try {
    const { title, url, description, thumbnailUrl, duration, tags, bodyZones } = req.body
    
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' })
    }

    const id = uuidv4()
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

    await dbRun(
      `INSERT INTO videos (id, title, url, description, thumbnail_url, duration, tags, body_zones, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, url, description || null, thumbnailUrl || null, duration || null, JSON.stringify(tags || []), JSON.stringify(bodyZones || []), now, now]
    )

    const video = await dbGet('SELECT * FROM videos WHERE id = ?', [id])
    try {
      video.tags = typeof video.tags === 'string' ? JSON.parse(video.tags || '[]') : (Array.isArray(video.tags) ? video.tags : [])
      video.bodyZones = typeof video.body_zones === 'string' ? JSON.parse(video.body_zones || '[]') : (Array.isArray(video.body_zones) ? video.body_zones : [])
    } catch (e) {
      console.error('Error parsing video JSON:', video)
      video.tags = []
      video.bodyZones = []
    }
    res.status(201).json(video)
  } catch (err) {
    next(err)
  }
})

// PUT обновить видео
router.put('/:id', async (req, res, next) => {
  try {
    const { title, url, description, thumbnailUrl, duration, tags, bodyZones } = req.body
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

    await dbRun(
      `UPDATE videos 
       SET title = ?, url = ?, description = ?, thumbnail_url = ?, duration = ?, tags = ?, body_zones = ?, updated_at = ?
       WHERE id = ?`,
      [title, url, description || null, thumbnailUrl || null, duration || null, JSON.stringify(tags || []), JSON.stringify(bodyZones || []), now, req.params.id]
    )

    const video = await dbGet('SELECT * FROM videos WHERE id = ?', [req.params.id])
    if (!video) return res.status(404).json({ error: 'Video not found' })
    
    try {
      video.tags = typeof video.tags === 'string' ? JSON.parse(video.tags || '[]') : (Array.isArray(video.tags) ? video.tags : [])
      video.bodyZones = typeof video.body_zones === 'string' ? JSON.parse(video.body_zones || '[]') : (Array.isArray(video.body_zones) ? video.body_zones : [])
    } catch (e) {
      console.error('Error parsing video JSON:', video)
      video.tags = []
      video.bodyZones = []
    }
    res.json(video)
  } catch (err) {
    next(err)
  }
})

// DELETE видео
router.delete('/:id', async (req, res, next) => {
  try {
    await dbRun('DELETE FROM videos WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
