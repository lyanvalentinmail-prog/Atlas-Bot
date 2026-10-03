// ╭────────────────────────────────────────────
// │  COMANDO » help
// │  Ayuda general o detalle de un comando:
// │  !help        -> resumen
// │  !help ping   -> detalle del comando ping
// ╰────────────────────────────────────────────
import { fmt } from '../../config.js'

export default {
  name: 'help',
  alias: ['ayuda', '?'],
  category: 'informacion',
  description: 'Muestra la ayuda general o el detalle de un comando.',
  usage: 'help [comando]',

  run: async ({ reply, args, prefix, config, commands }) => {

    // « Sin argumentos: ayuda general »
    if (!args[0]) {
      return reply([
        `╭─「 AYUDA ・ ${config.botName.toUpperCase()} 」`,
        `│ » ${prefix}menu             » lista de comandos`,
        `│ » ${prefix}help <comando>   » detalle de un comando`,
        `│ » ${prefix}ping             » velocidad del bot`,
        `│ » ${prefix}info             » información del bot`,
        '╰─────────────',
        `» Prefijo activo: [ ${prefix} ]`
      ].join('\n'))
    }

    // « Con argumento: detalle del comando »
    const command = commands.get(args[0].toLowerCase())
    if (!command) {
      return reply(fmt(config.messages.commandNotFound, { prefix }))
    }

    const label = config.categoryLabels[command.category] || command.category.toUpperCase()
    const restrictions = []
    if (command.ownerOnly) restrictions.push('solo dueño')
    if (command.groupOnly) restrictions.push('solo grupos')
    if (command.adminOnly) restrictions.push('solo admins')
    if (command.botAdminOnly) restrictions.push('bot admin')

    return reply([
      `╭─「 AYUDA ・ ${command.name.toUpperCase()} 」`,
      `│ » Nombre      : ${command.name}`,
      `│ » Alias       : ${command.alias?.length ? command.alias.join(', ') : 'ninguno'}`,
      `│ » Categoría   : ${label}`,
      `│ » Descripción : ${command.description || 'sin descripción'}`,
      `│ » Uso         : ${prefix}${command.usage || command.name}`,
      `│ » Restricción : ${restrictions.length ? restrictions.join(' » ') : 'ninguna'}`,
      '╰─────────────'
    ].join('\n'))
  }
}
