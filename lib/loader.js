// ╭────────────────────────────────────────────
// │  ATLAS BOT · Cargador de comandos
// │  Lee todas las carpetas dentro de commands/
// │  y registra cada archivo .js como un comando.
// │  El nombre de cada carpeta es su categoría.
// ╰────────────────────────────────────────────
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { config } from '../config.js'
import { logger } from './logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Carpeta raíz de comandos: <proyecto>/commands
export const COMMANDS_DIR = path.join(__dirname, '..', 'commands')

// ── « Comandos de emergencia » ──────────────
// Si menu.js o help.js fallan al cargar (edición
// rota, baileys incompatible...), el bot NUNCA
// queda sin menú ni ayuda: se inyectan estas
// versiones mínimas en texto puro.
const emergencyMenu = {
  name: 'menu',
  alias: ['menú', 'comandos'],
  category: 'informacion',
  description: 'Menú de emergencia (menu.js no cargó bien).',
  usage: 'menu [categoría]',

  run: async ({ reply, args, prefix, config, categories }) => {
    const requested = String(args[0] || '').toLowerCase()
    const out = [`╭─「 ${config.botName.toUpperCase()} ・ MENÚ 」`]

    for (const [category, cmds] of categories) {
      if (!cmds?.length) continue
      if (requested && category !== requested &&
          config.categoryAliases?.[requested] !== category) continue
      const label = config.categoryLabels?.[category] || category.toUpperCase()
      const names = cmds.map(c => `${prefix}${c.name}`)
      out.push(`│ ✐ *${label}* · ${cmds.length}`)
      out.push(`│ ${names.slice(0, 10).join(' ・ ')}${names.length > 10 ? ` ・ +${names.length - 10} más` : ''}`)
    }

    out.push('╰─────────────')
    out.push(`> Detalle: ${prefix}help <comando>`)
    out.push(`> Modo emergencia: revisa [ERROR] al arrancar.`)
    return reply(out.join('\n'))
  }
}

const emergencyHelp = {
  name: 'help',
  alias: ['ayuda', '?'],
  category: 'informacion',
  description: 'Ayuda de emergencia (help.js no cargó bien).',
  usage: 'help [comando]',

  run: async ({ reply, args, prefix, commands }) => {
    const command = args[0] ? commands.get(String(args[0]).toLowerCase()) : null
    if (!command) return reply(`> Usa ${prefix}menu para ver los comandos.`)
    return reply([
      `╭─「 AYUDA ・ ${command.name.toUpperCase()} 」`,
      `│ » Alias       : ${command.alias?.length ? command.alias.join(', ') : 'ninguno'}`,
      `│ » Descripción : ${command.description || 'sin descripción'}`,
      `│ » Uso         : ${prefix}${command.usage || command.name}`,
      '╰─────────────'
    ].join('\n'))
  }
}

// Registra un comando de emergencia si el real faltó.
const ensureCriticalCommand = (command, commands, categories, label) => {
  if (commands.has(command.name)) return
  logger.error(`"${command.name}" no se cargó » activando ${label} de emergencia (modo texto).`)
  commands.set(command.name, command)
  for (const alias of command.alias) {
    if (!commands.has(alias)) commands.set(alias, command)
  }
  if (!categories.has(command.category)) categories.set(command.category, [])
  categories.get(command.category).push(command)
}

export async function loadCommands() {
  const commands = new Map()   // nombre/alias -> comando
  const categories = new Map() // categoría -> [comandos]
  let errors = 0

  let folders = []
  try {
    folders = await readdir(COMMANDS_DIR, { withFileTypes: true })
  } catch {
    logger.warn('No se encontró la carpeta "commands". El bot iniciará sin comandos.')
    return { commands, categories, total: 0 }
  }

  for (const folder of folders) {
    if (!folder.isDirectory()) continue

    const category = folder.name.toLowerCase()
    const folderPath = path.join(COMMANDS_DIR, folder.name)
    const files = (await readdir(folderPath)).filter(file => file.endsWith('.js'))

    for (const file of files) {
      const filePath = path.join(folderPath, file)
      try {
        const module = await import(pathToFileURL(filePath).href)
        const command = module.default

        if (!command || typeof command !== 'object') {
          throw new Error('debe exportar un objeto con "export default"')
        }
        if (!command.name) throw new Error('le falta la propiedad "name"')
        if (typeof command.run !== 'function') throw new Error('le falta la función "run"')

        command.name = String(command.name).toLowerCase()
        command.alias = (command.alias || []).map(alias => String(alias).toLowerCase())
        command.category = String(command.category || category).toLowerCase()

        if (commands.has(command.name)) {
          throw new Error(`el nombre "${command.name}" ya está en uso`)
        }

        commands.set(command.name, command)

        for (const alias of command.alias) {
          if (!commands.has(alias)) commands.set(alias, command)
        }

        if (!categories.has(command.category)) categories.set(command.category, [])
        categories.get(command.category).push(command)
      } catch (error) {
        errors++
        logger.error(`No se pudo cargar "commands/${folder.name}/${file}" » ${error.message}`)
      }
    }
  }

  const total = [...categories.values()].reduce((sum, list) => sum + list.length, 0)
  if (errors > 0) logger.warn(`Se omitieron ${errors} archivo(s) con errores.`)

  // Ordena las categorías según config.categoryOrder;
  // las que falten en la lista van al final en orden alfabético.
  const ordered = new Map()
  for (const category of config.categoryOrder || []) {
    if (categories.has(category)) {
      ordered.set(category, categories.get(category))
      categories.delete(category)
    }
  }
  for (const [category, cmds] of [...categories.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    ordered.set(category, cmds)
  }

  // « Salvaguarda: el bot nunca queda sin menu/help »
  ensureCriticalCommand(emergencyMenu, commands, ordered, 'menú')
  ensureCriticalCommand(emergencyHelp, commands, ordered, 'ayuda')

  return { commands, categories: ordered, total }
}
