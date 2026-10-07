// ╭────────────────────────────────────────────
// │  COMANDO » eval » ejecuta código JS en el bot.
// │  Solo el dueño. Texto de salida recortado.
// ╰────────────────────────────────────────────

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

export default {
  name: 'eval',
  alias: ['evaljs', 'code'],
  category: 'propietario',
  description: 'Ejecuta código directamente en el bot.',
  usage: 'eval <código JavaScript>',
  ownerOnly: true,

  run: async ({ sock, msg, chatId, reply, text, prefix, config, commands, categories, sender }) => {
    if (!text) return reply(`» Uso: ${prefix}eval <código>\n» Ejemplo: ${prefix}eval 2 + 2`)

    try {
      const fn = new AsyncFunction('sock', 'msg', 'chatId', 'reply', 'config', 'commands', 'categories', 'sender',
        `let resultado;\n${text.includes('return') ? text : `resultado = ${text};`}\nreturn resultado;`)
      let resultado = await fn(sock, msg, chatId, reply, config, commands, categories, sender)

      if (typeof resultado === 'object') resultado = JSON.stringify(resultado, null, 2)
      const salida = String(resultado ?? 'undefined').slice(0, 1500)
      await reply(`> Resultado:\n\`\`\`\n${salida}\n\`\`\``)
    } catch (error) {
      await reply(`> Error en eval:\n\`\`\`\n${String(error.message).slice(0, 800)}\n\`\`\``)
    }
  }
}
