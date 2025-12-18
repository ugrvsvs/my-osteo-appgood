import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
  host: '91.132.57.37',
  port: 3306,
  user: 'osteo',
  password: 'osteo123',
  database: 'osteo'
})

console.log('✅ Подключение успешно!')
const [rows] = await connection.execute('SELECT VERSION()')
console.log('Версия MySQL:', rows)

await connection.end()
