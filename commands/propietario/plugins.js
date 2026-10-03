// ╭────────────────────────────────────────────
// │  COMANDO » plugins » comandos instalados.
// ╰────────────────────────────────────────────

export default {
  name: 'plugins',
  alias: ['modulos', 'comandoslist'],
  category: 'propietario',
  description: 'Muestra los plugins instalados.',
  usage: 'plugins',
  ownerOnly: true,

  run: async ({ reply, commands, categories }) => {
    const conteo = [...categories.entries()].map(([cat, lista]) =>
      `・ *${cat}* » ${lista.length} cmd(s)`)

    await reply([
      '╭─「 PLUGINS 」',
      `│ » Total categorías: ${categories.size}`,
      `│ » Total comandos  : ${[...commands.values()] ? new Set([...commands.values()]).size : 0}`,
      `│ » Alias totales   : ${commands.size}`,
      '╰─────────────',
      ...conteo
    ].join('\n'))
  }
}
