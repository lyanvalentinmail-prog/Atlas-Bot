// ╭────────────────────────────────────────────
// │  COMANDO » serie » busca serie (TVMaze,
// │  API pública sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'serie',
  alias: ['tv', 'series'],
  category: 'busqueda',
  description: 'Busca información sobre una serie.',
  usage: 'serie <título>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}serie <título>`)

    try {
      const data = await fetchJson(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(text)}`)
      if (!data?.name) return reply(`» No encontré la serie *${text}*.`)

      const resumen = (data.summary || '').replace(/<[^>]+>/g, '').slice(0, 400)

      await reply([
        '╭─「 SERIE 」',
        `│ » Título   : ${data.name}${data.premiered ? ` (${data.premiered.slice(0, 4)})` : ''}`,
        `│ » Estado   : ${data.status || '—'}`,
        `│ » Temporadas: ${data._embedded?.seasons?.length || '—'}`,
        `│ » Puntaje  : ${data.rating?.average ?? '—'}/10`,
        `│ » Géneros  : ${(data.genres || []).join(', ') || '—'}`,
        '╰─────────────',
        `> ${resumen || 'Sin resumen.'}`,
        `> ${data.url}`
      ].join('\n'))
    } catch {
      await reply(`» No encontré la serie *${text}*.`)
    }
  }
}
