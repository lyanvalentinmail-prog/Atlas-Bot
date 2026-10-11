// ╭────────────────────────────────────────────
// │  COMANDO » antilink
// │  Activa/desactiva el borrado de enlaces de
// │  invitación a otros grupos (solo admins).
// │  La lógica de borrado vive en lib/handler.js
// ╰────────────────────────────────────────────
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'antilink',
  alias: ['anti-link'],
  category: 'grupos',
  description: 'Activa/desactiva el anti-enlaces del grupo.',
  usage: 'antilink on/off',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, chatId, args, prefix }) => {
    const opcion = (args[0] || '').toLowerCase()
    const settings = getGroupSettings(chatId)

    if (optionsEsOnOff(opcion)) {
      settings.antilink = opcion === 'on'
      saveDatabase()
      return reply(
        settings.antilink
          ? '> こ Anti-link *activado*: borraré los enlaces de grupos de miembros que no sean admins.'
          : '> こ Anti-link *desactivado*.'
      )
    }

    await reply(
      `» Estado actual: ${settings.antilink ? '*activado*' : '*desactivado*'}\n` +
      `» Uso: ${prefix}antilink on ・ ${prefix}antilink off`
    )
  }
}

function optionsEsOnOff(texto) {
  return texto === 'on' || texto === 'off'
}
