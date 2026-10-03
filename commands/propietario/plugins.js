// ╭────────────────────────────────────────────
// │  COMANDO » plugins » comandos instalados,
// │  con detalle por categoría.
// ╰────────────────────────────────────────────
import { box, section } from '../../lib/ui.js'

export default {
  name: 'plugins',
  alias: ['modulos', 'comandoslist'],
  category: 'propietario',
  description: 'Muestra los plugins instalados.',
  usage: 'plugins',
  ownerOnly: true,

  run: async ({ reply, commands, categories, config }) => {
    const base = new Set([...commands.values()]).size

    const conteo = [...categories.entries()].map(([cat, lista]) => {
      const label = config.categoryLabels?.[cat] || cat.toUpperCase()
      return `│ ・ *${label}* › ${lista.length}`
    })

    await reply(box('PLUGINS INSTALADOS', [
      `│ » Comandos base  : ${base}`,
      `│ » Con alias      : ${commands.size}`,
      `│ » Categorías     : ${categories.size}`,
      '│─────────────',
      section('Por categoría'),
      ...conteo
    ]))
  }
}
