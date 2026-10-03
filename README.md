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
- **Menú decorado personalizable** (kaomojis y símbolos, sin emojis) con
  **banner de imagen**, saludo según la hora, filtro por categoría
  (`!menu grupos`) y contador real de usuarios.
- **Prefijo configurable** (uno o varios caracteres).
- **Configuración central**: nombre del bot, dueño, símbolos y mensajes.
- Conexión por **código QR** y **código de vinculación** (pairing).
- **Sesión persistente**: no vuelves a vincular después de reiniciar.
- **Reconexión automática** y manejo de errores.
- **227 comandos** con alias en **20 categorías**: información, IA, descargas,
  búsqueda, anime, stickers, imágenes, herramientas, utilidades, grupos,
  moderación, administración, perfil, sub-bots, juegos, memes, economía,
  gacha, pokemon y propietario.
- **Moderación completa por grupo**: mute, warns con expulsión automática
  al tercer aviso, ban con veto anti-reingreso, borrado de mensajes,
  anti-link configurable (borrar/avisar/expulsar), anti-spam, anti-flood,
  anti-bot, anti-NSFW, chat silenciado y comandos solo-admins.
- **Minijuegos con estado** (el bot lee tus respuestas en el chat):
  ahorcado, trivia, quiz, adivina, número secreto, memoria, scrabble,
  anagrama, capitales, banderas, quiz de pokémon/anime/fútbol,
  verdadero-falso y reacción rápida.
- **Anti-link y bienvenida personalizables por grupo** (`!antilink on/off`,
  `!bienvenida on/off`, `!setwelcome` y `!setbye` con `{user}`).
- **Prefijo por grupo** además del global (`!setprefix`).
- Juegos, economía y gacha con **base de datos JSON propia** (monedas,
  recompensa diaria, banco, tienda, registro, nivel/exp, matrimonios y
  colecciones) — sin bases de datos externas.
- Comandos con **APIs gratuitas sin registro**: clima, Wikipedia, Pokémon
  (PokeAPI), anime y manga (Jikan), waifus (waifu.pics / nekos.best),
  países (REST Countries), IP (ipapi.co), QR, imágenes IA (Pollinations),
  definiciones (dictionaryapi.dev), noticias y tendencias (RSS), imágenes
  libres (Openverse), letras (lyrics.ovh), series (TVMaze), juegos
  (CheapShark), memes (meme-api.com) y más.
