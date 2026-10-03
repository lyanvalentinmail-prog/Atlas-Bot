// ╭────────────────────────────────────────────
// │  COMANDO » rank » tu posición por nivel.
// ╰────────────────────────────────────────────
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getNumber } from '../../lib/utils.js'
import { box, kv, hint, bar, num, rankRows } from '../../lib/ui.js'

const DB_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../database/db.json')

export default {
  name: 'rank',
  alias: ['rankingnivel', 'posicion'],
  category: 'perfil',
  description: 'Muestra tu posición en el sistema de niveles.',
  usage: 'rank',

  run: async ({ reply, sender, prefix }) => {
    let cuentas = {}
    try { cuentas = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')).accounts || {} } catch {}

    const ranking = Object.entries(cuentas)
      .map(([numero, c]) => ({ numero, exp: c.exp || 0, level: c.level || 1 }))
      .sort((a, b) => b.level - a.level || b.exp - a.exp)

    const miNumero = getNumber(sender)
    const posicion = ranking.findIndex(r => r.numero === miNumero)

    if (posicion === -1) return reply(`» Aún no estás en el ranking. Gana exp con ${prefix}work y minijuegos.`)

    const yo = ranking[posicion]
    const expPara = yo.level * 100
    const vecinos = ranking.slice(Math.max(0, posicion - 1), posicion + 2)

    await reply(box('TU POSICIÓN', [
      kv('Posición', `*#${posicion + 1}* de ${ranking.length}`),
      kv('Nivel', `${yo.level} ・ ${num(yo.exp)} exp`),
      `│ ${bar(yo.exp, expPara, 14)}`,
      '│─────────────',
      ...rankRows(vecinos, (r) => {
        const pos = ranking.findIndex(x => x.numero === r.numero) + 1
        const marca = pos - 1 === posicion ? ' « tú' : ''
        return `#${pos} @${r.numero} › N${r.level}${marca}`
      })
    ], hint(`Sube posiciones ganando exp con juegos y ${prefix}work.`)),
      { mentions: vecinos.map(r => `${r.numero}@s.whatsapp.net`) })
  }
}
