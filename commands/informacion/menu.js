// ╭────────────────────────────────────────────
// │  COMANDO » menu
// │  Muestra el menú principal. Su diseño se
// │  edita en config.js, sección "menu".
// │
// │  Uso:
// │    !menu          -> menú completo
// │    !menu grupos   -> solo esa categoría
// │
// │  Si hay banner (config.menu.banner), el
// │  encabezado viaja como pie de la imagen y
// │  la lista de comandos en un mensaje de texto.
// ╰────────────────────────────────────────────
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { ROOT_DIR } from '../../config.js'
import { logger } from '../../lib/logger.js'
import { formatUptime, getGreeting } from '../../lib/utils.js'
import { getUserCount } from '../../lib/database.js'

// El banner se lee del disco una sola vez.
let bannerCache = null
let bannerMissing = false

const getBanner = (config) => {
  if (bannerCache || bannerMissing) return bannerCache
  if (!config.menu.banner) { bannerMissing = true; return null }

  const filePath = path.resolve(ROOT_DIR, config.menu.banner)
  if (!existsSync(filePath)) {
    logger.warn(`No se encontró el banner "${config.menu.banner}". El menú se enviará como texto.`)
    bannerMissing = true
    return null
  }
  bannerCache = readFileSync(filePath)
  return bannerCache
}

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
    const head = [
      m.header(data),
      '',
      m.divider,
      '',
      m.info(data)
    ]

    const body = [
      m.commandsTitle(data),
      '',
      m.hint({ prefix, filtered: Boolean(requested), kaomojiHint: m.kaomojiHint })
    ]

    for (const [category, cmds] of entries) {
      const label = config.categoryLabels[category] || category.toUpperCase()

      body.push('', m.frameTop)
      body.push(m.categoryTitle({ label, count: cmds.length }))
      body.push('')

      cmds.forEach((cmd, i) => {
        const extra = (cmd.usage || cmd.name).split(/\s+/).slice(1).join(' ')
        body.push(m.commandLine({
          prefix,
          name: cmd.name,
          alias: cmd.alias,
          extra,
          bullet: m.bullet
        }))
        body.push(m.commandDesc({ description: cmd.description }))
        if (i < cmds.length - 1) body.push('')
      })

      body.push(m.frameBottom)
    }

    const footer = ['', m.divider, '', m.footer(data)]

    // ── « Envío: con banner o solo texto » ──
    const banner = getBanner(config)

    if (banner) {
      // Foto con el encabezado como pie de imagen
      await sock.sendMessage(chatId, {
        image: banner,
        caption: head.join('\n'),
        mentions: [sender]
      }, { quoted: msg })

      // Lista de comandos como texto (los captions tienen
      // límite de caracteres, por eso viaja aparte)
      await sock.sendMessage(chatId, {
        text: [...body, ...footer].join('\n'),
        mentions: [sender]
      })
    } else {
      await sock.sendMessage(chatId, {
        text: [...head, '', m.divider, ...body, ...footer].join('\n'),
        mentions: [sender]
      }, { quoted: msg })
    }
  }
}