- Edición de imágenes (blur, recorte, texto, meme, pixel, sepia...) con
  **sharp opcional** (`npm i sharp`).
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
├── assets/
│   └── banner.jpg            # Imagen del banner del menú (reemplázala)
│
├── lib/                      # Núcleo del bot (no necesitas tocarlo)
│   ├── connection.js         # Conexión, QR, pairing, reconexión y sesión
│   ├── handler.js            # Lector de mensajes, prefijo, moderación y permisos
│   ├── loader.js             # Cargador automático de comandos
│   ├── database.js           # Mini base de datos JSON (usuarios, monedas, ajustes)
│   ├── logger.js             # Mensajes de consola con color (+ historial para !logs)
│   ├── games.js              # Registro de los minijuegos con estado (por chat)
│   ├── trackers.js           # Contadores en memoria (antispam/antiflood/antibot)
│   ├── image.js              # Descarga de imágenes y carga opcional de sharp
│   ├── utils.js              # Utilidades compartidas
│   └── data/
│       ├── characters.js     # Personajes del gacha (edítalos a tu gusto)
│       ├── quiz.js           # Palabras, preguntas y pistas de los minijuegos
│       ├── shop.js           # Objetos de la tienda virtual
│       └── texts.js          # Chistes, frases, verdades/retos y símbolos
│
├── commands/                 # COMANDOS (cada carpeta = una categoría)
│   ├── informacion/          # menu, help, ping, info, creador, repo
│   ├── ia/                   # ia (tu API key), imagine (Pollinations, gratis)
│   ├── descargas/            # descargar, play (plantillas para tu API)
│   ├── busqueda/             # clima, wiki, anime, pais, ipinfo, google, ytsearch,
│   │                         # github, npm, define, sinonimo, antonimo, noticias,
│   │                         # tendencias, imagen, gif, lyrics, pelicula, serie, juego
│   ├── anime/                # manga, personaje, seiyuu, temporada, animefoto,
│   │                         # randomanime, randommanga, waifu, husbando, animerank
│   ├── stickers/             # sticker, toimg, sticker2, stickertexto, stickerqr,
│   │                         # take, steal, stickerinfo, pack, toaudio, togif, tovideo
│   ├── imagenes/             # blur, resize, recortar, rotate, flip, grayscale, pixel,
│   │                         # invertir, brillo, contraste, sepia, negativo, marco,
│   │                         # textoimg, meme (requieren: npm i sharp)
│   ├── herramientas/         # calcular, acortar, traducir, qr, hora, morse, estilo
│   ├── utilidades/           # base64, binario, hex, uuid, contraseña, hash,
│   │                         # cronometro, temporizador, fecha, calendario,
│   │                         # porcentaje, promedio, convertir, rgb, bin
│   ├── grupos/               # grupo, kick, promote, demote, tagall, link,
│   │                         # antilink, bienvenida, nuevolink, setdesc, setname
│   ├── moderacion/           # mute, unmute, warn, warnings, delwarn, resetwarn,
│   │                         # ban, unban, borrar, antilink2, antispam, antiflood,
│   │                         # antibot, antinsfw, soloadmins, silenciar, desilenciar,
│   │                         # listadmins, staff, reglas
│   ├── administracion/       # setreglas, setfoto, setwelcome, setbye, setprefix,
│   │                         # resetgrupo, config, settings, open, close, add,
│   │                         # remove, promoteall, demoteall, listmembers
│   ├── perfil/               # perfil, registrar, level, xp, rank, reputacion, bio,
│   │                         # avatar, edad, matrimonio, divorcio, familia
│   ├── subbots/              # serbot (plantilla)
│   ├── juegos/               # ppt, dado, moneda, pregunta, ship, pareja, verdad,
│   │                         # reto, ahorcado, trivia, quiz, adivina, numero, memoria,
│   │                         # scrabble, anagrama, capitales, banderas, pokemonquiz,
│   │                         # animequiz, futbolquiz, verdadero, reaccion
│   ├── memes/                # meme2, chiste, dato, frase, insulto, roast,
│   │                         # motivacion, consejo, 8ball, eleccion, random, azar,
│   │                         # compatibilidad, suerte, horoscopo
│   ├── economia/             # daily, balance, apostar, top, slot, transferir, work,
│   │                         # crime, rob, depositar, retirar, banco, inventario,
│   │                         # tienda, comprar, vender
│   ├── gacha/                # roll, personajes, buscarpj
│   ├── pokemon/              # pokedex, atrapar, mispokemon, liberar
│   └── propietario/          # join, bc, reiniciar, eval, exec, shell, broadcast,
│                             # block, unblock, addowner, delowner, owners, logs,
│                             # backup, update, plugins, reload, estado (solo dueño)
│
├── database/                 # Se crea sola: usuarios y monedas (ignorada por git)
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
| `CONNECTION_METHOD` | Método de conexión: `qr` o `pairing` (vacío = te pregunta al iniciar) | `qr` |
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

## » Elegir entre QR y código de vinculación

La primera vez (sin sesión guardada) puedes elegir el método de tres formas:

**1. Pregunta interactiva (recomendado)** » si `CONNECTION_METHOD` está vacío
en el `.env`, el bot te pregunta directamente al iniciar:

```
[ATLAS] ¿Cómo quieres conectar el bot?
    [1] Código QR
    [2] Código de vinculación (pairing)
 » Selecciona [1 o 2]:
```

**2. Atajos por comando** » fuerzan un método sin editar nada:

```bash
npm run start:qr        # equivale a: node index.js --qr
npm run start:pairing   # equivale a: node index.js --pairing
```

**3. Desde el .env** » fija el método permanentemente:

```env
CONNECTION_METHOD=qr            # o: pairing
PAIRING_NUMBER=521234567890     # solo necesario para pairing
```

> **Prioridad:** atajo de comando » `.env` » pregunta al iniciar.
> Una vez vinculado, el bot usa la sesión guardada y ya no pregunta nada.
>
> **Con PM2 no hay terminal interactiva:** si no defines el método se usa QR;
> para pairing define `CONNECTION_METHOD=pairing` y `PAIRING_NUMBER` en el
> `.env` y mira el código con `pm2 logs atlas-bot`.

