module.exports = {
  apps: [
    {
      name: 'studycz-client',
      script: 'npm',
      args: 'start',
      cwd: '/opt/studycz-client',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        // порт выбран из свободных 13xx на сервере (1341 занят studycz-strapi);
        // `next start` читает PORT из окружения
        PORT: 1342,
      },
      error_file: '/var/log/pm2/studycz-client-error.log',
      out_file: '/var/log/pm2/studycz-client-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
  ],
};
