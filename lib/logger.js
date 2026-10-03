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

export const logger = {
  info: (...args) => console.log(tag('ATLAS', colors.cyan), timestamp(), ...args),
  success: (...args) => console.log(tag(' OK ', colors.green), timestamp(), ...args),
  warn: (...args) => console.warn(tag('AVISO', colors.yellow), timestamp(), ...args),
  error: (...args) => console.error(tag('ERROR', colors.red), timestamp(), ...args),
  command: (...args) => console.log(tag(' CMD ', colors.magenta), timestamp(), ...args)
}

export { colors }
