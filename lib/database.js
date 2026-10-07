// ╭────────────────────────────────────────────
// │  ATLAS BOT · Mini base de datos en JSON
// │  Guarda:
// │   - usuarios detectados (contador del menú)
// │   - cuentas: monedas, recompensa diaria,
// │     colecciones de pokemon y personajes
// │  Sin dependencias: solo un archivo JSON.
// ╰────────────────────────────────────────────
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from '../config.js'
import { getNumber } from './utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_DIR = path.join(__dirname, '..', 'database')
const DB_FILE = path.join(DB_DIR, 'db.json')
const LEGACY_FILE = path.join(DB_DIR, 'users.json') // formato antiguo

let state = { users: [], accounts: {}, groups: {}, bot: { owners: [] } }
let saveTimer = null

// Carga la base de datos al iniciar el bot.
export const loadDatabase = () => {
  try {
    if (existsSync(DB_FILE)) {
      const data = JSON.parse(readFileSync(DB_FILE, 'utf-8'))
      state = { users: [], accounts: {}, groups: {}, bot: { owners: [] }, ...data }
    } else if (existsSync(LEGACY_FILE)) {
      // Migración desde el formato anterior (solo lista de usuarios)
      const legacy = JSON.parse(readFileSync(LEGACY_FILE, 'utf-8'))
      state.users = Array.isArray(legacy) ? legacy : []
    }
  } catch {
    state = { users: [], accounts: {}, groups: {}, bot: { owners: [] } }
  }
  if (!Array.isArray(state.bot?.owners)) state.bot = { owners: [] }
}

// Guarda cambios en disco (con espera para no escribir en cada mensaje).
const scheduleSave = () => {
  if (saveTimer) return
  saveTimer = setTimeout(() => {
    saveTimer = null
    try {
      mkdirSync(DB_DIR, { recursive: true })
      writeFileSync(DB_FILE, JSON.stringify(state, null, 2))
    } catch {
      // Si no se puede escribir, los datos siguen en memoria.
    }
  }, 5000)
}

// Programa el guardado en disco tras modificar cuentas o ajustes.
// (Tiene una pequeña espera interna para no escribir en cada mensaje.)
export const saveDatabase = () => scheduleSave()

// Registra a un usuario por su número (si no estaba ya).
export const registerUser = (jid) => {
  const number = getNumber(jid)
  if (!number || state.users.includes(number)) return
  state.users.push(number)
  scheduleSave()
}

// Total de usuarios registrados.
export const getUserCount = () => state.users.length

// Campos que toda cuenta debe tener (migración suave para cuentas viejas).
const ACCOUNT_DEFAULTS = () => ({
  coins: config.game?.startCoins ?? 500,
  lastDaily: 0,
  pokemon: [],
  characters: [],
  bank: 0,
  items: [],
  rep: 0,
  level: 1,
  exp: 0,
  bio: '',
  marriage: null,       // { partner: número, since: timestamp }
  lastWork: 0,
  lastCrime: 0,
  lastRob: 0
})

// Campos que todo grupo debe tener (antilink, bienvenida, moderación...).
const GROUP_DEFAULTS = () => ({
  antilink: false,
  welcome: false,
  muted: [],            // números silenciados
  banned: [],           // números vetados del grupo
  warns: {},            // número -> cantidad de advertencias
  rules: '',            // reglas del grupo (!setreglas / !reglas)
  customWelcome: '',    // bienvenida personalizada (!setwelcome)
  customBye: '',        // despedida personalizada (!setbye)
  groupPrefix: '',      // prefijo exclusivo del grupo (!setprefix)
  soloAdmins: [],       // comandos restringidos a admins (!soloadmins)
  antispam: false,
  antiflood: false,
  antibot: false,
  antinsfw: false,
  mutedChat: 0,         // 0 = no, -1 = indefinido, o timestamp fin
  antilink2: { on: false, mode: 'borrar' } // borrar | avisar | expulsar
})

// Devuelve la cuenta de un usuario (la crea si no existe).
// Los comandos pueden modificarla directamente y luego llamar saveDatabase().
export const getAccount = (jid) => {
  const number = getNumber(jid)
  if (!state.accounts[number]) {
    state.accounts[number] = ACCOUNT_DEFAULTS()
    scheduleSave()
  }
  // Rellena campos faltantes en cuentas creadas con versiones viejas
  const defaults = ACCOUNT_DEFAULTS()
  for (const key of Object.keys(defaults)) {
    if (state.accounts[number][key] === undefined) state.accounts[number][key] = defaults[key]
  }
  return state.accounts[number]
}

// Ajustes por grupo. Se crean solos y se migran con campos nuevos.
export const getGroupSettings = (jid) => {
  if (!state.groups[jid]) {
    state.groups[jid] = GROUP_DEFAULTS()
    scheduleSave()
  }
  const defaults = GROUP_DEFAULTS()
  for (const key of Object.keys(defaults)) {
    if (state.groups[jid][key] === undefined) state.groups[jid][key] = defaults[key]
  }
  return state.groups[jid]
}

// Restablece los ajustes de un grupo a los valores por defecto.
export const resetGroupSettings = (jid) => {
  state.groups[jid] = GROUP_DEFAULTS()
  scheduleSave()
}

// ── « Dueños extra (addowner/delowner) » ────
export const getExtraOwners = () => state.bot.owners

export const addExtraOwner = (number) => {
  number = String(number).replace(/\D/g, '')
  if (number && !state.bot.owners.includes(number)) {
    state.bot.owners.push(number)
    scheduleSave()
    return true
  }
  return false
}

export const removeExtraOwner = (number) => {
  number = String(number).replace(/\D/g, '')
  const i = state.bot.owners.indexOf(number)
  if (i === -1) return false
  state.bot.owners.splice(i, 1)
  scheduleSave()
  return true
}

// Top de usuarios por monedas (para el comando !top).
export const getTopAccounts = (limit = 10) =>
  Object.entries(state.accounts)
    .map(([number, account]) => ({ number, coins: account.coins || 0 }))
    .sort((a, b) => b.coins - a.coins)
    .slice(0, limit)
