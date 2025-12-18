# 🖼️ Исправление картинок на VPS (18 декабря 2025)

## ✅ Что было исправлено

**Проблема:** Картинки не подгружаются на сервере с `basePath: /osteo`

**Решение:** Все пути к placeholder картинкам теперь используют `NEXT_PUBLIC_BASE_PATH`

## 📝 Файлы которые были изменены

- ✅ `components/video-card.tsx` - 3 места
- ✅ `components/video-dialog.tsx` - 1 место
- ✅ `components/template-card.tsx` - 1 место
- ✅ `components/assignment-card.tsx` - 1 место
- ✅ `components/assignment-dialog.tsx` - 2 места
- ✅ `components/template-dialog.tsx` - 1 место
- ✅ `app/share/[token]/page.tsx` - 1 место
- ✅ `hooks/use-asset-path.ts` - новый хук (для будущего использования)

## 🚀 Как обновить на VPS

### 1️⃣ Подтягивают обновления с GitHub

```bash
cd /var/www/osteo
git pull origin main
```

### 2️⃣ Пересобираем приложение

```bash
export NEXT_PUBLIC_BASE_PATH=/osteo
export NEXT_PUBLIC_ASSET_PREFIX=/osteo
pnpm install --prod
pnpm build
```

### 3️⃣ Перезагружаем PM2

```bash
pm2 restart osteo-app
# или
pm2 restart ecosystem.config.js
```

### 4️⃣ Проверяем логи

```bash
pm2 logs osteo-app
```

### 5️⃣ Проверяем в браузере

```
https://flura.top/osteo
https://flura.top/osteo/dashboard/videos
https://flura.top/osteo/dashboard/templates
https://flura.top/osteo/share/TOKEN  # с любым валидным токеном
```

---

## 🔍 Как работает исправление

### Было (не работает на сервере):
```tsx
src="/placeholder.svg"  // Ищет /osteo/placeholder.svg вместо /osteo/osteo/placeholder.svg ❌
```

### Стало (работает везде):
```tsx
src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/placeholder.svg`}
// На локальной машине: /placeholder.svg ✅
// На сервере: /osteo/placeholder.svg ✅
```

---

## 💡 Ключевые моменты

1. **Переменная окружения:** `NEXT_PUBLIC_BASE_PATH` должна быть установлена на сервере
2. **Сборка:** Убедиться что переменная установлена ДО запуска `pnpm build`
3. **Кэш:** Если картинки все ещё не загружаются, очистить кэш браузера (Ctrl+Shift+Delete)
4. **PM2:** После обновления обязательно перезагрузить приложение

---

## ❓ Если все ещё не работает

### Проверка 1: Переменные окружения
```bash
cat /var/www/osteo/ecosystem.config.js | grep NEXT_PUBLIC_BASE_PATH
# Должно быть: NEXT_PUBLIC_BASE_PATH: "/osteo"
```

### Проверка 2: Файлы в public
```bash
ls -la /var/www/osteo/public/ | grep placeholder
# Должны быть файлы: placeholder.svg, placeholder.jpg, и т.д.
```

### Проверка 3: Next.js файлы
```bash
ls -la /var/www/osteo/.next/static/
# Файлы должны быть скомпилированы
```

### Проверка 4: Логи PM2
```bash
pm2 logs osteo-app --lines 100
# Ищем ошибки при загрузке
```

### Проверка 5: DevTools браузера
1. Открыть https://flura.top/osteo
2. F12 -> Network вкладка
3. Обновить страницу (F5)
4. Ищи запросы на /placeholder.svg и смотри статус (200 или 404)
5. Если 404, значит путь неправильный

---

## 📞 Если нужна помощь

Отправь логи:
```bash
pm2 logs osteo-app --lines 50 > /tmp/pm2-logs.txt
curl http://localhost:3000/osteo/placeholder.svg -I > /tmp/curl-test.txt
cat /var/www/osteo/.env.production >> /tmp/env-check.txt
```

И прикрепи эти файлы для диагностики.
