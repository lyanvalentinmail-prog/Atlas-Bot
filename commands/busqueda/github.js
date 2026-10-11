// ╭────────────────────────────────────────────
// │  COMANDO » github » busca repositorios.
// │  API pública de GitHub (con límite suave).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'github',
  alias: ['gh', 'gitrepo'],
  category: 'busqueda',
  description: 'Busca repositorios en GitHub.',
  usage: 'github <término>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}github <qué buscar>`)

    try {
      const data = await fetchJson(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(text)}&per_page=5&sort=stars`
      )

      const repos = data?.items
      if (!repos?.length) return reply(`» No encontré repositorios de *${text}*.`)

      const lineas = repos.map(r =>
        `・ *${r.full_name}* ★${r.stargazers_count.toLocaleString('es')}\n> ${(r.description || 'sin descripción').slice(0, 100)}\n> ${r.html_url}`)
      await reply([`> GitHub » *${text}*:`, ...lineas].join('\n\n'))
    } catch {
      await reply('» GitHub no responde ahora mismo (quizá alcancé el límite gratuito).')
    }
  }
}
