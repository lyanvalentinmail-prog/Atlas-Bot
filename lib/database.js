// ╭────────────────────────────────────────────
// │  ATLAS BOT · Mini base de datos en JSON
// │  Lleva el registro de usuarios que han usado
// │  el bot (para el contador del menú).
// │  Sin dependencias: solo un archivo JSON.
// ╰────────────────────────────────────────────
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getNumber } from './utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_DIR = path.join(__dirname, '..', 'database')
const DB_FILE = path.join(DB_DIR, 'users.json')

let users = new Set()
let saveTimer = null

// Carga la base de datos al iniciar el bot.
export const loadDatabase = () => {
  try {
    if (existsSync(DB_FILE)) {
      const data = JSON.parse(readFileSync(DB_FILE, 'utf-8'))
      users = new Set(Array.isArray(data) ? data : [])
    }
  } catch {
    users = new Set()
  }
}

// Guarda cambios en disco (con espera para no escribir en cada mensaje).
const scheduleSave = () => {
  if (saveTimer) return
  saveTimer = setTimeout(() => {
    saveTimer = null
    try {
      mkdirSync(DB_DIR, { recursive: true })
      writeFileSync(DB_FILE, JSON.stringify([...users], null, 2))
    } catch {
      // Si no se puede escribir, el conteo sigue en memoria.
    }
  }, 5000)
}

// Registra a un usuario por su número (si no estaba ya).
export const registerUser = (jid) => {
  const number = getNumber(jid)
  if (!number || users.has(number)) return
  users.add(number)
  scheduleSave()
}

// Total de usuarios registrados.
export const getUserCount = () => users.size
