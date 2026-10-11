// ╭────────────────────────────────────────────
// │  COMANDO » fecha » fecha y hora actual.
// ╰────────────────────────────────────────────

export default {
  name: 'date',
  alias: ['hoy', 'fecha'],
  category: 'utilidades',
  description: 'Muestra la fecha actual.',
  usage: 'date',

  run: async ({ reply }) => {
    const ahora = new Date()
    const texto = ahora.toLocaleDateString('es-UY', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    const hora = ahora.toLocaleTimeString('es-UY')
    const unix = Math.floor(ahora.getTime() / 1000)

    await reply(`> 仮 Hoy:\n> ${texto}\n> Hora del servidor: ${hora}\n> Unix: ${unix}`)
  }
}
