// ╭────────────────────────────────────────────
// │  COMANDO » creador
// │  Muestra quién es el dueño del bot.
// ╰────────────────────────────────────────────

export default {
  name: 'creador',
  alias: ['owner', 'dueno', 'dueño'],
  category: 'informacion',
  description: 'Muestra el contacto del dueño del bot.',
  usage: 'creador',

  run: async ({ reply, config }) => {
    const ownerJid = config.ownerNumbers[0]
      ? `${config.ownerNumbers[0]}@s.whatsapp.net` : null

    await reply([
      '╭─「 CREADOR 」',
      `│ » Nombre : ${config.ownerName}`,
      `│ » Número : ${ownerJid ? `+${config.ownerNumbers[0]}` : 'sin definir'}`,
      `│ » Bot    : ${config.botName} v${config.botVersion}`,
      '╰─────────────'
    ].join('\n'), { mentions: ownerJid ? [ownerJid] : [] })
  }
}
