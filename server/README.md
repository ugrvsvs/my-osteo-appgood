# 🚀 Backend для Osteo App (SQLite + Express)

## 📋 О проекте

Backend сервер для приложения "Мой Остео" с использованием:
- **Express.js** - веб-фреймворк
- **SQLite** - встроенная база данных
- **Node.js** - runtime

## 🚀 Быстрый старт (локально)

### 1. Установка

```bash
cd server
npm install
```

### 2. Конфигурация

```bash
cp .env.example .env
# Отредактировать .env если нужно
```

### 3. Запуск

```bash
# Режим разработки с автоперезагрузкой
npm run dev

# Или просто запуск
npm start
```

Сервер будет доступен на `http://localhost:3001`

## 📡 API Endpoints

### Видео
```
GET    /api/videos              - Получить все видео
GET    /api/videos/:id          - Получить видео по ID
POST   /api/videos              - Создать видео
PUT    /api/videos/:id          - Обновить видео
DELETE /api/videos/:id          - Удалить видео
```

### Пациенты
```
GET    /api/patients            - Получить всех пациентов
GET    /api/patients/:id        - Получить пациента по ID
GET    /api/patients/access/:token - Получить пациента по токену
POST   /api/patients            - Создать пациента
PUT    /api/patients/:id        - Обновить пациента
DELETE /api/patients/:id        - Удалить пациента
```

### Назначения
```
GET    /api/assignments         - Получить все назначения
GET    /api/assignments/patient/:patientId - Назначения пациента
POST   /api/assignments         - Создать назначение
PUT    /api/assignments/:id     - Обновить назначение
DELETE /api/assignments/:id     - Удалить назначение
```

### Шаблоны
```
GET    /api/templates           - Получить все шаблоны
POST   /api/templates           - Создать шаблон
PUT    /api/templates/:id       - Обновить шаблон
DELETE /api/templates/:id       - Удалить шаблон
```

### Health Check
```
GET    /api/health              - Проверка статуса сервера
```

## 🗄️ База данных

БД находится в `data/osteo.db` (автоматически создается)

### Таблицы
- `body_zones` - зоны тела
- `videos` - видео библиотека
- `patients` - пациенты
- `assignments` - назначения
- `video_views` - просмотры видео
- `templates` - шаблоны упражнений

## 🌐 Deployment на VPS

### 1. Установка на VPS

```bash
# На VPS, клонируй репо
cd /var/www/osteo/server
npm install --production
```

### 2. Переменные окружения

```bash
cp .env.example .env
# Отредактировать .env для production
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DATABASE_PATH=/var/www/osteo/data/osteo.db
CORS_ORIGIN=https://flura.top
EOF
```

### 3. Запуск с PM2

```bash
# Обновить ecosystem.config.js для запуска backend
pm2 start "npm run start" --name "osteo-backend" --cwd /var/www/osteo/server

# Или через отдельный файл конфига
pm2 start ecosystem-backend.config.js
```

### 4. Nginx конфигурация

```nginx
# Добавить в nginx конфиг для /osteo блок:

location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
}
```

### 5. Frontend конфигурация

В frontend обновить API base URL:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function fetchVideos() {
  const res = await fetch(`${API_URL}/videos`)
  return res.json()
}
```

## 📊 Примеры запросов

### Создать видео

```bash
curl -X POST http://localhost:3001/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Упражнения для шеи",
    "url": "https://youtube.com/watch?v=...",
    "description": "Эффективные упражнения",
    "tags": ["шея", "растяжка"],
    "bodyZones": ["zone1", "zone2"]
  }'
```

### Создать пациента

```bash
curl -X POST http://localhost:3001/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Иван Петров",
    "email": "ivan@example.com",
    "phone": "+7 (999) 123-45-67"
  }'
```

## 🔧 Переменные окружения

```env
NODE_ENV=development          # development или production
PORT=3001                     # Порт сервера
DATABASE_PATH=./data/osteo.db # Путь к БД (абсолютный или относительный)
CORS_ORIGIN=http://localhost:3000 # Origin для CORS
```

## 📝 Логирование

Все запросы логируются с timestamp и методом:
```
2025-12-18T19:45:30.123Z GET /api/videos
2025-12-18T19:45:31.456Z POST /api/patients
```

## ❌ Обработка ошибок

API возвращает JSON с статус кодом:

```json
// 400 Bad Request
{"error": "Title is required"}

// 404 Not Found
{"error": "Video not found"}

// 500 Server Error
{"error": "Internal Server Error"}
```

## 🚦 Health Check

```bash
curl http://localhost:3001/api/health
# {"status":"ok","timestamp":"2025-12-18T19:45:30.123Z"}
```

## 📚 Дополнительно

- SQLite поддерживает большое количество записей (~миллионы)
- Файл БД можно просматривать через: `sqlite3 data/osteo.db`
- БД автоматически создается при первом запуске
- Все JSON данные автоматически парсятся/сохраняются

## 🐛 Troubleshooting

**Ошибка: "Cannot find module 'sqlite3'"**
```bash
npm install
```

**БД не создается**
```bash
mkdir -p data
npm run start
```

**CORS ошибки**
- Проверить `CORS_ORIGIN` в .env
- Убедиться что frontend обращается к правильному адресу API

**Порт занят**
```bash
lsof -i :3001
kill -9 <PID>
# или измени PORT в .env
```
