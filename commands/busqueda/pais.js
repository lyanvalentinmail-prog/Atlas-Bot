// ╭────────────────────────────────────────────
// │  COMANDO » pais
// │  Información de un país (REST Countries,
// │  API gratuita sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'pais',
  alias: ['country', 'paisinfo'],
  category: 'busqueda',
  description: 'Muestra información de un país.',
  usage: 'pais <nombre>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}pais <nombre>\n» Ejemplo: ${prefix}pais Uruguay`)

    try {
      const data = await fetchJson(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(text)}?lang=es`
      )
      const country = data?.[0]
      if (!country) return reply(`» No encontré el país *${text}*.`)

      const currency = country.currencies
        ? Object.values(country.currencies)[0] : null

      await reply([
        `╭─「 PAÍS ・ ${(country.name?.common || text).toUpperCase()} 」`,
        `│ » Nombre oficial : ${country.name?.official || '—'}`,
        `│ » Capital        : ${country.capital?.[0] || '—'}`,
        `│ » Región         : ${country.region || '—'}${country.subregion ? ` (${country.subregion})` : ''}`,
        `│ » Población      : ${(country.population || 0).toLocaleString('es')}`,
        `│ » Moneda         : ${currency ? `${currency.name} (${currency.symbol || ''})` : '—'}`,
        `│ » Mapa           : ${country.maps?.googleMaps || '—'}`,
        '╰─────────────'
      ].join('\n'))
    } catch {
      await reply(`» No encontré el país *${text}*. Revisa el nombre.`)
    }
  }
}
