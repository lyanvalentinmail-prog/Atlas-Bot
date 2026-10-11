// ╭────────────────────────────────────────────
// │  COMANDO » broadcast » anuncio a grupos y a
// │  todos los usuarios registrados (solo dueño).
// ╰────────────────────────────────────────────
import { sleep } from '../../lib/utils.js'

export default {
  name: 'broadcast',
  alias: ['difusion', 'alerta'],
  category: 'propietario',
  description: 'Envía un anuncio a los chats configurados.',
  usage: 'broadcast <mensaje>',
  ownerOnly: true,

  run: async ({ sock, chatId, reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}broadcast <mensaje>`)

    let grupos = {}
    try { grupos = await sock.groupFetchAllParticipating() } catch {}
    const ids = Object.keys(grupos)

    if (ids.length === 0) return reply('» El bot no está en ningún grupo todavía.')

    await reply(`> Enviando a ${ids.length} chats...`)
    let ok = 0, fallos = 0
    for (const id of ids) {
      try {
        await sock.sendMessage(id, { text: `> 〄 COMUNICADO\n> ${text}` })
        ok++
      } catch { fallos++ }
      await sleep(1200)
    }

    await sock.sendMessage(chatId, { text: `> Broadcast terminado: ${ok} enviados${fallos ? `, ${fallos} fallaron` : ''}.` })
  }
}
