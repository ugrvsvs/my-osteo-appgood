# 🚀 Инструкция деплоя на VPS (Frontend + Backend с MySQL)

## 🏗️ Архитектура

```
┌─────────────────┐
│   Клиент        │
│  (браузер)      │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────────────┐
│   VPS (91.132.57.37)                │
│                                     │
│  ┌──────────────────────┐           │
│  │  Nginx (порт 80/443)│           │
│  │  - Reverse Proxy    │           │
│  └──────────┬───────────┘           │
│             │                       │
│  ┌──────────▼──────────┐            │
│  │ Next.js (порт 3000)│            │
│  │ Frontend App       │            │
│  └──────────┬──────────┘            │
│             │                       │
│  ┌──────────▼──────────┐            │
│  │ Node.js (порт 3001)│            │
│  │ Backend API        │            │
│  └──────────┬──────────┘            │
│             │                       │
│  ┌──────────▼──────────┐            │
│  │  MySQL (порт 3306) │            │
│  │  База данных       │            │
│  └────────────────────┘            │
└─────────────────────────────────────┘
```

---

## 📋 Требования на VPS

- Node.js 16+ или 18+
- MySQL 5.7+ или MariaDB
- Nginx
- PM2 (для управления процессами)
- Git

---

## 🔧 Конфигурация Nginx

```nginx
upstream frontend {
    server localhost:3000;
}

upstream backend {
    server localhost:3001;
}

server {
    listen 80;
    server_name 91.132.57.37;  # или ваш домен
    
    # Перенаправить HTTP на HTTPS (если есть SSL)
    # return 301 https://$server_name$request_uri;
}

server {
    listen 80;  # или 443 с SSL
    server_name 91.132.57.37;
    
    # === FRONTEND (Next.js) ===
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # === BACKEND API ===
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Увеличить размер буфера для больших файлов
        client_max_body_size 50M;
        proxy_request_buffering off;
    }
    
    # === STATIC FILES ===
    location /_next/static {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 📦 Этапы деплоя на VPS

### 1️⃣ Подготовка на VPS

```bash
# Подключитесь по SSH на VPS
ssh root@91.132.57.37

# Создайте директорию проекта
mkdir -p /var/www/osteo
cd /var/www/osteo

# Клонируйте репозиторий
git clone https://github.com/ugrvsvs/my-osteo-appgood.git .
```

### 2️⃣ Установка зависимостей

```bash
# Перейти в директорию проекта
cd /var/www/osteo

# Установить pnpm (если нет)
npm install -g pnpm

# Установить зависимости frontend
pnpm install

# Установить зависимости backend
cd server
pnpm install
cd ..
```

### 3️⃣ Настройка переменных окружения

#### Для Frontend (.env.local)

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_BASE_PATH=
NEXT_PUBLIC_ASSET_PREFIX=
EOF
```

#### Для Backend (server/.env)

```bash
cat > server/.env << 'EOF'
# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=osteo_user
DB_PASSWORD=your_secure_password
DB_NAME=osteo

# Server
PORT=3001
NODE_ENV=production
EOF
```

### 4️⃣ Сборка Frontend

```bash
cd /var/www/osteo

# Собрать Next.js приложение
pnpm build

# Проверить что сборка успешна
ls -la .next
```

### 5️⃣ Настройка PM2 для управления процессами

```bash
# Установить PM2 глобально (если нет)
npm install -g pm2

# Создать конфиг для PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "osteo-frontend",
      script: "pnpm",
      args: "start",
      cwd: "/var/www/osteo",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/osteo-frontend-error.log",
      out_file: "/var/log/osteo-frontend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_memory_restart: "1G",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
    },
    {
      name: "osteo-backend",
      script: "npm",
      args: "start",
      cwd: "/var/www/osteo/server",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "/var/log/osteo-backend-error.log",
      out_file: "/var/log/osteo-backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_memory_restart: "500M",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
}
EOF

# Запустить приложения через PM2
pm2 start ecosystem.config.js

# Сохранить конфигурацию для автозагрузки
pm2 save
pm2 startup

# Проверить статус
pm2 status
pm2 logs
```

### 6️⃣ Проверка доступности

```bash
# На VPS, проверить что приложения слушат
netstat -tlnp | grep -E '3000|3001'

# Проверить через curl
curl -I http://localhost:3000
curl -I http://localhost:3001/api/videos

# На клиентском хосте (в браузере)
# http://91.132.57.37
# http://91.132.57.37/dashboard
# http://91.132.57.37/share/[PATIENT_TOKEN]
```

---

## 🔄 Обновление приложения

Когда нужно обновить код (новые фичи, баги фиксы):

```bash
cd /var/www/osteo

# 1. Получить последние изменения с GitHub
git pull origin main

# 2. Установить новые зависимости (если добавлены)
pnpm install

# 3. Пересобрать frontend (если изменились файлы frontend)
pnpm build

# 4. Перезагрузить приложения через PM2
pm2 restart all

# 5. Проверить статус
pm2 status
pm2 logs
```

---

## 🐛 Troubleshooting

### ❌ Backend не может подключиться к MySQL

**Симптомы:**
```
❌ Ошибка подключения к MySQL
connection ECONNREFUSED
```

