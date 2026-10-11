// ╭────────────────────────────────────────────
// │  COMANDO » hora
// │  Muestra la hora de una zona horaria.
// │  No usa ninguna API externa: solo Node.js.
// ╰────────────────────────────────────────────

// Atajos de ciudades » puedes añadir más
const ZONAS = {
  montevideo: 'America/Montevideo', uruguay: 'America/Montevideo',
  buenosaires: 'America/Argentina/Buenos_Aires', argentina: 'America/Argentina/Buenos_Aires',
  chile: 'America/Santiago', santiago: 'America/Santiago',
  lima: 'America/Lima', peru: 'America/Lima',
  mexico: 'America/Mexico_City', cdmx: 'America/Mexico_City',
  colombia: 'America/Bogota', bogota: 'America/Bogota',
  madrid: 'Europe/Madrid', espana: 'Europe/Madrid', espanha: 'Europe/Madrid', 'españa': 'Europe/Madrid',
  tokio: 'Asia/Tokyo', tokyo: 'Asia/Tokyo',
  londres: 'Europe/London'
}

export default {
  name: 'time',
  alias: ['reloj', 'hora'],
  category: 'herramientas',
  description: 'Muestra la hora actual (ej: hora madrid).',
  usage: 'time [ciudad o zona]',

  run: async ({ reply, args, prefix }) => {
    const consulta = (args[0] || '').toLowerCase().replace(/[\s_-]/g, '')

    // Prioridad: atajo del mapa » zona IATA completa » Montevideo
    let timeZone = 'America/Montevideo'
    if (consulta) {
      if (ZONAS[consulta]) {
        timeZone = ZONAS[consulta]
      } else if (args[0].includes('/') && args[0].length < 60) {
        timeZone = args[0] // formato tipo America/Montevideo
      } else {
        return reply(
          `» No conozco la zona *${args[0]}*.\n` +
          `» Usa una ciudad (ej: ${prefix}time madrid)\n` +
          `» o una zona completa (ej: ${prefix}time America/Montevideo)`
        )
      }
    }

    try {
      const ahora = new Date().toLocaleString('es-UY', {
        timeZone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      await reply(`> っ ${timeZone}\n> ${ahora}`)
    } catch {
      await reply(`» La zona *${timeZone}* no es válida.`)
    }
  }
}
