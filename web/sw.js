/* Service worker: lo que hace que la aplicación funcione sin internet.
 *
 * Estrategia: al instalar se guarda todo el "casco" (HTML, CSS, JS, iconos), y
 * después se responde siempre desde la caché. La aplicación no pide datos a
 * ningún servidor —el contenido va dentro del JavaScript y el progreso en el
 * teléfono—, así que una vez instalada no necesita red nunca más.
 *
 * Para publicar una versión nueva hay que subir VERSION. Al cambiar, el service
 * worker nuevo borra las cachés viejas y toma el control de inmediato; si no se
 * sube, los teléfonos que ya la instalaron seguirían con la versión vieja.
 *
 * Subir VERSION es necesario pero no basta, y esto costó descubrirlo: aunque el
 * service worker nuevo tome el control, la página que ya está abierta sigue
 * ejecutando el JavaScript que cargó al principio. Quien recarga una vez ve la
 * versión vieja y concluye que la actualización no llegó. Por eso app.js
 * escucha 'controllerchange' y recarga sola. Las dos piezas van juntas.
 */
const VERSION = "stars-v8";

const CASCO = [
  ".",
  "index.html",
  "manifest.webmanifest",
  "css/app.css",
  "js/dom.js",
  "js/almacen.js",
  "js/datos.js",
  "js/datos-verbos.js",
  "js/datos-sonidos.js",
  "js/datos-gramatica.js",
  "js/datos-reglas.js",
  "js/datos-lectura.js",
  "js/datos-palabras.js",
  "js/curriculo.js",
  "js/srs.js",
  "js/audio.js",
  "js/texto.js",
  "js/motor.js",
  "js/verbos.js",
  "js/pronunciacion.js",
  "js/gramatica.js",
  "js/reglas.js",
  "js/diccionario.js",
  "js/examen.js",
  "js/tutor.js",
  "js/cuenta.js",
  "js/leccion.js",
  "js/pantallas.js",
  "js/app.js",
  "icons/icono-192.png",
  "icons/icono-512.png",
  "icons/icono-apple.png",
];

self.addEventListener("install", function (ev) {
  ev.waitUntil(
    caches.open(VERSION).then(function (c) {
      // addAll falla entero si un solo archivo falla; se piden de a uno para
      // que un icono que no esté no deje la aplicación sin instalar.
      return Promise.all(
        CASCO.map(function (u) {
          /* cache: "reload" obliga a ir a la red de verdad, saltándose la
           * caché del propio navegador.
           *
           * Sin esto la actualización no llega nunca, y de la peor manera:
           * sin ningún error. El navegador tiene guardado el archivo viejo,
           * este fetch se lo sirve desde ahí, y el service worker nuevo acaba
           * guardando en su caché nueva exactamente el mismo código viejo.
           * Todo parece correcto —el despliegue en verde, la versión subida,
           * la caché renovada— y los cambios no aparecen. */
          return c.add(new Request(u, { cache: "reload" })).catch(function () {});
        })
      );
    // skipWaiting va DESPUÉS de guardar, no antes. Si se llama de entrada, el
    // service worker nuevo puede activarse con la caché a medio llenar y
    // borrar la vieja antes de tener con qué reemplazarla.
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (ev) {
  ev.waitUntil(
    caches.keys().then(function (llaves) {
      return Promise.all(
        llaves.map(function (k) {
          return k === VERSION ? null : caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (ev) {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  /* La API nunca se guarda en caché ni se responde desde ella.
   *
   * Sin esto, "GET /api/progreso" caería en la estrategia de abajo —responder
   * con lo guardado— y la aplicación leería para siempre el progreso de la
   * primera vez que entró, ignorando lo que hay en el servidor. Es un fallo que
   * no da ningún error: simplemente el avance deja de sincronizarse. */
  if (url.pathname.indexOf("/api/") === 0) return;

  ev.respondWith(
    caches.match(req).then(function (guardada) {
      if (guardada) {
        // Se responde con lo guardado y en paralelo se busca una versión nueva
        // para la próxima vez: rápido ahora, actualizado después.
        fetch(req)
          .then(function (r) {
            if (r && r.ok) caches.open(VERSION).then(function (c) { c.put(req, r.clone()); });
          })
          .catch(function () {});
        return guardada;
      }
      return fetch(req)
        .then(function (r) {
          if (r && r.ok) {
            const copia = r.clone();
            caches.open(VERSION).then(function (c) { c.put(req, copia); });
          }
          return r;
        })
        .catch(function () {
          // Sin red y sin caché: si navegaba, al menos devolver la portada.
          if (req.mode === "navigate") return caches.match("index.html");
          return new Response("", { status: 504, statusText: "Sin conexión" });
        });
    })
  );
});