## » Conectar con código QR

1. Elige el método QR (opción 1, `npm run start:qr` o `CONNECTION_METHOD=qr`).
2. Ejecuta el bot.
3. En WhatsApp ve a: **Ajustes » Dispositivos vinculados » Vincular un dispositivo**.
4. Escanea el QR que aparece en la terminal.

> El QR se renueva solo si expira. Si no se ve completo, agranda la ventana
> de la terminal o usa el método *pairing*.

## » Conectar con código de vinculación (pairing)

Ideal para Termux o terminales donde el QR no se ve bien.

1. Elige el método pairing (opción 2, `npm run start:pairing` o `CONNECTION_METHOD=pairing`).
2. Escribe tu número **con código de país, sin `+` ni espacios**
   (`521234567890`) cuando el bot lo pida — o déjalo listo en
   `PAIRING_NUMBER` del `.env` para saltarte la pregunta.
3. El bot mostrará un código tipo `ABCD-1234`.
4. En WhatsApp ve a: **Ajustes » Dispositivos vinculados » Vincular con número de teléfono**
   e ingresa el código. Si expira antes de usarlo, reinicia el bot para
   generar uno nuevo.

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

El menú se arma con **plantillas** en `config.js`, sección `menu`. No usa
emojis: todo el estilo se logra con símbolos Unicode y kaomojis.

**Datos extra del encabezado** (en `config.js`):

```js
botWeb: 'Aún no tiene web..',  // línea "ᴡᴇʙ" del menú
botType: 'Sub-Bot',            // línea "ᴛɪᴘᴏ" del menú
```

**Banner del menú** (en `config.js` » `menu`):

```js
banner: 'assets/banner.jpg',   // imagen del menú
```

- El menú se envía como **foto** (con el encabezado de pie de imagen) y la
  lista de comandos llega en un texto justo después.
- Para cambiarla: reemplaza el archivo `assets/banner.jpg` por tu imagen.
- Para menú solo de texto: `banner: null` (también cae a texto automáticamente
  si la imagen no existe).

**Decoraciones y plantillas** (sección `menu`):

| Pieza | Qué controla |
|---|---|
| `kaomoji` / `kaomojiHint` | Caritas del saludo y de la pista |
| `divider` | Línea divisoria del encabezado (`✧･ﾟ: ✧･ﾟ: ...`) |
| `thinLine` | Separador fino entre categorías (`───────────────`) |
| `bullet` | Viñeta de cada comando (`₍ᐢ..ᐢ₎`) |
| `header(datos)` | Saludo inicial (`> Hola ...`) |
| `info(datos)` | Líneas ʙᴏᴛ / ᴡᴇʙ / ᴛɪᴘᴏ / ᴀᴄᴛɪᴠᴏ / ᴜsᴜᴀʀɪᴏs / ᴄᴍᴅs |
| `commandsTitle()` | Título de la lista (`*LISTA DE COMANDOS*`) |
| `hint({ prefix, filtered })` | Pista bajo el título |
| `categoryTitle({ label })` | Encabezado de categoría (`✐ *GRUPOS*`) |
| `commandLine(datos)` | Bloque de comando (nombre `»` + descripción en `>`) |
| `footer(datos)` | Cierre del menú |

Datos de `commandLine`: `{ prefix, name, description, bullet }` —
cada comando usa dos líneas:

```
₍ᐢ..ᐢ₎ *!help* »
> ᴍᴜᴇꜱᴛʀᴀ ʟᴀ ᴀʏᴜᴅᴀ ɢᴇɴᴇʀᴀʟ...
```

El detalle completo (alias, uso, restricciones) se consulta con
`!help <comando>`.

Datos disponibles en `header`, `info` y `footer`:

```
{ user, botName, botWeb, botType, owner, greeting, prefix, totalCommands, users, uptime, kaomoji }
```

Notas del menú:

