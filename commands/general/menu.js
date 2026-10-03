// ╭────────────────────────────────────────────
// │  COMANDO » menu
// │  Muestra el menú principal. Su diseño se
// │  edita en config.js, sección "menu".
// ╰────────────────────────────────────────────
import { getNumber, formatUptime } from '../../lib/utils.js'

export default {
  name: 'menu',
  alias: ['menú', 'allmenu', 'comandos'],
  category: 'general',
  description: 'Muestra el menú con todos los comandos.',
  usage: 'menu',

  run: async ({ sock, msg, chatId, sender, prefix, config, categories }) => {
    const totalCommands = [...categories.values()]
      .reduce((sum, list) => sum + list.length, 0)

    const data = {
      botName: config.botName,
      user: `@${getNumber(sender)}`,
      owner: config.ownerName,
      prefix,
      totalCommands,
      uptime: formatUptime(process.uptime())
    }

    const lines = [config.menu.header(data), '']

    for (const [category, cmds] of categories) {
      const label = config.categoryLabels[category] || category.toUpperCase()
      lines.push(config.menu.categoryTitle({ label, count: cmds.length }))
      for (const cmd of cmds) {
        lines.push(config.menu.commandItem({ prefix, name: cmd.name, description: cmd.description }))
      }
      lines.push(config.menu.categoryFooter({ label, count: cmds.length }))
      lines.push('')
    }

    lines.push(config.menu.footer(data))

    await sock.sendMessage(chatId, {
      text: lines.join('\n'),
      mentions: [sender]
    }, { quoted: msg })
  }
}
