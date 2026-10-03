// ╭────────────────────────────────────────────
// │  COMANDO » ipinfo
// │  Geolocaliza una dirección IP
// │  (ipapi.co, API gratuita sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

export default {
  name: 'ipinfo',
  alias: ['geoip', 'ip'],
  category: 'busqueda',
  description: 'Muestra la geolocalización de una IP.',
  usage: 'ipinfo <ip>',

  run: async ({ reply, args, prefix }) => {
    const ip = (args[0] || '').trim()
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
      return reply(`» Uso: ${prefix}ipinfo <ip>\n» Ejemplo: ${prefix}ipinfo 8.8.8.8`)
    }

    try {
      const data = await fetchJson(`https://ipapi.co/${encodeURIComponent(ip)}/json/`)
      if (data?.error) throw new Error(data.reason || 'IP inválida')

      await reply([
        '╭─「 IP INFO 」',
        `│ » IP      : ${data.ip}`,
        `│ » Ciudad  : ${data.city || '—'}`,
        `│ » Región  : ${data.region || '—'}`,
        `│ » País    : ${data.country_name || '—'} (${data.country_code || ''})`,
        `│ » ISP     : ${data.org || '—'}`,
        `│ » Zona    : ${data.timezone || '—'}`,
        '╰─────────────'
      ].join('\n'))
    } catch {
      await reply(`» No se pudo obtener información de *${ip}*.`)
    }
  }
}
