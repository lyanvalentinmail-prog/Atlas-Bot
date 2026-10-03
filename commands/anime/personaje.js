// ╭────────────────────────────────────────────
// │  COMANDO » personaje » busca personaje (Jikan).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'personaje',
  alias: ['chara', 'anichar'],
  category: 'anime',
  description: 'Busca información sobre un personaje de anime.',
  usage: 'personaje <nombre>',

  run: async ({ sock, msg, chatId, reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}personaje <nombre>`)

    try {
      const data = await fetchJson(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(text)}&limit=1`)
      const pj = data?.data?.[0]
      if (!pj) return reply(`» No encontré a *${text}*.`)

      const sobre = (pj.about || 'Sin información.')
      const caption = [
        '╭─「 PERSONAJE 」',
        `│ » Nombre      : ${pj.name}`,
        `│ » Favoritos   : ${(pj.favorites || 0).toLocaleString('es')}`,
        '╰─────────────',
        `> ${sobre.length > 350 ? sobre.slice(0, 350).trimEnd() + '...' : sobre}`
      ].join('\n')

      const imagen = pj.images?.jpg?.image_url
      if (imagen) {
        await sock.sendMessage(chatId, { image: { url: imagen }, caption }, { quoted: msg })
      } else {
        await reply(caption)
      }
    } catch {
      await reply('» No se pudo buscar el personaje ahora mismo.')
    }
  }
}
