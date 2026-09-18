# Stars Climb

Una aplicación para aprender inglés. Se abre en el navegador, se instala en el
teléfono como cualquier otra app, y sigue funcionando en el metro sin señal.

- **Tres niveles** con el marco europeo: Básico (A1–A2), Intermedio (B1),
  Avanzado (B2). 83 lecciones, y un **examen final** por nivel que abre el
  siguiente.
- **Reglas**: 17 reglas del inglés en el formato de los libros de gramática —la
  regla explicada corta, y después ejercicios de esa regla y de ninguna otra.
  Los ejercicios se generan, así que no se acaban: *am/is/are* da 120 frases
  distintas, *do/does* 320. Al fallar sale la respuesta **y el porqué**.
- **Prueba de nivelación** al entrar, para no empezar en "Hola" si ya sabes.
- **Repaso espaciado** (el mismo algoritmo de Anki): cada palabra vuelve justo
  antes de que se te olvide, no antes ni después.
- **Verbos**: 102 verbos, 8 tiempos, con las conjugaciones generadas y
  comprobadas una por una.
- **Pronunciación**: los 20 sonidos vocálicos del inglés con pares mínimos
  (*ship* / *sheep*), porque son los que no se distinguen de oído.
- **Lectura**: 9 textos con glosario y preguntas, de 82 palabras en básico a
  161 en avanzado.
- **Toca cualquier palabra** y ves qué significa, de qué verbo viene y cómo
  suena. Funciona sin internet.
- **Conversar con un tutor**, hablando o escribiendo, que te corrige y te
  explica por qué. Es lo único que necesita internet y lo único que cuesta
  dinero: es opcional y se configura aparte (ver más abajo).
- **Gramática de consulta**: 19 temas con la trampa típica de cada uno.
- **Registro de estudio**: minutos, días, reglas dominadas y las palabras que
  se te siguen olvidando.

No tiene vidas, ni puntos, ni rachas de fuego, ni logros. Se quitaron a
propósito: medían cuánto habías tocado la pantalla, no cuánto sabías, y se
puede juntar mucho XP contestando rápido lo que ya sabías. Equivocarse no
cuesta nada — el error queda anotado y vuelve en el repaso, que es para lo que
sirve.

La cuenta es opcional. Sin cuenta, todo el avance se guarda en el aparato y la
aplicación funciona entera. Con cuenta, el avance del teléfono y el del
computador se juntan sin que ninguno pise al otro.

---

## Instalarla en Render, con GitHub y Neon

Son tres servicios y los tres tienen plan gratuito. Media hora la primera vez.

### 1. Subir el código a GitHub

En <https://github.com/new>: nombre `stars-climb`, privado o público, **sin**
marcar nada de README ni .gitignore (ya vienen). Después, en esta carpeta:

```bash
git init
git add .
git commit -m "Stars Climb"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/stars-climb.git
git push -u origin main
```

### 2. Crear la base en Neon

1. Entra a <https://neon.tech> y crea un proyecto (`stars-climb`, región la más
   cercana: para Chile, US East).
2. Copia la **connection string**. Se ve así:

   ```
   postgresql://usuario:clave@ep-algo-123.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

   Guárdala en algún lado por un minuto. Es una contraseña: no la pegues en un
   chat ni la subas al repositorio.

> El plan gratuito de Neon duerme la base cuando nadie la usa. La primera
> petición después de un rato tarda un segundo o dos; eso es normal y la
> aplicación ya lo tiene previsto (`pool_pre_ping` en `api/config.py`).

### 3. Desplegar en Render

1. En <https://render.com> → **New** → **Blueprint**, y elige el repositorio.
   Render lee `render.yaml` y arma el servicio solo.
2. Te va a pedir un valor: **DATABASE_URL**. Pega ahí la cadena de Neon.
3. **Apply**. El primer despliegue tarda unos minutos.

Queda en `https://stars-climb.onrender.com` (o el nombre que elijas).

> El plan gratuito de Render duerme el servicio a los 15 minutos sin visitas, y
> despertarlo tarda unos 30 segundos. La aplicación espera hasta 20 segundos a
> la sincronización por eso mismo, y mientras tanto funciona igual con lo que
> tiene guardado: el que espera es el servidor, no tú.

### 4. Instalarla en el teléfono

Abre la dirección en el teléfono y:

- **Android (Chrome)**: sale solo un aviso de "Instalar aplicación". Si no,
  menú ⋮ → *Añadir a pantalla de inicio*.
- **iPhone (Safari)**: botón de compartir → *Añadir a pantalla de inicio*.
  Tiene que ser Safari; desde Chrome en iPhone no se puede.

