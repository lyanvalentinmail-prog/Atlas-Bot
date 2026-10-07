// ╭────────────────────────────────────────────
// │  COMANDO » backup » copia de la base de datos.
// ╰────────────────────────────────────────────
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const DB_FILE = path.join(ROOT, '../../database/db.json')

export default {
  name: 'backup',
  alias: ['copia', 'respaldo'],
  category: 'propietario',
  description: 'Crea una copia de seguridad de los datos.',
  usage: 'backup',
  ownerOnly: true,

  run: async ({ sock, chatId, reply }) => {
    if (!fs.existsSync(DB_FILE)) return reply('» Aún no existe la base de datos.')

    try {
      const buffer = fs.readFileSync(DB_FILE)
      await sock.sendMessage(chatId, {
        document: buffer,
        mimetype: 'application/json',
        fileName: `atlas-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`,
        caption: '> ✉ Copia de seguridad de database/db.json'
      })
    } catch {
      await reply('» No pude enviar la copia.')
    }
  }
}
