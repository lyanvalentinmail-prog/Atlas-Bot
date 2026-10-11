// ╭────────────────────────────────────────────
// │  ATLAS BOT · Pruebas del código de vinculación
// │  Regla que se verifica aquí: el bot NO muestra
// │  ningún código que WhatsApp no haya confirmado.
// │
// │  Ejecutar:  npm test
// ╰────────────────────────────────────────────
import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import {
  DEFAULT_PAIRING_BROWSER,
  PairingError,
  canRequestVerifiedCode,
  describePairingFailure,
  generatePairingCode,
  getPairingPlatform,
  isValidPairingCode,
  normalizePairingCode,
  requestVerifiedPairingCode
} from '../lib/pairing.js'

const NUMERO = '59896719709'

// Credenciales mínimas (solo se necesitan las claves públicas en buffer).
const mockCreds = (extra = {}) => ({
  registered: false,
  noiseKey: { public: Buffer.alloc(32, 7) },
  signedIdentityKey: { public: Buffer.alloc(32, 3) },
  pairingEphemeralKeyPair: { public: Buffer.alloc(32, 5), private: Buffer.alloc(32, 9) },
  ...extra
})

// Socket de pega: registra lo que se envía y permite decidir la respuesta.
const mockSocket = ({ creds = mockCreds(), query, nativeCode = 'ABCD1234' } = {}) => {
  const eventos = []
  const ev = new EventEmitter()
  ev.on('creds.update', () => eventos.push('creds.update'))
  let etiqueta = 0
  return {
    ev,
    eventos,
    authState: { creds },
    generateMessageTag: () => `atlas-${++etiqueta}`,
    query: query || (async () => ({ tag: 'iq', attrs: { type: 'result' } })),
    requestPairingCode: async () => nativeCode
  }
}

// Error estilo Boom (los que lanza Baileys con el IQ de respuesta).
const boom = (statusCode, message) => {
  const error = new Error(message)
  error.name = 'Boom'
  error.output = { statusCode }
  return error
}

// Busca un nodo hijo por etiqueta dentro del stanza.
const child = (node, tag) => (node?.content || []).find(item => item?.tag === tag)

test('la plataforma declarada es canónica (WhatsApp la valida con rigor)', () => {
  assert.deepEqual(getPairingPlatform(['Ubuntu', 'Chrome', '20.0.04']), {
    id: '1',
    display: 'Chrome (Ubuntu)'
  })
  // Etiqueta personalizada => se normaliza (era una causa de rechazo 400).
  assert.deepEqual(getPairingPlatform(['Mi Bot Raro', 'Chrome', '20.0.04']), {
    id: '1',
    display: 'Chrome (Mac OS)'
  })
  assert.deepEqual(getPairingPlatform(['Mac OS', 'Safari', '17.0']), {
    id: '5',
    display: 'Safari (Mac OS)'
  })
  assert.deepEqual(getPairingPlatform(['Windows', 'NavegadorInventado', '1']), {
    id: '1',
    display: 'Chrome (Windows)'
  })
  assert.equal(getPairingPlatform(DEFAULT_PAIRING_BROWSER).display, 'Chrome (Ubuntu)')
})

test('los códigos generados usan el alfabeto de WhatsApp', () => {
  for (let i = 0; i < 200; i++) {
    const code = generatePairingCode()
    assert.match(code, /^[1-9A-HJ-NP-TV-Z]{8}$/, `código inválido: ${code}`)
    assert.ok(isValidPairingCode(code))
  }
  assert.ok(isValidPairingCode('LE13F4G1'))   // la L sí es válida
  assert.ok(!isValidPairingCode('0OIU0000'))  // 0, O, I, U no existen
  assert.ok(!isValidPairingCode('ABC123'))    // demasiado corto
  assert.equal(normalizePairingCode(' abcd-1234 '), 'ABCD1234')
})

test('petición verificada: envía companion_hello y espera la respuesta', async () => {
  const creds = mockCreds()
  let visto = null
  const sock = mockSocket({
    creds,
    query: async (node) => {
      visto = node
      // La sesión NO puede marcarse como pendiente antes de la confirmación.
      assert.equal(creds.me, undefined)
      return { tag: 'iq', attrs: { type: 'result' } }
    }
  })

  const resultado = await requestVerifiedPairingCode(sock, NUMERO)

  assert.equal(resultado.confirmed, true)
  assert.equal(resultado.via, 'verified')
  assert.ok(isValidPairingCode(resultado.code))

  // Stanza correcto.
  assert.equal(visto.tag, 'iq')
  assert.equal(visto.attrs.to, '@s.whatsapp.net')
  assert.equal(visto.attrs.type, 'set')
  assert.equal(visto.attrs.xmlns, 'md')

  const registro = child(visto, 'link_code_companion_reg')
  assert.ok(registro, 'falta link_code_companion_reg')
  assert.equal(registro.attrs.stage, 'companion_hello')
  assert.equal(registro.attrs.jid, `${NUMERO}@s.whatsapp.net`)
  assert.equal(registro.attrs.should_show_push_notification, 'true')

  const envuelta = child(registro, 'link_code_pairing_wrapped_companion_ephemeral_pub')
  assert.ok(Buffer.isBuffer(envuelta.content))
  assert.equal(envuelta.content.length, 32 + 16 + 32) // salt + iv + clave cifrada
  assert.equal(child(registro, 'companion_platform_display').content, 'Chrome (Ubuntu)')
  assert.equal(child(registro, 'companion_platform_id').content, '1')
  assert.equal(child(registro, 'link_code_pairing_nonce').content, '0')
  assert.ok(Buffer.isBuffer(child(registro, 'companion_server_auth_key_pub').content))

  // Solo tras la confirmación se guarda la sesión pendiente de vincular.
  assert.deepEqual(sock.eventos, ['creds.update'])
  assert.deepEqual(creds.me, { id: `${NUMERO}@s.whatsapp.net`, name: '~' })
  assert.equal(creds.pairingCode, resultado.code)
})

