// ╭────────────────────────────────────────────
// │  COMANDO » temporizador » avisa al cumplirse.
// ╰────────────────────────────────────────────
import { getNumber } from '../../lib/utils.js'

export default {
  name: 'timer',
  alias: ['avisoen', 'temporizador'],
  category: 'utilidades',
  description: 'Crea un temporizador que te avisa al final.',
  usage: 'timer <minutos> [motivo]',

  run: async ({ sock, chatId, reply, sender, args, prefix }) => {
    const minutos = Math.abs(parseFloat(args[0]))
    if (!minutos || minutos < 0.1 || minutos > 360) {
      return reply(`» Uso: ${prefix}timer <minutos> [motivo]\n» Ejemplo: ${prefix}timer 5 revisar el pan`)
    }

    const motivo = args.slice(1).join(' ') || 'tu temporizador'
    const etiqueta = minutos === 1 ? '1 minuto' : `${minutos} minutos`

    await reply(`> こ Temporizador de *${etiqueta}* iniciado. Te aviso aquí.`)

    setTimeout(() => {
      sock.sendMessage(chatId, {
        text: `> ⏾ @${getNumber(sender)}, tiempo cumplido:\n> *${motivo}*`,
        mentions: [sender]
      }).catch(() => null)
    }, minutos * 60 * 1000).unref?.()
  }
}
