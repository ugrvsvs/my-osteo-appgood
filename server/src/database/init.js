import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'osteo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Создать pool подключений
const pool = mysql.createPool(config)

// Инициализация таблиц
async function initializeTables() {
  const connection = await pool.getConnection()
  
  try {
    console.log('📊 Инициализация таблиц MySQL...')

    // Зоны тела
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS body_zones (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        order_num INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // Видео
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS videos (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        thumbnail_url VARCHAR(500),
        duration INT,
        tags JSON,
        body_zones JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // Пациенты
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        notes TEXT,
        access_token VARCHAR(64) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // Назначения
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS assignments (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_ids JSON,
        video_order JSON,
        is_active BOOLEAN DEFAULT 1,
        expires_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        INDEX idx_patient (patient_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // Просмотры видео
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS video_views (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36) NOT NULL,
        assignment_id VARCHAR(36) NOT NULL,
        video_id VARCHAR(36) NOT NULL,
        watched_at DATETIME NOT NULL,
        watch_duration INT,
        completed BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        INDEX idx_patient (patient_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // Шаблоны
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS templates (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        video_ids JSON,
        tags JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    console.log('✅ Таблицы созданы/обновлены')
  } catch (error) {
    console.error('❌ Ошибка инициализации таблиц:', error)
    throw error
  } finally {
    connection.release()
  }
}

// Проверить подключение к БД
async function checkConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('✅ Подключено к MySQL:', config.host)
    connection.release()
  } catch (error) {
    console.error('❌ Ошибка подключения к MySQL:', error.message)
    throw error
  }
}

// Инициализировать БД
export async function initializeDatabase() {
  try {
    await checkConnection()
    await initializeTables()
    console.log('✅ База данных инициализирована\n')
  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error)
    process.exit(1)
  }
}

export default pool