test('WhatsApp rechaza (400): no hay código y la sesión queda limpia', async () => {
  const creds = mockCreds()
  const sock = mockSocket({ creds, query: async () => { throw boom(400, 'bad-request') } })

  const error = await requestVerifiedPairingCode(sock, NUMERO).then(
    () => null,
    (e) => e
  )

  assert.ok(error instanceof PairingError, 'debe lanzar PairingError')
  assert.equal(error.statusCode, 400)
  assert.match(error.message, /400/)
  // Nada de códigos falsos ni sesión contaminada.
  assert.equal(sock.eventos.length, 0)
  assert.equal(creds.me, undefined)
  assert.equal(creds.pairingCode, undefined)
})

test('WhatsApp no responde: tampoco se inventa un código', async () => {
  const sock = mockSocket({ query: async () => undefined })
  await assert.rejects(
    requestVerifiedPairingCode(sock, NUMERO),
    (error) => error instanceof PairingError && /no respondió/i.test(error.message)
  )
})

test('tiempo de espera agotado (408)', async () => {
  const sock = mockSocket({ query: async () => { throw boom(408, 'Timed Out') } })
  const error = await requestVerifiedPairingCode(sock, NUMERO).then(() => null, e => e)
  assert.ok(error instanceof PairingError)
  assert.match(error.message, /no respondió/i)
})

test('número inválido o sesión ya vinculada: se rechaza antes de pedir nada', async () => {
  let llamadas = 0
  const sock = mockSocket({ query: async () => { llamadas++; return { tag: 'iq' } } })

  await assert.rejects(requestVerifiedPairingCode(sock, '12345'), PairingError)
  await assert.rejects(requestVerifiedPairingCode(sock, '+0 (555) 123'), PairingError)
  assert.equal(llamadas, 0)

  const registrado = mockSocket({ creds: mockCreds({ registered: true }) })
  const error = await requestVerifiedPairingCode(registrado, NUMERO).then(() => null, e => e)
  assert.ok(error instanceof PairingError)
  assert.equal(error.retryable, false)
  assert.match(error.message, /ya está vinculada/i)
})

test('sesión sin claves de vinculación: pide reiniciar en vez de fallar raro', async () => {
  for (const clave of ['pairingEphemeralKeyPair', 'noiseKey']) {
    const creds = mockCreds()
    delete creds[clave]
    const sock = mockSocket({ creds })
    const error = await requestVerifiedPairingCode(sock, NUMERO).then(() => null, e => e)
    assert.ok(error instanceof PairingError, `sin ${clave} debe lanzar PairingError`)
    assert.equal(error.retryable, false)
    assert.match(error.message, /Reiniciar sesión/i)
    // Tampoco aquí se publica nada.
    assert.equal(sock.eventos.length, 0)
  }
})

test('respaldo: si faltan las utilidades internas, avisa que no está confirmado', async () => {
  const libIncompleta = { jidEncode: (n) => `${n}@s.whatsapp.net`, S_WHATSAPP_NET: '@s.whatsapp.net' }
  assert.equal(canRequestVerifiedCode(libIncompleta), false)

  const sock = mockSocket({ nativeCode: 'abcd 1234' })
  const resultado = await requestVerifiedPairingCode(sock, NUMERO, { lib: libIncompleta })

  assert.equal(resultado.via, 'native')
  assert.equal(resultado.confirmed, false)
  assert.equal(resultado.code, 'ABCD1234')

  // Si Baileys devuelve basura, tampoco se muestra.
  const malo = mockSocket({ nativeCode: '???' })
  await assert.rejects(requestVerifiedPairingCode(malo, NUMERO, { lib: libIncompleta }), PairingError)
})

test('los fallos se explican en español y sin código de por medio', () => {
  assert.match(describePairingFailure(boom(400, 'bad-request')), /rechazó/)
  assert.match(describePairingFailure(boom(401, 'not-authorized')), /Reiniciar sesión/)
  assert.match(describePairingFailure(boom(405, 'not-acceptable')), /no aceptó ese número/)
  assert.match(describePairingFailure(boom(429, 'rate-limited')), /Demasiados intentos/)
  assert.match(describePairingFailure(boom(503, 'unavailable')), /servidor de WhatsApp/)
  assert.match(describePairingFailure(boom(408, 'Timed Out')), /no respondió/)
  // Mensajes propios del bot: se devuelven tal cual.
  const propio = new Error('La conexión cambió mientras se generaba el código.')
  assert.equal(describePairingFailure(propio), propio.message)
  assert.equal(describePairingFailure(new PairingError('Texto exacto')), 'Texto exacto')
})
