// ╭────────────────────────────────────────────
// │  ATLAS BOT · Código de vinculación (pairing)
// │  Regla de oro: NUNCA se muestra un código que
// │  WhatsApp no haya confirmado.
// │
// │  ¿Por qué existe este archivo?
// │  Baileys (hasta 6.17.x y 7.0.0-rc14) genera el
// │  código de 8 dígitos EN LOCAL y lo devuelve tras
// │  escribir la petición en el WebSocket, SIN esperar
// │  la respuesta del servidor. Si WhatsApp rechaza ese
// │  registro (número inválido, socket aún sin negociar,
// │  etiqueta de navegador no aceptada, saturación...)
// │  el bot enseña un código "falso" y el teléfono
// │  responde que no existe.
// │
// │  Aquí se replica el registro "companion_hello" pero
// │  enviándolo con sock.query(), que SÍ espera el IQ de
// │  respuesta: si WhatsApp no lo acepta, se lanza un
// │  error real y no se muestra ningún código.
// │  (Mismo criterio del arreglo oficial de Baileys:
// │   WhiskeySockets/Baileys#2559 · issue #2560)
// ╰────────────────────────────────────────────
import * as baileys from '@whiskeysockets/baileys'
import { randomBytes } from 'node:crypto'

// ── « Constantes del protocolo » ────────────
// Alfabeto Crockford de WhatsApp: 8 caracteres sin 0, I, O ni U.
// (Ojo: la L SÍ es válida; descartarla tiraba a la basura un código
//  bueno de cada cuatro.)
const CROCKFORD = '123456789ABCDEFGHJKLMNPQRSTVWXYZ'
export const PAIRING_CODE_PATTERN = /^[1-9A-HJ-NP-TV-Z]{8}$/

// Navegador que declara el bot. Debe ser una etiqueta canónica:
// WhatsApp valida "companion_platform_display" con más rigor en el
// flujo de código que en el de QR (una etiqueta rara => 400 y código muerto).
export const DEFAULT_PAIRING_BROWSER = ['Ubuntu', 'Chrome', '20.0.04']

// Espera máxima de la respuesta de WhatsApp al registrar el código.
export const PAIRING_REQUEST_TIMEOUT = 20_000

// IDs de plataforma aceptados por WhatsApp en el flujo de código.
const PAIRING_BROWSER_IDS = {
  CHROME: '1',
  FIREFOX: '2',
  IE: '3',
  OPERA: '4',
  SAFARI: '5',
  EDGE: '6'
}
const PAIRING_BROWSER_NAMES = {
  CHROME: 'Chrome',
  FIREFOX: 'Firefox',
  IE: 'IE',
  OPERA: 'Opera',
  SAFARI: 'Safari',
  EDGE: 'Edge'
}
// Sistemas que WhatsApp reconoce en "companion_platform_display".
const PAIRING_OS_ALLOWED = new Set(['Mac OS', 'Windows', 'Ubuntu'])
const PAIRING_OS_FALLBACK = 'Mac OS'

// ── « Error con contexto (para mensajes claros al usuario) » ──
export class PairingError extends Error {
  constructor(message, { statusCode = null, reason = null, retryable = true } = {}) {
    super(message)
    this.name = 'PairingError'
    this.statusCode = statusCode
    this.reason = reason
    this.retryable = retryable
  }
}

// ── « Validación y formato del código » ─────
export const normalizePairingCode = (raw) =>
  String(raw ?? '').trim().toUpperCase().replace(/[\s\-_.]/g, '')

export const isValidPairingCode = (raw) => PAIRING_CODE_PATTERN.test(normalizePairingCode(raw))

// Genera un código de 8 caracteres (mismo algoritmo que Baileys:
// 5 bytes aleatorios -> base32 Crockford). Si por lo que sea el
// resultado no encaja, se genera uno propio carácter a carácter.
export const generatePairingCode = (lib = baileys) => {
  if (typeof lib?.bytesToCrockford === 'function') {
    try {
      const code = normalizePairingCode(lib.bytesToCrockford(randomBytes(5)))
      if (isValidPairingCode(code)) return code
    } catch {
      // se ignora: se genera manualmente abajo
    }
  }
  const bytes = randomBytes(5)
  let value = 0
  let bits = 0
  let code = ''
  for (const byte of bytes) {
    value = (value << 8) | (byte & 0xff)
    bits += 8
    while (bits >= 5) {
      code += CROCKFORD.charAt((value >>> (bits - 5)) & 31)
      bits -= 5
    }
  }
  if (bits > 0) code += CROCKFORD.charAt((value << (5 - bits)) & 31)
  return normalizePairingCode(code)
}

