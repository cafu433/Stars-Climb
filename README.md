# Stars Climb

Una aplicación para aprender inglés. Se abre en el navegador, se instala en el
teléfono como cualquier otra app, y sigue funcionando en el metro sin señal.

- **Camino de lecciones** con vidas, rachas, XP y logros.
- **Repaso espaciado** (el mismo algoritmo de Anki): cada palabra vuelve justo
  antes de que se te olvide, no antes ni después.
- **Módulo de verbos**: 102 verbos, 8 tiempos, con las conjugaciones generadas
  y comprobadas una por una.
- **Módulo de pronunciación**: los 20 sonidos vocálicos del inglés con pares
  mínimos (*ship* / *sheep*), porque son los que no se distinguen de oído.
- **Gramática**: 17 temas explicados con la trampa típica de cada uno.
- **Pelusa**, una chinchilla que comenta cómo te va.

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
node pruebas/pruebas.js   # la lógica de la aplicación (79)
python3 -m pytest pruebas/ -q   # el servidor (31)
```

Las de `node` no necesitan navegador: cargan los mismos archivos que usa la
aplicación en un contexto fingido, sin copiarlos ni adaptarlos.

### Cómo está armado

```
web/     La aplicación. JavaScript suelto, sin framework ni compilación:
         se abre tal cual, y en un teléfono de gama media eso se nota.
  js/    Un archivo por tema, todos registrados en window.APP.
  sw.js  El service worker (lo que la hace funcionar sin internet).
api/     Flask. Cuentas y progreso, nada más.
pruebas/ Las de la aplicación (node) y las del servidor (pytest).
```

### Dos cosas que conviene saber antes de tocar nada

**Al cambiar cualquier archivo de `web/`, sube el número de `VERSION` en
`web/sw.js`.** Si no, los teléfonos que ya la tienen instalada siguen con la
versión vieja para siempre. No da ningún error: simplemente los cambios no
aparecen, y es lo más difícil de diagnosticar de todo el proyecto.

**La fusión de avances vive en `web/js/almacen.js`, no en el servidor.** El
servidor guarda un texto y lo devuelve igual, sin entenderlo. Está hecho así a
propósito: la fusión tiene que funcionar sin conexión de todas formas, así que
escribirla dos veces sólo daría dos versiones que se desincronizan.
