/* Arranque.
 *
 * Se ejecuta al final: todos los módulos ya se registraron en window.APP.
 */
(function () {
  "use strict";

  function arrancar() {
    APP.pantallas.aplicarTema();
    APP.pantallas.enganchar();
    APP.pantallas.pintar();

    /* Al volver a la aplicación después de un rato hay que redibujar: las vidas
     * se recuperan con el reloj y la racha cambia a medianoche, así que la
     * pantalla que quedó abierta puede estar mostrando datos de ayer. */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden || document.getElementById("leccion")) return;
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
      if (r.ok) APP.pantallas.pintar();
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
    // La ruta es relativa a propósito: la aplicación tiene que funcionar igual
    // servida desde la raíz del dominio o desde una subcarpeta.
    navigator.serviceWorker.register("sw.js").catch(function () {
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