// Normaliza la plataforma que se declara al pedir el código.
// browser = [sistema, navegador, versión] (igual que en Baileys).
export const getPairingPlatform = (browser = DEFAULT_PAIRING_BROWSER) => {
  const [os = '', browserName = ''] = Array.isArray(browser) ? browser : []
  const key = String(browserName).toUpperCase()
  const display = PAIRING_OS_ALLOWED.has(String(os)) ? String(os) : PAIRING_OS_FALLBACK
  return {
    id: PAIRING_BROWSER_IDS[key] || PAIRING_BROWSER_IDS.CHROME,
    display: `${PAIRING_BROWSER_NAMES[key] || 'Chrome'} (${display})`
  }
}

// ¿Tenemos todo lo necesario para registrar el código nosotros mismos?
export const canRequestVerifiedCode = (lib = baileys) =>
  typeof lib?.derivePairingCodeKey === 'function' &&
  typeof lib?.aesEncryptCTR === 'function' &&
  typeof lib?.jidEncode === 'function' &&
  Boolean(lib?.S_WHATSAPP_NET)

// ── « Traducción de fallos a mensajes útiles » ──
// Ninguno de estos casos muestra un código: el usuario recibe el motivo.
export const describePairingFailure = (error) => {
  if (!error) return 'No se pudo generar el código de vinculación (error desconocido).'
  // Errores ya redactados (PairingError o mensajes internos del bot).
  if (error.name === 'PairingError') return error.message

  const status = Number(
    error?.output?.statusCode ?? error?.statusCode ?? error?.data?.statusCode ?? 0
  ) || null
  const detail = String(error?.message || error).trim()

  // Respuesta negativa de WhatsApp al registrar el código.
  if (status) {
    if (status === 408) {
      return 'WhatsApp no respondió al registrar el código. No se generó ningún código: revisa la conexión del servidor e inténtalo de nuevo.'
    }
    if (status === 400 || /bad-?request/i.test(detail)) {
      return 'WhatsApp rechazó la solicitud del código (400). Comprueba que el número exista en WhatsApp y lleve código de país, sin "+" ni espacios.'
    }
    if (status === 401 || status === 403) {
      return `WhatsApp no autorizó la vinculación (${status}). Pulsa "Reiniciar sesión" y vuelve a pedir el código.`
    }
    if (status === 404 || status === 405 || status === 406 ||
        /not-?acceptable|not-?found|not-?allowed/i.test(detail)) {
      return `WhatsApp no aceptó ese número (${status}). Verifica que esté registrado en WhatsApp y que incluya el código de país.`
    }
    if (status === 429) {
      return 'Demasiados intentos seguidos: WhatsApp bloquea las peticiones repetidas. Espera 2 o 3 minutos y vuelve a intentarlo.'
    }
    if (status >= 500) {
      return `Error del servidor de WhatsApp (${status}). No se generó ningún código: inténtalo en unos minutos.`
    }
    return `WhatsApp rechazó la petición del código (código ${status}): ${detail}`
  }

  if (/timed ?out|timeout/i.test(detail)) {
    return 'WhatsApp no respondió al registrar el código. No se generó ningún código: inténtalo de nuevo.'
  }
  if (/connection closed|conexi[oó]n.*cerr/i.test(detail)) {
    return 'La conexión con WhatsApp se cerró antes de registrar el código. No se generó ningún código: inténtalo de nuevo.'
  }
  // Error interno del bot: el mensaje ya viene redactado en español.
  return detail || 'No se pudo generar el código de vinculación.'
}

// ── « Clave efímera cifrada con el código » ──
// Idéntica a generatePairingKey() de Baileys: el servidor usa el
// código que escribe el usuario para descifrarla. Si el código no
// coincide con lo registrado, la vinculación falla.
const buildWrappedEphemeralKey = async (creds, code, lib) => {
  const ephemeral = creds?.pairingEphemeralKeyPair?.public
  if (!ephemeral || !creds?.noiseKey?.public) {
    throw new PairingError(
      'La sesión guardada no tiene las claves de vinculación. Pulsa "Reiniciar sesión" en el panel y vuelve a intentarlo.',
      { reason: 'missing-keys', retryable: false }
    )
  }
  const salt = randomBytes(32)
  const iv = randomBytes(16)
  const key = await lib.derivePairingCodeKey(code, salt)
  const ciphered = lib.aesEncryptCTR(ephemeral, key, iv)
  return Buffer.concat([salt, iv, ciphered])
}

// ── « Petición NATIVA (respaldo) » ──────────
// Solo se usa si faltan las utilidades internas de Baileys. El código
// se devuelve marcado como "sin confirmar" para que la interfaz lo
// advierta en vez de darlo por bueno.
const requestNativePairingCode = async (sock, number, { timeoutMs }) => {
  if (typeof sock?.requestPairingCode !== 'function') {
    throw new PairingError(
      'Esta versión de Baileys no permite pedir el código de vinculación. Reinstala las dependencias con npm install.',
      { reason: 'unsupported', retryable: false }
    )
  }
  let timer = null
  let raw = null
  try {
    raw = await Promise.race([
      sock.requestPairingCode(number),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new PairingError(
          'WhatsApp no confirmó el código a tiempo. No se generó ningún código.',
          { statusCode: 408, reason: 'timeout' }
        )), timeoutMs + 5_000)
        // No retener el proceso si la petición ya terminó.
        timer.unref?.()
      })
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
  const code = normalizePairingCode(raw)
  if (!isValidPairingCode(code)) {
    throw new PairingError(`WhatsApp devolvió un código inválido (${code || 'vacío'}).`, {
      reason: 'invalid-code',
      retryable: false
    })
  }
  return { code, confirmed: false, via: 'native' }
}

