// ╭────────────────────────────────────────────
// │  COMANDO » ytsearch » busca videos en el
// │  HTML público de YouTube (sin API key).
// ╰────────────────────────────────────────────

export default {
  name: 'ytsearch',
  alias: ['youtube', 'videobuscar'],
  category: 'busqueda',
  description: 'Busca videos en YouTube.',
  usage: 'ytsearch <consulta>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}ytsearch <canción o tema>`)

    try {
      const respuesta = await fetch(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(text)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AtlasBot/1.0)', 'Accept-Language': 'es' }, signal: AbortSignal.timeout(15000) }
      )
      const html = await respuesta.text()

      // Extrae pares videoId + título del JSON embebido de YouTube
      const vistos = new Set()
      const encontrados = []
      const re = /"videoId":"([\w-]{11})"[^{}]*?"title":\{"runs":\[\{"text":"([^"]{3,120})"/g
      let m
      while ((m = re.exec(html)) && encontrados.length < 5) {
        if (vistos.has(m[1])) continue
        vistos.add(m[1])
        encontrados.push({ id: m[1], titulo: m[2] })
      }

      if (encontrados.length === 0) {
        return reply(`» No encontré videos de *${text}* (YouTube cambió su página o no hay resaca útil).`)
      }

      const lineas = encontrados.map((v, i) =>
        `${i + 1}. *${v.titulo}*\n> https://youtu.be/${v.id}`)
      await reply([`> Videos de *${text}*:`, ...lineas].join('\n\n'))
    } catch {
      await reply('» No pude buscar en YouTube ahora mismo.')
    }
  }
}
