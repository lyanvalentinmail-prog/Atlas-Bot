// ╭────────────────────────────────────────────
// │  ATLAS BOT · CONFIGURACIÓN CENTRAL
// │  Aquí se controla todo el bot:
// │  nombre, dueño, prefijo, símbolos, mensajes
// │  y el diseño del menú.
// │
// │  Los valores básicos se leen del archivo .env
// │  (ver .env.example). Estos son sus valores
// │  por defecto si el .env no existe.
// ╰────────────────────────────────────────────
import process from 'node:process'
import dotenv from 'dotenv'

dotenv.config({ quiet: true })

// ── Utilidades internas ─────────────────────
const cleanNumber = (value = '') => String(value).replace(/[^0-9]/g, '')

const toNumberList = (value = '') =>
  String(value).split(',').map(cleanNumber).filter(Boolean)

// Reemplaza marcadores como {prefix} dentro de los textos.
export const fmt = (text = '', data = {}) =>
  String(text).replace(/\{(\w+)\}/g, (_, key) => data[key] ?? `{${key}}`)

export const config = {

  // ══ « 1. INFORMACIÓN BÁSICA » ═════════════
  botName: process.env.BOT_NAME || 'Atlas Bot',
  botVersion: '1.0.0',
  ownerName: process.env.OWNER_NAME || 'Sin definir',
  ownerNumbers: toNumberList(process.env.OWNER_NUMBER),

  // Prefijo de comandos. Cada carácter funciona como prefijo:
  // PREFIX = '!'  -> solo !
  // PREFIX = '!/' -> ! y /
  prefix: process.env.PREFIX || '!',

  // ══ « 2. CONEXIÓN » ═══════════════════════
  sessionName: process.env.SESSION_NAME || 'session',
  // 'qr' | 'pairing' | '' (vacío = el bot pregunta al iniciar)
  connectionMethod: (process.env.CONNECTION_METHOD || '').trim().toLowerCase(),
  pairingNumber: cleanNumber(process.env.PAIRING_NUMBER || ''),
  reconnectDelay: Number(process.env.RECONNECT_DELAY) || 3000,

  // ══ « 3. SÍMBOLOS » ═══════════════════════
  // El bot no usa emojis: todos sus mensajes se
  // construyen con estos símbolos. Modifícalos
  // aquí para cambiar el estilo visual global.
  symbols: {
    bullet: '»',        // Viñeta principal
    separator: '・',    // Separador secundario
    bracketOpen: '「',  // Apertura de títulos
    bracketClose: '」', // Cierre de títulos
    line: '─',          // Línea horizontal
    edge: '│',          // Borde vertical
    topLeft: '╭',       // Esquina superior
    bottomLeft: '╰'     // Esquina inferior
  },

  // ══ « 4. MENSAJES DEL SISTEMA » ═══════════
  // Textos que usa el bot automáticamente.
  // Puedes usar {prefix} y se reemplazará solo.
  // Deja commandNotFound vacío ('') si no quieres
  // que el bot responda a comandos inexistentes.
  messages: {
    wait: '» Un momento, por favor...',
    error: '» Ocurrió un error al ejecutar el comando.',
    ownerOnly: '» Este comando es exclusivo del dueño del bot.',
    groupOnly: '» Este comando solo funciona dentro de grupos.',
    adminOnly: '» Este comando es solo para administradores del grupo.',
    botAdminOnly: '» Necesito ser administrador del grupo para hacer eso.',
    noMention: '» Menciona a un usuario o responde a uno de sus mensajes.',
    commandNotFound: '» Comando no encontrado. Usa {prefix}menu para ver la lista.'
  },

  // ══ « 5. NOMBRES DE CATEGORÍAS » ══════════
  // Clave: nombre de la carpeta dentro de commands/
  // Valor: cómo se mostrará en el menú.
  // Si una carpeta no está aquí, se muestra en mayúsculas.
  categoryLabels: {
    general: 'GENERAL',
    grupos: 'GRUPOS',
    propietario: 'PROPIETARIO'
  },

  // ══ « 6. DISEÑO DEL MENÚ » ════════════════
  // Plantillas del menú. Cada una es una función que
  // recibe datos y devuelve una línea (o varias) de texto.
  // Modifícalas a tu gusto sin tocar el código del bot.
  //
  // Datos disponibles en header/footer:
  //   { botName, user, owner, prefix, totalCommands, uptime }
  // Datos en categoryTitle/categoryFooter:
  //   { label, count }
  // Datos en commandItem:
  //   { prefix, name, description }
  menu: {
    header: ({ botName, user, owner, prefix, totalCommands, uptime }) => [
      '╭───────────── »',
      `│  ${botName.toUpperCase()}`,
      '│─────────────',
      `│ » Usuario  : ${user}`,
      `│ » Dueño    : ${owner}`,
      `│ » Prefijo  : [ ${prefix} ]`,
      `│ » Comandos : ${totalCommands}`,
      `│ » Activo   : ${uptime}`,
      '╰───────────── »'
    ].join('\n'),

    categoryTitle: ({ label }) => `╭─「 ${label} 」`,

    commandItem: ({ prefix, name }) => `│ » ${prefix}${name}`,

    categoryFooter: () => '╰─────────────',

    footer: ({ prefix }) =>
      `» Usa ${prefix}help <comando> para ver el detalle de cada comando.`
  }
}

export default config
