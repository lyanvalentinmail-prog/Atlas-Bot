// ╭────────────────────────────────────────────
// │  COMANDO » clima
// │  Clima actual de una ciudad (Open-Meteo,
// │  API gratuita sin registro).
// ╰────────────────────────────────────────────
import { fetchJson } from '../../lib/utils.js'

const WEATHER_CODES = {
  0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado',
  3: 'Nublado', 45: 'Niebla', 48: 'Niebla helada',
  51: 'Llovizna', 53: 'Llovizna', 55: 'Llovizna intensa',
  61: 'Lluvia ligera', 63: 'Lluvia', 65: 'Lluvia intensa',
  71: 'Nieve ligera', 73: 'Nieve', 75: 'Nieve intensa',
  77: 'Granizo fino', 80: 'Chubascos', 81: 'Chubascos', 82: 'Chubascos fuertes',
  85: 'Nevadas', 86: 'Nevadas fuertes', 95: 'Tormenta', 96: 'Tormenta con granizo', 99: 'Tormenta con granizo'
}

export default {
  name: 'clima',
  alias: ['weather'],
  category: 'busqueda',
  description: 'Muestra el clima actual de una ciudad.',
  usage: 'clima <ciudad>',

  run: async ({ reply, text, prefix }) => {
    if (!text) return reply(`» Uso: ${prefix}clima <ciudad>`)

    let place, current
    try {
      const geo = await fetchJson(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=1&language=es`
      )
      place = geo?.results?.[0]
      if (!place) return reply(`» No encontré la ciudad *${text}*.`)

      const data = await fetchJson(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
        '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto'
      )
      current = data?.current
      if (!current) throw new Error('sin datos')
    } catch {
      return reply('» No se pudo obtener el clima. Revisa tu internet e intenta más tarde.')
    }

    const condition = WEATHER_CODES[current.weather_code] || 'Desconocido'

    await reply([
      `╭─「 CLIMA ・ ${place.name.toUpperCase()} 」`,
      `│ » Lugar     : ${place.name}, ${place.country}`,
      `│ » Estado    : ${condition}`,
      `│ » Temp      : ${current.temperature_2m}°C (sensación ${current.apparent_temperature}°C)`,
      `│ » Humedad   : ${current.relative_humidity_2m}%`,
      `│ » Viento    : ${current.wind_speed_10m} km/h`,
      '╰─────────────'
    ].join('\n'))
  }
}
