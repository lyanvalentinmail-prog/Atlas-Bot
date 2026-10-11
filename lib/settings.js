// ╭────────────────────────────────────────────
// │  ATLAS BOT · Ajustes editables desde el panel web
// │  - Prefijo global, nombre del bot, dueño y números
// │  - Banner del menú (por defecto, subido, URL o ninguno)
// │  Se guardan en database/db.json y se aplican en vivo,
// │  sin reiniciar el bot. Lo del .env actúa como valor
// │  por defecto.
// ╰────────────────────────────────────────────
import fs from 'node:fs'
import path from 'node:path'
import { config, ROOT_DIR } from '../config.js'
import { getBotSettings, setBotSettings } from './database.js'
import { logger } from './logger.js'

// Banner que trae el proyecto de fábrica.
export const DEFAULT_BANNER = 'assets/banner.jpg'

// Carpeta para las imágenes que sube el usuario (está en .gitignore).
const BANNER_DIR = path.join(ROOT_DIR, 'database')
const BANNER_BASENAME = 'banner'
const MAX_BANNER_BYTES = 5 * 1024 * 1024 // 5 MB

// Tipos de imagen aceptados (para subidas y descargas).
const BANNER_TYPES = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
}

const cleanLine = (value, max = 60) =>
  String(value ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max)

// Acepta "59896719709, 521234567890" (o un array) y devuelve números limpios.
const parseOwnerNumbers = (value) => {
  const list = Array.isArray(value)
    ? value
    : String(value ?? '').split(/[,;\s]+/)
  const numbers = []
  for (const item of list) {
    let number = String(item ?? '').replace(/[^0-9]/g, '')
    if (number.startsWith('00')) number = number.slice(2)
    if (!number) continue
    if (!numbers.includes(number)) numbers.push(number)
  }
  return numbers
}

// ── « Validación » ──────────────────────────
// Devuelve { ok, value, errors } con los campos ya normalizados.
export const sanitizeSettings = (patch = {}) => {
  const errors = []
  const value = {}

  if ('prefix' in patch) {
    const prefix = String(patch.prefix ?? '').trim()
    if (!prefix) errors.push('El prefijo no puede estar vacío.')
    else if (prefix.length > 4) errors.push('El prefijo admite como máximo 4 símbolos.')
    else if (/\s/.test(prefix)) errors.push('El prefijo no puede llevar espacios.')
    else if (/[\p{L}\p{N}]/u.test(prefix)) errors.push('El prefijo debe ser de símbolos (sin letras ni números).')
    else value.prefix = prefix
  }

  if ('botName' in patch) {
    const botName = cleanLine(patch.botName, 32)
    if (!botName) errors.push('El nombre del bot no puede estar vacío.')
    else value.botName = botName
  }

  if ('ownerName' in patch) {
    value.ownerName = cleanLine(patch.ownerName, 32) || 'Sin definir'
  }

  if ('ownerNumbers' in patch) {
    const numbers = parseOwnerNumbers(patch.ownerNumbers)
    const invalid = numbers.filter(number => number.length < 8 || number.length > 15)
    if (invalid.length) {
      errors.push(`Revisa estos números (8 a 15 dígitos, con código de país): ${invalid.join(', ')}`)
    } else {
      value.ownerNumbers = numbers
    }
  }

  return { ok: errors.length === 0, value, errors }
}

// ── « Banner » ──────────────────────────────
const bannerFilePath = (bannerPath) =>
  bannerPath ? path.resolve(ROOT_DIR, bannerPath) : null

export const bannerExists = (bannerPath) => {
  const file = bannerFilePath(bannerPath)
  return Boolean(file && fs.existsSync(file))
}

const deleteOldBanners = (except = null) => {
  try {
    for (const file of fs.readdirSync(BANNER_DIR)) {
      if (!file.startsWith(`${BANNER_BASENAME}.`)) continue
      const full = path.join(BANNER_DIR, file)
      if (except && path.resolve(full) === path.resolve(except)) continue
      fs.rmSync(full, { force: true }) // libera espacio: solo se guarda el banner actual
    }
  } catch {}
}

const saveBannerBuffer = (buffer, ext = 'jpg') => {
  fs.mkdirSync(BANNER_DIR, { recursive: true })
  const file = path.join(BANNER_DIR, `${BANNER_BASENAME}.${ext}`)
  fs.writeFileSync(file, buffer)
  deleteOldBanners(file)
  return path.relative(ROOT_DIR, file).split(path.sep).join('/')
}

// Descarga una imagen de Internet y la guarda como banner local.
const downloadBanner = async (url) => {
  const response = await fetch(url, { redirect: 'follow' })
  if (!response.ok) throw new Error(`La descarga respondió ${response.status}.`)

  const type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
  const ext = BANNER_TYPES[type]
  if (!ext) throw new Error('La URL no devolvió una imagen (jpg, png, webp o gif).')

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length > MAX_BANNER_BYTES) throw new Error('La imagen supera los 5 MB.')
  return saveBannerBuffer(buffer, ext)
}

