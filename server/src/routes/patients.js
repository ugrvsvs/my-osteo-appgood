import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { dbRun, dbGet, dbAll } from '../utils/db.js'

const router = express.Router()

// GET все пациенты
router.get('/', async (req, res, next) => {
  try {
    const patients = await dbAll('SELECT * FROM patients ORDER BY created_at DESC')
    res.json(patients)
  } catch (err) {
    next(err)
  }
})

// GET пациент по токену доступа (для публичной ссылки) - ДОЛЖЕН БЫТЬ ДО /:id
router.get('/token/:token', async (req, res, next) => {
  try {
    const patient = await dbGet('SELECT * FROM patients WHERE access_token = ?', [req.params.token])
    if (!patient) return res.status(404).json({ error: 'Patient not found' })
    res.json(patient)
  } catch (err) {
    next(err)
  }
})

// GET пациент по ID
router.get('/:id', async (req, res, next) => {
  try {
    const patient = await dbGet('SELECT * FROM patients WHERE id = ?', [req.params.id])
    if (!patient) return res.status(404).json({ error: 'Patient not found' })
    res.json(patient)
  } catch (err) {
    next(err)
  }
})

// POST новый пациент
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, notes } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }

    const id = uuidv4()
    const accessToken = crypto.randomBytes(32).toString('hex')
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

    await dbRun(
      `INSERT INTO patients (id, name, email, phone, notes, access_token, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email || null, phone || null, notes || null, accessToken, now, now]
    )

    const patient = await dbGet('SELECT * FROM patients WHERE id = ?', [id])
    res.status(201).json(patient)
  } catch (err) {
    next(err)
  }
})

// PUT обновить пациента
router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, phone, notes } = req.body
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

    await dbRun(
      `UPDATE patients 
       SET name = ?, email = ?, phone = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      [name || null, email || null, phone || null, notes || null, now, req.params.id]
    )

    const patient = await dbGet('SELECT * FROM patients WHERE id = ?', [req.params.id])
    if (!patient) return res.status(404).json({ error: 'Patient not found' })
    res.json(patient)
  } catch (err) {
    next(err)
  }
})

// DELETE пациента
router.delete('/:id', async (req, res, next) => {
  try {
    await dbRun('DELETE FROM patients WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
