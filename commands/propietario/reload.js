// ╭────────────────────────────────────────────
// │  COMANDO » reload » recarga los comandos sin
// │  reiniciar el bot (solo dueño).
// ╰────────────────────────────────────────────
import { loadCommands } from '../../lib/loader.js'

export default {
  name: 'reload',
  alias: ['recargar', 'recarga'],
  category: 'propietario',
  description: 'Recarga los comandos del bot.',
  usage: 'reload',
  ownerOnly: true,

  run: async ({ reply, commands, categories }) => {
    try {
      const { commands: nuevos, categories: nuevas, total } = await loadCommands()

      // Reemplaza el contenido en los mapas vivos (mutar, no reasignar)
      commands.clear()
      for (const [nombre, cmd] of nuevos) commands.set(nombre, cmd)
      categories.clear()
      for (const [nombre, lista] of nuevas) categories.set(nombre, lista)

      await reply(`> こ Comandos recargados: *${total}* comandos base, ${commands.size} con alias.`)
    } catch (error) {
      await reply(`» Falló la recarga: ${error.message}`)
    }
  }
}