// Acepta una subida en base64 (data URL o base64 puro).
const saveUploadedBanner = (data) => {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(String(data || '').trim())
  const mime = (match?.[1] || 'image/jpeg').toLowerCase()
  const base64 = (match?.[3] || String(data || '')).trim()

  const ext = BANNER_TYPES[mime]
  if (!ext) throw new Error('Formato no soportado. Usa JPG, PNG, WEBP o GIF.')

  const buffer = Buffer.from(base64, 'base64')
  if (!buffer.length) throw new Error('La imagen llegó vacía.')
  if (buffer.length > MAX_BANNER_BYTES) throw new Error('La imagen supera los 5 MB.')
  return saveBannerBuffer(buffer, ext)
}

// Resuelve el valor del campo "banner" que envía el panel.
//   'default'            » banner del proyecto (assets/banner.jpg)
//   'none' / null / ''   » menú solo de texto
//   'https://...'        » se descarga y queda como banner local
//   'data:image/...'     » subida desde el dispositivo
//   'carpeta/archivo'    » ruta relativa a la raíz del proyecto
const resolveBanner = async (input) => {
  if (input === undefined) return undefined

  const raw = String(input ?? '').trim()
  if (!raw || raw === 'default') return DEFAULT_BANNER
  if (raw === 'none' || raw === 'null') return null

  if (/^https?:\/\//i.test(raw)) return downloadBanner(raw)

  if (/^data:image\//i.test(raw)) return saveUploadedBanner(raw)

  const clean = raw.replace(/^\.\//, '')
  if (!bannerExists(clean)) throw new Error(`No existe el archivo "${clean}" en el proyecto.`)
  return clean
}

// ── « Aplicar a la configuración en vivo » ──
export const applySettings = (settings = {}) => {
  if (settings.prefix) config.prefix = settings.prefix
  if (settings.botName) config.botName = settings.botName
  if (settings.ownerName) config.ownerName = settings.ownerName
  if (Array.isArray(settings.ownerNumbers)) config.ownerNumbers = [...settings.ownerNumbers]
  if ('banner' in settings) config.menu.banner = settings.banner
  return describeSettings()
}

// Datos que el panel web muestra en la pestaña de ajustes.
export const describeSettings = () => {
  const banner = config.menu?.banner ?? null
  const exists = bannerExists(banner)
  let bannerLabel = 'Sin banner (menú solo de texto)'

  if (banner) {
    if (!exists) bannerLabel = `Archivo no encontrado: ${banner}`
    else if (banner === DEFAULT_BANNER) bannerLabel = 'Banner del proyecto'
    else if (banner.startsWith('database/')) bannerLabel = 'Imagen subida desde el panel'
    else bannerLabel = banner
  }

  return {
    prefix: config.prefix,
    botName: config.botName,
    ownerName: config.ownerName,
    ownerNumbers: [...(config.ownerNumbers || [])],
    ownerNumbersText: (config.ownerNumbers || []).join(', '),
    banner,
    bannerIsDefault: banner === DEFAULT_BANNER,
    bannerExists: exists,
    bannerLabel,
    bannerUrl: exists ? `/api/banner?v=${encodeURIComponent(banner)}` : null,
    defaultBanner: DEFAULT_BANNER
  }
}

// Si el banner activo no es una imagen subida, borra las que ya no sirven
// (así no se acumula espacio en el servidor).
const pruneUploadedBanners = () => {
  if (!String(config.menu?.banner || '').startsWith('database/')) deleteOldBanners(null)
}

// Guarda y aplica. `patch` puede traer todos los campos o solo algunos.
export const updateSettings = async (patch = {}) => {
  const { ok, value, errors } = sanitizeSettings(patch)
  if (!ok) {
    const error = new Error(errors.join(' '))
    error.details = errors
    throw error
  }

  if ('banner' in patch) {
    value.banner = await resolveBanner(patch.banner)
  }

  setBotSettings(value)
  applySettings(value)
  pruneUploadedBanners()
  logger.info(
    `Ajustes del panel guardados » prefijo: ${config.prefix} ・ bot: ${config.botName} ` +
    `・ dueño: ${config.ownerName} ・ banner: ${config.menu.banner || 'ninguno'}`
  )
  return describeSettings()
}

// Sube/reemplaza el banner (endpoint /api/banner).
export const updateBanner = async (input) => {
  const banner = await resolveBanner(input)
  if (banner === undefined) throw new Error('No se recibió la imagen.')
  setBotSettings({ banner })
  config.menu.banner = banner
  pruneUploadedBanners()
  logger.info(`Banner del menú actualizado » ${banner || 'sin banner'}`)
  return describeSettings()
}

// Se llama al arrancar: aplica lo que se guardó desde el panel web.
export const loadStoredSettings = () => {
  const stored = getBotSettings()
  if (!Object.keys(stored).length) return describeSettings()

  if ('banner' in stored && stored.banner && !bannerExists(stored.banner)) {
    logger.warn(`El banner guardado "${stored.banner}" ya no existe. Se usa el del proyecto.`)
    stored.banner = DEFAULT_BANNER
  }

  applySettings(stored)
  logger.info(
    `Ajustes restaurados del panel » prefijo: ${config.prefix} ・ bot: ${config.botName} ` +
    `・ dueño: ${config.ownerName}`
  )
  return describeSettings()
}
