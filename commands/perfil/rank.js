// ╭────────────────────────────────────────────
// │  COMANDO » rank » tu posición por nivel.
// ╰────────────────────────────────────────────
import { getAccount } from '../../lib/database.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getNumber } from '../../lib/utils.js'

const DB_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../database/db.json')

export default {
  name: 'rank',
  alias: ['rankingnivel', 'posicion'],
  category: 'perfil',
  description: 'Muestra tu posición en el sistema de niveles.',
  usage: 'rank',

  run: async ({ reply, sender }) => {
    let cuentas = {}
    try { cuentas = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')).accounts || {} } catch {}

    const ranking = Object.entries(cuentas)
      .map(([numero, c]) => ({ numero, exp: c.exp || 0, level: c.level || 1 }))
      .sort((a, b) => b.level - a.level || b.exp - a.exp)

    const miNumero = getNumber(sender)
    const posicion = ranking.findIndex(r => r.numero === miNumero)

    if (posicion === -1) return reply('» Aún no estás en el ranking. Gana exp jugando.')

    const cerca = ranking.slice(Math.max(0, posicion - 1), posicion + 2)

    await reply([
      '╭─「 TU RANK 」',
      `│ » Posición : *#${posicion + 1}* de ${ranking.length}`,
      `│ » Nivel    : ${ranking[posicion].level} ・ ${ranking[posicion].exp} exp`,
      '╰─────────────',
      ...cerca.map((r, i) => {
        const pos = ranking.findIndex(x => x.numero === r.numero) + 1
        return `${pos === posicion + 1 ? 'ᯓ' : ' '} ${pos}. @${r.numero} » N${r.level}`
      })
    ].join('\n'), { mentions: cerca.map(r => `${r.numero}@s.whatsapp.net`) })
  }
}
