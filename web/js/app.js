/* Arranque.
 *
 * Se ejecuta al final: todos los módulos ya se registraron en window.APP.
 */
(function () {
  "use strict";

  function arrancar() {
    APP.pantallas.aplicarTema();
    APP.pantallas.enganchar();

    /* La puerta. A la aplicación se entra con correo y contraseña.
     *
     * Si en este aparato no se ha entrado nunca, se pide antes de dibujar
     * nada: no tiene sentido pintar la aplicación entera para taparla medio
     * segundo después. Si ya se entró alguna vez, se abre de inmediato y la
     * sesión se comprueba por detrás — así abrir es instantáneo y sigue
     * funcionando sin señal. */
    if (APP.puerta.hayQuePedir()) {
      APP.puerta.pintar();
      registrarServicio();
      return;
    }

    APP.pantallas.pintar();

    /* Al volver a la aplicación después de un rato hay que redibujar: las vidas
     * se recuperan con el reloj y la racha cambia a medianoche, así que la
     * pantalla que quedó abierta puede estar mostrando datos de ayer. */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden || document.getElementById("leccion")) return;
      if (!APP.puerta.abierta()) return;
      APP.pantallas.pintar();
      // Al volver puede que se haya practicado en otro aparato.
      APP.cuenta.sincronizarSiCorresponde(5).then(function (r) {
        if (r.ok) APP.pantallas.pintar();
      });
    });

    /* Al abrir se pregunta si hay sesión y, si la hay, se baja el avance del
     * servidor antes de redibujar. No se espera a que termine: la aplicación ya
     * se dibujó con lo local y tiene que poder usarse aunque el servidor esté
     * dormido o no haya señal. */
    APP.cuenta.arrancar().then(function (r) {
      // Si el servidor contestó que la sesión ya no vale, se cierra la puerta.
      APP.puerta.revisarTrasArrancar();
      if (r.ok && APP.puerta.abierta()) APP.pantallas.pintar();
    });

    registrarServicio();
    prepararInstalacion();
  }

  function registrarServicio() {
    if (!("serviceWorker" in navigator)) return;
    // La versión de una sola página (la que se abre desde un enlace, sin
    // instalar) no tiene sw.js: sin esta marca intentaría registrarlo y dejaría
    // un error en la consola cada vez que abre.
    if (!document.querySelector('meta[name="modo-sin-conexion"]')) return;

    /* Recargar sola cuando llega una versión nueva.
     *
     * Sin esto, publicar una versión nueva no se ve aunque todo esté bien
     * hecho. El service worker nuevo se instala y toma el control —hace
     * skipWaiting y claim— pero la página que ya está abierta se quedó con el
     * JavaScript que cargó al principio, que es el viejo. Hacía falta una
     * segunda recarga a mano, y nadie recarga dos veces: se concluye que la
     * actualización no llegó.
     *
     * 'teniaControlador' distingue el caso que sí importa. La primera vez que
     * alguien abre la aplicación no hay controlador y el evento igual salta:
     * recargar ahí sería un parpadeo gratis en la primera visita, justo la
     * peor para dar una impresión rara.
     */
    const teniaControlador = !!navigator.serviceWorker.controller;
    let recargando = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!teniaControlador || recargando) return;
      recargando = true;
      window.location.reload();
    });

    // La ruta es relativa a propósito: la aplicación tiene que funcionar igual
    // servida desde la raíz del dominio o desde una subcarpeta.
    navigator.serviceWorker.register("sw.js").then(function (reg) {
      /* Y se vuelve a preguntar al volver a la aplicación. Una aplicación
       * instalada puede pasarse semanas sin recargarse —se deja en segundo
       * plano y se vuelve a ella— y entonces nunca se enteraría de que hay
       * algo nuevo. */
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) reg.update().catch(function () {});
      });
    }).catch(function () {
      /* sin service worker sigue funcionando, sólo que no offline */
    });
  }

  function prepararInstalacion() {
    /* Chrome en Android permite ofrecer la instalación con un botón propio.
     * Safari no: ahí sólo quedan las instrucciones que están en Ajustes. */
    window.addEventListener("beforeinstallprompt", function (ev) {
      ev.preventDefault();
      const caja = document.getElementById("instalar-caja");
      if (!caja) return;
      caja.innerHTML = '<button class="btn" style="margin-top:10px">📲 Instalar ahora</button>';
      caja.querySelector("button").addEventListener("click", function () {
        ev.prompt();
        caja.innerHTML = "";
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
