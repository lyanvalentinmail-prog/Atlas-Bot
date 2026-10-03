# ATLAS BOT

Base **profesional y modular** para un bot de WhatsApp con **Node.js + Baileys**.
Código limpio, sin emojis (solo símbolos), sin dependencias innecesarias y listo para producción.

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                 ATLAS BOT                 ┃
┃        v1.0.0 » Node.js + Baileys         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## » Características

- Sistema de comandos dividido por **categorías** (carpetas).
- **Menú personalizable** desde un solo archivo (`config.js`).
- **Prefijo configurable** (uno o varios caracteres).
- **Configuración central**: nombre del bot, dueño, símbolos y mensajes.
- Conexión por **código QR** y **código de vinculación** (pairing).
- **Sesión persistente**: no vuelves a vincular después de reiniciar.
- **Reconexión automática** y manejo de errores.
- 11 comandos de ejemplo: `menu`, `help`, `ping`, `info`, `grupo`, `kick`, `promote`, `demote`, `tagall`, `link` y `join`.
- Listo para **VPS/Linux** y **Termux**.
- Soporte para **PM2** (archivo `ecosystem.config.cjs` incluido).

## » Requisitos

| Requisito | Versión mínima | Notas |
|---|---|---|
| Node.js | **20 o superior** | Requerido por Baileys |
| npm | 9+ | Se instala con Node.js |
| git | Cualquiera | Necesario para clonar y para `npm install` |

> Baileys instala una dependencia (libsignal) directamente desde GitHub,
> por eso **git es obligatorio** durante `npm install`.

## » Estructura del proyecto

```
Atlas-Bot/
│
├── index.js                  # Punto de entrada (banner, carga y arranque)
├── config.js                 # CONFIGURACIÓN CENTRAL del bot
├── package.json              # Dependencias y scripts
├── ecosystem.config.cjs      # Configuración de PM2
├── .env.example              # Plantilla de variables de entorno
├── .gitignore                # Archivos ignorados por git
│
├── lib/                      # Núcleo del bot (no necesitas tocarlo)
│   ├── connection.js         # Conexión, QR, pairing, reconexión y sesión
│   ├── handler.js            # Lector de mensajes, prefijo y permisos
│   ├── loader.js             # Cargador automático de comandos
│   ├── logger.js             # Mensajes de consola con color
│   └── utils.js              # Utilidades compartidas
│
├── commands/                 # COMANDOS (cada carpeta = una categoría)
│   ├── general/              # menu, help, ping, info
│   ├── grupos/               # grupo, kick, promote, demote, tagall, link
│   └── propietario/          # join (solo dueño)
│
└── session/                  # Se crea sola: guarda la sesión (ignorada por git)
```

Para personalizar el bot **solo necesitas tocar**: `.env`, `config.js` y `commands/`.

---

# INSTALACIÓN

## » Instalación en VPS (Ubuntu/Debian)

**1. Actualiza el sistema e instala Node.js 20:**

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verifica que todo quedó bien:

```bash
node -v   # debe mostrar v20.x o superior
npm -v
git --version
```

**2. Clona el proyecto e instala dependencias:**

```bash
git clone https://github.com/lyanvalentinmail-prog/Atlas-Bot.git
cd Atlas-Bot
npm install
```

**3. Crea tu archivo de configuración:**

```bash
cp .env.example .env
nano .env
```

Edita como mínimo `BOT_NAME`, `OWNER_NAME` y `OWNER_NUMBER` (tu número con
código de país, sin `+` ni espacios, por ejemplo `521234567890`).
Guarda con `CTRL + O`, `Enter` y sal con `CTRL + X`.

**4. Inicia el bot:**

```bash
npm start
```

