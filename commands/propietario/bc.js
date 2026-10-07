// ╭────────────────────────────────────────────
// │  COMANDO » bc (broadcast)
// │  Envía un mensaje a todos los grupos en
// │  los que está el bot (solo dueño).
// ╰────────────────────────────────────────────
import { sleep } from '../../lib/utils.js'

export default {
  name: 'bc',
  alias: ['anuncio', 'avisoglobal'],
  category: 'propietario',
  description: 'Envía un mensaje a todos los grupos.',
  usage: 'bc <mensaje>',
  ownerOnly: true,

  run: async ({ sock, chatId, reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}bc <mensaje>`)

    let grupos = {}
    try {
      grupos = await sock.groupFetchAllParticipating()
    } catch {
      return reply('» No pude leer la lista de grupos.')
    }

    const ids = Object.keys(grupos)
    if (ids.length === 0) return reply('» El bot no está en ningún grupo.')

    await reply(`> Enviando a ${ids.length} grupos...`)

    let ok = 0, fallos = 0
    for (const id of ids) {
      try {
        await sock.sendMessage(id, { text: `> 〄 AVISO\n> ${text}` })
        ok++
      } catch { fallos++ }
      await sleep(1000) // pausa para no saturar
    }

    await sock.sendMessage(chatId, { text: `> Listo: ${ok} enviados${fallos ? `, ${fallos} fallaron` : ''}.` })
  }
}
