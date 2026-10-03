// ╭────────────────────────────────────────────
// │  COMANDO » noticias » titulares recientes
// │  (RSS público de Google News, sin registro).
// ╰────────────────────────────────────────────

export default {
  name: 'news',
  alias: ['titulares', 'noticias'],
  category: 'busqueda',
  description: 'Muestra noticias recientes.',
  usage: 'news [tema]',

  run: async ({ reply, text }) => {
    const tema = text.trim()
    const url = tema
      ? `https://news.google.com/rss/search?q=${encodeURIComponent(tema)}&hl=es-419&gl=US&ceid=US:es-419`
      : 'https://news.google.com/rss?hl=es-419&gl=US&ceid=US:es-419'

    try {
      const respuesta = await fetch(url, { signal: AbortSignal.timeout(15000) })
      const xml = await respuesta.text()

      const items = [...xml.matchAll(/<item>[\s\S]*?<title>([^<]+)<\/title>[\s\S]*?<link>([^<]+)<\/link>/g)]
        .slice(0, 5)

      if (items.length === 0) return reply('» No encontré noticias frescas ahora.')

      const lineas = items.map((m, i) => `${i + 1}. *${m[1].trim()}*\n> ${m[2].trim()}`)
      await reply([`> Titulares ${tema ? `de *${tema}*` : 'recientes'}:`, ...lineas].join('\n\n'))
    } catch {
      await reply('» No pude leer las noticias ahora mismo.')
    }
  }
}