// ── « Petición VERIFICADA (camino principal) » ──
// Registra el código en WhatsApp y espera su respuesta:
//  - respuesta OK  -> se devuelve el código (existe de verdad)
//  - error/timeout -> se lanza PairingError y NO hay código que mostrar
export const requestVerifiedPairingCode = async (sock, number, options = {}) => {
  const {
    lib = baileys,
    browser = DEFAULT_PAIRING_BROWSER,
    timeoutMs = PAIRING_REQUEST_TIMEOUT
  } = options

  const digits = String(number ?? '').replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15 || digits.startsWith('0')) {
    throw new PairingError(
      'El número no sirve para vincular. Debe llevar código de país y solo dígitos (ej: 59896719709).',
      { reason: 'bad-number', retryable: false }
    )
  }

  const creds = sock?.authState?.creds
  if (!creds) {
    throw new PairingError('La conexión con WhatsApp no está disponible todavía.', {
      reason: 'no-socket',
      retryable: false
    })
  }
  if (creds.registered) {
    throw new PairingError(
      'Esta sesión ya está vinculada a un WhatsApp. Usa "Reiniciar sesión" para vincular otro número.',
      { reason: 'already-registered', retryable: false }
    )
  }

  // Sin las utilidades internas no se puede verificar: se usa Baileys
  // tal cual, avisando de que el código no está confirmado.
  if (!canRequestVerifiedCode(lib) || typeof sock.query !== 'function') {
    return requestNativePairingCode(sock, digits, { timeoutMs })
  }

  const code = generatePairingCode(lib)
  if (!isValidPairingCode(code)) {
    throw new PairingError('No se pudo generar un código válido. Inténtalo de nuevo.', {
      reason: 'invalid-code',
      retryable: false
    })
  }

  const jid = lib.jidEncode(digits, 's.whatsapp.net')
  const platform = getPairingPlatform(browser)
  const previousCode = creds.pairingCode

  // El código tiene que estar en creds ANTES de cifrar la clave efímera:
  // WhatsApp la descifrará con el mismo código que escriba el usuario.
  creds.pairingCode = code

  try {
    const wrapped = await buildWrappedEphemeralKey(creds, code, lib)
    const result = await sock.query({
      tag: 'iq',
      attrs: {
        to: lib.S_WHATSAPP_NET,
        type: 'set',
        id: typeof sock.generateMessageTag === 'function' ? sock.generateMessageTag() : undefined,
        xmlns: 'md'
      },
      content: [
        {
          tag: 'link_code_companion_reg',
          attrs: {
            jid,
            stage: 'companion_hello',
            should_show_push_notification: 'true'
          },
          content: [
            { tag: 'link_code_pairing_wrapped_companion_ephemeral_pub', attrs: {}, content: wrapped },
            { tag: 'companion_server_auth_key_pub', attrs: {}, content: creds.noiseKey?.public },
            { tag: 'companion_platform_id', attrs: {}, content: platform.id },
            { tag: 'companion_platform_display', attrs: {}, content: platform.display },
            { tag: 'link_code_pairing_nonce', attrs: {}, content: '0' }
          ]
        }
      ]
    }, timeoutMs)

    // Sin respuesta no hay confirmación: mejor error que código falso.
    if (!result) {
      throw new PairingError(
        'WhatsApp no respondió al registrar el código. No se generó ningún código.',
        { statusCode: 408, reason: 'timeout' }
      )
    }
  } catch (error) {
    // Se limpia el estado transitorio: un código rechazado NO debe quedar
    // guardado en la sesión (dejaría la vinculación siguiente contaminada).
    if (creds.pairingCode === code) creds.pairingCode = previousCode
    if (error instanceof PairingError) throw error
    throw new PairingError(describePairingFailure(error), {
      statusCode: Number(error?.output?.statusCode) || null,
      reason: 'server-rejected'
    })
  }

  // Confirmado por WhatsApp: recién ahora se marca la sesión como
  // "pendiente de vincular" y se guarda en disco.
  creds.me = { id: jid, name: '~' }
  try {
    sock.ev?.emit?.('creds.update', creds)
  } catch {
    // guardar la sesión no debe romper una vinculación ya confirmada
  }

  return { code, confirmed: true, via: 'verified', platform }
}
