// ╭────────────────────────────────────────────
// │  ATLAS BOT · Servidor Web y Panel
// │  - Escucha en 0.0.0.0:$PORT (requerido por Render)
// │  - Endpoint /health para Health Checks y UptimeRobot
// │  - Panel web (lib/panel.html) para ver estado, espacio
// │    libre, todos los comandos, vincular por QR o código
// │    de 8 dígitos y editar prefijo, nombre, banner y dueño
// │  - Auto-ping opcional (RENDER_EXTERNAL_URL)
// ╰────────────────────────────────────────────
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { config, ROOT_DIR } from '../config.js'
import { logger, getLogs } from './logger.js'
import { getUserCount } from './database.js'
import { formatUptime } from './utils.js'
import {
  getConnectionState,
  requestWebPairingCode,
  switchToQrMode,
  resetSession,
  logoutSession
} from './connection.js'
import { describeSettings, updateSettings, updateBanner } from './settings.js'

let serverInstance = null
let botStats = { totalCommands: 0, totalCategories: 0, commandsInfo: null }

export const setServerBotStats = (stats = {}) => {
  botStats = { ...botStats, ...stats }
}

// El panel completo vive en lib/panel.html (se cachea en memoria).
let panelHtmlCache = null
const getPanelHtml = () => {
  if (panelHtmlCache) return panelHtmlCache
  try {
    panelHtmlCache = fs.readFileSync(path.join(ROOT_DIR, 'lib', 'panel.html'), 'utf-8')
  } catch (error) {
    logger.error(`No se pudo leer lib/panel.html » ${error.message}`)
    panelHtmlCache = `<!DOCTYPE html><html lang="es"><body style="font-family:sans-serif;background:#0b0f19;color:#e6edf7;padding:32px">
      <h1>${config.botName}</h1>
      <p>No se encontró <code>lib/panel.html</code>. Revisa los archivos del proyecto.</p>
      <p><code>/health</code> sigue disponible para el health check.</p></body></html>`
  }
  return panelHtmlCache
}

// ── « Lectura del cuerpo JSON » ─────────────
const readJsonBody = (req, maxBytes = 64 * 1024) =>
  new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > maxBytes) {
        req.destroy()
        reject(new Error('Payload demasiado grande'))
      }
    })
    req.on('end', () => {
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('JSON inválido'))
      }
    })
    req.on('error', reject)
  })

const sendJson = (res, statusCode, payload) => {
  const body = JSON.stringify(payload)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  })
  res.end(body)
}

const checkAuth = (req, body = {}) => {
  const required = (config.panelPassword || '').trim()
  if (!required) return true
  const provided = String(
    body.password ||
    body.panelPassword ||
    req.headers['x-panel-password'] ||
    ''
  ).trim()
  return provided === required
}

const requireAuth = (req, res, body = {}) => {
  if (checkAuth(req, body)) return true
  sendJson(res, 401, { ok: false, error: 'Contraseña del panel incorrecta (PANEL_PASSWORD).' })
  return false
}

// ── « Espacio en disco y peso del bot » ─────
// El cálculo se cachea unos segundos: el panel consulta muy seguido.
const STORAGE_CACHE_MS = 12_000
let storageCache = { at: 0, data: null }

const dirSize = (dir, limit = 4000) => {
  let total = 0
  let files = 0
  const stack = [dir]
  while (stack.length && files < limit) {
    const current = stack.pop()
    let entries = []
    try {
      entries = fs.readdirSync(current, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) stack.push(full)
      else if (entry.isFile()) {
        try {
          const stat = fs.statSync(full)
          total += stat.size
          files++
        } catch {}
      }
    }
  }
  return { bytes: total, files }
}

const getStorageInfo = () => {
  if (storageCache.data && Date.now() - storageCache.at < STORAGE_CACHE_MS) {
    return { ...storageCache.data, cached: true }
  }

  // Espacio del disco donde vive el bot (Render / VPS / Termux).
  let disk = null
  try {
    const stat = fs.statfsSync(ROOT_DIR)
    const total = Number(stat.blocks) * Number(stat.bsize)
    const free = Number(stat.bavail) * Number(stat.bsize)
    const used = total - Number(stat.bfree) * Number(stat.bsize)
    disk = {
      total,
      free,
      used,
      usedPercent: total ? Math.round((used / total) * 1000) / 10 : 0,
      freePercent: total ? Math.round((free / total) * 1000) / 10 : 0
    }
  } catch {
    disk = null
  }

  const sessionPath = path.resolve(config.sessionName)
  const data = {
    disk,
    dirs: {
      session: dirSize(sessionPath),
      database: dirSize(path.join(ROOT_DIR, 'database')),
      assets: dirSize(path.join(ROOT_DIR, 'assets'))
    },
    memory: {
      rss: process.memoryUsage().rss,
      heapUsed: process.memoryUsage().heapUsed,
      heapTotal: process.memoryUsage().heapTotal
    },
    storagePath: ROOT_DIR,
    checkedAt: Date.now()
  }

  storageCache = { at: Date.now(), data }
  return { ...data, cached: false }
}

