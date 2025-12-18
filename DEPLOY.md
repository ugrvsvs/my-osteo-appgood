# 🚀 Инструкция деплоя на VPS (Nginx + PM2)

## 📋 Проблема (решена)

**Старая архитектура:**
- Путь: `/p/[token]` ❌ конфликтует с реверс-прокси Nginx
- Результат: 404 ошибки для публичных ссылок

**Новая архитектура:**
- Путь: `/share/[token]` ✅ более стабильный и предсказуемый
- Обратная совместимость: старые ссылки `/p/[token]` перенаправляют на новый путь

---

## 🔧 Конфигурация Nginx (simplified)

```nginx
server {
    listen 80;
    server_name flura.top;
    
    # Редирект HTTP на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name flura.top;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Основной прокси на PM2 приложение
    location /osteo {
        proxy_pass http://localhost:3000/osteo;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Важно: не требуется специальный rewrite для /share/[token]
        # Next.js теперь правильно обрабатывает этот маршрут
    }
}
```

**Ключевые моменты:**
- ✅ **Нет сложных rewrites** для `/share/[token]`
- ✅ **Простой proxy_pass** работает для всех маршрутов
- ✅ **basePath: '/osteo'** в Next.js автоматически обрабатывает пути

---

## 📦 Этапы деплоя на VPS

### 1️⃣ Подготовка на локальной машине

```bash
# Проверить, что все работает локально
pnpm install
pnpm build
pnpm start

# Проверить доступность:
# - http://localhost:3000/osteo
# - http://localhost:3000/osteo/dashboard/templates
# - http://localhost:3000/osteo/share/TOKEN (где TOKEN - real token)
```

### 2️⃣ Загрузка на VPS

```bash
# На VPS, в директории проекта /var/www/osteo

# Скопировать файлы (из вашего локального хоста)
scp -r ~/osteo/* user@flura.top:/var/www/osteo/

# Или использовать Git
cd /var/www/osteo
git pull origin main
```

### 3️⃣ Установка и сборка на VPS

```bash
cd /var/www/osteo

# Установить pnpm глобально (если нет)
npm install -g pnpm

# Установить зависимости
pnpm install --prod

# ВАЖНО: установить переменные окружения для basePath
export NEXT_PUBLIC_BASE_PATH=/osteo
export NEXT_PUBLIC_ASSET_PREFIX=/osteo

# Сборка оптимизированная для продакшена
pnpm build

# Проверить, что сборка успешна
ls -la .next
```

### 4️⃣ Настройка PM2

```bash
# Создать файл конфигурации PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "osteo-app",
      script: "node_modules/.bin/next",
      args: "start --port 3000",
      cwd: "/var/www/osteo",
      env: {
        NODE_ENV: "production",
        NEXT_PUBLIC_BASE_PATH: "/osteo",
        NEXT_PUBLIC_ASSET_PREFIX: "/osteo",
        PORT: 3000,
      },
      error_file: "/var/log/osteo-error.log",
      out_file: "/var/log/osteo-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      watch: false,
      ignore_watch: ["node_modules", ".next", "public"],
      max_memory_restart: "500M",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
}
EOF

# Запустить приложение через PM2
pm2 start ecosystem.config.js

# Сохранить конфигурацию PM2 для автозагрузки при рестарте сервера
pm2 save
pm2 startup

# Проверить статус
pm2 status
pm2 logs osteo-app
```

### 5️⃣ Проверка доступности

```bash
# На VPS, проверить что приложение слушит
netstat -tlnp | grep 3000

# Проверить через curl локально на VPS
curl -I http://localhost:3000/osteo
curl -I http://localhost:3000/osteo/dashboard

# На клиентском хосте, проверить через браузер
# https://flura.top/osteo
# https://flura.top/osteo/dashboard/templates
# https://flura.top/osteo/share/VALID_TOKEN
```

---

## 🔍 Что изменилось в коде

### 1. Новый маршрут `/share/[token]`
- **Файл:** `/app/share/[token]/page.tsx`
- **Преимущества:** 
  - Более простой путь для маршрутизации
  - Не конфликтует с потенциальными проблемами Nginx
  - Явно указывает на публичный портал пациента

### 2. Редирект старого маршрута `/p/[token]`
- **Файл:** `/app/p/[token]/page.tsx`
- **Функция:** автоматически перенаправляет на `/share/[token]`
- **Зачем:** обратная совместимость для существующих ссылок

### 3. Обновлена генерация ссылок
- **Файл:** `/components/patient-card.tsx`
- **Что:** все новые ссылки генерируются с путем `/share/[token]`

### 4. Оптимизирована конфигурация Next.js
- **Файл:** `/next.config.mjs`
- **Добавлено:** поддержка динамического `basePath` через env переменные
- **Результат:** лучшая совместимость с VPS деплойментом

---

## 🐛 Troubleshooting

### ❌ Ошибка 404 при открытии /osteo/share/TOKEN

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
