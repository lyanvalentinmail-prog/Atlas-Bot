// ╭────────────────────────────────────────────
// │  COMANDO » owners » lista los dueños.
// ╰────────────────────────────────────────────
import { getExtraOwners } from '../../lib/database.js'

export default {
  name: 'owners',
  alias: ['duenos', 'listacreadores'],
  category: 'propietario',
  description: 'Muestra los propietarios configurados.',
  usage: 'owners',
  ownerOnly: true,

  run: async ({ reply, config }) => {
    const base = config.ownerNumbers.map(n => `ᯓ +${n} (.env)`)
    const extra = getExtraOwners().map(n => `» +${n} (añadido)`)

    await reply([
      '╭─「 DUEÑOS DEL BOT 」',
      ...base,
      ...(extra.length ? extra : ['(sin dueños extra)']),
      '╰─────────────'
    ].join('\n'))
  }
}
