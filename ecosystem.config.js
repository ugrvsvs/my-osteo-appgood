// PM2 Ecosystem Configuration для Osteo приложения
// Используется для запуска приложения на VPS

module.exports = {
  apps: [
    {
      name: "osteo-app",
      script: "node_modules/.bin/next",
      args: "start --port 3000",
      cwd: "/var/www/osteo",
      instances: 1, // Измени на "max" для автоматического количества ядер
      exec_mode: "cluster",
      
      // ==========================================
      // Переменные окружения
      // ==========================================
      env: {
        NODE_ENV: "production",
        NEXT_PUBLIC_BASE_PATH: "/osteo",
        NEXT_PUBLIC_ASSET_PREFIX: "/osteo",
        PORT: 3000,
      },
      
      // ==========================================
      // Логирование
      // ==========================================
      error_file: "/var/log/osteo-error.log",
      out_file: "/var/log/osteo-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      
      // ==========================================
      // Поведение при сбоях
      // ==========================================
      autorestart: true, // Автоматический перезапуск при крахе
      max_restarts: 10, // Максимум перезапусков
      min_uptime: "10s", // Минимальное время работы перед учетом как "рабочий"
      max_memory_restart: "500M", // Перезапуск если превышен лимит памяти
      
      // ==========================================
      // Отслеживание файлов
      // ==========================================
      watch: false, // Не перезагружать при изменении файлов (production)
      ignore_watch: [
        "node_modules",
        ".next",
        "public",
        "logs",
        ".git",
        ".env",
      ],
      
      // ==========================================
      // Graceful shutdown
      // ==========================================
      kill_timeout: 5000, // 5 сек для graceful shutdown
      listen_timeout: 3000,
    },
  ],
  
  // ==========================================
  // Развертывание (опционально для CI/CD)
  // ==========================================
  deploy: {
    production: {
      user: "ubuntu", // Измени на твоего пользователя на VPS
      host: "flura.top",
      ref: "origin/main",
      repo: "git@github.com:YOUR_REPO/osteo.git", // Измени на свой репо
      path: "/var/www/osteo",
      "post-deploy": "pnpm install --prod && pnpm build && pm2 reload ecosystem.config.js --env production",
    },
  },
}
