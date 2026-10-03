// ╭────────────────────────────────────────────
// │  COMANDO » tendencias » temas populares
// │  (RSS de tendencias diarias de Google).
// ╰────────────────────────────────────────────

export default {
  name: 'tendencias',
  alias: ['trends', 'tendencia'],
  category: 'busqueda',
  description: 'Muestra temas populares de búsqueda.',
  usage: 'tendencias [país código, ej: uy / ar / mx]',

  run: async ({ reply, args }) => {
    const geo = (args[0] || 'us').toUpperCase().slice(0, 2)

    try {
      const respuesta = await fetch(
        `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`,
        { signal: AbortSignal.timeout(15000) }
      )
      const xml = await respuesta.text()

      const titulos = [...xml.matchAll(/<title>([^<]+)<\/title>/g)]
        .map(m => m[1].trim())
        .filter(t => !/trending searches/i.test(t))
        .slice(0, 10)

      if (titulos.length === 0) return reply('» No encontré tendencias ahora.')

      const lineas = titulos.map((t, i) => `${i + 1}. ${t}`)
      await reply([`> Tendencias (${geo}):`, ...lineas].join('\n'))
    } catch {
      await reply('» No pude leer las tendencias ahora mismo.')
    }
  }
}
