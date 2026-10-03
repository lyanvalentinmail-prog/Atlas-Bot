// ╭────────────────────────────────────────────
// │  COMANDO » repo
// │  Muestra el enlace del repositorio/código.
// ╰────────────────────────────────────────────

export default {
  name: 'repo',
  alias: ['repositorio', 'github', 'script', 'codigo'],
  category: 'informacion',
  description: 'Muestra el repositorio del bot.',
  usage: 'repo',

  run: async ({ reply, config }) => {
    await reply([
      '╭─「 REPOSITORIO 」',
      `│ » ${config.botName}`,
      `│ » Base modular con Node.js + Baileys`,
      '╰─────────────',
      `> ${config.repoUrl}`
    ].join('\n'))
  }
}
