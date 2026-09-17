/* Cuatro ayudas de DOM. No hay framework a propósito.
 *
 * La aplicación tiene que abrir instantánea en un teléfono de gama media y
 * funcionar sin internet; meter una librería significaría descargarla y
 * ejecutarla antes de mostrar la primera palabra. Las pantallas son pocas y se
 * redibujan enteras, así que con esto alcanza.
 */
(function () {
  "use strict";

  function esc(s) {
    return String(s === null || s === undefined ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function html(nodo, contenido) {
    nodo.innerHTML = contenido;
    return nodo;
  }

  function $(sel, raiz) {
    return (raiz || document).querySelector(sel);
  }

  function $$(sel, raiz) {
    return Array.prototype.slice.call((raiz || document).querySelectorAll(sel));
  }

  /* Un solo escuchador en la raíz en vez de uno por botón: las pantallas se
   * redibujan enteras y así no hay que volver a enganchar nada ni quedan
   * escuchadores colgando de nodos que ya no existen. */
  function alTocar(raiz, selector, fn) {
    raiz.addEventListener("click", function (ev) {
      const t = ev.target.closest(selector);
      if (t && raiz.contains(t)) fn(t, ev);
    });
  }

  /* Avisos y confirmaciones propios, en vez de alert() y confirm().
   *
   * No es por estética: abierta dentro de otra página —el visor de un enlace
   * compartido, por ejemplo— el navegador **ignora en silencio** alert() y
   * confirm(). confirm() devuelve false sin preguntar nada, así que el botón de
   * salir de una lección no hacía absolutamente nada y no había forma de darse
   * cuenta desde el código.
   *
   * Estos usan el mismo panel deslizante que el resto de la aplicación y
   * funcionan igual esté donde esté.
   */
  function panel(contenido, alCerrar) {
    const velo = document.createElement("div");
    velo.className = "velo";
    velo.innerHTML = '<div class="hoja">' + contenido + "</div>";
    document.body.appendChild(velo);

    function cerrar(respuesta) {
      if (!velo.parentNode) return;
      velo.remove();
      document.removeEventListener("keydown", alTeclado);
      if (alCerrar) alCerrar(respuesta);
    }

    function alTeclado(ev) {
      if (ev.key === "Escape") cerrar(null);
    }

    velo.addEventListener("click", function (ev) {
      // Tocar fuera del panel es cancelar, igual que en el resto del sistema.
      if (ev.target === velo) return cerrar(null);
      const b = ev.target.closest("[data-respuesta]");
      if (b) cerrar(b.getAttribute("data-respuesta"));
    });
    document.addEventListener("keydown", alTeclado);
    const primero = velo.querySelector("button");
    if (primero) primero.focus();
    return velo;
  }

  function avisar(titulo, texto, alCerrar) {
    panel(
      "<h2>" + esc(titulo) + "</h2>" +
      (texto ? '<p class="chico apagado">' + esc(texto) + "</p>" : "") +
      '<button class="btn" data-respuesta="ok">Entendido</button>',
      function () { if (alCerrar) alCerrar(); }
    );
  }

  function confirmar(op) {
    panel(
      "<h2>" + esc(op.titulo) + "</h2>" +
      (op.texto ? '<p class="chico apagado">' + esc(op.texto) + "</p>" : "") +
      '<button class="btn' + (op.peligroso ? " rojo" : "") + '" data-respuesta="si">' +
      esc(op.si || "Sí") + "</button>" +
      '<div style="height:8px"></div>' +
      '<button class="btn hueco" data-respuesta="no">' + esc(op.no || "Cancelar") + "</button>",
      function (respuesta) {
        if (respuesta === "si" && op.alConfirmar) op.alConfirmar();
        else if (respuesta !== "si" && op.alCancelar) op.alCancelar();
      }
    );
  }

  function minutos(seg) {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  window.APP = window.APP || {};
  APP.dom = {
    esc: esc, html: html, $: $, $$: $$, alTocar: alTocar, minutos: minutos,
    panel: panel, avisar: avisar, confirmar: confirmar,
  };
})();
