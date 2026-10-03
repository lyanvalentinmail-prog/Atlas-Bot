// ╭────────────────────────────────────────────
// │  COMANDO » serbot (PLANTILLA)
// │  Los Sub-Bots (jadibot) permiten que otros
// │  usuarios conecten su propio número usando
// │  la misma base del bot.
// │
// │  Requiere: crear una sesión por usuario con
// │  useMultiFileAuthState dentro de una carpeta
// │  propia (ej: sessions/<numero>) reutilizando
// │  la lógica de lib/connection.js.
// │
// │  Se deja como ejercicio guiado: la base ya
// │  separó la conexión en lib/connection.js
// │  para que puedas instanciar más de una.
// ╰────────────────────────────────────────────

export default {
  name: 'serbot',
  alias: ['jadibot'],
  category: 'subbots',
  description: 'Convierte tu número en un Sub-Bot.',
  usage: 'serbot',

  run: async ({ reply }) => {
    await reply(
      '> El sistema de Sub-Bots aún no está activo.\n' +
      '> La base ya está preparada para implementarlo:\n' +
      '> reutiliza *lib/connection.js* con una sesión\n' +
      '> por usuario dentro de la carpeta *sessions/*.\n' +
      '> Revisa el ejemplo comentado en el comando.'
    )
  }
}
