// ╭────────────────────────────────────────────
// │  COMANDO » help
// │  Ayuda general, detalle de un comando o
// │  la lista de una categoría:
// │    !help          -> resumen
// │    !help ping     -> detalle del comando ping
// │    !help cats     -> comandos de gatos (alias)
// │    !help gatos    -> idem en español
// ╰────────────────────────────────────────────
import { fmt } from '../../config.js'

// Quita tildes para comparar: "imágenes" == "imagenes".
const normalize = (value = '') =>
  String(value).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default {
  name: 'help',
  alias: ['ayuda', '?'],
  category: 'informacion',
  description: 'Muestra la ayuda general, el detalle de un comando o una categoría.',
  usage: 'help [comando o categoría]',

  run: async ({ reply, args, prefix, config, commands, categories }) => {

    // « Sin argumentos: ayuda general »
    if (!args[0]) {
      return reply([
        `╭─「 AYUDA ・ ${config.botName.toUpperCase()} 」`,
        `│ » ${prefix}menu             » menú de comandos`,
        `│ » ${prefix}menu <categoría>  » solo esa categoría`,
        `│ » ${prefix}help <comando>   » detalle del comando`,
        `│ » ${prefix}help <categoría> » comandos de la categoría`,
        `│ » ${prefix}ping             » velocidad del bot`,
        `│ » ${prefix}info             » información del bot`,
        '╰─────────────',
        `» Prefijo activo: [ ${prefix} ]`
      ].join('\n'))
    }

    const term = normalize(args.join(' '))
    const termSingle = normalize(args[0])

    // « Índice de categorías: !help cats »
    // ("cats" = abreviatura de "categorías", no gatitos)
    const INDEX_TERMS = new Set([
      'cats', 'cat', 'categorias', 'categoria', 'lista', 'list',
      'secciones', 'seccion', 'index', 'indice', 'todo'
    ])
    if (INDEX_TERMS.has(termSingle)) {
      const lines = [`╭─「 CATEGORÍAS DEL MENÚ 」`]
      for (const [category, cmds] of categories?.entries?.() || []) {
        if (!cmds?.length) continue
        const label = config.categoryLabels?.[category] || category.toUpperCase()
        lines.push(`│ ✐ *${label}* · ${cmds.length} » ${prefix}menu ${category}`)
      }
      lines.push(
        '╰─────────────',
        `> Esa categoría al completo: *${prefix}menu <categoría>*`
      )
      return reply(lines.join('\n'))
    }

    // « Con argumento: detalle del comando »
    const command = commands.get(term) || commands.get(termSingle)

    if (command) {
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

    // « O una categoría: !help cats / !help gatos »
    const aliased = config.categoryAliases?.[termSingle]
    const catEntry = [...(categories?.entries?.() || [])].find(([category]) =>
      category === termSingle || category === aliased ||
      normalize(config.categoryLabels?.[category] || '') === term
    )

    if (catEntry) {
      const [category, cmds] = catEntry
      const label = config.categoryLabels?.[category] || category.toUpperCase()
      return reply([
        `╭─「 AYUDA ・ ${label} 」`,
        ...cmds.map(cmd => `│ » ${prefix}${cmd.name.padEnd?.(12) || cmd.name} » ${cmd.description || ''}`),
        '╰─────────────',
        `> ${cmds.length} comando(s) » todo junto con *${prefix}menu ${category}*`
      ].join('\n'))
    }

    // « Ni comando ni categoría »
    return reply(
      fmt(config.messages.commandNotFound, { prefix }) + '\n' +
      `> Categorías: ${[...(categories?.keys?.() || [])].join(', ')}`
    )
  }
}