// ── « Datos para el panel » ─────────────────
const buildStatus = (url) => {
  const state = getConnectionState()
  const includeQr = url?.searchParams?.get('qr') === '1'

  return {
    ok: true,
    botName: config.botName,
    botVersion: config.botVersion,
    ownerName: config.ownerName,
    ownerNumbers: config.ownerNumbers,
    prefix: config.prefix,
    totalCommands: botStats.totalCommands || 0,
    totalCategories: botStats.totalCategories || 0,
    totalUsers: getUserCount(),
    uptime: Math.floor(process.uptime()),
    uptimeFormatted: formatUptime(process.uptime()),
    node: process.version,
    protected: Boolean((config.panelPassword || '').trim()),
    storage: getStorageInfo(),
    settings: describeSettings(),
    connection: {
      status: state.status,
      method: state.method,
      hasQr: Boolean(state.qrSvg),
      qrToken: state.qrSvg ? String(state.updatedAt) : null,
      qrSvg: includeQr ? state.qrSvg : null,
      pairingCode: state.pairingCode,
      pairingNumber: state.pairingNumber,
      pairingIssuedAt: state.pairingIssuedAt,
      pairingError: state.pairingError,
      user: state.user,
      lastError: state.lastError,
      updatedAt: state.updatedAt
    },
    logs: getLogs(30)
  }
}

