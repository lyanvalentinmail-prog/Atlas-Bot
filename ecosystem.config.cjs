// ╭────────────────────────────────────────────
// │  ATLAS BOT · Configuración de PM2
// │  Uso:  pm2 start ecosystem.config.cjs
// │  Nota: se usa extensión .cjs porque el proyecto
// │        es ESM ("type": "module") y PM2 espera
// │        CommonJS en sus archivos de configuración.
// ╰────────────────────────────────────────────
module.exports = {
  apps: [
    {
      name: 'atlas-bot',          // Nombre del proceso en PM2
      script: 'index.js',         // Archivo de entrada
      cwd: __dirname,             // Carpeta del proyecto
      instances: 1,               // Una sola instancia (WhatsApp no permite más)
      exec_mode: 'fork',          // Modo fork (no cluster)
      autorestart: true,          // Reiniciar si el proceso cae
      max_restarts: 10,           // Máximo de reinicios seguidos
      restart_delay: 3000,        // Espera 3 s entre reinicios
      max_memory_restart: '400M', // Reinicia si supera 400 MB de RAM
      time: true,                 // Fecha/hora en los logs de PM2

      // NOTA: no activar "watch" en producción: la carpeta de sesión
      // cambia constantemente y provocaría reinicios en bucle.
      watch: false,
      ignore_watch: ['node_modules', 'session', 'logs'],

      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
