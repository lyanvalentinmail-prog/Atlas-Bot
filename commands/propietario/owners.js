// ╭────────────────────────────────────────────
// │  COMANDO » owners » lista los dueños.
// ╰────────────────────────────────────────────
import { getExtraOwners } from '../../lib/database.js'
import { box, hint } from '../../lib/ui.js'

export default {
  name: 'owners',
  alias: ['duenos', 'listacreadores'],
  category: 'propietario',
  description: 'Muestra los propietarios configurados.',
  usage: 'owners',
  ownerOnly: true,

  run: async ({ reply, config, prefix }) => {
    const base = config.ownerNumbers.map((n, i) => `│ ${i + 1}. +${n} › *principal* (.env)`)
    const extra = getExtraOwners().map((n, i) =>
      `│ ${config.ownerNumbers.length + i + 1}. +${n} › añadido`)

    await reply(box(`DUEÑOS DEL BOT ・ ${base.length + extra.length}`, [
      ...base,
      ...extra,
      ...(extra.length ? [] : ['│ (sin dueños añadidos)'])
    ], hint(`Añade/quita con ${prefix}addowner y ${prefix}delowner`)))
  }
}
