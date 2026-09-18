/* La puerta: a la aplicación sólo se entra con correo y contraseña.
 *
 * Dos cosas que conviene tener claras sobre qué protege esto y qué no.
 *
 * Lo que sí: el avance, la cuenta del tutor y todo lo que está en el servidor.
 * Eso ya estaba protegido de verdad — /progreso y /tutor contestan 401 sin
 * sesión — y ninguna pantalla puede saltarse esa comprobación, porque se hace
 * del otro lado.
 *
 * Lo que no: los archivos de la aplicación. Son una página web, y una página
 * web se descarga antes de saber quién la pide. Alguien con conocimientos
 * puede leer el JavaScript sin entrar. No hay nada personal ahí dentro —son
 * las lecciones, las mismas para todos—, así que no es un problema; pero decir
 * que esto "cierra" la aplicación sería prometer de más.
 *
 * Y una decisión importante: si el servidor no contesta, la puerta NO pide la
 * clave. Distinguir "no hay sesión" de "no hubo respuesta" es lo que permite
 * seguir practicando en el metro o con el servidor dormido. Quedarse sin señal
 * no debería dejarte fuera de tu propia aplicación.
 */
(function () {
  "use strict";

  const d = APP.dom;

  let cerrada = false;

  function ajustes() {
    return APP.almacen.estado().ajustes;
  }

  /* ¿Hay que pedir la clave antes de dejar ver nada?
   *
   * Sólo si en este aparato no se ha entrado nunca. Si ya se entró alguna vez,
   * se deja pasar y se comprueba contra el servidor por detrás: así abrir la
   * aplicación es instantáneo y funciona sin señal. */
  function hayQuePedir() {
    return !ajustes().aparatoAbierto;
  }

  /* Lo que se hace cuando el servidor sí contestó y dijo que no hay sesión:
   * la sesión caducó o se cerró desde otro sitio. Ahí sí se cierra la puerta. */
  function revisarTrasArrancar() {
    const e = APP.cuenta.estado();
    if (!e.respondio) return;      // sin respuesta: no se toca nada
    if (e.conectado) return;       // todo en orden
    if (!ajustes().aparatoAbierto) return;
    ajustes().aparatoAbierto = false;
    APP.almacen.guardar();
    pintar("La sesión se cerró. Vuelve a entrar para seguir.");
  }

  function pintar(aviso) {
    cerrada = true;

    /* Se quita lo que hubiera abierto: una lección a medias, una hoja, el
     * diccionario. Si no, la puerta se dibuja encima pero lo de abajo sigue
     * ahí y se alcanza a ver al hacer scroll. */
    Array.prototype.forEach.call(
      document.querySelectorAll(".velo, .leccion"),
      function (e) { e.remove(); }
    );

    const puerta = document.createElement("div");
    puerta.className = "puerta";
    puerta.id = "puerta";
    document.body.appendChild(puerta);
    document.body.classList.add("con-puerta");
    dibujar(puerta, "entrar", aviso || "");
  }

  function dibujar(puerta, modo, aviso) {
    const crear = modo === "crear";
    puerta.innerHTML =
      '<div class="puerta-caja">' +
      '<div class="puerta-marca">⭐</div>' +
      "<h1>Stars Climb</h1>" +
      '<p class="puerta-sub">' +
      (crear
        ? "Crea tu cuenta. Sólo correo y contraseña: no se manda ningún correo ni se pide nada más."
        : "Entra con tu correo y tu contraseña para continuar.") +
      "</p>" +
      (aviso ? '<div class="aviso ojo mini" style="margin-bottom:10px">' + d.esc(aviso) + "</div>" : "") +
      '<form id="puerta-form" autocomplete="on">' +
      '<input class="campo" id="p-email" type="email" name="email" required ' +
      'autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" ' +
      'style="min-height:auto;margin-bottom:8px" placeholder="tu@correo.cl">' +
      '<input class="campo" id="p-clave" type="password" name="password" required ' +
      'autocomplete="' + (crear ? "new-password" : "current-password") + '" ' +
      'style="min-height:auto" placeholder="' +
      (crear ? "Contraseña (mínimo 8 caracteres)" : "Contraseña") + '">' +
      '<div id="p-error"></div>' +
      '<button class="btn" type="submit" id="p-enviar" style="margin-top:12px">' +
      (crear ? "Crear cuenta y entrar" : "Entrar") + "</button>" +
      "</form>" +
      '<div style="height:8px"></div>' +
      '<button class="btn hueco" id="p-cambiar">' +
      (crear ? "Ya tengo cuenta" : "No tengo cuenta, quiero crear una") + "</button>" +
      '<p class="puerta-pie">Tu avance se guarda en tu cuenta. Entra con el mismo ' +
      "correo en el teléfono y en el computador y verás lo mismo en los dos.</p>" +
      "</div>";

    d.$("#p-cambiar", puerta).addEventListener("click", function () {
      dibujar(puerta, crear ? "entrar" : "crear", "");
    });

    /* Un <form> de verdad, y no un botón suelto: así el teclado del teléfono
     * muestra "Entrar", el gestor de contraseñas ofrece rellenar, y la tecla
     * Enter funciona. Son tres cosas gratis que con un div no se tienen. */
    d.$("#puerta-form", puerta).addEventListener("submit", function (ev) {
      ev.preventDefault();
      enviar(puerta, crear);
    });

    const campo = d.$("#p-email", puerta);
    const recordado = ajustes().entroComo;
    if (recordado) campo.value = recordado;
    if (recordado) d.$("#p-clave", puerta).focus();
    else campo.focus();
  }

  function enviar(puerta, crear) {
    const email = d.$("#p-email", puerta).value.trim();
    const clave = d.$("#p-clave", puerta).value;
    const caja = d.$("#p-error", puerta);
    const boton = d.$("#p-enviar", puerta);

    if (!email || !clave) {
      caja.innerHTML = '<div class="aviso ojo mini" style="margin-top:10px">' +
        "Falta el correo o la contraseña.</div>";
      return;
    }

    boton.disabled = true;
    boton.textContent = crear ? "Creando…" : "Entrando…";
    // El servidor gratuito se duerme y tarda en despertar; sin este aviso
    // parece colgado y se cierra la pestaña antes de que conteste.
    caja.innerHTML = '<div class="mini apagado" style="margin-top:10px">' +
      "Puede tardar unos segundos la primera vez del día.</div>";

    const accion = crear ? APP.cuenta.registrar : APP.cuenta.entrar;
    accion(email, clave).then(
      function () { abrir(); },
      function (err) {
        boton.disabled = false;
        boton.textContent = crear ? "Crear cuenta y entrar" : "Entrar";
        caja.innerHTML = '<div class="aviso ojo mini" style="margin-top:10px">' +
          d.esc(err.message) + "</div>";
        d.$("#p-clave", puerta).value = "";
        d.$("#p-clave", puerta).focus();
      }
    );
  }

  function abrir() {
    const puerta = document.getElementById("puerta");
    if (puerta) puerta.remove();
    document.body.classList.remove("con-puerta");
    cerrada = false;
    APP.pantallas.pintar();
  }

  window.APP = window.APP || {};
  APP.puerta = {
    hayQuePedir: hayQuePedir,
    revisarTrasArrancar: revisarTrasArrancar,
    pintar: pintar,
    abierta: function () { return !cerrada; },
  };
})();