Escanea el QR (o usa el código de vinculación) y listo.
Para dejarlo corriendo 24/7, sigue la sección **[PM2](#-mantener-el-bot-activo-con-pm2-vps)**.

## » Instalación en Termux

**1. Actualiza paquetes e instala lo necesario:**

```bash
pkg update && pkg upgrade -y
pkg install -y nodejs git
```

Verifica:

```bash
node -v   # debe mostrar v20 o superior
```

> Si Termux te ofrece una versión de Node menor a 20, actualiza la app
> Termux desde **F-Droid** (la de Play Store está desactualizada).

**2. Clona el proyecto e instala dependencias:**

```bash
git clone https://github.com/lyanvalentinmail-prog/Atlas-Bot.git
cd Atlas-Bot
npm install
```

**3. Configura el bot:**

```bash
cp .env.example .env
nano .env
```

(Edita `BOT_NAME`, `OWNER_NAME` y `OWNER_NUMBER`).

**4. Inicia el bot:**

```bash
npm start
```

**5. (Recomendado) Evita que Android "duerma" el bot:**

```bash
termux-wake-lock
```

Y en los ajustes de Android desactiva la *optimización de batería* para Termux.

---

# CONFIGURACIÓN

## » El archivo .env

Toda la configuración básica está en el archivo `.env` (lo creas a partir de
`.env.example`). Estas son las variables disponibles:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `BOT_NAME` | Nombre del bot (menú y mensajes) | `Atlas Bot` |
| `OWNER_NAME` | Nombre del dueño (informativo) | `Valentin` |
| `OWNER_NUMBER` | Número(s) del dueño, con código de país, sin `+`. Varios separados por comas | `521234567890` |
| `PREFIX` | Prefijo de comandos. Cada carácter cuenta como prefijo | `!` o `!./` |
| `CONNECTION_METHOD` | Método de conexión: `qr` o `pairing` | `qr` |
| `PAIRING_NUMBER` | Número del teléfono para el código de vinculación (vacío = te lo pide en consola) | `521234567890` |
| `SESSION_NAME` | Carpeta donde se guarda la sesión | `session` |
| `RECONNECT_DELAY` | Espera entre reconexiones (milisegundos) | `3000` |

## » El archivo config.js

Aquí se personaliza todo lo demás **sin tocar la lógica del bot**:

- **`symbols`** » los símbolos que usa el bot (`»`, `「」`, `╭`, `╰`, etc.).
- **`messages`** » mensajes automáticos (permisos denegados, errores, etc.).
- **`categoryLabels`** » cómo se muestra cada categoría en el menú.
- **`menu`** » el diseño completo del menú (ver más abajo).

---

# CÓMO INICIAR EL BOT

```bash
npm start
```

La primera vez mostrará el **código QR** o el **código de vinculación**
(según `CONNECTION_METHOD`). Los siguientes arranques usarán la **sesión
guardada** y conectarán directamente.

## » Conectar con código QR

1. En tu `.env` pon `CONNECTION_METHOD=qr`.
2. Ejecuta `npm start`.
3. En WhatsApp ve a: **Ajustes » Dispositivos vinculados » Vincular un dispositivo**.
4. Escanea el QR que aparece en la terminal.

> El QR se renueva solo si expira. Si no se ve completo, agranda la ventana
> de la terminal o usa el método *pairing*.

## » Conectar con código de vinculación (pairing)

Ideal para Termux o terminales donde el QR no se ve bien.

1. En tu `.env` pon:
   ```env
   CONNECTION_METHOD=pairing
   PAIRING_NUMBER=521234567890
   ```
   (Número **con código de país, sin `+`** y sin espacios. Si lo dejas vacío,
   el bot te lo pedirá en la consola al iniciar.)
2. Ejecuta `npm start` y verás un código tipo `ABCD-1234`.
3. En WhatsApp ve a: **Ajustes » Dispositivos vinculados » Vincular con número de teléfono**
   e ingresa el código (dura poco tiempo; si expira, reinicia el bot).

## » Sesión persistente

Al vincular, las credenciales se guardan en la carpeta `session/`.
Mientras esa carpeta exista, el bot **conecta solo al reiniciar**, sin QR.

- **No compartas** esa carpeta: contiene el acceso completo a tu WhatsApp.
- Ya está excluida en `.gitignore`, nunca la subas a GitHub.
- Para cerrar la sesión por completo: borra la carpeta `session/` y vuelve a iniciar.
- Si WhatsApp cierra la sesión por sí mismo (código 401), el bot **borra la
  carpeta automáticamente** y se detiene para que puedas vincular de nuevo.

---

# MANTENER EL BOT ACTIVO CON PM2 (VPS)

[PM2](https://pm2.keymetrics.io/) mantiene el bot encendido 24/7: lo reinicia
si falla y lo arranca con el servidor.

**1. Instala PM2 globalmente:**

```bash
sudo npm install -g pm2
```

**2. Inicia el bot con PM2** (desde la carpeta del proyecto):

```bash
pm2 start ecosystem.config.cjs
```

o con el atajo incluido:

```bash
npm run pm2:start
```

**3. Comandos útiles de PM2:**

| Acción | Comando | Atajo npm |
|---|---|---|
| Ver estado | `pm2 status` | — |
| Ver logs en vivo | `pm2 logs atlas-bot` | `npm run pm2:logs` |
| Reiniciar | `pm2 restart atlas-bot` | `npm run pm2:restart` |
| Detener | `pm2 stop atlas-bot` | `npm run pm2:stop` |
| Eliminar del proceso | `pm2 delete atlas-bot` | `npm run pm2:delete` |

**4. Que el bot arranque al reiniciar el VPS:**

```bash
pm2 save          # guarda la lista de procesos actual
pm2 startup       # genera el comando para autoinicio (cópialo y ejecútalo)
```

> **Importante:** el flujo correcto es » primero vincula el bot con `npm start`
> hasta ver *"conectado correctamente"*, después detenlo con `CTRL + C` y
> arráncalo con PM2. Así la sesión ya quedó guardada.

> PM2 también funciona en Termux (`npm install -g pm2`), solo que sin
> `pm2 startup` (Android no lo soporta): usa `termux-wake-lock` y vuelve a
> ejecutar `npm run pm2:start` tras reiniciar el teléfono.

---

# PERSONALIZACIÓN

## » Cambiar nombre, dueño y prefijo

Se hace desde el `.env` (reinicia el bot después):

```env
BOT_NAME=Mi Bot
OWNER_NAME=Valentin
OWNER_NUMBER=521234567890
PREFIX=./!
```

- `OWNER_NUMBER`: número con código de país, **sin `+`**. Para varios dueños:
  `OWNER_NUMBER=521234567890,521098765432`
- `PREFIX`: cada carácter es un prefijo válido. Con `PREFIX=./!` sirven
  `.menu`, `/menu` y `!menu`.

## » Cambiar el menú

El menú se arma con **plantillas** en `config.js`, sección `menu`. Cada
plantilla es una función que recibe datos y devuelve texto:

```js
menu: {
  // Encabezado. Datos: { botName, user, owner, prefix, totalCommands, uptime }
  header: ({ botName, prefix }) =>
    `╭─「 ${botName} 」\n│ » Prefijo : [ ${prefix} ]\n╰─────────────`,

  // Título de cada categoría. Datos: { label, count }
  categoryTitle: ({ label }) => `╭─「 ${label} 」`,

  // Cada línea de comando. Datos: { prefix, name, description }
  commandItem: ({ prefix, name }) => `│ » ${prefix}${name}`,

  // Cierre de cada categoría
  categoryFooter: () => '╰─────────────',

  // Línea final del menú
  footer: ({ prefix }) => `» Usa ${prefix}help <comando> para más detalles.`
}
```

Modifica esos textos como quieras: el bot los renderiza tal cual.
El menú se genera **solo con símbolos** (`╭ ╰ │ ─ 「 」 » ・`), siguiendo el
estilo sin emojis del proyecto.

## » Cambiar los mensajes automáticos

En `config.js`, sección `messages`:

```js
messages: {
  error: '» Ocurrió un error al ejecutar el comando.',
  ownerOnly: '» Este comando es exclusivo del dueño del bot.',
  groupOnly: '» Este comando solo funciona dentro de grupos.',
  adminOnly: '» Este comando es solo para administradores del grupo.',
  botAdminOnly: '» Necesito ser administrador del grupo para hacer eso.',
  noMention: '» Menciona a un usuario o responde a uno de sus mensajes.',
  commandNotFound: '» Comando no encontrado. Usa {prefix}menu para ver la lista.'
}
```

Consejo: deja `commandNotFound` vacío (`''`) si no quieres que el bot
responda nada ante comandos inexistentes.

---

# CREAR NUEVOS COMANDOS

Cada comando es un archivo `.js` dentro de una carpeta de `commands/`.
**El bot lo detecta y carga solo al reiniciar** », no hay que registrarlo en ningún lado.

## » Plantilla de comando

Crea, por ejemplo, `commands/general/hola.js`:

```js
export default {
  name: 'hola',                      // Nombre del comando (obligatorio)
  alias: ['hi', 'saludar'],          // Alias opcionales
  category: 'general',               // Categoría (por defecto: la carpeta)
  description: 'Saluda al usuario.', // Se muestra en !help
  usage: 'hola',                     // Se muestra en !help

  run: async ({ reply }) => {
    await reply('» Hola, bienvenido al bot.')
  }
}
```

Reinicia el bot y ya funciona: `!hola`.

## » Propiedades disponibles

| Propiedad | Tipo | Descripción |
|---|---|---|
| `name` | texto | **Obligatorio.** Nombre del comando. |
| `alias` | array | Otros nombres que disparan el mismo comando. |
| `category` | texto | Categoría en el menú (por defecto: nombre de la carpeta). |
| `description` | texto | Descripción que muestra `!help`. |
| `usage` | texto | Ejemplo de uso que muestra `!help`. |
| `run` | función | **Obligatoria.** Lo que hace el comando. |
| `ownerOnly` | bool | Solo el dueño puede usarlo. |
| `groupOnly` | bool | Solo funciona en grupos. |
| `adminOnly` | bool | Solo admins del grupo (el dueño siempre puede). |
| `botAdminOnly` | bool | Requiere que el bot sea admin del grupo. |

Los permisos se declaran y el sistema los valida **automáticamente**,
respondiendo con los mensajes de `config.messages`.

## » Datos que recibe la función `run`

```js
run: async (ctx) => { /* ... */ }
```

| Dato | Descripción |
|---|---|
| `ctx.sock` | Conexión de Baileys (para enviar mensajes, imágenes, etc.). |
| `ctx.msg` | Mensaje original completo. |
| `ctx.args` | Argumentos como array (`!kick @user` » `['@user']`). |
| `ctx.text` | Argumentos unidos en un solo texto. |
| `ctx.command` | Nombre del comando usado. |
| `ctx.prefix` | Prefijo con el que se llamó. |
| `ctx.chatId` | JID del chat/grupo donde se escribió. |
| `ctx.sender` | JID de quien envió el mensaje. |
| `ctx.isOwner` / `ctx.isGroup` | Booleanos útiles. |
| `ctx.groupMetadata` | Info del grupo (participantes, etc.) cuando aplica. |
| `ctx.isAdmin` / `ctx.isBotAdmin` | Roles dentro del grupo. |
| `ctx.config` | La configuración central. |
| `ctx.reply(texto, extra?)` | Responde citando el mensaje original. |
| `ctx.commands` / `ctx.categories` | Registro de todos los comandos. |

## » Crear nuevas categorías

1. Crea una carpeta dentro de `commands/`, por ejemplo: `commands/descargas/`.
2. Mete ahí los comandos que quieras.
3. (Opcional) En `config.js` » `categoryLabels`, dale un nombre bonito:

```js
categoryLabels: {
  general: 'GENERAL',
  grupos: 'GRUPOS',
  propietario: 'PROPIETARIO',
  descargas: 'DESCARGAS'
}
```

Si no la agregas, se mostrará con el nombre de la carpeta en mayúsculas.

---

# PROBLEMAS COMUNES Y SOLUCIONES

**» `npm install` falla con errores de `node-gyp` o de permisos**
Verifica que `node -v` sea 20 o superior y que `git` esté instalado.
En VPS: `sudo apt install -y build-essential git`. En Termux: `pkg install -y git`.

**» El código QR no se muestra o se ve cortado**
Agranda la ventana de la terminal (el QR necesita espacio) o cambia a
`CONNECTION_METHOD=pairing`, que imprime solo un código corto.

**» El código de vinculación da "Connection Failure" o no llega**
Confirma que el número tenga **código de país, sin `+` y sin espacios**
(`521234567890`), espera unos segundos tras el arranque y no reintentes
muchas veces seguidas (WhatsApp limita los intentos). Si persiste, borra la
carpeta `session/` y vuelve a intentar.

**» Aparece "La sesión fue cerrada por WhatsApp (código 401)"**
WhatsApp invalidó la sesión (se desvinculó el dispositivo o expiró).
El bot **borra la carpeta `session/` automáticamente**: solo vuelve a
ejecutar `npm start` y vincula de nuevo.

**» El bot dice "Reconectando..." cada pocos segundos**
Es la reconexión automática ante un corte de red o de WhatsApp
(códigos 408/428/515). Es normal que ocurra alguna vez al día; el bot se
recupera solo. Si ocurre constantemente, revisa el internet del servidor.

**» El bot conecta pero no responde comandos**
Revisa en orden: 1) usas el **prefijo correcto** (`PREFIX` del `.env`),
2) el comando existe en `!menu`, 3) la consola muestra `[ CMD ]` al enviarlo
(si no aparece nada, el mensaje no está llegando: revisa la conexión y que no
sea un estado/`broadcast`).

