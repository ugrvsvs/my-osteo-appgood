import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import db from './database/init.js'

// Инициализация видео
import videoRoutes from './routes/videos.js'
import patientRoutes from './routes/patients.js'
import assignmentRoutes from './routes/assignments.js'
import templateRoutes from './routes/templates.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

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

app.listen(PORT, () => {
  console.log(`\n🚀 Сервер запущен на http://localhost:${PORT}`)
  console.log(`📊 БД: ${process.env.DATABASE_PATH || './data/osteo.db'}\n`)
})
