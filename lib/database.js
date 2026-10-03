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

let state = { users: [], accounts: {} }
let saveTimer = null

// Carga la base de datos al iniciar el bot.
export const loadDatabase = () => {
  try {
    if (existsSync(DB_FILE)) {
      const data = JSON.parse(readFileSync(DB_FILE, 'utf-8'))
      state = { users: [], accounts: {}, ...data }
    } else if (existsSync(LEGACY_FILE)) {
      // Migración desde el formato anterior (solo lista de usuarios)
      const legacy = JSON.parse(readFileSync(LEGACY_FILE, 'utf-8'))
      state.users = Array.isArray(legacy) ? legacy : []
    }
  } catch {
    state = { users: [], accounts: {} }
  }
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

// Registra a un usuario por su número (si no estaba ya).
export const registerUser = (jid) => {
  const number = getNumber(jid)
  if (!number || state.users.includes(number)) return
  state.users.push(number)
  scheduleSave()
}

// Total de usuarios registrados.
export const getUserCount = () => state.users.length

// Devuelve la cuenta de un usuario (la crea si no existe).
// Los comandos pueden modificarla directamente; se guarda solo.
export const getAccount = (jid) => {
  const number = getNumber(jid)
  if (!state.accounts[number]) {
    state.accounts[number] = {
      coins: config.game?.startCoins ?? 500,
      lastDaily: 0,
      pokemon: [],
      characters: []
    }
    scheduleSave()
  }
  return state.accounts[number]
}
