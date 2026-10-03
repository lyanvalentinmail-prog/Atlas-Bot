// ╭────────────────────────────────────────────
// │  COMANDO » add » agrega un número al grupo.
// ╰────────────────────────────────────────────

export default {
  name: 'add',
  alias: ['agregar', 'invitar'],
  category: 'administracion',
  description: 'Agrega un número al grupo.',
  usage: 'add <número con código de país>',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, chatId, reply, args, prefix }) => {
    const numero = (args[0] || '').replace(/\D/g, '')
    if (!numero || numero.length < 8) {
      return reply(`» Uso: ${prefix}add <número>\n» Ejemplo: ${prefix}add 59898765432`)
    }

    const jid = `${numero}@s.whatsapp.net`
    try {
      const resultado = await sock.groupParticipantsUpdate(chatId, [jid], 'add')
      const estado = resultado?.[0]?.status
      if (estado === '200' || !estado) return reply(`> こ +${numero} agregado al grupo.`)
      if (estado === '403') return reply('» Su privacidad no permite agregarlo. Envíale el enlace con: !link')
      if (estado === '409') return reply('» Ese número ya está en el grupo.')
      return reply(`» No pude agregarlo (código ${estado}).`)
    } catch {
      await reply('» No pude agregar ese número (¿soy admin?).')
    }
  }
}
