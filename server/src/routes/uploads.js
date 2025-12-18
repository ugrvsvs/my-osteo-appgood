import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Директория для сохранения файлов (в корне проекта)
const UPLOADS_DIR = path.join(__dirname, '../../../uploads')

// Создать директорию если не существует
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

// POST /api/upload - загрузить файл
router.post('/', (req, res, next) => {
  try {
    // Получаем base64 из тела запроса
    const { file, filename } = req.body
    
    console.log('📁 Upload request:', { filename, fileSize: file?.length || 0 })
    console.log('📁 UPLOADS_DIR:', UPLOADS_DIR)

    if (!file || !filename) {
      return res.status(400).json({ error: 'File and filename are required' })
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const newFilename = `${timestamp}_${sanitizedFilename}`
    const filepath = path.join(UPLOADS_DIR, newFilename)

    // Преобразуем base64 в буфер
    let buffer
    if (file.startsWith('data:image')) {
      // Это data URL
      const base64Data = file.replace(/^data:image\/[a-z]+;base64,/, '')
      buffer = Buffer.from(base64Data, 'base64')
    } else {
      // Это уже base64
      buffer = Buffer.from(file, 'base64')
    }

    // Проверяем размер (макс 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File is too large. Maximum 5MB.' })
    }

    // Сохраняем файл
    console.log('📁 Saving to:', filepath)
    fs.writeFileSync(filepath, buffer)
    console.log('✅ File saved successfully')

    // Возвращаем URL для доступа к файлу
    const fileUrl = `/api/uploads/${newFilename}`

    res.json({
      success: true,
      url: fileUrl,
      filename: newFilename,
    })
  } catch (err) {
    console.error('Upload error:', err)
    next(err)
  }
})

// GET /api/uploads/:filename - получить файл
router.get('/:filename', (req, res, next) => {
  try {
    const filepath = path.join(UPLOADS_DIR, req.params.filename)

    // Защита от path traversal
    if (!filepath.startsWith(UPLOADS_DIR)) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    res.sendFile(filepath)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/uploads/:filename - удалить файл
router.delete('/:filename', (req, res, next) => {
  try {
    const filepath = path.join(UPLOADS_DIR, req.params.filename)

    // Защита от path traversal
    if (!filepath.startsWith(UPLOADS_DIR)) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    fs.unlinkSync(filepath)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
