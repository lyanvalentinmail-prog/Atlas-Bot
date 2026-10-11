// ╭────────────────────────────────────────────
// │  ATLAS BOT · Logger de consola
// │  Mensajes de consola con color y hora,
// │  sin dependencias externas.
// ╰────────────────────────────────────────────

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

const tag = (label, color) => `${colors.bold}${color}[${label}]${colors.reset}`

const timestamp = () => {
  const time = new Date().toLocaleTimeString('es-MX', { hour12: false })
  return `${colors.gray}${time}${colors.reset}`
}

// ── « Historial en memoria para !logs » ─────
// Guarda las últimas líneas de consola (sin colores).
const history = []
const HISTORY_LIMIT = 300

const remember = (label, args) => {
  const line = args
    .map(arg => (typeof arg === 'string' ? arg : arg instanceof Error ? arg.message : JSON.stringify(arg)))
    .join(' ')
  history.push(`[${new Date().toLocaleTimeString('es-MX', { hour12: false })}] [${label}] ${line}`)
  if (history.length > HISTORY_LIMIT) history.splice(0, history.length - HISTORY_LIMIT)
}

export const getLogs = (count = 15) => history.slice(-count)

export const logger = {
  info: (...args) => { remember('ATLAS', args); console.log(tag('ATLAS', colors.cyan), timestamp(), ...args) },
  success: (...args) => { remember(' OK ', args); console.log(tag(' OK ', colors.green), timestamp(), ...args) },
  warn: (...args) => { remember('AVISO', args); console.warn(tag('AVISO', colors.yellow), timestamp(), ...args) },
  error: (...args) => { remember('ERROR', args); console.error(tag('ERROR', colors.red), timestamp(), ...args) },
  command: (...args) => { remember(' CMD ', args); console.log(tag(' CMD ', colors.magenta), timestamp(), ...args) }
}

export { colors }
