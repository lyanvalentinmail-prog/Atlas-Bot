// ╭────────────────────────────────────────────
// │  COMANDO » warn » advierte a un miembro.
// │  A las 3 advertencias se expulsa al usuario.
// ╰────────────────────────────────────────────
import { getTargetUser, getNumber } from '../../lib/utils.js'
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export const WARN_LIMIT = 3

export default {
  name: 'warn',
  alias: ['advertir', 'avisar'],
  category: 'moderacion',
  description: 'Envía una advertencia a un miembro.',
  usage: 'warn @usuario [motivo]',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, msg, reply, chatId, text, prefix }) => {
    const target = getTargetUser(msg)
    if (!target) return reply(`» Uso: ${prefix}warn @usuario [motivo]`)

    const settings = getGroupSettings(chatId)
    const number = getNumber(target)
    settings.warns[number] = (settings.warns[number] || 0) + 1
    saveDatabase()

    const cuenta = settings.warns[number]
    const motivo = text.split('@')[0].trim()

    if (cuenta >= WARN_LIMIT) {
      settings.warns[number] = 0
      saveDatabase()
      try { await sock.groupParticipantsUpdate(chatId, [target], 'remove') } catch {}
      return reply([
        `> 〔⚠〕 @${number} acumuló ${WARN_LIMIT} advertencias y fue *expulsado*.`,
        motivo ? `> Motivo: ${motivo}` : ''
      ].filter(Boolean).join('\n'), { mentions: [target] })
    }

    await reply([
      `> 〔⚠〕 Advertencia para @${number} » ${cuenta}/${WARN_LIMIT}`,
      motivo ? `> Motivo: ${motivo}` : '> A las 3 advertencias: expulsión.'
    ].join('\n'), { mentions: [target] })
  }
}
