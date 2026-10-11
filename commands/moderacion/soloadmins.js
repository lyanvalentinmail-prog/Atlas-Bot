// ╭────────────────────────────────────────────
// │  COMANDO » soloadmins » restringe comandos
// │  a administradores en este grupo.
// │  add/del/lista » ej: soloadmins add slot
// ╰────────────────────────────────────────────
import { getGroupSettings, saveDatabase } from '../../lib/database.js'

export default {
  name: 'adminsonly',
  alias: ['cmdadmin', 'restrictcmd', 'soloadmins'],
  category: 'moderacion',
  description: 'Configura comandos exclusivos para administradores.',
  usage: 'adminsonly add/del/lista <comando>',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, chatId, args, commands, prefix }) => {
    const accion = (args[0] || '').toLowerCase()
    const nombre = (args[1] || '').toLowerCase()
    const settings = getGroupSettings(chatId)

    if (accion === 'lista' || accion === '') {
      const lista = settings.soloAdmins.length
        ? settings.soloAdmins.map(c => `» ${prefix}${c}`).join(' ・ ')
        : 'ninguno'
      return reply(`> Comandos solo-admins aquí:\n> ${lista}\n» Uso: ${prefix}adminsonly add/del <comando>`)
    }

    if (!['add', 'del'].includes(accion) || !nombre) {
      return reply(`» Uso: ${prefix}adminsonly add <comando> ・ ${prefix}adminsonly del <comando>`)
    }

    const cmd = commands.get(nombre)
    if (!cmd) return reply(`» No existe el comando *${nombre}*.`)

    if (accion === 'add') {
      if (!settings.soloAdmins.includes(cmd.name)) settings.soloAdmins.push(cmd.name)
      saveDatabase()
      return reply(`> こ *${prefix}${cmd.name}* ahora es solo para administradores.`)
    }

    settings.soloAdmins = settings.soloAdmins.filter(c => c !== cmd.name)
    saveDatabase()
    await reply(`> こ *${prefix}${cmd.name}* vuelve a ser libre para todos.`)
  }
}
