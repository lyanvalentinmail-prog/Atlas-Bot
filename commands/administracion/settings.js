// ╭────────────────────────────────────────────
// │  COMANDO » settings » panel de opciones.
// ╰────────────────────────────────────────────

export default {
  name: 'settings',
  alias: ['opciones', 'panel'],
  category: 'administracion',
  description: 'Administra las opciones del bot en el grupo.',
  usage: 'settings',
  adminOnly: true,
  groupOnly: true,

  run: async ({ reply, prefix }) => {
    await reply([
      '╭─「 OPCIONES DEL GRUPO 」',
      `│ ${prefix}config » ver ajustes actuales`,
      `│ ${prefix}antilink on/off » enlaces de grupos`,
      `│ ${prefix}antilink2 borrar/avisar/expulsar`,
      `│ ${prefix}bienvenida on/off » + ${prefix}setwelcome / ${prefix}setbye`,
      `│ ${prefix}antispam on/off ・ ${prefix}antiflood on/off`,
      `│ ${prefix}antibot on/off ・ ${prefix}antinsfw on/off`,
      `│ ${prefix}silenciar / ${prefix}desilenciar`,
      `│ ${prefix}setreglas ・ ${prefix}setprefix ・ ${prefix}setfoto`,
      `│ ${prefix}soloadmins add/del/lista`,
      `│ ${prefix}resetgrupo » todo de fábrica`,
      '╰─────────────'
    ].join('\n'))
  }
}