**Решение:**
```bash
# 1. Проверить что MySQL запущена
service mysql status
# или
systemctl status mysql

# 2. Проверить credentials в server/.env
cat server/.env

# 3. Проверить что БД существует
mysql -u osteo_user -p -e "SHOW DATABASES;"

# 4. Перезагрузить backend
pm2 restart osteo-backend
```

### ❌ Frontend не может подключиться к Backend API

**Симптомы:**
```
Failed to fetch videos
Failed to fetch templates
CORS error
```

**Решение:**

Убедитесь что переменная окружения правильная:
```bash
# Проверить текущее значение
curl http://localhost:3001/api/videos

# Если API доступен локально, но фронтенд не видит, проверить .env.local
cat .env.local

# Должно быть:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### ❌ Ошибка 404 при открытии `/share/[TOKEN]`

**Симптомы:**
```
"Ссылка не найдена или истекла"
```

**Решение:**
1. Проверить что пациент существует в БД
2. Проверить что токен правильный (без пробелов)
3. Проверить логи backend: `pm2 logs osteo-backend`

### ❌ Изображения не загружаются (500 ошибка)

**Решение:**
```bash
# 1. Проверить что директория uploads существует
ls -la /var/www/osteo/uploads

# 2. Проверить права доступа
chmod -R 755 /var/www/osteo/uploads

# 3. Перезагрузить backend
pm2 restart osteo-backend
```

---

## 📊 Мониторинг

```bash
# Просмотреть логи всех приложений
pm2 logs

# Просмотреть логи конкретного приложения
pm2 logs osteo-frontend
pm2 logs osteo-backend

# Просмотреть последние N строк
pm2 logs --lines 50

# Монитор в реальном времени
pm2 monit
```

---

## 🔐 Безопасность

1. **Используйте SSL сертификаты** (Let's Encrypt)
2. **Установите firewall правила** - открыть только нужные порты
3. **Регулярно обновляйте** пакеты и зависимости
4. **Используйте strong пароли** для MySQL
5. **Ограничьте размер загружаемых файлов** в Nginx (уже установлено 50MB)

---

## 📝 Файлы конфигурации

### Структура проекта на VPS

```
/var/www/osteo/
├── .env.local              # Frontend env (NEXT_PUBLIC_API_URL)
├── .git/                   # Git репозиторий
├── .next/                  # Собранное Next.js приложение
├── app/                    # Next.js pages
├── components/             # React компоненты
├── lib/                    # Утилиты и API клиент
├── public/                 # Статические файлы
├── ecosystem.config.js     # PM2 конфиг
├── next.config.mjs         # Next.js конфиг
├── package.json            # Dependencies
├── server/
│   ├── .env                # Backend env (DB_HOST, DB_USER и т.д.)
│   ├── src/
│   │   ├── index.js        # Express сервер
│   │   ├── routes/         # API роуты
│   │   ├── database/       # Инициализация БД
│   │   └── utils/          # Утилиты
│   └── package.json
└── uploads/                # Загруженные изображения
```

---

## ✅ Чек-лист деплоя

- [ ] Клонирован репозиторий на VPS
- [ ] Установлены зависимости (frontend и backend)
- [ ] Созданы `.env` файлы с correct credentials
- [ ] MySQL база инициализирована и доступна
- [ ] Frontend успешно собран (`pnpm build`)
- [ ] PM2 конфиг создан и приложения запущены
- [ ] Nginx настроен и перезагружен
- [ ] Доступны обе приложения (порты 3000 и 3001)
- [ ] API тестирован: `curl http://localhost:3001/api/videos`
- [ ] Фронтенд доступен: http://91.132.57.37
- [ ] Логи проверены: `pm2 logs`
- [ ] Настроена автозагрузка: `pm2 startup`

**Решение:**
```bash
# 1. Проверить что PM2 приложение запущено
pm2 status

# 2. Перезагрузить приложение
pm2 restart osteo-app

# 3. Проверить логи
pm2 logs osteo-app

# 4. Убедиться что basePath установлены
cat ecosystem.config.js | grep NEXT_PUBLIC
```

### ❌ CORS или редирект ошибки

**Решение:**
```bash
# Убедиться что Nginx правильно настроен
nginx -t

# Перезагрузить Nginx
systemctl reload nginx

# Проверить логи Nginx
tail -f /var/log/nginx/error.log
```

### ❌ Медленная загрузка страниц

**Решение:**
```bash
# Увеличить лимит памяти PM2
pm2 restart osteo-app --max-memory-restart 800M

# Проверить CPU и память
pm2 monit
```

---

## ✅ Чеклист деплоя

- [ ] Локально тестировано: `pnpm build && pnpm start`
- [ ] Файлы загружены на VPS
- [ ] Переменные окружения установлены
- [ ] `pnpm build` выполнена успешно
- [ ] PM2 запущен с `ecosystem.config.js`
- [ ] Nginx перезагружен и конфигурация валидна
- [ ] Тестировано: https://flura.top/osteo
- [ ] Тестировано: https://flura.top/osteo/dashboard
- [ ] Тестировано: https://flura.top/osteo/share/VALID_TOKEN
- [ ] PM2 настроен на автозагрузку (`pm2 startup && pm2 save`)
- [ ] Логирование настроено

---

## 📚 Дополнительные ресурсы

- [Next.js basePath документация](https://nextjs.org/docs/app/api-reference/next-config-js/basePath)
- [PM2 экосистем-файл](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/)
- [Nginx proxy_pass документация](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)
