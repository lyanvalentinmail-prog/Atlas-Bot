// ╭────────────────────────────────────────────
// │  COMANDO » lyrics » letra de canción
// │  (lyrics.ovh, sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'lyrics',
  alias: ['letra', 'letracancion'],
  category: 'busqueda',
  description: 'Busca la letra e información de una canción.',
  usage: 'lyrics <artista> - <canción>',

  run: async ({ reply, text, prefix }) => {
    const [artista = '', cancion = ''] = text.split('-').map(t => t.trim())
    if (!artista || !cancion) {
      return reply(`» Uso: ${prefix}lyrics <artista> - <canción>\n» Ejemplo: ${prefix}lyrics Karol G - Provenza`)
    }

    try {
      const data = await fetchJson(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artista)}/${encodeURIComponent(cancion)}`
      )
      const letra = (data?.lyrics || '').trim()
      if (!letra) return reply(`» No encontré la letra de *${artista} - ${cancion}*.`)

      const corta = letra.length > 2500 ? letra.slice(0, 2500) + '\n\n… (letra recortada)' : letra
      await reply(`> *${artista} » ${cancion}*\n\n${corta}`)
    } catch {
      await reply(`» No encontré la letra de *${artista} - ${cancion}*.`)
    }
  }
}
