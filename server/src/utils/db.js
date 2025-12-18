import pool from '../database/init.js'

/**
 * Выполнить SQL запрос с параметрами
 */
export async function dbRun(sql, params = []) {
  const connection = await pool.getConnection()
  try {
    const [result] = await connection.execute(sql, params)
    return result
  } finally {
    connection.release()
  }
}

/**
 * Получить одну строку
 */
export async function dbGet(sql, params = []) {
  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.execute(sql, params)
    return rows[0] || null
  } finally {
    connection.release()
  }
}

/**
 * Получить все строки
 */
export async function dbAll(sql, params = []) {
  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.execute(sql, params)
    return rows || []
  } finally {
    connection.release()
  }
}
