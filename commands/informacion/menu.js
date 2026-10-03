// ╭────────────────────────────────────────────
// │  COMANDO » menu
// │  Muestra el menú principal.
// │
// │  Uso:
// │    !menu          -> menú completo
// │    !menu grupos   -> solo esa categoría
// │    !menu cats     -> alias también valen
// │                      (español e inglés)
// │
// │  Diseño a prueba de fallos:
// │   - Si el banner no existe o no puede enviarse,
// │     el menú cae automáticamente a texto.
// │   - Si falta alguna plantilla en config.js,
// │     usa respaldos internos en vez de romperse.
// │   - Si el texto sale muy largo, se divide en
// │     varios mensajes para que WhatsApp no se trabe.
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

// WhatsApp se pone lento (o corta) con textos gigantes:
// a partir de aquí el menú se manda en varios mensajes.
const MAX_CHUNK = 3500

// Quita tildes para comparar: "imágenes" == "imagenes".
const normalize = (value = '') =>
  String(value).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

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

// Parte un texto largo en bloques sin cortar líneas.
// Cada bloque lleva su numerito [1/3] si hay varios.
const splitText = (text, max = MAX_CHUNK) => {
  const lines = String(text).split('\n')
  const chunks = []
  let current = ''

  for (const line of lines) {
    const candidate = current ? `${current}\n${line}` : line
    // Una sola línea puede pasar del límite: va igual,
    // nunca se corta a la mitad.
    if (candidate.length > max && current) {
      chunks.push(current)
      current = line
    } else {
      current = candidate
    }
  }
  if (current) chunks.push(current)

  return chunks.length <= 1
    ? chunks
    : chunks.map((chunk, i) => `${chunk}\n\n> [: ${i + 1}/${chunks.length}]`)
}

export default {
  name: 'menu',
  alias: ['menú', 'allmenu', 'comandos'],
  category: 'informacion',
  description: 'Muestra el menú con todos los comandos (o el de una categoría).',
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
    // Acepta el nombre de la carpeta, su etiqueta
    // del menú y los alias de config.categoryAliases
    // (en español o inglés, con o sin tildes).
    const requested = normalize(args[0] || '')
    let entries = [...categories]

    if (requested) {
      const aliased = config.categoryAliases?.[requested]
        || config.categoryAliases?.[requested.replace(/\s+/g, '')]

      entries = entries.filter(([category]) => {
        const label = normalize(config.categoryLabels?.[category] || '')
        return category === requested
          || category === aliased
          || label === requested
      })

      if (entries.length === 0) {
        // Categoría desconocida: NO mandamos todo a ciegas,
        // solo la lista de categorías con un par de alias.
        const aliasHint = Object.entries(config.categoryAliases || {})
          .slice(0, 6)
          .map(([alias, cat]) => `${alias}=${cat}`)
          .join(', ')
        return sock.sendMessage(chatId, {
          text: `> No encontré la categoría *${args[0]}*.\n` +
                `> Categorías: ${[...categories.keys()].join(', ')}\n` +
                (aliasHint ? `> Alias útiles: ${aliasHint}…\n` : '') +
                `> Usa *${prefix}menu* para el menú completo.`,
          mentions: [sender]
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
          `${bullet} *${prefix}${cmd.name}* »`
        )
      }
    }

    body.push('', thinLine, '',
      tpl(m, 'footer', data) || `> *${data.botName}* ✧ ${totalCommands} comandos disponibles.`)

    // Cabecera completa (mensaje 1) y cuerpo separado,
    // cada uno en bloques manejables.
    const headText = [header, '', divider, '', info].join('\n')
    const bodyText = body.filter(Boolean).join('\n')
    const chunks = [headText, ...splitText(bodyText)].filter(Boolean)

    // ── « Envío: con banner o solo texto » ──
    // (con filtro siempre va en texto puro: es una
    // consulta puntual, no la portada del bot)
    const bannerImg = requested ? null : getBanner(m)

    if (bannerImg) {
      try {
        // Foto con el encabezado como pie de imagen.
        await sock.sendMessage(chatId, {
          image: bannerImg,
          caption: headText,
          mentions: [sender]
        }, { quoted: msg })

        // Lista de comandos como texto (los captions tienen
        // límite de caracteres, por eso viaja aparte).
        for (const chunk of splitText(bodyText)) {
          await sock.sendMessage(chatId, { text: chunk, mentions: [sender] })
        }
        return
      } catch (error) {
        logger.warn(`No se pudo enviar el banner (${error.message}). El menú va como texto.`)
      }
    }

    for (let i = 0; i < chunks.length; i++) {
      await sock.sendMessage(
        chatId,
        { text: chunks[i], mentions: [sender] },
        i === 0 ? { quoted: msg } : undefined
      )
    }
  }
}
