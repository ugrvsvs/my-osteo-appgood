import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { initializeDatabase } from './database/init.js'

// Инициализация видео
import videoRoutes from './routes/videos.js'
import patientRoutes from './routes/patients.js'
import assignmentRoutes from './routes/assignments.js'
import templateRoutes from './routes/templates.js'
import uploadRoutes from './routes/uploads.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// API Routes
app.use('/api/videos', videoRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/upload', uploadRoutes)

// Раздача загруженных файлов
const uploadsDir = path.join(__dirname, '../../uploads')
console.log('📁 Static uploads dir:', uploadsDir)
app.use('/api/uploads', express.static(uploadsDir))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Ошибка:', err)
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    status: 500
  })
})

// Инициализировать БД и запустить сервер
async function start() {
  try {
    await initializeDatabase()
    app.listen(PORT, () => {
      console.log(`\n🚀 Сервер запущен на http://localhost:${PORT}`)
      console.log(`📊 БД: MySQL ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}\n`)
    })
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error)
    process.exit(1)
  }
}

start()