- **`greeting`** dice «Buenos días / tardes / noches» según la hora del servidor (automático).
- **`users`** es un conteo **real**: cada usuario que usa un comando se guarda en `database/users.json`.
- El menú se puede **filtrar por categoría**: `!menu grupos` muestra solo esa categoría.
- Las descripciones se convierten a letras pequeñas con la utilidad `toSmallCaps` (en `lib/utils.js`).

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
  commandNotFound: '» Comando no encontrado. Usa {prefix}menu para ver la lista.',

  // Mensaje de bienvenida (!bienvenida on) » puedes usar {user}
  welcome: '> ¡Bienvenido/a {user}! ...',

  // Aviso del anti-link (!antilink on) » puedes usar {user}
  antilink: '> {user}, los enlaces de grupos no están permitidos aquí.'
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

1. Crea una carpeta dentro de `commands/`, por ejemplo: `commands/musica/`.
2. Mete ahí los comandos que quieras.
3. (Opcional) En `config.js` » `categoryLabels`, dale un nombre bonito:

```js
categoryLabels: {
  informacion: 'INFORMACIÓN',
  ia: 'INTELIGENCIA ARTIFICIAL',
  // ...
  musica: 'MÚSICA'
}
```

4. (Opcional) En `config.js` » `categoryOrder` decides el orden del menú.
   Las categorías que no estén listadas aparecen al final en orden alfabético.

Si no la agregas a `categoryLabels`, se mostrará con el nombre de la carpeta
en mayúsculas.

---

# APIS EXTERNAS (IA, STICKERS, DESCARGAS)

Algunos comandos dependen de servicios externos. Estado actual:

| Categoría | Comandos | Estado |
|---|---|---|
| Búsqueda | `clima`, `wiki`, `anime`, `pais`, `ipinfo`, `github`, `npm`, `define`, `sinonimo`, `antonimo`, `noticias`, `tendencias`, `imagen`, `lyrics`, `serie`, `juego` | Funcionan (APIs gratuitas sin registro) |
| Búsqueda | `google` (DuckDuckGo), `ytsearch`, `gif`, `pelicula` | Funcionan (páginas públicas «best-effort», pueden fallar si el proveedor cambia su HTML) |
| Anime/Jikan | `anime`, `manga`, `personaje`, `seiyuu`, `temporada`, `animefoto`, `randomanime`, `randommanga`, `animerank` | Funcionan (Jikan, gratuita) |
| Anime | `waifu`, `husbando` | Funcionan (waifu.pics / nekos.best) |
| Pokemon | `pokedex`, `atrapar`, `mispokemon`, `liberar` | Funcionan (PokeAPI, gratuita) |
| Herramientas | `acortar`, `traducir`, `calcular`, `qr` | Funcionan (sin registro) |
| Herramientas / Utilidades | `hora`, `morse`, `estilo`, `base64`, `binario`, `hex`, `uuid`, `contraseña`, `hash`, `cronometro`, `temporizador`, `fecha`, `calendario`, `porcentaje`, `promedio`, `convertir`, `rgb`, `bin` | Funcionan **sin ninguna API** |
| IA | `imagine` | Funciona (Pollinations, gratis sin registro) |
| IA | `ia` | Requiere tu **API key** |
| Stickers | `sticker`, `toimg`, `sticker2`, `stickertexto`, `stickerqr`, `take`, `steal`, `togif` | Requieren instalar **sharp** (con aviso amigable si falta) |
| Stickers | `stickerinfo`, `pack`, `toaudio`, `tovideo` | Informativos / requieren ffmpeg para video |
| Imágenes | todas las de `imagenes/` | Requieren instalar **sharp** |
| Descargas / Sub-Bots | `descargar`, `play`, `serbot` | **Plantillas** para conectar tu API |

**» Moderación (grupos)**

Todo se guarda por grupo en `database/db.json`. Los comandos de moderación
son `adminOnly` (y varios piden que el bot también sea admin):

```
!mute @user / !unmute @user      # silencia a un miembro (se borran sus mensajes)
!warn @user [motivo]             # a las 3 advertencias se expulsa solo
!ban @user / !unban @user        # expulsa y veta (si vuelve a entrar, sale de nuevo)
!borrar (respondiendo)           # elimina el mensaje citado
!antilink on/off                 # borra enlaces de grupos (modo clásico)
!antilink2 borrar/avisar/expulsar/off   # modo configurable
!antispam / !antiflood / !antibot / !antinsfw on/off
!silenciar [min] / !desilenciar  # calla el chat para no-admins
!soloadmins add/del/lista <cmd>  # deja comandos solo para admins del grupo
```

