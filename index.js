// ╭────────────────────────────────────────────
// │  ATLAS BOT · Punto de entrada
// │  Ejecuta:  npm start
// ╰────────────────────────────────────────────
import process from 'node:process'
import { config } from './config.js'
import { loadCommands, summarizeCommands } from './lib/loader.js'
import { loadDatabase, flushDatabase } from './lib/database.js'
import { loadStoredSettings } from './lib/settings.js'
import { startConnection } from './lib/connection.js'
import { startServer, setServerBotStats } from './lib/server.js'
import { logger, colors } from './lib/logger.js'

// ── « Banner de inicio » ────────────────────
const showBanner = () => {
  const width = 43
  const center = (text) => {
    const space = Math.max(width - text.length, 0)
    const left = Math.floor(space / 2)
    return '┃' + ' '.repeat(left) + text + ' '.repeat(space - left) + '┃'
  }
  console.log(colors.cyan + colors.bold)
  console.log('┏' + '━'.repeat(width) + '┓')
  console.log(center(config.botName.toUpperCase()))
  console.log(center(`v${config.botVersion} » Node.js + Baileys`))
  console.log('┗' + '━'.repeat(width) + '┛')
  console.log(colors.reset)
}

// ── « Método de conexión por argumentos » ───
// npm start -- --qr   |   npm start -- --pairing
// (o los atajos: npm run start:qr / start:pairing)
const getCliMethod = () => {
  const args = process.argv.slice(2)
  if (args.includes('--pairing')) return 'pairing'
  if (args.includes('--qr')) return 'qr'
  return null
}

const main = async () => {
  showBanner()

  // Inicia el servidor HTTP y panel web de inmediato (requerido por Render en $PORT)
  startServer()

  // El método se decide así: argumento CLI > .env > pregunta al iniciar (o QR + panel web en Render).
  let method = getCliMethod()
  if (!method && ['qr', 'pairing'].includes(config.connectionMethod)) {
    method = config.connectionMethod
  }

  // Base de datos + ajustes guardados desde el panel web
  // (prefijo, nombre del bot, banner y dueño).
  loadDatabase()
  loadStoredSettings()

  logger.info(`Dueño   : ${config.ownerName} » ${config.ownerNumbers.join(', ') || 'sin definir'}`)
  logger.info(`Prefijo : [ ${[...config.prefix].join(' ')} ]`)
  logger.info(
    'Método  : ' +
    (method === 'pairing' ? 'Código de vinculación'
      : method === 'qr' ? 'Código QR'
      : 'automático / panel web')
  )

  const { commands, categories, total } = await loadCommands()
  setServerBotStats({
    totalCommands: total,
    totalCategories: categories.size,
    // Lista completa de comandos para la pestaña "Comandos" del panel.
    commandsInfo: summarizeCommands(commands, categories)
  })

  if (total === 0) {
    logger.warn('No se cargó ningún comando. Revisa la carpeta "commands".')
  } else {
    logger.success(`${total} comandos cargados en ${categories.size} categorías.`)
  }

  await startConnection({ commands, categories, sock: null, method })
}

// ── « Manejo de errores globales » ──────────
// Evita que errores inesperados detengan el bot;
// se registran en consola para poder revisarlos.
process.on('uncaughtException', (error) => {
  logger.error('Error no controlado (uncaughtException):', error)
})

// Al apagar (Render envía SIGTERM), guarda los datos pendientes en disco.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    flushDatabase()
    logger.info(`Señal ${signal} recibida. Base de datos guardada. Cerrando...`)
    process.exit(0)
  })
}
process.on('unhandledRejection', (reason) => {
  logger.error('Promesa rechazada sin manejar (unhandledRejection):', reason)
})

main().catch((error) => {
  logger.error('No se pudo iniciar el bot:', error)
  if (!process.env.RENDER && process.stdin.isTTY) {
    process.exit(1)
  }
})
