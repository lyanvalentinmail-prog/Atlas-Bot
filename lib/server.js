// ╭────────────────────────────────────────────
// │  ATLAS BOT · Servidor Web y Panel para Render
// │  - Escucha en 0.0.0.0:$PORT (requerido por Render)
// │  - Endpoint /health para Health Checks y UptimeRobot
// │  - Panel web en / para ver estado, escanear QR
// │    o generar código de vinculación desde el navegador
// │  - Auto-ping opcional (RENDER_EXTERNAL_URL)
// ╰────────────────────────────────────────────
import http from 'node:http'
import process from 'node:process'
import { config } from '../config.js'
import { logger, getLogs } from './logger.js'
import { getUserCount } from './database.js'
import { formatUptime } from './utils.js'
import {
  getConnectionState,
  requestWebPairingCode,
  switchToQrMode,
  resetSession
} from './connection.js'

let serverInstance = null
let botStats = { totalCommands: 0, totalCategories: 0 }

export const setServerBotStats = (stats = {}) => {
  botStats = { ...botStats, ...stats }
}

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 32_768) {
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
    req.headers['x-panel-password'] ||
    ''
  ).trim()
  return provided === required
}

const renderDashboardHtml = () => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.botName} · Panel Render</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card: #131b2e;
      --card-border: #22304f;
      --text: #e6edf7;
      --muted: #8fa1c1;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --ok: #10b981;
      --warn: #f59e0b;
      --err: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: radial-gradient(circle at top, #17223b 0%, var(--bg) 65%);
      color: var(--text);
      min-height: 100vh;
      padding: 24px 16px 48px;
    }
    .container { max-width: 960px; margin: 0 auto; }
    header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 20px 24px;
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      margin-bottom: 20px;
    }
    .brand h1 { font-size: 1.45rem; letter-spacing: 0.5px; }
    .brand p { color: var(--muted); font-size: 0.9rem; margin-top: 4px; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 0.88rem;
      font-weight: 600;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
    }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--warn); }
    .badge.connected .dot { background: var(--ok); box-shadow: 0 0 10px var(--ok); }
    .badge.qr .dot, .badge.pairing .dot { background: var(--warn); box-shadow: 0 0 10px var(--warn); }
    .badge.disconnected .dot { background: var(--err); }

    .grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 20px;
    }
    @media (max-width: 780px) { .grid { grid-template-columns: 1fr; } }

    .card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 22px;
    }
    .card h2 {
      font-size: 1.08rem;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    .stat {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .stat .label { color: var(--muted); font-size: 0.78rem; text-transform: uppercase; }
    .stat .val { font-size: 1.05rem; font-weight: 600; margin-top: 4px; word-break: break-all; }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .tab-btn {
      flex: 1;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--card-border);
      background: rgba(255,255,255,0.03);
      color: var(--text);
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: 0.15s;
    }
    .tab-btn.active {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }

    .link-box {
      text-align: center;
      padding: 18px;
      background: rgba(0,0,0,0.22);
      border-radius: 12px;
      border: 1px dashed var(--card-border);
      min-height: 290px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .qr-wrap svg {
      border-radius: 12px;
      max-width: 250px;
      height: auto;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .pair-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: 4px;
      color: #fff;
      background: rgba(99, 102, 241, 0.18);
      border: 1px solid var(--accent);
      padding: 14px 22px;
      border-radius: 12px;
      user-select: all;
    }
    .input-row {
      display: flex;
      gap: 8px;
      width: 100%;
      max-width: 360px;
      margin-top: 6px;
    }
    input {
      flex: 1;
      padding: 11px 14px;
      border-radius: 10px;
      border: 1px solid var(--card-border);
      background: #0b101d;
      color: var(--text);
      font-size: 0.95rem;
      outline: none;
    }
    input:focus { border-color: var(--accent); }
    button.primary {
      padding: 11px 16px;
      border-radius: 10px;
      border: none;
      background: var(--accent);
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: 0.15s;
    }
    button.primary:hover { background: var(--accent-hover); }
    button.secondary {
      padding: 8px 13px;
      border-radius: 8px;
      border: 1px solid var(--card-border);
      background: rgba(255,255,255,0.05);
      color: var(--muted);
      font-size: 0.82rem;
      cursor: pointer;
    }
    button.secondary:hover { color: #fff; border-color: var(--muted); }
    .hint { color: var(--muted); font-size: 0.85rem; line-height: 1.45; max-width: 380px; }
    .msg { font-size: 0.85rem; margin-top: 6px; }
    .msg.err { color: #f87171; }
    .msg.ok { color: #34d399; }

    .logs {
      background: #080c14;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.78rem;
      color: #b6c4de;
      height: 340px;
      overflow-y: auto;
      white-space: pre-wrap;
      line-height: 1.5;
    }
    .actions-footer {
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <h1 id="botTitle">${config.botName}</h1>
        <p>Panel de control y vinculación en vivo · Render Ready</p>
      </div>
      <div id="statusBadge" class="badge">
        <span class="dot"></span>
        <span id="statusText">Cargando estado...</span>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <h2>
          <span>Vinculación de WhatsApp</span>
          <button class="secondary" onclick="resetBotSession()">Reiniciar sesión</button>
        </h2>

        <div class="tabs" id="modeTabs">
          <button class="tab-btn active" id="tabQr" onclick="selectTab('qr')">Código QR</button>
          <button class="tab-btn" id="tabPair" onclick="selectTab('pairing')">Código de 8 dígitos</button>
        </div>

        <div id="passwordBox" style="display:none; margin-bottom: 12px;">
          <input type="password" id="panelPassword" placeholder="Contraseña del panel (PANEL_PASSWORD)" style="width:100%;" />
        </div>

        <div class="link-box" id="linkContent">
          <p class="hint">Consultando estado de la conexión...</p>
        </div>
        <div id="actionMsg" class="msg"></div>
      </div>

      <div class="card">
        <h2>Estado del Bot</h2>
        <div class="stats">
          <div class="stat">
            <div class="label">Cuenta vinculada</div>
            <div class="val" id="statAccount">Sin vincular</div>
          </div>
          <div class="stat">
            <div class="label">Tiempo activo</div>
            <div class="val" id="statUptime">0s</div>
          </div>
          <div class="stat">
            <div class="label">Comandos / Categorías</div>
            <div class="val" id="statCommands">0</div>
          </div>
          <div class="stat">
            <div class="label">Prefijo / Dueño</div>
            <div class="val" id="statPrefix">!</div>
          </div>
        </div>

        <h2>Consola en vivo</h2>
        <div class="logs" id="logBox">Cargando registros...</div>
      </div>
    </div>
  </div>

  <script>
    let currentTab = 'qr';
    let lastStatus = null;

    function setMsg(text, isErr = false) {
      const el = document.getElementById('actionMsg');
      el.textContent = text || '';
      el.className = 'msg ' + (isErr ? 'err' : 'ok');
    }

    function getPassword() {
      const el = document.getElementById('panelPassword');
      return el ? el.value : '';
    }

    async function selectTab(tab) {
      currentTab = tab;
      document.getElementById('tabQr').classList.toggle('active', tab === 'qr');
      document.getElementById('tabPair').classList.toggle('active', tab === 'pairing');
      setMsg('');
      if (tab === 'qr' && lastStatus?.connection?.status !== 'connected' && !lastStatus?.connection?.hasQr) {
        try {
          await fetch('/api/qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: getPassword() })
          });
        } catch {}
      }
      renderLinkBox(lastStatus);
    }

    async function requestPair(e) {
      if (e) e.preventDefault();
      const input = document.getElementById('phoneInput');
      const number = input ? input.value.trim() : '';
      if (!number) {
        setMsg('Escribe tu número con código de país (ej: 59896719709).', true);
        return;
      }
      setMsg('Solicitando código de vinculación a WhatsApp...');
      try {
        const res = await fetch('/api/pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number, password: getPassword() })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setMsg(data.error || 'No se pudo generar el código.', true);
        } else {
          setMsg('¡Código generado! Ingrésalo en WhatsApp » Dispositivos vinculados.');
          fetchStatus();
        }
      } catch (err) {
        setMsg('Error de red al solicitar el código.', true);
      }
    }

    async function resetBotSession() {
      if (!confirm('¿Seguro que deseas cerrar y reiniciar la sesión actual de WhatsApp?')) return;
      setMsg('Reiniciando sesión...');
      try {
        const res = await fetch('/api/reset-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: getPassword() })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setMsg(data.error || 'No se pudo reiniciar la sesión.', true);
        } else {
          currentTab = 'qr';
          setMsg('Sesión reiniciada. Esperando nuevo código QR...');
          fetchStatus();
        }
      } catch {
        setMsg('Error al reiniciar la sesión.', true);
      }
    }

    function renderLinkBox(data) {
      if (!data) return;
      const conn = data.connection || {};
      const box = document.getElementById('linkContent');
      const tabs = document.getElementById('modeTabs');

      if (conn.status === 'connected') {
        tabs.style.display = 'none';
        const u = conn.user || {};
        box.innerHTML =
          '<div style="font-size:2.6rem;">✓</div>' +
          '<h3 style="color:#10b981;">¡Bot conectado y activo!</h3>' +
          '<p class="hint">Vinculado a <b>' + (u.name || 'WhatsApp') + '</b> (+' + (u.number || '') + ').<br/>' +
          'Envía <b>' + (data.prefix || '!') + 'menu</b> en WhatsApp para probarlo.</p>';
        return;
      }

      tabs.style.display = 'flex';

      if (currentTab === 'pairing') {
        const savedPhone = document.getElementById('phoneInput')?.value || conn.pairingNumber || '';
        const activeElem = document.activeElement;
        const isTyping = activeElem && activeElem.id === 'phoneInput';
        if (isTyping) return;

        box.innerHTML =
          (conn.pairingCode
            ? '<div class="pair-code">' + conn.pairingCode + '</div>' +
              '<p class="hint">En WhatsApp ve a <b>Ajustes » Dispositivos vinculados » Vincular con el número de teléfono</b> e introduce este código.</p>'
            : '<p class="hint">Ingresa tu número de WhatsApp con código de país (sin "+" ni espacios) para recibir un código de 8 dígitos:</p>') +
          '<form class="input-row" onsubmit="requestPair(event)">' +
            '<input id="phoneInput" type="text" placeholder="Ej: 59896719709" value="' + savedPhone + '" />' +
            '<button type="submit" class="primary">Obtener código</button>' +
          '</form>';
        return;
      }

      // Modo QR
      if (conn.qrSvg) {
        box.innerHTML =
          '<div class="qr-wrap">' + conn.qrSvg + '</div>' +
          '<p class="hint">Abre WhatsApp » <b>Dispositivos vinculados</b> » <b>Vincular un dispositivo</b> y escanea este QR.</p>';
      } else {
        box.innerHTML =
          '<p class="hint">Generando código QR de WhatsApp...<br/>Si tarda más de unos segundos, pulsa en "Reiniciar sesión" o usa el "Código de 8 dígitos".</p>';
      }
    }

    async function fetchStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        lastStatus = data;

        document.getElementById('passwordBox').style.display = data.protected ? 'block' : 'none';
        const conn = data.connection || {};
        const badge = document.getElementById('statusBadge');
        const statusText = document.getElementById('statusText');

        badge.className = 'badge ' + (conn.status || '');
        const labels = {
          connected: 'Conectado a WhatsApp',
          qr: 'Esperando escaneo de QR',
          pairing: 'Modo código de vinculación',
          reconnecting: 'Reconectando...',
          starting: 'Iniciando bot...',
          disconnected: 'Desconectado'
        };
        statusText.textContent = labels[conn.status] || conn.status || 'Activo';

        document.getElementById('statAccount').textContent =
          conn.user?.number ? ('+' + conn.user.number + ' (' + (conn.user.name || 'Bot') + ')') : 'Sin vincular';
        document.getElementById('statUptime').textContent = data.uptimeFormatted || '0s';
        document.getElementById('statCommands').textContent =
          (data.totalCommands || 0) + ' cmds · ' + (data.totalCategories || 0) + ' categorías';
        document.getElementById('statPrefix').textContent =
          '[ ' + (data.prefix || '!') + ' ] · ' + (data.ownerName || 'Sin definir');

        const logBox = document.getElementById('logBox');
        const atBottom = logBox.scrollHeight - logBox.scrollTop - logBox.clientHeight < 40;
        logBox.textContent = (data.logs || []).join('\\n') || 'Sin registros aún.';
        if (atBottom) logBox.scrollTop = logBox.scrollHeight;

        renderLinkBox(data);
      } catch {}
    }

    fetchStatus();
    setInterval(fetchStatus, 2500);
  </script>
</body>
</html>`

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
        const state = getConnectionState()
        return sendJson(res, 200, {
          ok: true,
          botName: config.botName,
          botVersion: config.botVersion,
          ownerName: config.ownerName,
          prefix: config.prefix,
          totalCommands: botStats.totalCommands || 0,
          totalCategories: botStats.totalCategories || 0,
          totalUsers: getUserCount(),
          uptime: Math.floor(process.uptime()),
          uptimeFormatted: formatUptime(process.uptime()),
          protected: Boolean((config.panelPassword || '').trim()),
          connection: {
            status: state.status,
            method: state.method,
            hasQr: Boolean(state.qrSvg),
            qrSvg: state.qrSvg,
            pairingCode: state.pairingCode,
            pairingNumber: state.pairingNumber,
            user: state.user,
            lastError: state.lastError,
            updatedAt: state.updatedAt
          },
          logs: getLogs(30)
        })
      }

      // 3. SVG directo del QR en /qr
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

      // 4. Solicitar código de vinculación desde la web
      if (req.method === 'POST' && pathname === '/api/pair') {
        const body = await readJsonBody(req)
        if (!checkAuth(req, body)) {
          return sendJson(res, 401, { ok: false, error: 'Contraseña del panel incorrecta (PANEL_PASSWORD).' })
        }
        const code = await requestWebPairingCode(body.number)
        return sendJson(res, 200, { ok: true, code, number: body.number })
      }

      // 5. Cambiar a modo QR desde la web
      if (req.method === 'POST' && pathname === '/api/qr') {
        const body = await readJsonBody(req)
        if (!checkAuth(req, body)) {
          return sendJson(res, 401, { ok: false, error: 'Contraseña del panel incorrecta (PANEL_PASSWORD).' })
        }
        await switchToQrMode()
        return sendJson(res, 200, { ok: true })
      }

      // 6. Reiniciar sesión de WhatsApp desde la web
      if (req.method === 'POST' && pathname === '/api/reset-session') {
        const body = await readJsonBody(req)
        if (!checkAuth(req, body)) {
          return sendJson(res, 401, { ok: false, error: 'Contraseña del panel incorrecta (PANEL_PASSWORD).' })
        }
        await resetSession()
        return sendJson(res, 200, { ok: true })
      }

      // 7. Panel principal en /
      if (req.method === 'GET' && pathname === '/') {
        const html = renderDashboardHtml()
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store'
        })
        return res.end(html)
      }

      return sendJson(res, 404, { ok: false, error: 'Ruta no encontrada' })
    } catch (error) {
      return sendJson(res, 400, { ok: false, error: error.message || 'Error en la solicitud' })
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