**» Administración del grupo**

`!setreglas` (todos las leen con `!reglas`), `!setwelcome`/`!setbye`
(personalizan bienvenida/despedida con `{user}`), `!setprefix` (prefijo
extra solo del grupo, sin quitar el global), `!setfoto`, `!config`,
`!settings` (panel), `!open`/`!close`, `!add`, `!remove`,
`!promoteall`/`!demoteall`, `!resetgrupo`.

**» Minijuegos con estado**

Algunos juegos siguen vivos en el chat hasta terminar: escribes la
respuesta directamente (sin prefijo) y el bot la lee. Ejemplos:

```
!ahorcado » escribe letras: "a" ・ palabra completa: "perro" ・ "salir" para rendirte
!numero » escribe un número y el bot dice ▲ más alto / ▼ más bajo
!quiz / !futbolquiz / !verdadero » responde con el número o "verdadero/falso"
!memoria » voltea casillas: "A1 B2"
!reaccion » escribe el símbolo apenas salga; el primero gana
```

- Solo puede haber **un juego activo por chat** (se cierra solo a los 10 min).
- Ganar suma **monedas y experiencia** (!level para ver tu nivel).

**» Comandos del propietario (¡cuidado!)**

Solo el dueño (incluidos los agregados con `!addowner`) puede usarlos:

- `!eval` y `!shell` ejecutan código/comandos en el servidor → **poder
  total sobre la máquina**: no agregues dueños en quien no confíes.
- `!bc` anuncia solo a los grupos; `!broadcast` es igual (alias natural).
- `!reload` recarga comandos sin reiniciar (útil al editar).
- `!backup` descarga `database/db.json` como documento.
- `!logs`, `!estado`, `!plugins`, `!update` » diagnósticos rápidos.
- `!block`/`!unblock` bloquean a nivel cuenta de WhatsApp.

**» Activar la inteligencia artificial (`!ia`)**

Agrega tu key en el `.env`:

```env
AI_API_KEY=tu-api-key
```

O en `config.js` » sección `ai` (ahí también puedes cambiar `apiUrl` y
`model`: sirve cualquier API compatible con OpenAI: OpenAI, DeepSeek,
Groq, LM Studio...).

**» Activar los stickers (`!sticker`)**

```bash
npm install sharp
npm restart o reinicia el bot
```

El comando detecta solo si `sharp` está instalada; sin ella avisa cómo activarla.

**» Economía y gacha**

Funcionan sin nada externo. Las monedas, la recompensa diaria, el registro
y las colecciones se guardan en `database/db.json` (se crea solo).

- Recompensas, costos y apuesta mínima: `config.js` » sección `game`.
- Personajes y probabilidades del gacha: `lib/data/characters.js`
  (puedes agregar `"image": "https://..."` a cada personaje y `!roll`
  enviará la foto).

**» Anti-link y bienvenida (grupos)**

Se activan **por grupo** y solo los admins pueden cambiarlos:

```
!antilink on/off    # borra enlaces de invitación a otros grupos
!bienvenida on/off  # saluda automáticamente a los nuevos miembros
```

- Los textos se editan en `config.js` » `messages.welcome` y
  `messages.antilink` (puedes usar `{user}` para mencionar).
- Los ajustes de cada grupo se guardan también en `database/db.json`.

**» Reiniciar el bot (`!reiniciar`)**

El comando apaga el proceso limpiamente (`process.exit`). Para que el bot
**vuelva solo**, debe estar corriendo con PM2 (`pm2 start ecosystem.config.cjs`);
si lo iniciaste con `npm start`, tendrás que encenderlo a mano.

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

**» El bot no me pregunta si quiero QR o pairing**
Sucede cuando: 1) ya definiste `CONNECTION_METHOD` en el `.env`, 2) usaste
un atajo (`--qr`/`--pairing`), 3) ya existe una sesión vinculada, o 4) corre
bajo PM2 (sin terminal interactiva » se usa QR salvo que lo fijes en el `.env`).

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
