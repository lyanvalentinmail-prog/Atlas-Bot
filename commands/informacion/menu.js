// ╭────────────────────────────────────────────
// │  COMANDO » menu
// │  Muestra el menú principal.
// │
// │  Uso:
// │    !menu          -> menú completo
// │    !menu grupos   -> solo esa categoría
// │
// │  Diseño a prueba de fallos:
// │   - Si el banner no existe o no puede enviarse,
// │     el menú cae automáticamente a texto.
// │   - Si falta alguna plantilla en config.js,
// │     usa respaldos internos en vez de romperse.
// ╰────────────────────────────────────────────
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { logger } from '../../lib/logger.js'
import { formatUptime, getGreeting } from '../../lib/utils.js'
import { getUserCount } from '../../lib/database.js'

// Raíz del proyecto según la ubicación de ESTE archivo:
// no depende de config.js (funciona aunque la config sea vieja).
const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '..', '..'
)

// El banner se lee del disco una sola vez.
let bannerCache = null
let bannerMissing = false

const getBanner = (menuCfg) => {
  if (bannerCache || bannerMissing) return bannerCache
  const bannerPath = menuCfg?.banner
  if (!bannerPath) { bannerMissing = true; return null }

  try {
    const filePath = path.resolve(PROJECT_ROOT, bannerPath)
    if (!existsSync(filePath)) throw new Error('archivo inexistente')
    bannerCache = readFileSync(filePath)
  } catch {
    logger.warn(`No se encontró el banner "${bannerPath}". El menú se enviará como texto.`)
    bannerMissing = true
    return null
  }
  return bannerCache
}

// Ejecuta una plantilla del menú; nunca lanza error.
const tpl = (menuCfg, key, data) => {
  try {
    const value = menuCfg?.[key]
    return typeof value === 'function' ? value(data) : String(value ?? '')
  } catch {
    return ''
  }
}

// Devuelve una decoración válida (o el respaldo).
const decor = (value, fallback) =>
  (typeof value === 'string' && value.length ? value : fallback)

export default {
  name: 'menu',
  alias: ['menú', 'allmenu', 'comandos'],
  category: 'informacion',
  description: 'Muestra el menú con todos los comandos.',
  usage: 'menu [categoría]',

  run: async ({ sock, msg, chatId, sender, args, prefix, config, categories }) => {
    const m = config?.menu || {}
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
      kaomoji: decor(m.kaomoji, '૮₍ ˶ᵔ ᵕ ᔔ˶ ₎ა')
    }

    // ── « Filtro por categoría: !menu grupos » ──
    const requested = (args[0] || '').toLowerCase()
    let entries = [...categories]

    if (requested) {
      entries = entries.filter(([category]) => {
        const label = (config.categoryLabels?.[category] || '').toLowerCase()
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
    const divider = decor(m.divider, '───────────────')
    const thinLine = decor(m.thinLine, '───────────────')
    const bullet = decor(m.bullet, '»')

    const header = tpl(m, 'header', data) ||
      `> ¡${data.greeting}! Menú de *${data.botName}*`
    const info = tpl(m, 'info', data)

    const body = [
      tpl(m, 'commandsTitle', data) || '*LISTA DE COMANDOS*',
      '',
      tpl(m, 'hint', { prefix, filtered: Boolean(requested), kaomojiHint: decor(m.kaomojiHint, '') })
    ]

    for (const [category, cmds] of entries) {
      const label = config.categoryLabels?.[category] || category.toUpperCase()

      body.push('', thinLine)
      body.push(
        tpl(m, 'categoryTitle', { label, count: cmds.length }) || `*${label}*`
      )

      for (const cmd of cmds) {
        body.push(
          tpl(m, 'commandLine', { prefix, name: cmd.name, description: cmd.description, bullet }) ||
          `${bullet} *${prefix}${cmd.name}*`
        )
      }
    }

    body.push('', thinLine, '',
      tpl(m, 'footer', data) || `> *${data.botName}* ✧ ${totalCommands} comandos disponibles.`)

    // ── « Envío: con banner o solo texto » ──
    const banner = getBanner(m)

    if (banner) {
      try {
        // Foto con el encabezado como pie de imagen
        await sock.sendMessage(chatId, {
          image: banner,
          caption: [header, '', divider, '', info].join('\n'),
          mentions: [sender]
        }, { quoted: msg })

        // Lista de comandos como texto (los captions tienen
        // límite de caracteres, por eso viaja aparte)
        await sock.sendMessage(chatId, {
          text: body.join('\n'),
          mentions: [sender]
        })
        return
      } catch (error) {
        logger.warn(`No se pudo enviar el banner (${error.message}). El menú va como texto.`)
      }
    }

    await sock.sendMessage(chatId, {
      text: [header, '', divider, '', info, '', divider, ...body].join('\n'),
      mentions: [sender]
    }, { quoted: msg })
  }
}