// ── « Panel y API » ─────────────────────────
export function startServer(stats = {}) {
  setServerBotStats(stats)
  if (serverInstance) return serverInstance

  const port = Number(process.env.PORT) || Number(config.port) || 3000
  const host = '0.0.0.0'

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    const pathname = url.pathname

    try {
      // 1. Health Check para Render y UptimeRobot
      if (req.method === 'GET' && (pathname === '/health' || pathname === '/ping' || pathname === '/healthz')) {
        const state = getConnectionState()
        return sendJson(res, 200, {
          ok: true,
          bot: config.botName,
          version: config.botVersion,
          status: state.status,
          connected: state.status === 'connected',
          uptime: Math.floor(process.uptime())
        })
      }

      // 2. Estado JSON para el panel web
      if (req.method === 'GET' && (pathname === '/api/status' || pathname === '/status')) {
        return sendJson(res, 200, buildStatus(url))
      }

      // 3. Espacio libre y peso del bot
      if (req.method === 'GET' && pathname === '/api/storage') {
        return sendJson(res, 200, { ok: true, ...getStorageInfo() })
      }

      // 4. Todos los comandos (buscador y filtros del panel)
      if (req.method === 'GET' && pathname === '/api/commands') {
        const info = botStats.commandsInfo || { total: 0, categories: [], list: [] }
        const q = (url.searchParams.get('q') || '').trim().toLowerCase()
        const category = (url.searchParams.get('category') || '').trim().toLowerCase()

        let list = info.list
        if (category && category !== 'todas') {
          list = list.filter(command => command.category === category)
        }
        if (q) {
          list = list.filter(command =>
            command.name.includes(q) ||
            command.description.toLowerCase().includes(q) ||
            command.label.toLowerCase().includes(q) ||
            command.aliases.some(alias => alias.includes(q))
          )
        }

        return sendJson(res, 200, {
          ok: true,
          total: info.total,
          filtered: list.length,
          prefix: config.prefix,
          categories: info.categories,
          commands: list
        })
      }

      // 5. Ajustes del bot (prefijo, nombre, banner, dueño)
      if (req.method === 'GET' && pathname === '/api/settings') {
        if (!requireAuth(req, res)) return
        return sendJson(res, 200, { ok: true, settings: describeSettings() })
      }

      if (req.method === 'POST' && pathname === '/api/settings') {
        const body = await readJsonBody(req, 8 * 1024 * 1024)
        if (!requireAuth(req, res, body)) return
        const settings = await updateSettings(body)
        return sendJson(res, 200, {
          ok: true,
          message: 'Ajustes guardados. Se aplicaron al bot al instante.',
          settings
        })
      }

      // 6. Banner del menú (ver, subir, restaurar)
      if (req.method === 'GET' && pathname === '/api/banner') {
        const { banner, bannerExists } = describeSettings()
        if (!banner || !bannerExists) {
          return sendJson(res, 404, { ok: false, error: 'Sin banner configurado' })
        }
        const file = path.resolve(ROOT_DIR, banner)
        const ext = path.extname(file).toLowerCase()
        const types = {
          '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
          '.webp': 'image/webp', '.gif': 'image/gif'
        }
        try {
          const data = fs.readFileSync(file)
          res.writeHead(200, {
            'Content-Type': types[ext] || 'application/octet-stream',
            'Content-Length': data.length,
            'Cache-Control': 'no-store'
          })
          return res.end(data)
        } catch {
          return sendJson(res, 404, { ok: false, error: 'No se pudo leer el banner' })
        }
      }

      if (req.method === 'POST' && pathname === '/api/banner') {
        const body = await readJsonBody(req, 8 * 1024 * 1024)
        if (!requireAuth(req, res, body)) return

        // Acepta: { data: 'data:image/...' } (subida), { url },
        // { mode: 'default' | 'none' } o { banner: 'ruta/o/url' }.
        let input
        if (body.mode === 'none') input = 'none'
        else if (body.mode === 'default') input = 'default'
        else input = body.data ?? body.url ?? body.banner ?? undefined

        const settings = await updateBanner(input)
        return sendJson(res, 200, { ok: true, settings })
      }

      // 7. Solicitar código de vinculación desde la web
      //    Devuelve { code } si WhatsApp ya lo confirmó o { pending: true }
      //    si todavía está tardando (el panel lo muestra con su sondeo).
      if (req.method === 'POST' && pathname === '/api/pair') {
        const body = await readJsonBody(req)
        if (!requireAuth(req, res, body)) return
        const result = await requestWebPairingCode(body.number, { force: Boolean(body.force) })
        return sendJson(res, 200, {
          ok: true,
          code: result.code || null,
          pending: Boolean(result.pending),
          number: result.number,
          issuedAt: result.issuedAt || Date.now(),
          message: result.message
        })
      }

      // 8. Cambiar a modo QR desde la web
      if (req.method === 'POST' && pathname === '/api/qr') {
        const body = await readJsonBody(req)
        if (!requireAuth(req, res, body)) return
        await switchToQrMode()
        return sendJson(res, 200, { ok: true })
      }

      // 9. Reiniciar sesión de WhatsApp desde la web
      if (req.method === 'POST' && pathname === '/api/reset-session') {
        const body = await readJsonBody(req)
        if (!requireAuth(req, res, body)) return
        await resetSession()
        return sendJson(res, 200, { ok: true })
      }

      // 10. Cerrar la sesión (desvincular el dispositivo) sin apagar el bot
      if (req.method === 'POST' && pathname === '/api/logout') {
        const body = await readJsonBody(req)
        if (!requireAuth(req, res, body)) return
        await logoutSession()
        return sendJson(res, 200, { ok: true })
      }

      // 11. SVG del QR en /qr (el panel lo usa como <img>)
      if (req.method === 'GET' && pathname === '/qr') {
        const state = getConnectionState()
        if (state.qrSvg) {
          res.writeHead(200, {
            'Content-Type': 'image/svg+xml; charset=utf-8',
            'Cache-Control': 'no-store'
          })
          return res.end(state.qrSvg)
        }
        res.writeHead(302, { Location: '/' })
        return res.end()
      }

      // 12. Panel principal en / (y /panel)
      if (req.method === 'GET' && (pathname === '/' || pathname === '/panel')) {
        const html = getPanelHtml()
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store'
        })
        return res.end(html)
      }

      return sendJson(res, 404, { ok: false, error: 'Ruta no encontrada' })
    } catch (error) {
      // Errores de validación (ajustes, número, banner...) devuelven 400
      // con el detalle para que el panel lo muestre tal cual.
      return sendJson(res, 400, {
        ok: false,
        error: error?.message || 'Error en la solicitud',
        details: error?.details || null
      })
    }
  })

  server.on('error', (error) => {
    logger.error(`Error en el servidor HTTP (puerto ${port}): ${error.message}`)
  })

  server.listen(port, host, () => {
    logger.success(`Servidor web y panel activos en http://${host}:${port}`)
    if (process.env.RENDER_EXTERNAL_URL) {
      logger.info(`Panel en Render : ${process.env.RENDER_EXTERNAL_URL}`)
    }
  })

  // Auto-ping cada 10 minutos cuando corre en Render para mantener activo el servicio
  const keepAliveUrl = (config.keepAliveUrl || process.env.RENDER_EXTERNAL_URL || '').trim()
  if (keepAliveUrl && /^https?:\/\//i.test(keepAliveUrl)) {
    const pingUrl = `${keepAliveUrl.replace(/\/+$/, '')}/health`
    setInterval(() => {
      fetch(pingUrl).catch(() => null)
    }, 10 * 60 * 1000).unref()
  }

  serverInstance = server
  return server
}
