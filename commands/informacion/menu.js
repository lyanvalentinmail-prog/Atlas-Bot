// ╭────────────────────────────────────────────
// │  COMANDO » menu
// │  Muestra el menú principal. Su diseño se
// │  edita en config.js, sección "menu".
// │
// │  Uso:
// │    !menu          -> menú completo
// │    !menu grupos   -> solo esa categoría
// ╰────────────────────────────────────────────
import { formatUptime, getGreeting } from '../../lib/utils.js'
import { getUserCount } from '../../lib/database.js'

export default {
  name: 'menu',
  alias: ['menú', 'allmenu', 'comandos'],
  category: 'informacion',
  description: 'Muestra el menú con todos los comandos.',
  usage: 'menu [categoría]',

  run: async ({ sock, msg, chatId, sender, args, prefix, config, categories }) => {
    const m = config.menu
    const totalCommands = [...categories.values()]
      .reduce((sum, list) => sum + list.length, 0)

    const data = {
      user: msg.pushName || 'usuario',
      botName: config.botName,
      botWeb: config.botWeb,
      botType: config.botType,
      owner: config.ownerName,
      greeting: getGreeting(),
      prefix,
      totalCommands,
      users: getUserCount(),
      uptime: formatUptime(process.uptime()),
      kaomoji: m.kaomoji
    }

    // ── « Filtro por categoría: !menu grupos » ──
    const requested = (args[0] || '').toLowerCase()
    let entries = [...categories]

    if (requested) {
      entries = entries.filter(([category]) => {
        const label = (config.categoryLabels[category] || '').toLowerCase()
        return category === requested || label === requested
      })
      if (entries.length === 0) {
        return sock.sendMessage(chatId, {
          text: `> No encontré la categoría *${args[0]}*.\n` +
                `> Categorías disponibles: ${[...categories.keys()].join(', ')}\n` +
                `> Usa *${prefix}menu* para ver el menú completo.`
        }, { quoted: msg })
      }
    }

    // ── « Construcción del menú » ───────────
    const parts = [
      m.header(data),
      '',
      m.divider,
      '',
      m.info(data),
      '',
      m.divider,
      '',
      m.commandsTitle(data),
      '',
      m.hint({ prefix, filtered: Boolean(requested), kaomojiHint: m.kaomojiHint })
    ]

    for (const [category, cmds] of entries) {
      const label = config.categoryLabels[category] || category.toUpperCase()

      parts.push('', m.frameTop)
      parts.push(m.categoryTitle({ label, count: cmds.length }))
      parts.push('')

      cmds.forEach((cmd, i) => {
        const extra = (cmd.usage || cmd.name).split(/\s+/).slice(1).join(' ')
        parts.push(m.commandLine({
          prefix,
          name: cmd.name,
          alias: cmd.alias,
          extra,
          bullet: m.bullet
        }))
        parts.push(m.commandDesc({ description: cmd.description }))
        if (i < cmds.length - 1) parts.push('')
      })

      parts.push(m.frameBottom)
    }

    parts.push('', m.divider, '', m.footer(data))

    await sock.sendMessage(chatId, {
      text: parts.join('\n'),
      mentions: [sender]
    }, { quoted: msg })
  }
}
