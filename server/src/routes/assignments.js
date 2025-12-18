import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { dbRun, dbGet, dbAll } from '../utils/db.js'

const router = express.Router()

// GET все назначения
router.get('/', async (req, res, next) => {
  try {
    const assignments = await dbAll('SELECT * FROM assignments ORDER BY created_at DESC')
    const parsed = assignments.map(a => ({
      ...a,
      videoIds: JSON.parse(a.video_ids || '[]'),
      videoOrder: JSON.parse(a.video_order || '[]'),
      isActive: Boolean(a.is_active)
    }))
    res.json(parsed)
  } catch (err) {
    next(err)
  }
})

// GET назначения пациента
router.get('/patient/:patientId', async (req, res, next) => {
  try {
    const assignments = await dbAll(
      'SELECT * FROM assignments WHERE patient_id = ? ORDER BY created_at DESC',
      [req.params.patientId]
    )
    const parsed = assignments.map(a => ({
      ...a,
      videoIds: JSON.parse(a.video_ids || '[]'),
      videoOrder: JSON.parse(a.video_order || '[]'),
      isActive: Boolean(a.is_active)
    }))
    res.json(parsed)
  } catch (err) {
    next(err)
  }
})

// POST новое назначение
router.post('/', async (req, res, next) => {
  try {
    const { patientId, title, description, videoIds, videoOrder, expiresAt } = req.body
    
    if (!patientId || !title) {
      return res.status(400).json({ error: 'Patient ID and title are required' })
    }

    const id = uuidv4()
    const now = new Date().toISOString()

    await dbRun(
      `INSERT INTO assignments (id, patient_id, title, description, video_ids, video_order, is_active, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, patientId, title, description, JSON.stringify(videoIds || []), JSON.stringify(videoOrder || []), 1, expiresAt, now]
    )

    const assignment = await dbGet('SELECT * FROM assignments WHERE id = ?', [id])
    assignment.videoIds = JSON.parse(assignment.video_ids || '[]')
    assignment.videoOrder = JSON.parse(assignment.video_order || '[]')
    assignment.isActive = Boolean(assignment.is_active)
    
    res.status(201).json(assignment)
  } catch (err) {
    next(err)
  }
})

// PUT обновить назначение
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, videoIds, videoOrder, isActive, expiresAt } = req.body

    await dbRun(
      `UPDATE assignments 
       SET title = ?, description = ?, video_ids = ?, video_order = ?, is_active = ?, expires_at = ?
       WHERE id = ?`,
      [title, description, JSON.stringify(videoIds || []), JSON.stringify(videoOrder || []), isActive ? 1 : 0, expiresAt, req.params.id]
    )

    const assignment = await dbGet('SELECT * FROM assignments WHERE id = ?', [req.params.id])
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' })
    
    assignment.videoIds = JSON.parse(assignment.video_ids || '[]')
    assignment.videoOrder = JSON.parse(assignment.video_order || '[]')
    assignment.isActive = Boolean(assignment.is_active)
    res.json(assignment)
  } catch (err) {
    next(err)
  }
})

// DELETE назначение
router.delete('/:id', async (req, res, next) => {
  try {
    await dbRun('DELETE FROM assignments WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
