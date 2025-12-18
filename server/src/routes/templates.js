import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { dbRun, dbGet, dbAll } from '../utils/db.js'

const router = express.Router()

// GET все шаблоны
router.get('/', async (req, res, next) => {
  try {
    const templates = await dbAll('SELECT * FROM templates ORDER BY created_at DESC')
    const parsed = templates.map(t => {
      try {
        const videoIds = typeof t.video_ids === 'string' ? JSON.parse(t.video_ids || '[]') : (Array.isArray(t.video_ids) ? t.video_ids : [])
        const tags = typeof t.tags === 'string' ? JSON.parse(t.tags || '[]') : (Array.isArray(t.tags) ? t.tags : [])
        
        return {
          ...t,
          videoIds: videoIds,
          tags: tags
        }
      } catch (e) {
        console.error('Error parsing template JSON:', t)
        return {
          ...t,
          videoIds: [],
          tags: []
        }
      }
    })
    res.json(parsed)
  } catch (err) {
    next(err)
  }
})

// POST новый шаблон
router.post('/', async (req, res, next) => {
  try {
    const { name, description, videoIds, tags } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }

    const id = uuidv4()
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

    await dbRun(
      `INSERT INTO templates (id, name, description, video_ids, tags, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, description || null, JSON.stringify(videoIds || []), JSON.stringify(tags || []), now]
    )

    const template = await dbGet('SELECT * FROM templates WHERE id = ?', [id])
    try {
      template.videoIds = typeof template.video_ids === 'string' ? JSON.parse(template.video_ids || '[]') : (Array.isArray(template.video_ids) ? template.video_ids : [])
      template.tags = typeof template.tags === 'string' ? JSON.parse(template.tags || '[]') : (Array.isArray(template.tags) ? template.tags : [])
    } catch (e) {
      console.error('Error parsing template JSON:', template)
      template.videoIds = []
      template.tags = []
    }
    
    res.status(201).json(template)
  } catch (err) {
    next(err)
  }
})

// PUT обновить шаблон
router.put('/:id', async (req, res, next) => {
  try {
    const { name, description, videoIds, tags } = req.body

    await dbRun(
      `UPDATE templates 
       SET name = ?, description = ?, video_ids = ?, tags = ?
       WHERE id = ?`,
      [name, description || null, JSON.stringify(videoIds || []), JSON.stringify(tags || []), req.params.id]
    )

    const template = await dbGet('SELECT * FROM templates WHERE id = ?', [req.params.id])
    if (!template) return res.status(404).json({ error: 'Template not found' })
    
    try {
      template.videoIds = typeof template.video_ids === 'string' ? JSON.parse(template.video_ids || '[]') : (Array.isArray(template.video_ids) ? template.video_ids : [])
      template.tags = typeof template.tags === 'string' ? JSON.parse(template.tags || '[]') : (Array.isArray(template.tags) ? template.tags : [])
    } catch (e) {
      console.error('Error parsing template JSON:', template)
      template.videoIds = []
      template.tags = []
    }
    res.json(template)
  } catch (err) {
    next(err)
  }
})

// DELETE шаблон
router.delete('/:id', async (req, res, next) => {
  try {
    await dbRun('DELETE FROM templates WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
