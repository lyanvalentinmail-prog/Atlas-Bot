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
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { toSmallCaps } from './lib/utils.js'

dotenv.config({ quiet: true })

// Carpeta raíz del proyecto (donde está este archivo)
export const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url))

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

  // Datos extra que se muestran en el menú
  botWeb: 'Aún no tiene web..',
  botType: 'Sub-Bot',

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

  // ══ « 5. CATEGORÍAS DEL MENÚ » ═══════════
  // Orden en el que aparecen las categorías en el
  // menú (nombre de cada carpeta en commands/).
  // Las que no estén aquí se agregan al final.
  categoryOrder: [
    'informacion',
    'ia',
    'descargas',
    'busqueda',
    'stickers',
    'herramientas',
    'grupos',
    'perfil',
    'subbots',
    'juegos',
    'economia',
    'gacha',
    'pokemon'
  ],

  // ══ « 5.1. NOMBRES DE CATEGORÍAS » ═══════
  // Clave: nombre de la carpeta dentro de commands/
  // Valor: cómo se mostrará en el menú.
  // Si una carpeta no está aquí, se muestra en mayúsculas.
  categoryLabels: {
    informacion: 'INFORMACIÓN',
    ia: 'INTELIGENCIA ARTIFICIAL',
    descargas: 'DESCARGAS',
    busqueda: 'BÚSQUEDA',
    stickers: 'STICKERS',
    herramientas: 'HERRAMIENTAS',
    grupos: 'GRUPOS',
    perfil: 'PERFIL',
    subbots: 'SUB-BOTS',
    juegos: 'JUEGOS',
    economia: 'ECONOMÍA',
    gacha: 'GACHA',
    pokemon: 'POKEMON',
    propietario: 'PROPIETARIO'
  },

  // ══ « 6. DISEÑO DEL MENÚ » ════════════════
  // Todo el estilo del menú se controla aquí.
  // Cada plantilla es una función que recibe
  // datos y devuelve texto. Modifícalas a tu
  // gusto sin tocar el código del bot.
  //
  // Datos disponibles:
  //   header/info/footer » { user, botName, botWeb, botType, owner,
  //                          greeting, prefix, totalCommands, users, uptime, kaomoji }
  //   categoryTitle      » { label, count }
  //   commandLine        » { prefix, name, description }
  menu: {
    // ── « Banner del menú » ──────────────────
    // Imagen que acompaña al menú (ruta relativa a la
    // carpeta del proyecto). El encabezado y la info van
    // como pie de la imagen, y la lista llega en un
    // mensaje de texto justo después.
    // Ponlo en null para menú solo de texto.
    banner: 'assets/banner.jpg',

    // ── « Decoraciones » ─────────────────────
    kaomoji: '૮₍ ˶ᵔ ᵕ ᔔ˶ ₎ა',
    kaomojiHint: '૮(˶ᵔᕕᔔ˶)ა',
    divider: '✧･ﾟ: ✧･ﾟ: ── ⟡ ── :･ﾟ✧:･ﾟ✧',
    thinLine: '───────────────',
    bullet: '₍ᐢ..ᐢ₎',

    // ── « Saludo de bienvenida » ─────────────
    header: ({ user, botName, greeting, kaomoji }) =>
      `> Hola ${user}, soy *${botName}* ${kaomoji}\n\n` +
      `> ¡${greeting}! Aquí tienes el menú de mis comandos.`,

    // ── « Líneas de información » ────────────
    info: ({ botName, botWeb, botType, uptime, users, totalCommands }) => [
      `: ̗̀〄 ʙᴏᴛ › ${botName}`,
      `: ̗̀☁︎ ᴡᴇʙ › ${botWeb}`,
      `: ̗̀ꕥ ᴛɪᴘᴏ › ${botType}`,
      `: ̗̀☄︎ ᴀᴄᴛɪᴠᴏ › ${uptime}`,
      `: ̗̀❖ ᴜsᴜᴀʀɪᴏs › ${users}`,
      `: ̗̀❀ ᴄᴍᴅs › ${totalCommands}`
    ].join('\n'),

    // ── « Título de la lista » ───────────────
    commandsTitle: () => '✧ *LISTA DE COMANDOS* ✧',

    // ── « Pista bajo el título » ─────────────
    hint: ({ prefix, filtered, kaomojiHint }) =>
      filtered
        ? `> ${kaomojiHint} Usa *${prefix}menu* para el menú completo.`
        : `> ${kaomojiHint} Usa *${prefix}menu <categoría>* para filtrar.`,

    // ── « Encabezado de cada categoría » ─────
    categoryTitle: ({ label }) => `✐ *${label}*`,

    // ── « Línea de cada comando » ────────────
    // Dos líneas: nombre arriba, descripción abajo.
    // El detalle completo se consulta con !help <comando>
    commandLine: ({ prefix, name, description, bullet }) =>
      `${bullet} *${prefix}${name}* »` +
      (description ? `\n> ${toSmallCaps(description)}` : ''),

    // ── « Cierre del menú » ──────────────────
    footer: ({ botName, totalCommands }) =>
      `> *${botName}* ✧ ${totalCommands} comandos disponibles.`
  },

  // ══ « 7. INTELIGENCIA ARTIFICIAL » ═══════
  // El comando !ia usa una API compatible con OpenAI.
  // Pon tu API key aquí o en el .env (AI_API_KEY).
  // También sirve para APIs alternativas cambiando
  // apiUrl y model (DeepSeek, Groq, LM Studio...).
  ai: {
    apiUrl: process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    systemPrompt: 'Eres Atlas, el asistente de Atlas Bot. Responde siempre en español, de forma clara y breve.'
  },

  // ══ « 8. JUEGOS Y ECONOMÍA » ═════════════
  game: {
    startCoins: 500,   // Monedas iniciales de cada usuario
    dailyReward: 250,  // Recompensa del comando !daily
    gachaCost: 50,     // Costo de cada tirada !roll
    gachaRefund: 25,   // Reembolso si el personaje ya lo tienes
    minBet: 10         // Apuesta mínima de !apostar
  }
}

export default config
