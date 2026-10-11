// ╭────────────────────────────────────────────
// │  COMANDO » reiniciar
// │  Reinicia el bot. Para que vuelva solo,
// │  correlo con PM2 o en un bucle (ver guía).
// ╰────────────────────────────────────────────

export default {
  name: 'restart',
  alias: ['botrestart', 'reiniciar'],
  category: 'propietario',
  description: 'Reinicia el bot (con PM2 vuelve solo).',
  usage: 'restart',
  ownerOnly: true,

  run: async ({ reply, config }) => {
    await reply(`> ${config.botName} se reinicia en 2 segundos...`)
    setTimeout(() => process.exit(0), 2000)
  }
}
