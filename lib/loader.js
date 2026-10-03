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

  return { commands, categories: ordered, total }
}
