/* Las cuatro pantallas de la aplicación y la navegación entre ellas.
 *
 * Camino → qué toca aprender hoy.
 * Práctica → repasar, corregir errores, frases y canciones.
 * Progreso → cuánto llevas de verdad, no cuántos días seguidos abriste la app.
 * Ajustes → voz, teclado, vidas y respaldo.
 *
 * Se redibuja la pantalla completa en cada cambio. Es más simple que llevar la
 * cuenta de qué nodo cambió, y a esta escala no se nota.
 */
(function () {
  "use strict";

  const d = APP.dom;
  const A = function () { return APP.almacen; };
  let tab = "camino";
  let raiz = null;

  function pintar() {
    if (!raiz) raiz = d.$("#app");
    raiz.innerHTML =
      barraSuperior() +
      '<div class="contenido">' + contenido() + "</div>" +
      navegacion();
    // Volver arriba al cambiar de pestaña: si no, la pestaña nueva aparece
    // scrolleada a la mitad y parece rota.
    window.scrollTo(0, 0);
  }

  /* ---------------- Barra superior ---------------- */

  function barraSuperior() {
    const e = A().estado();
    const racha = A().rachaViva();
    const xpHoy = A().xpDeHoy();
    const meta = e.metaDiaria;
    const vidas = A().vidas();
    const pct = Math.min(100, Math.round((xpHoy / meta) * 100));
    return (
      '<div class="barra">' +
      '<span class="contador racha' + (racha ? "" : " apagada") + '">🔥 <span class="n">' + racha + "</span></span>" +
      '<div class="crece" style="display:flex;align-items:center;gap:8px;flex:1">' +
      '<div class="barra-prog fina"><i style="width:' + pct + '%;background:' +
      (pct >= 100 ? "var(--dorado)" : "var(--verde)") + '"></i></div>' +
      '<span class="mini fuerte apagado" style="white-space:nowrap">' + xpHoy + "/" + meta + "</span>" +
      "</div>" +
      (e.ajustes.corazones === false
        ? ""
        : '<span class="contador vidas' + (vidas ? "" : " apagada") + '" data-accion="ver-vidas">❤️ <span class="n">' +
          vidas + "</span></span>") +
      "</div>"
    );
  }

  /* ---------------- Navegación ---------------- */

  const TABS = [
    { id: "camino", emo: "🛤️", nombre: "Camino" },
    { id: "practica", emo: "🎧", nombre: "Práctica" },
    { id: "progreso", emo: "📊", nombre: "Progreso" },
    { id: "ajustes", emo: "⚙️", nombre: "Ajustes" },
  ];

  function navegacion() {
    return (
      '<nav class="nav"><div class="nav-caja">' +
      TABS.map(function (t) {
        return (
          '<button class="' + (tab === t.id ? "activa" : "") + '" data-accion="tab" data-tab="' + t.id + '">' +
          '<span class="emo">' + t.emo + "</span>" + t.nombre + "</button>"
        );
      }).join("") +
      "</div></nav>"
    );
  }

  function contenido() {
    if (tab === "camino") return camino();
    if (tab === "practica") return practica();
    if (tab === "progreso") return progreso();
    return ajustes();
  }

  /* ---------------- Camino ---------------- */

  function camino() {
    const siguiente = A().siguienteLeccion();
    const saludo = APP.mascota.saludo();
    let out = APP.mascota.burbuja(saludo.cara, saludo.texto) + tarjetaDesafio();
    APP.curriculo.UNIDADES.forEach(function (u) {
      const hechas = u.lecciones.filter(function (l) { return A().leccion(l.id).coronas > 0; }).length;
      out +=
        '<div class="unidad-cabecera" style="background:' + u.color + '">' +
        '<span class="emo">' + u.icon + "</span>" +
        '<div class="txt"><h2>' + d.esc(u.titulo) + "</h2>" +
        '<div class="sub">' + d.esc(u.resumen) + "</div></div>" +
        '<span class="pastilla" style="background:rgba(255,255,255,.25);color:#fff">' +
        hechas + "/" + u.lecciones.length + "</span></div>" +
        '<div class="camino">';

      u.lecciones.forEach(function (l, i) {
        const est = A().leccion(l.id);
        const abierta = A().leccionAbierta(l.id);
        const esSiguiente = siguiente && siguiente.id === l.id;
        const clase = !abierta ? "cerrado" : est.coronas >= 5 ? "terminado" : "";
        out +=
          '<div class="nodo-fila" data-desvio="' + (i % 8) + '">' +
          '<div class="nodo-caja">' +
          (esSiguiente && abierta ? '<div class="burbuja">' + (est.veces ? "SEGUIR" : "EMPEZAR") + "</div>" : "") +
          '<button class="nodo ' + clase + '" style="' +
          (abierta && !clase ? "background:" + u.color + ";box-shadow:0 7px 0 " + oscurecer(u.color) : "") +
          '" data-accion="leccion" data-id="' + l.id + '"' + (abierta ? "" : " disabled") + ">" +
          (abierta ? (est.coronas >= 5 ? "👑" : u.icon) : "🔒") +
          (est.coronas ? '<span class="coronas">👑 ' + est.coronas + "</span>" : "") +
          "</button>" +
          '<div class="nodo-etiqueta">' + d.esc(l.titulo) + "</div>" +
          "</div></div>";
      });
      out += "</div>";
    });
    return out;
  }

  function tarjetaDesafio() {
    /* Va arriba del camino porque es lo primero que se mira al abrir, y porque
     * su gracia es cambiar la rutina: si estuviera escondido en otra pestaña
     * sería una función que nadie usa. */
    const desafio = APP.desafio.deHoy();
    const hecho = Math.min(APP.desafio.progreso(), desafio.meta);
    const listo = APP.desafio.cumplido();
    const porCobrar = APP.desafio.pendienteDeCobro();

    return (
      '<div class="tarjeta" style="margin-top:14px;' +
      (listo ? "border-color:var(--dorado);background:rgba(255,200,0,.09)" : "") + '">' +
      '<div class="fila">' +
      '<span style="font-size:26px">' + desafio.emo + "</span>" +
      '<span class="crece">' +
      '<span class="mini fuerte apagado" style="display:block;letter-spacing:.06em">DESAFÍO DE HOY</span>' +
      '<span class="fuerte">' + d.esc(desafio.texto) + "</span></span>" +
      (listo ? '<span style="font-size:22px">✅</span>' : "") +
      "</div>" +
      '<div class="fila" style="margin-top:10px">' +
      '<div class="barra-prog fina"><i style="width:' +
      Math.round((hecho / desafio.meta) * 100) + '%;background:var(--dorado)"></i></div>' +
      '<span class="mini fuerte apagado" style="white-space:nowrap">' +
      hecho + "/" + desafio.meta + "</span></div>" +
      (porCobrar
        ? '<button class="btn" style="margin-top:12px" data-accion="cobrar-desafio">🎁 Reclamar +' +
          APP.desafio.PREMIO_XP + " XP</button>"
        : "") +
      "</div>"
    );
  }

  function oscurecer(hex) {
    // Un tono más oscuro del color de la unidad para la sombra del nodo.
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, ((n >> 16) & 255) - 40);
    const g = Math.max(0, ((n >> 8) & 255) - 40);
    const b = Math.max(0, (n & 255) - 40);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  /* ---------------- Práctica ---------------- */

  function practica() {
    const pendientes = APP.srs.pendientes().length;
    const errores = A().estado().errores.filter(function (e) { return !e.superado; }).length;
    return (
      "<h1>Práctica</h1>" +
      '<p class="apagado chico">Acá no se pierden vidas. Practica todo lo que quieras.</p>' +

      tarjetaContrarreloj() +

      tarjetaAccion("♻️", "Repaso del día", pendientes
        ? pendientes + " palabras te toca repasar hoy"
        : "Nada pendiente. Vuelve mañana.", "repaso", pendientes > 0) +

      tarjetaAccion("📕", "Cuaderno de errores", errores
        ? errores + " cosas que has fallado"
        : "Todavía no fallas nada. Buena señal.", "errores", errores > 0) +

      tarjetaAccion("📐", "Gramática", "Pronombres, verbos, artículos: cómo se arma el inglés", "gramatica", true) +
      tarjetaAccion("🔁", "Verbos", "Los 102 que más se usan, en todos los tiempos", "verbos", true) +
      tarjetaAccion("🗣️", "Pronunciación", "Los 20 sonidos de vocales, uno por uno", "sonidos", true) +
      tarjetaAccion("💬", "Frases útiles", "Escúchalas y repítelas en voz alta", "frasario", true) +
      tarjetaAccion("🎵", "Canciones", "Pega la letra de una canción y practícala línea por línea", "canciones", true) +

      '<h2 style="margin-top:22px">Por tema</h2>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      APP.datos.TEMAS.map(function (t) {
        const p = APP.srs.porTema()[t.id] || { promedio: 0, total: 0 };
        return (
          '<button class="tarjeta" style="text-align:left;cursor:pointer" data-accion="tema" data-id="' + t.id + '">' +
          '<div style="font-size:26px">' + t.icon + "</div>" +
          '<div class="fuerte">' + d.esc(t.label) + "</div>" +
          '<div class="barra-prog fina azul" style="margin-top:6px"><i style="width:' +
          Math.round(p.promedio * 100) + '%"></i></div>' +
          '<div class="mini apagado">' + Math.round(p.promedio * 100) + "% aprendido</div></button>"
        );
      }).join("") +
      "</div>"
    );
  }

  function tarjetaContrarreloj() {
    /* Va arriba de todo y con su propio color: es lo que se toca cuando hay
     * cinco minutos muertos en la fila del supermercado, que es cuando de
     * verdad se practica. */
    const marca = A().mejorMarca("contrarreloj");
    return (
      '<button class="tarjeta fila" style="width:100%;text-align:left;cursor:pointer;' +
      'border-color:var(--dorado);background:rgba(255,200,0,.09)" data-accion="contrarreloj">' +
      '<span style="font-size:30px">⏱️</span>' +
      '<span class="crece"><span class="fuerte" style="display:block">Contrarreloj</span>' +
      '<span class="chico apagado">' +
      (marca ? "Tu récord: " + marca + " en un minuto" : "Un minuto. ¿Cuántas puedes?") +
      "</span></span>" +
      '<span class="apagado">›</span></button>'
    );
  }

  function tarjetaAccion(emo, titulo, sub, accion, activa) {
    return (
      '<button class="tarjeta fila" style="width:100%;text-align:left;cursor:pointer' +
      (activa ? "" : ";opacity:.55") + '" data-accion="' + accion + '">' +
      '<span style="font-size:30px">' + emo + "</span>" +
      '<span class="crece"><span class="fuerte" style="display:block">' + d.esc(titulo) + "</span>" +
      '<span class="chico apagado">' + d.esc(sub) + "</span></span>" +
      '<span class="apagado">›</span></button>'
    );
  }

  /* ---------------- Progreso ---------------- */

  function progreso() {
    const e = A().estado();
    const n = A().nivel();
    const r = APP.srs.resumen();
    const sem = A().semana();
    const maxSem = Math.max(e.metaDiaria, Math.max.apply(null, sem.map(function (x) { return x.xp; })));
    const nombresDia = ["D", "L", "M", "M", "J", "V", "S"];

    return (
      "<h1>Tu progreso</h1>" +

      '<div class="tarjeta">' +
      '<div class="fila entre"><span class="fuerte">Nivel ' + n.nivel + "</span>" +
      '<span class="mini apagado">' + (n.xp - n.desde) + " / " + (n.hasta - n.desde) + " XP</span></div>" +
      '<div class="barra-prog" style="margin-top:8px"><i style="width:' +
      Math.round(((n.xp - n.desde) / (n.hasta - n.desde)) * 100) + '%"></i></div>' +
      '<div class="mini apagado" style="margin-top:6px">' + n.xp + " XP en total</div></div>" +

      '<div class="tarjeta"><h3>Esta semana</h3>' +
      '<div class="semana">' +
      sem.map(function (x, i) {
        const alto = Math.round((x.xp / maxSem) * 76);
        const dia = new Date(x.fecha.split("-")[0], x.fecha.split("-")[1] - 1, x.fecha.split("-")[2]).getDay();
        return (
          '<div class="dia"><div class="bar ' + (x.xp >= e.metaDiaria ? "meta" : x.xp ? "hay" : "") +
          '" style="height:' + Math.max(4, alto) + 'px" title="' + x.xp + ' XP"></div>' +
          '<div class="et">' + nombresDia[dia] + "</div></div>"
        );
      }).join("") +
      "</div>" +
      '<div class="mini apagado centro">Dorado = meta cumplida (' + e.metaDiaria + " XP)</div></div>" +

      '<div class="tarjeta"><h3>Vocabulario</h3>' +
      fila("Aprendidas de memoria", r.aprendidas) +
      fila("En proceso", r.enCurso) +
      fila("Sin ver todavía", r.total - r.vistas) +
      fila("Pendientes de repaso hoy", r.pendientes) +
      '<div class="barra-prog" style="margin-top:10px"><i style="width:' +
      Math.round((r.aprendidas / r.total) * 100) + '%"></i></div>' +
      '<div class="mini apagado" style="margin-top:6px">' + r.aprendidas + " de " + r.total +
      " palabras y frases del curso</div></div>" +

      '<div class="tarjeta"><h3>Racha</h3>' +
      fila("Racha actual", dias(A().rachaViva())) +
      fila("Tu mejor racha", dias(e.racha.mejor)) +
      fila("Escudos disponibles", e.racha.escudos) +
      '<div class="mini apagado" style="margin-top:8px">Un escudo salva la racha si te saltas un día. ' +
      "No se compran: se ganan quedándose.</div></div>" +

      '<div class="tarjeta"><h3>Logros</h3><div class="logros">' +
      APP.logros.todos().map(function (l) {
        return (
          '<div class="logro' + (l.ganado ? " ganado" : "") + '" title="' + d.esc(l.pista) + '">' +
          '<div class="emo">' + l.emo + "</div>" +
          '<div class="nom">' + d.esc(l.nombre) + "</div></div>"
        );
      }).join("") +
      "</div></div>" +

      (APP.srs.debiles(8).length
        ? '<div class="tarjeta"><h3>Lo que más te cuesta</h3><ul class="lista-limpia">' +
          APP.srs.debiles(8).map(function (id) {
            const t = APP.datos.porId(id);
            const s = APP.srs.tarjeta(id);
            return (
              '<li class="fila entre" style="padding:6px 0;border-bottom:1px solid var(--borde)">' +
              '<span class="crece"><b>' + d.esc(t.en) + '</b><br><span class="mini apagado">' +
              d.esc(t.es) + "</span></span>" +
              '<button class="icono-btn" data-accion="audio" data-texto="' + d.esc(t.en) + '">🔊</button>' +
              '<span class="pastilla">' + s.fallos + " ✗</span></li>"
            );
          }).join("") +
          "</ul></div>"
        : "")
    );
  }

  function dias(n) {
    return n + (n === 1 ? " día" : " días");
  }

  function fila(etiqueta, valor) {
    return (
      '<div class="fila entre" style="padding:4px 0"><span class="chico apagado">' + d.esc(etiqueta) +
      '</span><span class="fuerte">' + d.esc(valor) + "</span></div>"
    );
  }

  /* ---------------- Ajustes ---------------- */

  function ajustes() {
    const e = A().estado();
    const a = e.ajustes;
    return (
      "<h1>Ajustes</h1>" +

      '<div class="tarjeta"><h3>Meta diaria</h3>' +
      '<div class="seg">' +
      [["Suave", 20], ["Normal", 30], ["En serio", 50], ["Intensa", 80]].map(function (m) {
        return (
          '<button class="' + (e.metaDiaria === m[1] ? "activa" : "") + '" data-accion="meta" data-v="' +
          m[1] + '">' + m[0] + "<br><span class='mini'>" + m[1] + " XP</span></button>"
        );
      }).join("") +
      "</div>" +
      '<div class="mini apagado" style="margin-top:8px">Una lección da entre 100 y 160 XP.</div></div>' +

      '<div class="tarjeta"><h3>Voz</h3>' +
      '<div class="chico apagado" style="margin-bottom:6px">Acento</div>' +
      '<div class="seg">' +
      [["Británico", "en-GB"], ["Americano", "en-US"], ["Australiano", "en-AU"]].map(function (v) {
        return '<button class="' + (a.acento === v[1] ? "activa" : "") + '" data-accion="acento" data-v="' + v[1] + '">' + v[0] + "</button>";
      }).join("") +
      "</div>" +
      '<div class="chico apagado" style="margin:12px 0 6px">Velocidad al hablar: ' + a.velocidad.toFixed(2) + "×</div>" +
      '<input type="range" min="0.5" max="1.2" step="0.05" value="' + a.velocidad +
      '" data-accion="velocidad" style="width:100%">' +
      '<button class="btn azul chico" style="margin-top:10px" data-accion="audio" data-texto="Hello, this is how I sound.">🔊 Probar la voz</button>' +
      (APP.audio.hayVoz() ? "" : '<div class="aviso ojo mini" style="margin-top:10px">Este navegador no tiene voz. Prueba con Chrome o Safari.</div>') +
      "</div>" +

      '<div class="tarjeta"><h3>Cómo practicas</h3>' +
      palanca("Vidas (corazones)", "corazones", a.corazones !== false,
        "Con vidas apagadas puedes equivocarte sin que la lección se corte.") +
      palanca("Ejercicios de escribir", "teclado", a.teclado !== false,
        "Escribir en inglés en el teléfono es lento; puedes dejar sólo fichas y opciones.") +
      palanca("Ejercicios de hablar", "microfono", a.microfono !== false,
        "Necesita permiso del micrófono. Siempre puedes saltarte uno.") +
      palanca("Sonidos", "sonido", a.sonido !== false, "") +
      palanca("Vibración", "vibrar", a.vibrar !== false, "") +
      "</div>" +

      '<div class="tarjeta"><h3>Apariencia</h3>' +
      '<div class="seg">' +
      [["Automático", "auto"], ["Claro", "claro"], ["Oscuro", "oscuro"]].map(function (t) {
        return '<button class="' + (a.tema === t[1] ? "activa" : "") + '" data-accion="apariencia" data-v="' + t[1] + '">' + t[0] + "</button>";
      }).join("") +
      "</div></div>" +

      tarjetaCuenta() +

      '<div class="tarjeta"><h3>Tu progreso</h3>' +
      /* Dos textos distintos porque son dos situaciones distintas: sin cuenta
       * el respaldo es la única red de seguridad que hay, y decirlo con todas
       * sus letras es lo que evita la llamada de "perdí todo". Con cuenta ya
       * hay una copia fuera, y repetir la advertencia sonaría a que el
       * servidor no sirve. */
      '<p class="chico apagado">' +
      (APP.cuenta.estado().conectado
        ? "Tu avance está en este aparato y también en tu cuenta. Un respaldo sirve igual " +
          "para llevártelo a otra parte o guardarlo aparte."
        : "Todo se guarda sólo en este teléfono: no hay cuenta ni servidor. " +
          "Si cambias de teléfono o borras los datos del navegador, se pierde. Guarda un respaldo " +
          "de vez en cuando: descárgalo como archivo, o cópialo y mándatelo por mensaje.") +
      "</p>" +
      '<button class="btn azul chico" data-accion="exportar">⬇️ Descargar respaldo</button> ' +
      '<button class="btn hueco chico" data-accion="copiar">📋 Copiar</button> ' +
      '<button class="btn hueco chico" data-accion="importar">⬆️ Restaurar</button>' +
      '<div class="mini apagado" style="margin-top:8px">Restaurar junta el respaldo con lo que ya tienes acá: ' +
      "nunca hace perder lo practicado después.</div>" +
      '<input type="file" id="archivo" accept="application/json,.json" style="display:none">' +
      "</div>" +

      '<div class="tarjeta"><h3>Instalar en el teléfono</h3>' +
      '<p class="chico apagado">Instalada funciona sin internet y se abre a pantalla completa, ' +
      "como cualquier otra aplicación.</p>" +
      '<p class="chico"><b>Android (Chrome):</b> menú ⋮ → “Añadir a pantalla de inicio”.<br>' +
      "<b>iPhone (Safari):</b> compartir <span aria-hidden=\"true\">􀈂</span> → “Añadir a pantalla de inicio”.</p>" +
      '<div id="instalar-caja"></div></div>' +

      '<div class="tarjeta"><h3>Empezar de nuevo</h3>' +
      '<p class="chico apagado">Borra el avance, la racha y el vocabulario aprendido. No se puede deshacer.</p>' +
      '<button class="btn rojo chico" data-accion="borrar">Borrar todo mi progreso</button></div>' +

      '<p class="mini apagado centro" style="margin-top:16px">Hecha para aprender inglés de verdad: ' +
      "sin anuncios, sin suscripción, sin límite de tiempo.</p>"
    );
  }

  function tarjetaCuenta() {
    const e = APP.cuenta.estado();

    if (!e.conectado) {
      return (
        '<div class="tarjeta"><h3>Tu cuenta</h3>' +
        '<p class="chico apagado">Ahora mismo tu avance vive sólo en este aparato: si borras los datos ' +
        "del navegador o cambias de teléfono, se pierde.</p>" +
        '<p class="chico apagado">Con una cuenta queda guardado fuera, y puedes practicar en el teléfono ' +
        "y en el computador con la misma racha. Lo que ya practicaste no se pierde: se junta.</p>" +
        '<button class="btn" data-accion="crear-cuenta">Crear una cuenta</button>' +
        '<div style="height:8px"></div>' +
        '<button class="btn hueco" data-accion="entrar-cuenta">Ya tengo cuenta</button>' +
        (e.ultimoError
          ? '<div class="aviso ojo mini" style="margin-top:10px">' + d.esc(e.ultimoError) + "</div>"
          : "") +
        "</div>"
      );
    }

    return (
      '<div class="tarjeta"><h3>Tu cuenta</h3>' +
      '<div class="fila" style="gap:10px">' +
      '<span style="font-size:26px">👤</span>' +
      '<span class="crece"><b class="chico" style="word-break:break-all">' + d.esc(e.email) + "</b>" +
      '<br><span class="mini apagado">' +
      (e.sincronizando
        ? "Sincronizando…"
        : e.ultima
        ? "Al día · " + hace(e.ultima)
        : "Todavía no se ha sincronizado") +
      "</span></span></div>" +

      (e.ultimoError
        ? '<div class="aviso ojo mini" style="margin-top:10px">' + d.esc(e.ultimoError) + "</div>"
        : "") +

      '<div style="margin-top:12px">' +
      '<button class="btn azul chico" data-accion="sync-ahora">🔄 Sincronizar ahora</button> ' +
      '<button class="btn hueco chico" data-accion="cambiar-clave">Cambiar contraseña</button>' +
      "</div>" +
      '<div class="mini apagado" style="margin-top:10px">Se sincroniza sola al abrir la aplicación y al ' +
      "terminar cada lección. Lo practicado en dos aparatos se junta, no se pisa.</div>" +

      '<div style="margin-top:12px">' +
      '<button class="btn hueco chico" data-accion="salir-cuenta">Cerrar sesión</button> ' +
      '<button class="btn hueco chico" data-accion="borrar-cuenta">Borrar la cuenta</button>' +
      "</div></div>"
    );
  }

  function hace(momento) {
    const seg = Math.round((Date.now() - momento) / 1000);
    if (seg < 60) return "hace un momento";
    if (seg < 3600) return "hace " + Math.round(seg / 60) + " min";
    if (seg < 86400) return "hace " + Math.round(seg / 3600) + " h";
    return "hace " + Math.round(seg / 86400) + " días";
  }

  function palanca(etiqueta, clave, valor, ayuda) {
    return (
      '<div class="interruptor"><div class="crece"><div class="fuerte chico">' + d.esc(etiqueta) + "</div>" +
      (ayuda ? '<div class="mini apagado">' + d.esc(ayuda) + "</div>" : "") + "</div>" +
      '<button class="palanca" role="switch" aria-checked="' + (valor ? "true" : "false") +
      '" data-accion="palanca" data-clave="' + clave + '"><i></i></button></div>'
    );
  }

  /* ---------------- Sesiones ---------------- */

  function abrirLeccion(id) {
    const l = APP.curriculo.leccion(id);
    if (!l) return;
    if (A().estado().ajustes.corazones !== false && A().vidas() <= 0) {
      avisoSinVidas();
      return;
    }
    const ejercicios = filtrar(APP.motor.sesionLeccion(l));
    APP.leccion.iniciar({
      ejercicios: ejercicios,
      titulo: l.titulo,
      modo: "camino",
      leccionId: l.id,
      alTerminar: pintar,
    });
  }

  function filtrar(ejercicios) {
    /* Respeta los ajustes: si apagó el teclado o el micrófono, esos ejercicios
     * no aparecen. Se filtra acá y no en el motor porque es una preferencia de
     * la persona, no una regla del contenido. */
    const a = A().estado().ajustes;
    return ejercicios.filter(function (e) {
      if (a.teclado === false && e.tipo === "escribe") return false;
      if (a.microfono === false && e.tipo === "habla") return false;
      return true;
    });
  }

  function repaso() {
    const ejercicios = filtrar(APP.motor.sesionRepaso(15));
    if (!ejercicios.length) {
      d.avisar("Repaso al día", "No tienes nada vencido. Avanza en el camino y el repaso se llena solo.");
      return;
    }
    APP.leccion.iniciar({ ejercicios: ejercicios, titulo: "Repaso", modo: "repaso", corazones: false, alTerminar: pintar });
  }

  function repasoDeRescate() {
    /* El repaso que devuelve las vidas. Es a propósito lo que más le conviene
     * hacer en ese momento: en vez de castigarla con una espera, se le ofrece
     * practicar justo lo que está fallando. */
    let ejercicios = filtrar(APP.motor.sesionErrores(10));
    if (ejercicios.length < 5) ejercicios = ejercicios.concat(filtrar(APP.motor.sesionRepaso(10)));
    if (!ejercicios.length) {
      A().llenarVidas();
      pintar();
      return;
    }
    APP.leccion.iniciar({
      ejercicios: ejercicios,
      titulo: "Recuperar vidas",
      modo: "repaso",
      corazones: false,
      alTerminar: function () {
        A().llenarVidas();
        pintar();
      },
    });
  }

  function errores() {
    const ejercicios = filtrar(APP.motor.sesionErrores(12));
    if (!ejercicios.length) {
      d.avisar("Cuaderno vacío", "Todavía no has fallado nada. Buena señal.");
      return;
    }
    APP.leccion.iniciar({ ejercicios: ejercicios, titulo: "Errores", modo: "errores", corazones: false, alTerminar: pintar });
  }

  function tema(id) {
    const ejercicios = filtrar(APP.motor.sesionTema(id, 12));
    if (!ejercicios.length) return;
    APP.leccion.iniciar({ ejercicios: ejercicios, titulo: id, modo: "practica", corazones: false, alTerminar: pintar });
  }

  function contrarreloj() {
    /* Sólo preguntas de tocar y seguir: escribir o hablar contra el reloj es
     * frustrante, no rápido. Se arma una tanda larga porque en un minuto bueno
     * se contestan más de veinte, y la lista se recorre en círculo. */
    const banco = APP.datos.TEMAS.map(function (t) { return t.id; });
    const ejercicios = APP.motor.sesionLeccion({
      skills: banco,
      tipos: ["elige-en", "elige-es", "escucha-elige"],
      n: 45,
    });
    if (ejercicios.length < 5) {
      d.avisar("Todavía no", "Necesitas practicar un poco más antes de correr contra el reloj.");
      return;
    }
    APP.leccion.iniciar({
      ejercicios: ejercicios,
      titulo: "Contrarreloj",
      modo: "contrarreloj",
      corazones: false,
      alTerminar: pintar,
      alRepetir: contrarreloj,
    });
  }


  /* ---------------- Hojas emergentes ---------------- */

  function hoja(contenido, alTocar) {
    const velo = document.createElement("div");
    velo.className = "velo";
    velo.innerHTML = '<div class="hoja">' + contenido + "</div>";
    document.body.appendChild(velo);
    velo.addEventListener("click", function (ev) {
      if (ev.target === velo) return velo.remove();
      const b = ev.target.closest("[data-accion]");
      if (!b) return;
      const a = b.getAttribute("data-accion");
      if (a === "cerrar-hoja") return velo.remove();
      if (a === "audio") return APP.audio.hablar(b.getAttribute("data-texto"));
      if (alTocar) alTocar(a, b, velo);
    });
    return velo;
  }

  function avisoSinVidas() {
    hoja(
      '<div class="centro">' + APP.mascota.svg("triste", 96) + "</div>" +
      '<h2 class="centro">Sin vidas</h2>' +
      '<p class="centro apagado chico">La próxima llega en ' + d.minutos(A().segundosParaVida()) +
      ". Mientras tanto puedes practicar sin gastar vidas.</p>" +
      '<button class="btn" data-accion="rescate">Recuperar practicando</button><div style="height:8px"></div>' +
      '<button class="btn hueco" data-accion="cerrar-hoja">Ahora no</button>',
      function (a, b, velo) {
        if (a === "rescate") {
          velo.remove();
          repasoDeRescate();
        }
      }
    );
  }

  /* ---------------- Gramática ---------------- */

  function pantallaGramatica() {
    const G = APP.datosGramatica;
    hoja(
      '<div class="fila entre"><h2>Gramática</h2>' +
      '<button class="icono-btn" data-accion="cerrar-hoja">✕</button></div>' +
      '<p class="chico apagado">Cómo se arma el inglés, explicado comparándolo con el español. ' +
      "Cada tema termina con el error típico y por qué se comete.</p>" +

      '<button class="btn" style="margin-top:10px" data-accion="gram-trampas">' +
      "⚡ Repasar las 17 trampas</button>" +
      '<div class="mini apagado" style="margin-top:6px">Los errores concretos que hay que dejar de cometer, todos seguidos.</div>' +

      G.GRUPOS.map(function (grupo) {
        return (
          '<h3 style="margin-top:20px">' + d.esc(grupo) + "</h3>" +
          '<div style="display:flex;flex-direction:column;gap:8px">' +
          G.delGrupo(grupo).map(function (t) {
            const f = APP.gramatica.progresoDeTema(t);
            return (
              '<button class="tarjeta fila" style="width:100%;text-align:left;cursor:pointer;padding:12px" ' +
              'data-accion="ver-gramatica" data-id="' + t.id + '">' +
              '<span style="font-size:24px">' + t.emo + "</span>" +
              '<span class="crece"><span class="fuerte" style="display:block">' + d.esc(t.titulo) + "</span>" +
              '<span class="mini apagado">' + d.esc(t.resumen) + "</span>" +
              '<span class="barra-prog fina" style="margin-top:6px"><i style="width:' +
              Math.round(f * 100) + '%"></i></span></span>' +
              '<span class="apagado">›</span></button>'
            );
          }).join("") +
          "</div>"
        );
      }).join(""),
      function (a, b, velo) {
        if (a === "ver-gramatica") {
          velo.remove();
          fichaGramatica(b.getAttribute("data-id"));
        } else if (a === "gram-trampas") {
          velo.remove();
          const ejercicios = filtrar(APP.gramatica.sesionMezcla(12));
          if (!ejercicios.length) return;
          APP.leccion.iniciar({
            ejercicios: ejercicios, titulo: "Trampas", modo: "practica",
            corazones: false, alTerminar: pintar,
          });
        }
      }
    );
  }

  function fichaGramatica(id) {
    const t = APP.datosGramatica.tema(id);
    if (!t) return;

    hoja(
      '<div class="fila entre"><h2>' + d.esc(t.titulo) + "</h2>" +
      '<button class="icono-btn" data-accion="cerrar-hoja">✕</button></div>' +
      '<p class="chico apagado">' + d.esc(t.resumen) + "</p>" +

      // La explicación viene con párrafos y con algo de negrita; se parte por
      // los saltos de línea y se deja pasar sólo <b>, que es lo único que usa.
      '<div class="explica">' +
      t.explicacion.split("\n\n").map(function (parrafo) {
        return "<p>" + permitirNegrita(parrafo) + "</p>";
      }).join("") +
      "</div>" +

      (t.tabla
        ? '<div class="envoltorio"><table class="gram-tabla">' +
          "<thead><tr>" +
          t.tabla.cabecera.map(function (c) { return "<th>" + d.esc(c) + "</th>"; }).join("") +
          "</tr></thead><tbody>" +
          t.tabla.filas.map(function (f) {
            return "<tr>" + f.map(function (c, i) {
              return "<td" + (i === 0 ? ' class="clave"' : "") + ">" + d.esc(c) + "</td>";
            }).join("") + "</tr>";
          }).join("") +
          "</tbody></table></div>"
        : "") +

      '<div class="trampa">' +
      '<div class="tit">⚠️ El error típico</div>' +
      '<div class="linea-mal"><span class="marca">✗</span> ' + d.esc(t.trampa.mal) + "</div>" +
      '<button class="linea-bien" data-accion="audio" data-texto="' + d.esc(t.trampa.bien) + '">' +
      '<span class="marca">✓</span> ' + d.esc(t.trampa.bien) + " 🔊</button>" +
      '<div class="porque">' + permitirNegrita(t.trampa.porque) + "</div>" +
      "</div>" +

      '<h3 style="margin-top:18px">Ejemplos</h3>' +
      '<ul class="lista-limpia">' +
      t.ejemplos.map(function (e) {
        return (
          '<li class="fila" style="padding:9px 0;border-bottom:1px solid var(--borde)">' +
          '<span class="crece"><b>' + d.esc(e.en) + '</b><br><span class="chico apagado">' +
          d.esc(e.es) + "</span></span>" +
          '<button class="icono-btn" data-accion="audio" data-texto="' + d.esc(e.en) + '">🔊</button></li>'
        );
      }).join("") +
      "</ul>" +

      '<button class="btn" style="margin-top:14px" data-accion="practicar-gramatica">Practicar este tema</button>' +
      '<div style="height:8px"></div>' +
      '<button class="btn hueco" data-accion="volver-gramatica">Volver a los temas</button>',
      function (a, b, velo) {
        if (a === "practicar-gramatica") {
          velo.remove();
          const ejercicios = filtrar(APP.gramatica.sesionDeUnTema(t, 10));
          if (!ejercicios.length) return d.avisar("Nada que practicar", "Revisa los ajustes de teclado.");
          APP.leccion.iniciar({
            ejercicios: ejercicios, titulo: t.titulo, modo: "practica",
            corazones: false, alTerminar: function () { pintar(); fichaGramatica(id); },
          });
        } else if (a === "volver-gramatica") {
          velo.remove();
          pantallaGramatica();
        }
      }
    );
  }

  function permitirNegrita(texto) {
    /* El contenido es nuestro, pero igual se escapa todo y después se
     * devuelven sólo las negritas: así, si algún día un texto trae un signo
     * raro, no se puede colar nada por accidente. */
    return d.esc(texto).replace(/&lt;b&gt;/g, "<b>").replace(/&lt;\/b&gt;/g, "</b>");
  }

  /* ---------------- Verbos ---------------- */

  const MODOS_VERBO = [
    { id: "presente", emo: "⏰", nombre: "Presente", sub: "El verbo con -s de he/she/it" },
    { id: "pasado", emo: "⏮️", nombre: "Pasado", sub: "Regulares e irregulares" },
    { id: "futuro", emo: "⏭️", nombre: "Futuro", sub: "will + verbo base" },
    { id: "participio", emo: "✅", nombre: "Participio", sub: "have / has + …" },
    { id: "irregulares", emo: "🔥", nombre: "Sólo irregulares", sub: "Los 60 que hay que memorizar" },
    { id: "significado", emo: "🇪🇸", nombre: "Significados", sub: "Qué quiere decir cada uno" },
    { id: "mixto", emo: "🎲", nombre: "Todo mezclado", sub: "Los cuatro tiempos revueltos" },
  ];

  function pantallaVerbos(filtro) {
    const texto = (filtro || "").trim().toLowerCase();
    const lista = APP.datosVerbos.VERBOS.filter(function (v) {
      if (!texto) return true;
      return (v.base + " " + v.pasado + " " + v.participio + " " + v.es).toLowerCase().indexOf(texto) >= 0;
    });

    const velo = hoja(
      '<div class="fila entre"><h2>Verbos</h2>' +
      '<button class="icono-btn" data-accion="cerrar-hoja">✕</button></div>' +
      '<p class="chico apagado">Los 102 verbos que de verdad se usan, con sus cinco formas. ' +
      "Toca uno para ver toda su conjugación.</p>" +

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0">' +
      MODOS_VERBO.map(function (m) {
        return (
          '<button class="tarjeta" style="text-align:left;padding:11px" data-accion="verbo-modo" data-id="' + m.id + '">' +
          '<div style="font-size:20px">' + m.emo + "</div>" +
          '<div class="fuerte chico">' + d.esc(m.nombre) + "</div>" +
          '<div class="mini apagado">' + d.esc(m.sub) + "</div></button>"
        );
      }).join("") +
      "</div>" +

      '<input class="campo" id="buscar-verbo" style="min-height:auto" autocapitalize="none" ' +
      'autocorrect="off" spellcheck="false" placeholder="Buscar un verbo…" value="' + d.esc(filtro || "") + '">' +
      '<div class="mini apagado" style="margin:8px 0">' + lista.length + " verbos</div>" +

      '<ul class="lista-limpia">' +
      lista.map(function (v) {
        const f = APP.srs.fuerza(APP.verbos.idTarjeta(v, "pasado"));
        return (
          '<li><button class="fila" style="width:100%;text-align:left;background:none;border:none;' +
          'border-bottom:1px solid var(--borde);padding:10px 0;font:inherit;color:inherit;cursor:pointer" ' +
          'data-accion="ver-verbo" data-id="' + d.esc(v.base) + '">' +
          '<span class="crece"><b>' + d.esc(v.base) + "</b>" +
          (v.irregular ? ' <span class="pastilla mini" style="background:var(--rojo-suave);color:var(--rojo-oscuro)">irr</span>' : "") +
          '<br><span class="mini apagado">' + d.esc(v.pasado) + " · " + d.esc(v.participio) + " · " + d.esc(v.es) + "</span></span>" +
          '<span class="barra-prog fina" style="width:44px;flex:none"><i style="width:' +
          Math.round(f * 100) + '%"></i></span>' +
          '<span class="apagado">›</span></button></li>'
        );
      }).join("") +
      "</ul>",
      function (a, b, v) {
        if (a === "verbo-modo") {
          v.remove();
          practicarVerbos(b.getAttribute("data-id"));
        } else if (a === "ver-verbo") {
          const verbo = APP.datosVerbos.VERBOS.filter(function (x) { return x.base === b.getAttribute("data-id"); })[0];
          v.remove();
          fichaVerbo(verbo);
        }
      }
    );

    // La búsqueda redibuja la hoja entera conservando el foco y el texto: con
    // cien verbos, filtrar es la única forma cómoda de llegar a uno.
    const campo = d.$("#buscar-verbo", velo);
    if (campo) {
      campo.addEventListener("input", function () {
        const valor = campo.value;
        const posicion = campo.selectionStart;
        velo.remove();
        const nuevoVelo = pantallaVerbos(valor);
        const nuevoCampo = d.$("#buscar-verbo", nuevoVelo);
        if (nuevoCampo) {
          nuevoCampo.focus();
          try { nuevoCampo.setSelectionRange(posicion, posicion); } catch (e) { /* da igual */ }
        }
      });
    }
    return velo;
  }

  function fichaVerbo(v) {
    if (!v) return;
    hoja(
      '<div class="fila entre"><h2>' + d.esc(v.base) + "</h2>" +
      '<button class="icono-btn" data-accion="cerrar-hoja">✕</button></div>' +
      '<p class="chico apagado">' + d.esc(v.es) +
      (v.irregular ? " · verbo irregular" : " · verbo regular") + "</p>" +

      '<button class="btn azul chico" data-accion="audio" data-texto="' + d.esc(v.base) + '">🔊 Escuchar</button>' +

      '<h3 style="margin-top:18px">Las cinco formas</h3>' +
      '<div class="formas">' +
      APP.verbos.formasPrincipales(v).map(function (f) {
        return (
          '<button class="forma" data-accion="audio" data-texto="' + d.esc(f.valor.split(" / ")[0]) + '">' +
          '<span class="et">' + d.esc(f.etiqueta) + "</span>" +
          '<span class="val">' + d.esc(f.valor) + "</span>" +
          '<span class="ay">' + d.esc(f.ayuda) + "</span></button>"
        );
      }).join("") +
      "</div>" +
      (v.nota ? '<div class="aviso ojo mini">' + d.esc(v.nota) + "</div>" : "") +

      '<h3 style="margin-top:20px">En cada tiempo</h3>' +
      APP.verbos.tabla(v).map(function (bloque) {
        return (
          '<div class="tarjeta plana" style="margin-bottom:10px">' +
          '<div class="fila entre"><b class="chico">' + d.esc(bloque.tiempo.nombre) + "</b>" +
          '<button class="icono-btn" data-accion="audio" data-texto="' +
          d.esc(bloque.filas.map(function (f) { return f.texto; }).join(". ")) + '">🔊</button></div>' +
          '<div class="mini apagado" style="margin-bottom:8px">' + d.esc(bloque.tiempo.cuando) + "</div>" +
          '<div class="conjuga">' +
          bloque.filas.map(function (f) {
            return (
              '<button class="linea" data-accion="audio" data-texto="' + d.esc(f.texto) + '">' +
              '<span class="quien">' + d.esc(f.persona.es) + "</span>" +
              '<span class="dice">' + d.esc(f.texto) + "</span></button>"
            );
          }).join("") +
          "</div></div>"
        );
      }).join("") +

      '<button class="btn" style="margin-top:12px" data-accion="practicar-verbo">Practicar este verbo</button>' +
      '<div style="height:8px"></div>' +
      '<button class="btn hueco" data-accion="volver-verbos">Volver a la lista</button>',
      function (a, b, velo) {
        if (a === "practicar-verbo") {
          velo.remove();
          const ejercicios = filtrar(APP.verbos.sesionDeUnVerbo(v, 8));
          if (!ejercicios.length) return d.avisar("Nada que practicar", "Revisa los ajustes de teclado y micrófono.");
          APP.leccion.iniciar({
            ejercicios: ejercicios, titulo: v.base, modo: "practica",
            corazones: false, alTerminar: function () { pintar(); fichaVerbo(v); },
          });
        } else if (a === "volver-verbos") {
          velo.remove();
          pantallaVerbos();
        }
      }
    );
  }

  function practicarVerbos(modo) {
    const ejercicios = filtrar(APP.verbos.sesion(modo, 12));
    if (!ejercicios.length) {
      d.avisar("Nada que practicar", "Revisa los ajustes de teclado y micrófono.");
      return;
    }
    const nombre = (MODOS_VERBO.filter(function (m) { return m.id === modo; })[0] || {}).nombre || "Verbos";
    APP.leccion.iniciar({
      ejercicios: ejercicios, titulo: nombre, modo: "practica",
      corazones: false, alTerminar: pintar,
    });
  }

  /* ---------------- Pronunciación ---------------- */

  function pantallaSonidos() {
    function grupo(tipo, titulo, explica) {
      const sonidos = APP.datosSonidos.SONIDOS.filter(function (s) { return s.tipo === tipo; });
      return (
        '<h3 style="margin-top:18px">' + d.esc(titulo) + "</h3>" +
        '<p class="mini apagado">' + d.esc(explica) + "</p>" +
        '<div class="sonidos">' +
        sonidos.map(function (s) {
          const p = APP.pronunciacion.progresoDeSonido(s.id);
          return (
            '<button class="sonido" data-accion="ver-sonido" data-id="' + s.id + '">' +
            '<span class="ipa">' + d.esc(s.simbolo) + "</span>" +
            '<span class="ej">' + d.esc(s.ejemplos[0]) + "</span>" +
            '<span class="barra-prog fina"><i style="width:' + Math.round(p * 100) + '%"></i></span>' +
            "</button>"
          );
        }).join("") +
        "</div>"
      );
    }

    hoja(
      '<div class="fila entre"><h2>Pronunciación</h2>' +
      '<button class="icono-btn" data-accion="cerrar-hoja">✕</button></div>' +
      '<p class="chico apagado">El español tiene cinco vocales; el inglés tiene veinte. ' +
      "Ahí está la mitad de por qué cuesta entender y que te entiendan.</p>" +

      '<div class="aviso mini">Primero se aprende a <b>oír</b> la diferencia. ' +
      "No se puede pronunciar algo que todavía no se distingue de oído.</div>" +

      '<button class="btn" data-accion="sonidos-todos">Practicar los 20 mezclados</button>' +
      '<div style="height:8px"></div>' +
      '<div class="fila" style="gap:8px">' +
      '<button class="btn hueco chico" style="flex:1" data-accion="sonidos-simples">Sólo vocales simples</button>' +
      '<button class="btn hueco chico" style="flex:1" data-accion="sonidos-diptongos">Sólo diptongos</button>' +
      "</div>" +

      grupo("simple", "Vocales simples (12)", "Un solo sonido, sostenido. La diferencia suele estar en si es larga o corta.") +
      grupo("diptongo", "Diptongos (8)", "Dos vocales seguidas en un solo golpe de voz: empieza en una y termina en otra."),
      function (a, b, velo) {
        if (a === "ver-sonido") {
          velo.remove();
          fichaSonido(b.getAttribute("data-id"));
        } else if (a === "sonidos-todos" || a === "sonidos-simples" || a === "sonidos-diptongos") {
          const filtro = a === "sonidos-simples" ? "simple" : a === "sonidos-diptongos" ? "diptongo" : null;
          velo.remove();
          practicarSonidos(filtro);
        }
      }
    );
  }

  function fichaSonido(id) {
    const s = APP.datosSonidos.sonido(id);
    if (!s) return;
    const pares = APP.datosSonidos.paresDe(id);

    hoja(
      '<div class="fila entre"><h2>El sonido /' + d.esc(s.simbolo) + "/</h2>" +
      '<button class="icono-btn" data-accion="cerrar-hoja">✕</button></div>' +
      '<p class="chico apagado">' + d.esc(s.nombre) + " · " +
      (s.tipo === "simple" ? "vocal simple" : "diptongo") + "</p>" +

      '<div class="ipa-grande">' + d.esc(s.simbolo) + "</div>" +

      '<div class="fila" style="gap:8px;flex-wrap:wrap;justify-content:center">' +
      s.ejemplos.map(function (e) {
        return '<button class="btn azul chico" data-accion="audio" data-texto="' + d.esc(e) + '">🔊 ' + d.esc(e) + "</button>";
      }).join("") +
      "</div>" +

      '<div class="tarjeta" style="margin-top:16px"><h3>Cómo se hace</h3>' +
      "<p class=\"chico\">" + d.esc(s.comoSuena) + "</p></div>" +

      '<div class="tarjeta" style="border-color:var(--dorado);background:rgba(255,200,0,.08)">' +
      '<h3>La trampa</h3><p class="chico">' + d.esc(s.trampa) + "</p></div>" +

      (pares.length
        ? '<h3 style="margin-top:18px">Pares mínimos</h3>' +
          '<p class="mini apagado">Dos palabras que sólo se diferencian en la vocal. ' +
          "Si las distingues de oído, el sonido está aprendido.</p>" +
          '<ul class="lista-limpia">' +
          pares.map(function (p) {
            return (
              '<li class="fila" style="padding:9px 0;border-bottom:1px solid var(--borde)">' +
              '<button class="par-mini" data-accion="audio" data-texto="' + d.esc(p.a) + '">' +
              d.esc(p.a) + ' <span class="ipa">/' + d.esc(APP.datosSonidos.sonido(p.sonidoA).simbolo) + "/</span></button>" +
              '<button class="par-mini" data-accion="audio" data-texto="' + d.esc(p.b) + '">' +
              d.esc(p.b) + ' <span class="ipa">/' + d.esc(APP.datosSonidos.sonido(p.sonidoB).simbolo) + "/</span></button>" +
              '<span class="mini apagado crece" style="text-align:right">' + d.esc(p.es) + "</span></li>"
            );
          }).join("") +
          "</ul>"
        : '<div class="aviso mini" style="margin-top:16px">Este sonido no tiene pares mínimos: ' +
          "sólo aparece en sílabas <b>sin acento</b>, así que nunca es lo único que distingue dos palabras. " +
          "Se practica reconociéndolo y repitiéndolo.</div>") +

      '<button class="btn" style="margin-top:16px" data-accion="practicar-sonido">Practicar este sonido</button>' +
      '<div style="height:8px"></div>' +
      '<button class="btn hueco" data-accion="volver-sonidos">Volver a los 20</button>',
      function (a, b, velo) {
        if (a === "practicar-sonido") {
          velo.remove();
          const ejercicios = filtrar(APP.pronunciacion.sesionDeUnSonido(id, 10));
          if (!ejercicios.length) {
            return d.avisar("No se puede practicar acá", "Este navegador no tiene voz, o la tienes apagada en Ajustes.");
          }
          APP.leccion.iniciar({
            ejercicios: ejercicios, titulo: s.simbolo, modo: "practica",
            corazones: false, alTerminar: function () { pintar(); fichaSonido(id); },
          });
        } else if (a === "volver-sonidos") {
          velo.remove();
          pantallaSonidos();
        }
      }
    );
  }

  function practicarSonidos(filtro) {
    const ejercicios = filtrar(APP.pronunciacion.sesionMezcla(filtro, 12));
    if (!ejercicios.length) {
      d.avisar("No se puede practicar acá", "Este navegador no tiene voz, o la tienes apagada en Ajustes.");
      return;
    }
    APP.leccion.iniciar({
      ejercicios: ejercicios, titulo: "Pronunciación", modo: "practica",
      corazones: false, alTerminar: pintar,
    });
  }

  function frasario() {
    const porTema = {};
    APP.datos.TARJETAS.filter(function (t) { return t.tipo === "frase"; }).forEach(function (t) {
      (porTema[t.skill] = porTema[t.skill] || []).push(t);
    });
    const nombres = {
      saludos: "👋 Saludar y presentarse", trabajo: "💼 Trabajo", oficina: "🧾 Contabilidad y compras",
      restaurante: "🍽️ Restaurante", comida: "🥗 Comida", actividades: "🎯 Planes",
      emociones: "❤️ Cómo me siento", objetos: "📦 Cosas", familia: "👨‍👩‍👧 Familia",
      casa: "🏠 Casa", presente: "⏰ Presente", pasado: "⏮️ Pasado", futuro: "⏭️ Futuro",
      numeros: "🔢 Números", colores: "🎨 Colores", calendario: "📅 Días y meses",
      clima: "🌦️ Clima", profesiones: "👩‍⚕️ Profesiones", cuerpo: "🧍 Cuerpo",
      transporte: "🚌 Transporte", inged: "🔤 -ing / -ed",
    };
    hoja(
      '<div class="fila entre"><h2>Frases útiles</h2>' +
      '<button class="icono-btn" data-accion="cerrar-hoja">✕</button></div>' +
      '<p class="chico apagado">Tócalas para escucharlas. Repítelas en voz alta hasta que salgan solas.</p>' +
      Object.keys(porTema).map(function (k) {
        return (
          '<h3 style="margin-top:16px">' + d.esc(nombres[k] || k) + "</h3>" +
          '<ul class="lista-limpia">' +
          porTema[k].map(function (t) {
            return (
              '<li class="fila" style="padding:8px 0;border-bottom:1px solid var(--borde)">' +
              '<span class="crece"><b>' + d.esc(t.en) + '</b><br><span class="chico apagado">' +
              d.esc(t.es) + "</span></span>" +
              '<button class="icono-btn" data-accion="audio" data-texto="' + d.esc(t.en) + '">🔊</button></li>'
            );
          }).join("") +
          "</ul>"
        );
      }).join("")
    );
  }

  /* ---------------- Canciones ----------------
   * Aprender con la letra de una canción que le gusta funciona mejor que
   * cualquier lista de vocabulario: la melodía hace de gancho para la memoria.
   * La letra la pega ella; no se descarga nada.
   */

  function canciones() {
    const lista = A().estado().canciones;
    hoja(
      '<div class="fila entre"><h2>Canciones</h2>' +
      '<button class="icono-btn" data-accion="cerrar-hoja">✕</button></div>' +
      (lista.length
        ? lista.map(function (c, i) {
            return (
              '<button class="tarjeta fila" style="width:100%;text-align:left" data-accion="abrir-cancion" data-i="' + i + '">' +
              '<span style="font-size:26px">🎵</span><span class="crece"><b>' + d.esc(c.titulo) + "</b><br>" +
              '<span class="chico apagado">' + d.esc(c.artista || "") + " · " + c.lineas.length + " líneas</span></span>›</button>"
            );
          }).join("")
        : '<p class="apagado chico">Todavía no agregas ninguna. Busca la letra de una canción que te guste, cópiala y pégala acá.</p>') +
      '<button class="btn" data-accion="nueva-cancion">➕ Agregar una canción</button>',
      function (a, b, velo) {
        if (a === "nueva-cancion") {
          velo.remove();
          nuevaCancion();
        } else if (a === "abrir-cancion") {
          velo.remove();
          verCancion(parseInt(b.getAttribute("data-i"), 10));
        }
      }
    );
  }

  function nuevaCancion() {
    hoja(
      '<div class="fila entre"><h2>Nueva canción</h2><button class="icono-btn" data-accion="cerrar-hoja">✕</button></div>' +
      '<input class="campo" id="c-titulo" style="min-height:auto;margin-bottom:8px" placeholder="Título">' +
      '<input class="campo" id="c-artista" style="min-height:auto;margin-bottom:8px" placeholder="Artista (opcional)">' +
      '<textarea class="campo" id="c-letra" rows="8" placeholder="Pega la letra acá, una línea por renglón"></textarea>' +
      '<button class="btn" style="margin-top:10px" data-accion="guardar-cancion">Guardar</button>',
      function (a, b, velo) {
        if (a !== "guardar-cancion") return;
        const titulo = d.$("#c-titulo", velo).value.trim();
        const letra = d.$("#c-letra", velo).value.trim();
        if (!titulo || !letra) {
          d.avisar("Falta algo", "Necesito al menos el título y la letra de la canción.");
          return;
        }
        const lineas = letra.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
        A().estado().canciones.push({
          titulo: titulo,
          artista: d.$("#c-artista", velo).value.trim(),
          lineas: lineas,
        });
        A().guardar();
        velo.remove();
        canciones();
      }
    );
  }

  function verCancion(i) {
    const c = A().estado().canciones[i];
    if (!c) return;
    hoja(
      '<div class="fila entre"><h2>' + d.esc(c.titulo) + "</h2>" +
      '<button class="icono-btn" data-accion="cerrar-hoja">✕</button></div>' +
      '<p class="chico apagado">' + d.esc(c.artista || "") + "</p>" +
      '<button class="btn azul chico" data-accion="audio" data-texto="' + d.esc(c.lineas.join(". ")) + '">🔊 Escuchar todo</button>' +
      '<ul class="lista-limpia" style="margin-top:12px">' +
      c.lineas.map(function (l) {
        return (
          '<li class="fila" style="padding:8px 0;border-bottom:1px solid var(--borde)">' +
          '<span class="crece">' + d.esc(l) + "</span>" +
          '<button class="icono-btn" data-accion="audio" data-texto="' + d.esc(l) + '">🔊</button></li>'
        );
      }).join("") +
      "</ul>" +
      '<button class="btn hueco chico" style="margin-top:12px" data-accion="borrar-cancion">Borrar esta canción</button>',
      function (a, b, velo) {
        if (a !== "borrar-cancion") return;
        d.confirmar({
          titulo: "¿Borrar “" + c.titulo + "”?",
          texto: "Se quita de tu lista. Puedes volver a pegarla cuando quieras.",
          si: "Borrar",
          peligroso: true,
          alConfirmar: function () {
            A().estado().canciones.splice(i, 1);
            A().guardar();
            velo.remove();
            canciones();
          },
        });
      }
    );
  }

  /* ---------------- Respaldo ---------------- */

  function exportar() {
    const blob = new Blob([A().exportar()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ingles-respaldo-" + A().hoy() + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
  }

  function copiarRespaldo() {
    /* La descarga no siempre está disponible: abierta dentro de otra página
     * (un enlace compartido, por ejemplo) el navegador la bloquea sin avisar.
     * Copiar el respaldo funciona en todos lados: se pega en una nota o se
     * manda por mensaje, y desde ahí se restaura. */
    const texto = A().exportar();
    function aviso(ok) {
      hoja(
        '<h2>' + (ok ? "Respaldo copiado" : "Copia esto y guárdalo") + "</h2>" +
        '<p class="chico apagado">Guárdalo en una nota o mándatelo por mensaje. ' +
        'Para volver a tener tu avance en otro teléfono, usa “Restaurar” y pega este texto en un archivo .json.</p>' +
        '<textarea class="campo" style="min-height:160px;font-size:12px" readonly>' +
        d.esc(texto) + "</textarea>" +
        '<button class="btn" style="margin-top:10px" data-accion="cerrar-hoja">Listo</button>'
      );
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () { aviso(true); }, function () { aviso(false); });
    } else {
      aviso(false);
    }
  }

  function importar() {
    const input = d.$("#archivo");
    if (!input) return;
    input.value = "";
    input.onchange = function () {
      const f = input.files[0];
      if (!f) return;
      const lector = new FileReader();
      lector.onload = function () {
        try {
          A().importar(lector.result);
          aplicarTema();
          pintar();
          d.avisar("Progreso restaurado", "Se juntó con lo que ya tenías en este aparato.");
        } catch (e) {
          d.avisar("No se pudo leer el archivo", e.message);
        }
      };
      lector.readAsText(f);
    };
    input.click();
  }

  function sincronizar(avisar) {
    pintar();
    APP.cuenta.sincronizar().then(function (r) {
      pintar();
      if (!avisar) return;
      if (r.ok) APP.audio.efectos.bien();
      else if (r.motivo && r.motivo !== "en-curso" && r.motivo !== "sin-cuenta") {
        d.avisar("No se pudo sincronizar", r.motivo);
      }
    });
  }

  function formularioCuenta(modo) {
    /* Un solo formulario para crear cuenta y para entrar: son los mismos dos
     * campos y la misma pantalla, cambia el texto y a dónde se manda. */
    const crear = modo === "crear";
    const velo = hoja(
      "<h2>" + (crear ? "Crear una cuenta" : "Entrar") + "</h2>" +
      '<p class="chico apagado">' +
      (crear
        ? "Sólo correo y contraseña. No mandamos correos ni pedimos nada más. " +
          "Lo que ya practicaste en este aparato se sube a la cuenta, no se pierde."
        : "Al entrar, lo que tengas acá se junta con lo de tu cuenta.") +
      "</p>" +
      '<input class="campo" id="c-email" type="email" style="min-height:auto;margin-bottom:8px" ' +
      'autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="tu@correo.cl">' +
      '<input class="campo" id="c-clave" type="password" style="min-height:auto" ' +
      'placeholder="' + (crear ? "Contraseña (mínimo 8 caracteres)" : "Contraseña") + '">' +
      '<div id="c-error"></div>' +
      '<button class="btn" style="margin-top:12px" data-accion="c-enviar">' +
      (crear ? "Crear cuenta" : "Entrar") + "</button>" +
      '<div style="height:8px"></div>' +
      '<button class="btn hueco" data-accion="c-cambiar">' +
      (crear ? "Ya tengo cuenta" : "Prefiero crear una cuenta") + "</button>",
      function (a, b, v) {
        if (a === "c-cambiar") {
          v.remove();
          return formularioCuenta(crear ? "entrar" : "crear");
        }
        if (a !== "c-enviar") return;

        const email = d.$("#c-email", v).value.trim();
        const clave = d.$("#c-clave", v).value;
        const caja = d.$("#c-error", v);
        const boton = b;

        if (!email || !clave) {
          caja.innerHTML = '<div class="aviso ojo mini" style="margin-top:10px">Falta el correo o la contraseña.</div>';
          return;
        }

        // El servidor puede estar dormido y tardar; sin este aviso parece colgado.
        boton.disabled = true;
        boton.textContent = crear ? "Creando…" : "Entrando…";
        caja.innerHTML = '<div class="mini apagado" style="margin-top:10px">Puede tardar unos segundos la primera vez.</div>';

        const accion = crear ? APP.cuenta.registrar : APP.cuenta.entrar;
        accion(email, clave).then(
          function () {
            v.remove();
            pintar();
            APP.fiesta.confeti({ cantidad: 60 });
            d.avisar(
              crear ? "Cuenta creada" : "Listo",
              "Tu avance quedó guardado en la cuenta. Entra con el mismo correo en tus otros aparatos."
            );
          },
          function (err) {
            boton.disabled = false;
            boton.textContent = crear ? "Crear cuenta" : "Entrar";
            caja.innerHTML = '<div class="aviso ojo mini" style="margin-top:10px">' + d.esc(err.message) + "</div>";
          }
        );
      }
    );
    const campo = d.$("#c-email", velo);
    if (campo) campo.focus();
    return velo;
  }

  function formularioClave() {
    hoja(
      "<h2>Cambiar contraseña</h2>" +
      '<input class="campo" id="k-actual" type="password" style="min-height:auto;margin-bottom:8px" placeholder="Contraseña actual">' +
      '<input class="campo" id="k-nueva" type="password" style="min-height:auto" placeholder="Contraseña nueva (mínimo 8)">' +
      '<div id="k-error"></div>' +
      '<button class="btn" style="margin-top:12px" data-accion="k-enviar">Cambiar</button>',
      function (a, b, v) {
        if (a !== "k-enviar") return;
        const caja = d.$("#k-error", v);
        b.disabled = true;
        APP.cuenta.cambiarClave(d.$("#k-actual", v).value, d.$("#k-nueva", v).value).then(
          function () {
            v.remove();
            d.avisar("Contraseña cambiada", "Úsala la próxima vez que entres.");
          },
          function (err) {
            b.disabled = false;
            caja.innerHTML = '<div class="aviso ojo mini" style="margin-top:10px">' + d.esc(err.message) + "</div>";
          }
        );
      }
    );
  }

  function confirmarBorrarCuenta() {
    hoja(
      "<h2>Borrar la cuenta</h2>" +
      '<p class="chico apagado">Se borra tu cuenta y la copia de tu avance que está en el servidor. ' +
      "No se puede deshacer.</p>" +
      '<p class="chico apagado">Lo que tienes guardado <b>en este teléfono</b> no se toca: puedes seguir ' +
      "practicando sin cuenta.</p>" +
      '<input class="campo" id="b-clave" type="password" style="min-height:auto" placeholder="Tu contraseña">' +
      '<div id="b-error"></div>' +
      '<button class="btn rojo" style="margin-top:12px" data-accion="b-enviar">Sí, borrar mi cuenta</button>' +
      '<div style="height:8px"></div>' +
      '<button class="btn hueco" data-accion="cerrar-hoja">Cancelar</button>',
      function (a, b, v) {
        if (a !== "b-enviar") return;
        const caja = d.$("#b-error", v);
        b.disabled = true;
        APP.cuenta.borrarCuenta(d.$("#b-clave", v).value).then(
          function () {
            v.remove();
            pintar();
            d.avisar("Cuenta borrada", "Tu avance sigue en este teléfono.");
          },
          function (err) {
            b.disabled = false;
            caja.innerHTML = '<div class="aviso ojo mini" style="margin-top:10px">' + d.esc(err.message) + "</div>";
          }
        );
      }
    );
  }

  function aplicarTema() {
    const t = A().estado().ajustes.tema;
    if (t === "auto") document.documentElement.removeAttribute("data-tema");
    else document.documentElement.setAttribute("data-tema", t);
  }

  /* ---------------- Eventos ---------------- */

  function enganchar() {
    raiz = d.$("#app");

    raiz.addEventListener("input", function (ev) {
      if (ev.target.getAttribute("data-accion") === "velocidad") {
        A().estado().ajustes.velocidad = parseFloat(ev.target.value);
        A().guardar();
        const et = ev.target.previousElementSibling;
        if (et) et.textContent = "Velocidad al hablar: " + parseFloat(ev.target.value).toFixed(2) + "×";
      }
    });

    d.alTocar(raiz, "[data-accion]", function (b) {
      const a = b.getAttribute("data-accion");
      const e = A().estado();

      if (a === "tab") {
        tab = b.getAttribute("data-tab");
        pintar();
        return;
      }
      if (a === "leccion") return abrirLeccion(b.getAttribute("data-id"));
      if (a === "repaso") return repaso();
      if (a === "errores") return errores();
      if (a === "tema") return tema(b.getAttribute("data-id"));
      if (a === "contrarreloj") return contrarreloj();
      if (a === "gramatica") return pantallaGramatica();
      if (a === "verbos") return pantallaVerbos();
      if (a === "sonidos") return pantallaSonidos();
      if (a === "cobrar-desafio") {
        const premio = APP.desafio.cobrar();
        pintar();
        if (!premio) return;
        APP.audio.efectos.record();
        APP.fiesta.confeti({ cantidad: 100 });
        d.avisar(
          "¡Desafío cumplido!",
          "+" + premio.xp + " XP" +
            (premio.escudo ? " y un escudo para tu racha." : ". Ya tienes todos los escudos.")
        );
        return;
      }
      if (a === "frasario") return frasario();
      if (a === "canciones") return canciones();
      if (a === "ver-vidas") {
        if (A().vidas() <= 0) avisoSinVidas();
        return;
      }
      if (a === "audio") return APP.audio.hablar(b.getAttribute("data-texto"));

      if (a === "meta") {
        e.metaDiaria = parseInt(b.getAttribute("data-v"), 10);
        A().guardar();
        pintar();
        return;
      }
      if (a === "acento") {
        e.ajustes.acento = b.getAttribute("data-v");
        A().guardar();
        APP.audio.reiniciarVoz();
        APP.audio.hablar("Hello, this is how I sound.");
        pintar();
        return;
      }
      if (a === "apariencia") {
        e.ajustes.tema = b.getAttribute("data-v");
        A().guardar();
        aplicarTema();
        pintar();
        return;
      }
      if (a === "palanca") {
        const k = b.getAttribute("data-clave");
        e.ajustes[k] = e.ajustes[k] === false;
        if (k === "corazones" && e.ajustes[k]) A().llenarVidas();
        A().guardar();
        pintar();
        return;
      }
      if (a === "crear-cuenta") return formularioCuenta("crear");
      if (a === "entrar-cuenta") return formularioCuenta("entrar");
      if (a === "cambiar-clave") return formularioClave();
      if (a === "borrar-cuenta") return confirmarBorrarCuenta();
      if (a === "sync-ahora") return sincronizar(true);
      if (a === "salir-cuenta") {
        d.confirmar({
          titulo: "¿Cerrar sesión?",
          texto: "Tu avance se queda en este teléfono. Puedes volver a entrar cuando quieras.",
          si: "Cerrar sesión",
          alConfirmar: function () {
            APP.cuenta.salir().then(function () { pintar(); });
          },
        });
        return;
      }

      if (a === "exportar") return exportar();
      if (a === "copiar") return copiarRespaldo();
      if (a === "importar") return importar();
      if (a === "borrar") {
        d.confirmar({
          titulo: "¿Borrar todo tu progreso?",
          texto: "Se pierden la racha, el XP, el vocabulario aprendido y los logros. No se puede deshacer.",
          si: "Sí, borrar todo",
          peligroso: true,
          alConfirmar: function () {
            A().borrarTodo();
            aplicarTema();
            pintar();
          },
        });
        return;
      }
    });
  }

  window.APP = window.APP || {};
  APP.pantallas = {
    pintar: pintar,
    enganchar: enganchar,
    aplicarTema: aplicarTema,
    repasoDeRescate: repasoDeRescate,
    irA: function (t) { tab = t; pintar(); },
  };
})();
