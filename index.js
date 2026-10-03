// ╭────────────────────────────────────────────
// │  ATLAS BOT · Punto de entrada
// │  Ejecuta:  npm start
// ╰────────────────────────────────────────────
import process from 'node:process'
import { config } from './config.js'
import { loadCommands } from './lib/loader.js'
import { startConnection } from './lib/connection.js'
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

// ── « Inicio » ──────────────────────────────
const main = async () => {
  showBanner()

  if (!['qr', 'pairing'].includes(config.connectionMethod)) {
    logger.warn(`Método de conexión desconocido: "${config.connectionMethod}". Se usará "qr".`)
    config.connectionMethod = 'qr'
  }

  logger.info(`Dueño   : ${config.ownerName} » ${config.ownerNumbers.join(', ') || 'sin definir'}`)
  logger.info(`Prefijo : [ ${[...config.prefix].join(' ')} ]`)
  logger.info(`Método  : ${config.connectionMethod === 'pairing' ? 'Código de vinculación' : 'Código QR'}`)

  const { commands, categories, total } = await loadCommands()
  if (total === 0) {
    logger.warn('No se cargó ningún comando. Revisa la carpeta "commands".')
  } else {
    logger.success(`${total} comandos cargados en ${categories.size} categorías.`)
  }

  await startConnection({ commands, categories, sock: null })
}

// ── « Manejo de errores globales » ──────────
// Evita que errores inesperados detengan el bot;
// se registran en consola para poder revisarlos.
process.on('uncaughtException', (error) => {
  logger.error('Error no controlado (uncaughtException):', error)
})
process.on('unhandledRejection', (reason) => {
  logger.error('Promesa rechazada sin manejar (unhandledRejection):', reason)
})

main().catch((error) => {
  logger.error('No se pudo iniciar el bot:', error)
  process.exit(1)
})
