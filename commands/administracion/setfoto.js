// ╭────────────────────────────────────────────
// │  COMANDO » setfoto » cambia la foto del grupo.
// ╰────────────────────────────────────────────
import { downloadImage, findImageMessage } from '../../lib/image.js'

export default {
  name: 'setphoto',
  alias: ['fotogrupo', 'cambiarfoto', 'setfoto'],
  category: 'administracion',
  description: 'Cambia la foto del grupo.',
  usage: 'setphoto (respondiendo a una imagen)',
  adminOnly: true,
  groupOnly: true,
  botAdminOnly: true,

  run: async ({ sock, msg, chatId, reply }) => {
    if (!findImageMessage(msg)) return reply('» Responde a la imagen que será la nueva foto del grupo.')

    const buffer = await downloadImage(msg)
    if (!buffer) return reply('» No pude descargar esa imagen. Reenvíala e inténtalo de nuevo.')

    try {
      await sock.updateProfilePicture(chatId, { img: buffer })
      await reply('> こ Foto del grupo actualizada.')
    } catch {
      await reply('» No pude cambiar la foto (¿soy admin del grupo?).')
    }
  }
}
