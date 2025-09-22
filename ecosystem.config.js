module.exports = {
  apps: [
    {
      name: 'packme-backend',
      script: 'server.js',
      cwd: '/home/box',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'packme-frontend',
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 5173',
      cwd: '/home/box',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '5173'
      },
      error_file: './logs/frontend-err.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};