**» Los comandos de grupo responden "Necesito ser administrador"**
Haz **administrador al bot** en el grupo. Los comandos `grupo`, `kick`,
`promote`, `demote` y `link` lo requieren (`botAdminOnly`).

**» "Este comando es solo para administradores" pero eres admin**
Cerciórate de ser admin *de ese grupo*. El **dueño del bot** puede usar esos
comandos aunque no sea admin; verifica tu `OWNER_NUMBER` (sin `+`).

**» Los mensajes no llegan o se ven "Esperando este mensaje"**
Suele deberse a una versión vieja del protocolo de WhatsApp. Actualiza Baileys:

```bash
npm install @whiskeysockets/baileys@legacy
rm -rf session
npm start   # vincula de nuevo
```

**» En Termux el bot se apaga a los minutos**
Ejecuta `termux-wake-lock` y desactiva la optimización de batería para
Termux en los ajustes de Android.

**» PM2 no vuelve a arrancar tras reiniciar el VPS**
Te faltó guardar el proceso: `pm2 save` y ejecuta el comando que muestra
`pm2 startup`.

**» Cambié el código y no pasa nada**
Reinicia el bot (`CTRL + C` y `npm start`, o `pm2 restart atlas-bot`).
Los comandos se cargan al arrancar.

---

# ACTUALIZAR LA BASE

El proyecto usa **Baileys 6.7.x** (rama estable, dist-tag `legacy`), fijada
como `^6.7.24` en `package.json`, porque es la línea más probada y documentada.
Para comprobar actualizaciones de la misma línea:

```bash
npm install @whiskeysockets/baileys@legacy
```

> La versión 7.0.0 de Baileys aún está en *release candidate* y trae cambios
> que rompen compatibilidad (solo ESM, sistema LID, etc.). Esta base está
> pensada y probada para la línea 6.7.x.

---

# AVISO

Este proyecto es una base educativa. No está afiliado a WhatsApp ni a Meta.
Úsalo de forma responsable (sin spam ni automatización abusiva), respetando
los términos de servicio de WhatsApp. El uso es bajo tu propia responsabilidad.

---

» **Licencia:** MIT » Hecho con Node.js + [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)
