// ╭────────────────────────────────────────────
// │  COMANDO » settings » panel de opciones
// │  del grupo, ordenado por secciones.
// ╰────────────────────────────────────────────
import { box, section, hint } from '../../lib/ui.js'

export default {
  name: 'settings',
  alias: ['opciones', 'panel'],
  category: 'administracion',
  description: 'Administra las opciones del bot en el grupo.',
  usage: 'settings',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, prefix }) => {
    await reply(box('PANEL DEL GRUPO', [
      section('Protección'),
      `│ » ${prefix}antilink on/off › enlaces de grupos`,
      `│ » ${prefix}antilink2 borrar/avisar/expulsar`,
      `│ » ${prefix}antispam on/off ・ ${prefix}antiflood on/off`,
      `│ » ${prefix}antibot on/off ・ ${prefix}antinsfw on/off`,
      '│',
      section('Chat'),
      `│ » ${prefix}muteall / ${prefix}unmuteall`,
      `│ » ${prefix}adminsonly add/del/lista`,
      '│',
      section('Personalización'),
      `│ » ${prefix}setrules <texto> ・ ${prefix}setprefix <símbolo>`,
      `│ » ${prefix}welcome on/off ・ ${prefix}setwelcome / ${prefix}setbye`,
      `│ » ${prefix}setphoto › foto del grupo`,
      '│',
      section('Resumen y reset'),
      `│ » ${prefix}config › ajustes actuales`,
      `│ » ${prefix}resetgroup › todo de fábrica`
    ], hint(`Detalle de cada comando: ${prefix}help <comando>`)))
  }
}