Queda con su icono, sin barra de direcciones, y abre sin internet.

---

## El tutor de conversación (opcional, y es lo único que se paga)

Todo lo demás de Stars Climb es gratis y funciona sin internet. El tutor no:
usa un modelo de lenguaje, y eso se cobra por uso. Sin configurarlo, la
aplicación funciona entera y sólo esa pantalla explica que falta activarlo.

Para encenderlo:

1. Saca una clave en <https://console.anthropic.com> y ponle algo de crédito.
2. En Render, tu servicio → **Environment** → agrega `ANTHROPIC_API_KEY`.

Dos cosas importantes:

- **La clave se queda en el servidor y nunca llega al teléfono.** Si estuviera
  en el JavaScript, cualquiera que abra el inspector la copia y gasta tu
  crédito. Por eso `/api/tutor` es un intermediario y no una llamada directa
  desde el navegador.
- **Hay un tope de mensajes al día por persona** (`TUTOR_TOPE_DIARIO`, 60 por
  defecto). Sin tope, un bucle en el cliente o una sesión robada se comen el
  crédito de un mes en una tarde.

El modelo por defecto es Haiku, que para conversar y corregir errores rinde de
sobra, contesta rápido y cuesta una fracción de los grandes. Se cambia con
`TUTOR_MODELO`.

El servidor **no guarda la conversación**: la manda el teléfono en cada turno y
se queda ahí. Alguien practicando cuenta cosas de su trabajo y de su vida, y
eso no hay por qué archivarlo.

---

## Trabajar en ella

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
python wsgi.py          # http://localhost:5000
```

Sin `DATABASE_URL`, usa un SQLite local (`stars-climb.db`) y no hace falta base
ninguna para probar.

### Las pruebas

```bash
node pruebas/pruebas.js         # la lógica de la aplicación (102)
python3 -m pytest pruebas/ -q   # el servidor (46)
```

Las de `node` no necesitan navegador: cargan los mismos archivos que usa la
aplicación en un contexto fingido, sin copiarlos ni adaptarlos.

### Cómo está armado

```
web/     La aplicación. JavaScript suelto, sin framework ni compilación:
         se abre tal cual, y en un teléfono de gama media eso se nota.
  js/    Un archivo por tema, todos registrados en window.APP.
         Los datos-*.js son contenido; el resto, lógica.
  sw.js  El service worker (lo que la hace funcionar sin internet).
api/     Flask. Cuentas, progreso y el intermediario del tutor.
pruebas/ Las de la aplicación (node) y las del servidor (pytest).
```

Al agregar un archivo nuevo a `web/js/` hay que ponerlo en **tres** sitios:
`web/index.html`, la lista de `web/sw.js`, y `ARCHIVOS` en
`pruebas/pruebas.js`. Si falta en el service worker, la aplicación funciona con
internet y se rompe sin él, que es la peor forma de romperse.

### Dos cosas que conviene saber antes de tocar nada

**Al cambiar cualquier archivo de `web/`, sube el número de `VERSION` en
`web/sw.js`.** Si no, los teléfonos que ya la tienen instalada siguen con la
versión vieja para siempre. No da ningún error: simplemente los cambios no
aparecen, y es lo más difícil de diagnosticar de todo el proyecto.

Que eso funcione depende de tres piezas que van juntas, y las tres costaron un
despliegue que parecía correcto y no cambiaba nada:

1. `sw.js` pide el casco con `cache: "reload"`, para saltarse la caché del
   navegador. Sin eso, el service worker nuevo guarda en su caché nueva el
   mismo código viejo que el navegador tenía guardado.
2. El servidor manda los `.js` y el `.css` con `no-cache`. Llevan siempre el
   mismo nombre, así que dejarlos guardados un día significa servir código
   viejo durante un día.
3. `app.js` escucha `controllerchange` y recarga sola. Aunque el service worker
   nuevo tome el control, la página ya abierta sigue ejecutando el JavaScript
   que cargó al principio; hacía falta recargar dos veces, y nadie recarga dos
   veces.

Hay pruebas para la 2 (`pruebas/test_sitio.py`). Las otras dos se comprueban
publicando una versión, cambiando algo y viendo si aparece con una sola
recarga.

**La fusión de avances vive en `web/js/almacen.js`, no en el servidor.** El
servidor guarda un texto y lo devuelve igual, sin entenderlo. Está hecho así a
propósito: la fusión tiene que funcionar sin conexión de todas formas, así que
escribirla dos veces sólo daría dos versiones que se desincronizan.
