/* Las cuatro pantallas de la aplicación y la navegación entre ellas.
 *
 * Camino → qué toca aprender hoy.
 * Práctica → repasar, corregir errores, frases y canciones.
 * Progreso → cuánto llevas de verdad, no cuántos días seguidos abriste la app.
 * Ajustes → voz, teclado y respaldo.
 *
 * Se redibuja la pantalla completa en cada cambio. Es más simple que llevar la
 * cuenta de qué nodo cambió, y a esta escala no se nota.
 */
(function () {
  "use strict";

  const d = APP.dom;
  const A = function () { return APP.almacen; };
  let tab = "camino";
  // Una "vista" es una pantalla que se abre por encima de la pestaña y se
  // cierra volviendo: Reglas, por ahora.
  let vista = null;
  // Qué unidades están desplegadas en el índice. En memoria y no guardado: es
  // cómo estás mirando la pantalla ahora, no parte de tu avance.
  const desplegadas = {};
  let raiz = null;

  function pintar() {
    if (!raiz) raiz = d.$("#app");
    /* En pantalla ancha el índice se va a una columna fija a la izquierda y el
     * contenido queda a la derecha. En el teléfono no existe: ahí la columna
     * lateral se come el ancho que necesita lo que se está leyendo, y el
     * índice ya vive en la pestaña Curso.
     *
     * Se dibujan siempre los dos y es el CSS el que decide cuál se ve. Así no
     * hay que volver a dibujar la pantalla al girar el teléfono ni al cambiar
     * el tamaño de la ventana. */
    raiz.innerHTML =
      lateral() +
      '<main class="principal">' +
      barraSuperior() +
      '<div class="contenido">' + contenido() + "</div>" +
      "</main>" +
      buscador() +
      navegacion();
    // El buscador conserva lo que hubiera escrito: redibujar la pantalla no
    // puede borrarle la consulta a medio escribir.
    const campo = d.$("#dic-campo", raiz);
    if (campo && ultimaBusqueda) campo.value = ultimaBusqueda;
    // Volver arriba al cambiar de pestaña: si no, la pestaña nueva aparece
    // scrolleada a la mitad y parece rota.
    window.scrollTo(0, 0);
  }

  /* ---------------- Columna lateral (sólo pantalla ancha) ---------------- */

  function lateral() {
    let out =
      '<aside class="lateral">' +
      '<div class="marca">Stars Climb</div>' +
      '<nav class="lateral-secciones">' +
      TABS.map(function (t) {
        return '<button class="' + (tab === t.id && !vista ? "activa" : "") +
          '" data-accion="tab" data-tab="' + t.id + '">' + t.nombre + "</button>";
      }).join("") +
      "</nav>";

    // El árbol del curso. Es la razón de ser de la columna: tener el temario
    // entero a la vista mientras se estudia, en vez de tener que volver atrás
    // para saber qué viene después.
    out += '<div class="arbol">';
    APP.curriculo.NIVELES.forEach(function (n) {
      const abierto = APP.examen.abierto(n.id);
      const ls = APP.curriculo.leccionesDelNivel(n.id);
      const hechas = ls.filter(function (l) { return A().leccion(l.id).coronas > 0; }).length;

      out +=
        '<div class="arbol-nivel' + (abierto ? "" : " cerrado") + '">' +
        '<div class="arbol-cab">' + d.esc(n.titulo) +
        '<span class="mini apagado">' + hechas + "/" + ls.length + "</span></div>";

      if (abierto) {
        APP.curriculo.delNivel(n.id).forEach(function (u) {
          const uHechas = u.lecciones.filter(function (l) { return A().leccion(l.id).coronas > 0; }).length;
          const desplegada = desplegadas[u.id];
          out +=
            '<button class="arbol-unidad' + (desplegada ? " abierta" : "") +
            '" data-accion="desplegar" data-id="' + u.id + '">' +
            '<span class="flecha' + (desplegada ? " abierta" : "") + '">›</span>' +
            '<span class="t">' + d.esc(u.titulo) + "</span>" +
            '<span class="mini apagado">' + uHechas + "/" + u.lecciones.length + "</span>" +
            "</button>";
          if (!desplegada) return;
          out += '<div class="arbol-lecciones">';
          u.lecciones.forEach(function (l) {
            const hecha = A().leccion(l.id).coronas > 0;
            out +=
              '<button class="arbol-leccion' + (hecha ? " hecha" : "") +
              '" data-accion="leccion" data-id="' + l.id + '">' +
              '<span class="punto">' + (hecha ? "•" : "") + "</span>" +
              d.esc(l.titulo) + "</button>";
          });
          out += "</div>";
        });
      }
      out += "</div>";
    });
    out += "</div></aside>";
    return out;
  }

  /* ---------------- Diccionario, a la derecha ----------------
   *
   * Tocar una palabra sirve mientras lees. Esto es la otra mitad: la pregunta
   * de quien escribe, que es la contraria —"¿cómo se dice factura?"—. Busca en
   * los dos sentidos sin preguntar en cuál: si lo que escribes existe en
   * inglés te da su significado, y si no, lo busca como español.
   *
   * Funciona sin internet, igual que el resto.
   */
  let ultimaBusqueda = "";

  function buscador() {
    return (
      '<aside class="buscador">' +
      '<div class="marca">Diccionario</div>' +
      '<input class="campo" id="dic-campo" type="search" autocomplete="off" ' +
      'autocapitalize="off" spellcheck="false" placeholder="palabra en inglés o español">' +
      '<div class="mini apagado" style="margin-top:6px">Funciona sin internet.</div>' +
      '<div id="dic-resultado"></div>' +
      "</aside>"
    );
  }

  function pintarBusqueda(texto) {
    ultimaBusqueda = texto;
    const caja = d.$("#dic-resultado", raiz);
    if (!caja) return;

    const q = String(texto || "").trim();
    if (q.length < 2) { caja.innerHTML = ""; return; }

    const r = APP.diccionario.buscarLibre(q);
    let out = "";

    if (r.en) {
      const def = r.en;
      const etiquetas = [];
      if (def.clase) etiquetas.push(def.clase);
      if (def.forma && def.forma !== "base") etiquetas.push(def.forma);
      if (def.derivadaDe) etiquetas.push("de “" + def.derivadaDe + "”");
      out +=
        '<div class="dic-ficha">' +
        '<div class="dic-cab"><b>' + d.esc(def.en) + "</b>" +
        '<button class="btn azul chico" data-accion="audio" data-texto="' + d.esc(def.en) + '">🔊</button></div>' +
        '<div class="dic-es">' + d.esc(def.es) + "</div>" +
        (etiquetas.length
          ? '<div class="mini apagado">' + d.esc(etiquetas.join(" · ")) + "</div>"
          : "") +
        (def.nota ? '<div class="mini">💡 ' + d.esc(def.nota) + "</div>" : "") +
        "</div>";
    }

    if (r.es.length) {
      out += '<div class="mini apagado dic-titulo">En inglés se dice</div>';
      r.es.forEach(function (x) {
        out +=
          '<div class="dic-linea">' +
          '<button class="enlace" data-accion="palabra" data-palabra="' + d.esc(x.en) + '">' +
          d.esc(x.en) + "</button>" +
          '<span class="mini apagado">' + d.esc(x.es) + "</span>" +
          '<button class="icono-btn chico" data-accion="audio" data-texto="' + d.esc(x.en) + '" aria-label="Oír">🔊</button>' +
          "</div>";
      });
    }

    if (!out) {
      out = '<p class="mini apagado" style="margin-top:14px">No está en el curso. ' +
        "El curso tiene unas mil palabras: si buscas algo muy específico, puede que no esté.</p>";
    }
    caja.innerHTML = out;
  }

  /* ---------------- Barra superior ---------------- */

  /* La barra dice en qué nivel del curso vas y cuánto llevas hoy, en minutos.
   *
   * Antes llevaba una racha de fuego, una barra de puntos y unos corazones.
   * Las tres medían lo mismo —cuánto has tocado la pantalla— y ninguna medía
   * inglés. Los minutos tampoco lo miden, pero al menos no se pueden inflar
   * contestando rápido cosas que ya sabías.
   */
  function barraSuperior() {
    const minutos = A().minutosDelDia();
    const nivel = nivelActual();
    const ls = nivel ? APP.curriculo.leccionesDelNivel(nivel.id) : [];
    const hechas = ls.filter(function (l) { return A().leccion(l.id).coronas > 0; }).length;
    const pct = ls.length ? Math.round((hechas / ls.length) * 100) : 0;

    return (
      '<div class="barra sobria">' +
      '<span class="barra-nivel">' + (nivel ? d.esc(nivel.titulo) : "") + "</span>" +
      '<div class="crece" style="display:flex;align-items:center;gap:8px;flex:1">' +
      '<div class="barra-prog fina"><i style="width:' + pct + '%"></i></div>' +
      '<span class="mini apagado" style="white-space:nowrap">' + hechas + "/" + ls.length + "</span>" +
      "</div>" +
      '<span class="mini apagado" style="white-space:nowrap">' +
      (minutos ? minutos + " min hoy" : "") + "</span>" +
      "</div>"
    );
  }

  // El primer nivel abierto que todavía no está aprobado: es donde se está.
  function nivelActual() {
    const ns = APP.curriculo.NIVELES;
    for (let i = 0; i < ns.length; i++) {
      if (APP.examen.abierto(ns[i].id) && !A().nivelCurso(ns[i].id).aprobado) return ns[i];
    }
    return ns[ns.length - 1];
  }

  /* ---------------- Navegación ---------------- */

  /* Sin emoji. Un icono de dibujo animado por pestaña es de lo primero que
   * hace que algo parezca un juego, y esto es un cuaderno de estudio. */
  const TABS = [
    { id: "camino", nombre: "Curso" },
    { id: "practica", nombre: "Practicar" },
    { id: "progreso", nombre: "Registro" },
    { id: "ajustes", nombre: "Ajustes" },
  ];

  function navegacion() {
    return (
      '<nav class="nav"><div class="nav-caja">' +
      TABS.map(function (t) {
        return (
          '<button class="' + (tab === t.id ? "activa" : "") + '" data-accion="tab" data-tab="' + t.id + '">' +
          t.nombre + "</button>"
        );
      }).join("") +
      "</div></nav>"
    );
  }

  function contenido() {
    if (vista === "reglas") return pantallaReglas();
    if (vista === "tutor") return pantallaTutor();
    if (tab === "camino") return camino();
    if (tab === "practica") return practica();
    if (tab === "progreso") return progreso();
    return ajustes();
  }

  /* ---------------- Camino ---------------- */

  /* El índice del curso.
   *
   * Antes esto era un camino de burbujas que se recorría hacia abajo: bonito,
   * pero sólo dejaba ver tres lecciones a la vez y no decía nada de lo que
   * viene. Un índice —el de un libro— muestra el curso entero de un vistazo,
   * deja entrar donde quieras, y no insinúa que haya un único camino correcto.
   *
   * Las unidades se despliegan. Cerradas ocupan una línea; abiertas muestran
   * sus lecciones. Así se puede ver el temario completo sin perderse.
   */
  function camino() {
    let out = tarjetaNivelacion() + siguienteSugerida();

    APP.curriculo.NIVELES.forEach(function (n) {
      const abierto = APP.examen.abierto(n.id);
      const est = A().nivelCurso(n.id);
      const ls = APP.curriculo.leccionesDelNivel(n.id);
      const hechas = ls.filter(function (l) { return A().leccion(l.id).coronas > 0; }).length;

      out +=
        '<section class="nivel">' +
        '<header class="nivel-cab' + (abierto ? "" : " cerrado") + '">' +
        "<h2>" + d.esc(n.titulo) +
        '<span class="mcer">' + d.esc(n.mcer) + "</span>" +
        (est.aprobado ? '<span class="sello">aprobado</span>' : "") +
        "</h2>" +
        '<p class="sub">' + d.esc(n.resumen) + "</p>" +
        (abierto
          ? '<div class="linea-prog"><i style="width:' +
            Math.round((hechas / ls.length) * 100) + '%"></i></div>' +
            '<p class="mini apagado">' + hechas + " de " + ls.length + " lecciones · " +
            '<button class="enlace" data-accion="ver-nivel" data-id="' + n.id + '">qué aprenderás</button></p>'
          : '<p class="mini apagado">Se abre al aprobar el nivel anterior, o con la prueba de nivel.</p>') +
        "</header>";

      if (abierto) {
        APP.curriculo.delNivel(n.id).forEach(function (u) { out += unidadEnIndice(u); });
        out += filaExamen(n);
      }
      out += "</section>";
    });
    return out;
  }

  function unidadEnIndice(u) {
    const hechas = u.lecciones.filter(function (l) { return A().leccion(l.id).coronas > 0; }).length;
    const abierta = desplegadas[u.id];

    let out =
      '<div class="unidad">' +
      '<button class="unidad-cab" data-accion="desplegar" data-id="' + u.id + '">' +
      '<span class="flecha' + (abierta ? " abierta" : "") + '">›</span>' +
      '<span class="unidad-txt"><span class="titulo">' + d.esc(u.titulo) + "</span>" +
      '<span class="mini apagado">' + d.esc(u.resumen) + "</span></span>" +
      '<span class="cuenta' + (hechas === u.lecciones.length ? " completa" : "") + '">' +
      hechas + "/" + u.lecciones.length + "</span>" +
      "</button>";

    if (abierta) {
      out += '<ol class="lecciones">';
      u.lecciones.forEach(function (l) {
        const est = A().leccion(l.id);
        const hecha = est.coronas > 0;
        out +=
          '<li><button class="leccion-fila' + (hecha ? " hecha" : "") + '" ' +
          'data-accion="leccion" data-id="' + l.id + '">' +
          '<span class="marca">' + (hecha ? "✓" : "") + "</span>" +
          '<span class="txt">' + d.esc(l.titulo) +
          (l.clase || (l.reglas && l.reglas.length)
            ? '<span class="etiqueta">regla</span>'
            : l.texto ? '<span class="etiqueta">lectura</span>' : "") +
          "</span>" +
          (est.veces ? '<span class="mini apagado">' + est.veces + "×</span>" : "") +
          "</button></li>";
      });
      out += "</ol>";
    }
    return out + "</div>";
  }

  function filaExamen(n) {
    const est = A().nivelCurso(n.id);
    const ls = APP.curriculo.leccionesDelNivel(n.id);
    const hechas = ls.filter(function (l) { return A().leccion(l.id).coronas > 0; }).length;
    /* No hace falta terminar el nivel entero para examinarse: con dos tercios
     * ya se puede. Obligar al 100% castiga a quien sabe y sólo quiere
     * comprobarlo, que es a quien la prueba más tiempo le ahorra. */
    const listo = hechas >= Math.ceil(ls.length * 0.66);

    return (
      '<div class="examen-fila' + (est.aprobado ? " aprobada" : "") + '">' +
      '<div class="txt"><span class="titulo">Examen de ' + d.esc(n.titulo) + "</span>" +
      '<span class="mini apagado">Las cuatro destrezas. Se aprueba con ' +
      APP.examen.PARA_APROBAR + "%." +
      (est.veces ? " Mejor nota: " + est.mejor + "%." : "") + "</span></div>" +
      (listo
        ? '<button class="btn chico" data-accion="examen" data-id="' + n.id + '">' +
          (est.aprobado ? "Repetir" : "Rendir") + "</button>"
        : '<span class="mini apagado">faltan ' + (Math.ceil(ls.length * 0.66) - hechas) + "</span>") +
      "</div>"
    );
  }

  /* Por dónde seguir. Va arriba porque es la pregunta que se hace cualquiera al
   * abrir la aplicación, y responderla con un índice entero es hacérsela
   * responder a ella. */
  function siguienteSugerida() {
    const l = A().siguienteLeccion();
    if (!l) return "";
    const u = APP.curriculo.unidad(l.unidad);
    return (
      '<div class="seguir">' +
      '<div class="mini apagado">Por dónde ibas</div>' +
      '<div class="titulo">' + d.esc(l.titulo) + "</div>" +
      '<div class="mini apagado">' + d.esc(u ? u.titulo : "") + "</div>" +
      '<button class="btn" data-accion="leccion" data-id="' + l.id + '">' +
      (A().leccion(l.id).veces ? "Seguir" : "Empezar") + "</button>" +
      "</div>"
    );
  }

  function tarjetaNivelacion() {
    const e = A().estado();
    if (A().minutosTotales() > 20 || e.ajustes.nivelacionHecha) return "";
    return (
      '<div class="seguir">' +
      '<div class="titulo">¿Ya sabes algo de inglés?</div>' +
      '<p class="mini apagado">Quince preguntas y te dejo donde te corresponde, ' +
      "en vez de hacerte empezar en “Hola”.</p>" +
      '<button class="btn" data-accion="nivelacion">Hacer la prueba de nivel</button> ' +
      '<button class="enlace" data-accion="saltar-nivelacion">empezar desde cero</button>' +
      "</div>"
    );
  }

  function practica() {
    const pendientes = APP.srs.pendientes().length;
    const errores = A().estado().errores.filter(function (e) { return !e.superado; }).length;
    return (
      "<h1>Práctica</h1>" +
      '<p class="apagado chico">Lo que quieras, cuando quieras. Nada de esto se corta ni se acaba.</p>' +

      tarjetaAccion("♻️", "Repaso del día", pendientes
        ? pendientes + " palabras te toca repasar hoy"
        : "Nada pendiente. Vuelve mañana.", "repaso", pendientes > 0) +

      tarjetaAccion("📕", "Cuaderno de errores", errores
        ? errores + " cosas que has fallado"
        : "Todavía no fallas nada. Buena señal.", "errores", errores > 0) +

      tarjetaAccion("💭", "Conversar", "Habla o escribe en inglés con un tutor que te corrige y te explica", "tutor", true) +
      tarjetaAccion("🎯", "Reglas", "am/is/are, do/does, el -ed, el -ing: una regla y ejercicios hasta que salga sola", "reglas", true) +
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

  /* El registro de estudio.
   *
   * Antes esta pantalla decía nivel, XP, racha y logros: cuatro cifras que
   * suben solas con el uso y ninguna que respondiera "¿estoy aprendiendo?".
   * Ahora dice lo que sí lo responde: cuánto tiempo llevas, cuántas reglas te
   * salen solas, cuántas palabras tienes aprendidas y cuáles se te siguen
   * olvidando —que es lo único de esta pantalla sobre lo que se puede actuar.
   */
  function progreso() {
    const r = APP.srs.resumen();
    const reglas = APP.reglas.resumen(3);
    const sem = A().semana();
    const maxSem = Math.max(20, Math.max.apply(null, sem.map(function (x) { return x.minutos; })));
    const nombresDia = ["D", "L", "M", "M", "J", "V", "S"];
    const errores = A().estado().errores.filter(function (x) { return !x.superado; });

    return (
      "<h1>Registro</h1>" +

      '<div class="cifras">' +
      cifra(A().minutosTotales(), "minutos de estudio") +
      cifra(A().diasEstudiados(), "días") +
      cifra(reglas.dominadas + " de " + reglas.total, "reglas dominadas") +
      cifra(r.aprendidas, "palabras aprendidas") +
      "</div>" +

      '<section class="bloque"><h2>Últimos siete días</h2>' +
      '<div class="semana">' +
      sem.map(function (x, i) {
        const alto = Math.round((x.minutos / maxSem) * 100);
        return (
          '<div class="dia"><div class="bar ' + (x.minutos ? "hay" : "") +
          '" style="height:' + Math.max(x.minutos ? 6 : 2, alto) + '%"></div>' +
          '<div class="mini apagado">' + nombresDia[(new Date(x.fecha + "T12:00:00").getDay() + 7) % 7] + "</div></div>"
        );
      }).join("") +
      "</div>" +
      '<p class="mini apagado">' + A().minutosDeLaSemana() + " minutos esta semana.</p></section>" +

      '<section class="bloque"><h2>El curso</h2>' +
      APP.curriculo.NIVELES.map(function (n) {
        const ls = APP.curriculo.leccionesDelNivel(n.id);
        const hechas = ls.filter(function (l) { return A().leccion(l.id).coronas > 0; }).length;
        const est = A().nivelCurso(n.id);
        return (
          '<div class="fila-prog"><span class="et">' + d.esc(n.titulo) + "</span>" +
          '<div class="linea-prog"><i style="width:' + Math.round((hechas / ls.length) * 100) + '%"></i></div>' +
          '<span class="val">' + (est.aprobado ? "aprobado" : hechas + "/" + ls.length) + "</span></div>"
        );
      }).join("") +
      "</section>" +

      '<section class="bloque"><h2>Vocabulario</h2>' +
      fila("Para repasar hoy", r.pendientes) +
      fila("Aprendidas", r.aprendidas) +
      fila("Empezadas", r.enCurso) +
      fila("Sin ver", r.total - r.vistas) +
      fila("Total del curso", r.total) +
      "</section>" +

      '<section class="bloque"><h2>Lo que se te olvida</h2>' +
      (errores.length
        ? '<p class="mini apagado">Las que más veces has fallado. Son las que conviene mirar.</p>' +
          errores.slice(0, 8).map(function (x) {
            return '<div class="olvido"><b>' + d.esc(x.en || "") + "</b> · " + d.esc(x.es || "") +
              '<span class="mini apagado">' + x.veces + (x.veces === 1 ? " vez" : " veces") + "</span></div>";
          }).join("") +
          '<button class="btn hueco chico" style="margin-top:10px" data-accion="errores">Practicarlas</button>'
        : '<p class="mini apagado">Nada pendiente todavía.</p>') +
      "</section>"
    );
  }

  function cifra(valor, etiqueta) {
    return '<div class="cifra"><span class="n">' + valor + '</span><span class="et">' +
      d.esc(etiqueta) + "</span></div>";
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
    claseAntesDe(l, function () {
      const ejercicios = filtrar(APP.motor.sesionLeccion(l));
      APP.leccion.iniciar({
        ejercicios: ejercicios,
        titulo: l.titulo,
        modo: "camino",
        leccionId: l.id,
        alTerminar: pintar,
      });
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
      /* Tocar una palabra funciona también dentro de una hoja, encima de la
       * que ya está abierta. Sin esto, las palabras de la tabla de una clase
       * se veían tocables y no hacían nada, que es peor que no ofrecerlo: la
       * clase usa "I work here" para explicar los pronombres y quien no sabe
       * qué es "work" no puede seguir el ejemplo. */
      if (a === "palabra") return palabra(b.getAttribute("data-palabra"));
      if (alTocar) alTocar(a, b, velo);
    });
    return velo;
  }

  /* ---------------- Tocar una palabra ----------------
   *
   * Aparece por encima de lo que sea que esté abierto —una lección, un texto,
   * un examen— sin interrumpirlo: se mira y se cierra. Que no corte lo que se
   * estaba haciendo es justo lo que hace que se use; si hubiera que salir y
   * volver, se saltaría la palabra, que es lo que impide aprenderla.
   */
  function palabra(w) {
    const f = APP.diccionario.ficha(w);
    const limpia = APP.diccionario.limpiar(w);

    let out = '<div class="palabra-cabecera">' +
      "<h2>" + d.esc(limpia || w) + "</h2>" +
      botonDecir(limpia || w) + "</div>";

    if (!f.encontrada) {
      /* Decirlo tal cual. Inventar una traducción sería peor que no dar
       * ninguna: enseñaría algo falso con toda la confianza del mundo. */
      out += '<p class="chico apagado">Esta palabra no está en el curso, así que no tengo su ' +
        "traducción. Puedes oírla con el botón de arriba.</p>";
    } else {
      const def = f.definicion;
      out += '<div class="definicion">' + d.esc(def.es) + "</div>";

      const etiquetas = [];
      if (def.clase) etiquetas.push(def.clase);
      if (def.forma && def.forma !== "base") etiquetas.push(def.forma);
      if (def.derivadaDe) etiquetas.push("de “" + def.derivadaDe + "”");
      if (def.irregular) etiquetas.push("verbo irregular");
      if (etiquetas.length) {
        out += '<div class="etiquetas">' + etiquetas.map(function (e) {
          return '<span class="pastilla">' + d.esc(e) + "</span>";
        }).join("") + "</div>";
      }

      if (def.nota) out += '<div class="nota-palabra">💡 ' + d.esc(def.nota) + "</div>";

      if (def.verbo && def.verbo !== limpia) {
        out += '<button class="btn hueco chico" style="margin-top:10px" ' +
          'data-accion="ver-verbo" data-id="' + d.esc(def.verbo) + '">' +
          "Ver “" + d.esc(def.verbo) + "” en todos los tiempos</button>";
      }
    }

    if (f.expresiones.length) {
      out += '<div class="mini apagado" style="margin-top:16px">Con esta palabra</div>';
      f.expresiones.forEach(function (e) {
        out += '<div class="glosa"><b>' + d.esc(e.en) + "</b> · " + d.esc(e.es) +
          (e.nota ? ' <span class="mini apagado">' + d.esc(e.nota) + "</span>" : "") + "</div>";
      });
    }

    if (f.sonidos.length) {
      out += '<div class="mini apagado" style="margin-top:16px">Cómo suena</div>';
      f.sonidos.forEach(function (so) {
        out += '<div class="glosa"><b>' + d.esc(so.simbolo) + "</b> · " + d.esc(so.comoSuena) + "</div>";
      });
    }

    out += '<div style="height:12px"></div><button class="btn hueco" data-accion="cerrar-hoja">Cerrar</button>';

    hoja(out, function (a, b, velo) {
      if (a === "ver-verbo") {
        velo.remove();
        const v = APP.verbos.banco().filter(function (x) { return x.base === b.getAttribute("data-id"); })[0];
        if (v) fichaVerbo(v);
      }
    });
  }

  function botonDecir(texto) {
    return '<button class="btn azul chico" data-accion="audio" data-texto="' + d.esc(texto) + '">🔊</button>';
  }

  /* ---------------- Gramática ---------------- */

  /* ---------------- Reglas ---------------- */

  const ETAPAS = ["Reconocer", "Escribir", "Dominada"];

  function pantallaReglas() {
    const r = APP.reglas.resumen(3);
    let out =
      '<button class="btn hueco chico" data-accion="volver">← Volver</button>' +
      "<h1>Reglas</h1>" +
      '<p class="apagado chico">Una regla explicada corta, y después ejercicios de esa regla y de ' +
      "ninguna otra, hasta que salga sola. Los ejercicios se generan: no se acaban nunca.</p>" +
      '<div class="tarjeta destacada"><div class="fuerte">' + r.dominadas + " de " + r.total +
      " dominadas</div>" +
      '<div class="barra-prog" style="margin-top:8px"><i style="width:' +
      Math.round((r.dominadas / r.total) * 100) + '%"></i></div>' +
      (r.empezadas
        ? '<div class="mini apagado" style="margin-top:6px">' + r.empezadas + " a medias</div>"
        : "") +
      '<button class="btn" style="margin-top:12px" data-accion="regla-sugerida">' +
      "Practicar la que toca</button></div>";

    APP.datosReglas.GRUPOS.forEach(function (g) {
      out += '<h2 style="margin-top:20px">' + d.esc(g) + "</h2>";
      APP.datosReglas.delGrupo(g).forEach(function (re) {
        const av = APP.reglas.avance(re.id);
        const est = A().regla(re.id);
        out +=
          '<button class="tarjeta lista-item" data-accion="regla" data-id="' + re.id + '">' +
          '<span class="emo-grande">' + re.emo + "</span>" +
          '<span class="txt"><span class="fuerte">' + d.esc(re.titulo) + "</span>" +
          '<span class="mini apagado">' + d.esc(re.resumen) + "</span>" +
          (est.vistos
            ? '<span class="barra-prog fina" style="margin-top:6px"><i style="width:' +
              (av.etapa === 2 ? 100 : Math.round((av.hechos / av.de) * 100)) + "%;background:" +
              (av.etapa === 2 ? "#58cc02" : av.etapa === 1 ? "#1cb0f6" : "#ffc800") + '"></i></span>'
            : "") +
          "</span>" +
          '<span class="pastilla' + (av.etapa === 2 ? " verde" : "") + '">' +
          (est.vistos ? ETAPAS[av.etapa] : "nueva") + "</span>" +
          "</button>";
      });
    });
    return out;
  }

  function fichaRegla(id) {
    const re = APP.datosReglas.regla(id);
    if (!re) return;
    const av = APP.reglas.avance(id);
    const est = A().regla(id);

    let out =
      '<div class="ficha-cabecera"><span class="emo-grande">' + re.emo + "</span>" +
      "<h2>" + d.esc(re.titulo) + "</h2></div>" +
      '<div class="clave-regla">' + d.esc(re.clave) + "</div>" +
      '<div class="explicacion">' + permitirNegrita(re.regla) + "</div>";

    if (re.tabla) out += tablaTocable(re.tabla);

    /* El error típico, mal y bien, uno encima del otro. Es lo que de verdad se
     * recuerda: la forma correcta sola no avisa de nada, porque el error que
     * cometes te parece correcto hasta que lo ves tachado al lado. */
    out +=
      '<div class="trampa"><div class="mal">✗ ' + tocablesEn(re.error.mal) + "</div>" +
      '<div class="bien">✓ ' + tocablesEn(re.error.bien) + "</div></div>";

    out +=
      '<div class="mini apagado" style="margin-top:16px">' +
      (est.vistos
        ? av.etapa === 2
          ? "Dominada. Sigue apareciendo de vez en cuando para que no se enfríe."
          : av.etapa === 1
            ? "Ahora hay que escribirla: te faltan " + av.faltan + " seguidas para darla por dominada."
            : "Te faltan " + av.faltan + " seguidas para pasar a escribirla."
        : "Sin empezar.") +
      "</div>" +
      '<button class="btn" style="margin-top:10px" data-accion="practicar-regla" data-id="' + id + '">' +
      (est.vistos ? "Seguir practicando" : "Practicar esta regla") + "</button>" +
      '<div style="height:8px"></div>' +
      '<button class="btn hueco" data-accion="cerrar-hoja">Cerrar</button>';

    hoja(out, function (a, b, velo) {
      if (a === "practicar-regla") {
        velo.remove();
        practicarRegla(b.getAttribute("data-id"));
      }
    });
  }

  function practicarRegla(id) {
    const re = APP.datosReglas.regla(id);
    APP.leccion.iniciar({
      ejercicios: filtrar(APP.reglas.tanda(id, APP.reglas.LARGO)),
      titulo: re.titulo,
      modo: "practica",
      corazones: false,
      alTerminar: pintar,
      alRepetir: function () { practicarRegla(id); },
    });
  }

  /* ---------------- El tutor de conversación ----------------
   *
   * La única pantalla que necesita internet. Todo lo demás de la aplicación
   * funciona sin conexión, así que acá hay que ser explícito: si no se puede
   * usar, se dice por qué y cómo se arregla. Un botón que no hace nada es
   * peor que una explicación.
   */
  let tutorEsperando = false;

  function pantallaTutor() {
    let out =
      '<button class="btn hueco chico" data-accion="volver">← Volver</button>' +
      "<h1>Conversar</h1>" +
      '<div id="tutor-estado"><p class="apagado chico">Comprobando…</p></div>' +
      '<div id="tutor-chat" class="chat"></div>' +
      '<div id="tutor-barra"></div>';
    setTimeout(pintarTutor, 0);
    return out;
  }

  function pintarTutor() {
    const caja = d.$("#tutor-estado", raiz);
    if (!caja) return;

    APP.tutor.estado().then(function (e) {
      if (!d.$("#tutor-estado", raiz)) return;
      if (!e.disponible) return tutorNoDisponible(e.motivo);

      d.$("#tutor-estado", raiz).innerHTML =
        '<p class="apagado chico">Habla o escribe en inglés. Te contesto, y si te equivocas ' +
        "te digo cómo se dice y por qué.</p>" +
        '<div class="mini apagado">Te quedan ' + e.quedan + " mensajes hoy</div>";
      pintarChat();
      pintarBarraTutor(e.quedan > 0);
    });
  }

  function tutorNoDisponible(motivo) {
    const caja = d.$("#tutor-estado", raiz);
    const chat = d.$("#tutor-chat", raiz);
    const barra = d.$("#tutor-barra", raiz);
    if (chat) chat.innerHTML = "";
    if (barra) barra.innerHTML = "";

    if (motivo === "sin_internet") {
      caja.innerHTML =
        '<div class="tarjeta"><h3>Sin internet</h3>' +
        '<p class="chico apagado">Conversar es lo único que necesita conexión. ' +
        "Todo lo demás de la aplicación funciona igual sin ella.</p></div>";
      return;
    }
    if (motivo === "sin_cuenta") {
      caja.innerHTML =
        '<div class="tarjeta"><h3>Necesitas una cuenta</h3>' +
        '<p class="chico apagado">Para conversar hace falta entrar, porque hay un tope de ' +
        "mensajes al día por persona.</p>" +
        '<button class="btn" data-accion="crear-cuenta">Crear una cuenta</button></div>';
      return;
    }
    /* sin_clave. Se explica con todas sus letras, incluido que cuesta dinero:
     * descubrir el cobro después sería una sorpresa desagradable, y esto es
     * lo único de la aplicación que no es gratis. */
    caja.innerHTML =
      '<div class="tarjeta"><h3>Falta configurarlo</h3>' +
      '<p class="chico apagado">El tutor es la única parte de la aplicación que no es gratis: ' +
      "usa un modelo de lenguaje y eso se paga por uso. Para activarlo:</p>" +
      '<ol class="chico" style="padding-left:1.2em">' +
      "<li>Saca una clave en <b>console.anthropic.com</b> y ponle algo de crédito.</li>" +
      "<li>En Render, tu servicio → <b>Environment</b>.</li>" +
      "<li>Agrega <b>ANTHROPIC_API_KEY</b> con esa clave y guarda.</li>" +
      "</ol>" +
      '<p class="mini apagado">La clave se queda en el servidor y nunca llega al teléfono: ' +
      "si estuviera acá, cualquiera podría copiarla y gastar tu crédito. " +
      "Hay un tope de mensajes al día para que no se dispare la cuenta.</p></div>";
  }

  function pintarChat() {
    const chat = d.$("#tutor-chat", raiz);
    if (!chat) return;
    const hist = APP.tutor.historial();

    if (!hist.length) {
      /* Delante de un cuadro de texto vacío no se le ocurre nada a nadie. Los
       * temas de arranque son lo que convierte "conversar" en algo que se
       * empieza de verdad. */
      chat.innerHTML =
        '<div class="mini apagado" style="margin:10px 0">¿De qué hablamos?</div>' +
        APP.tutor.ARRANQUES.map(function (a, i) {
          return '<button class="tarjeta lista-item" data-accion="tutor-tema" data-i="' + i + '">' +
            '<span class="emo-grande">' + a.emo + "</span>" +
            '<span class="txt"><span class="fuerte">' + d.esc(a.es) + "</span></span></button>";
        }).join("");
      return;
    }

    chat.innerHTML = hist.map(function (t) {
      if (t.papel === "yo") {
        return '<div class="burbuja-chat mia">' + d.esc(t.texto) + "</div>";
      }
      return (
        '<div class="burbuja-chat suya">' +
        '<div class="texto">' + tocablesEn(t.texto) + "</div>" +
        '<button class="btn azul chico" data-accion="audio" data-texto="' + d.esc(t.texto) + '">🔊</button>' +
        "</div>" +
        (t.correccion
          ? '<div class="correccion"><div class="mal">✗ ' + d.esc(t.correccion.mal || "") + "</div>" +
            '<div class="bien">✓ ' + d.esc(t.correccion.bien) + "</div>" +
            '<div class="mini">' + d.esc(t.correccion.porque || "") + "</div></div>"
          : "")
      );
    }).join("") + (tutorEsperando ? '<div class="burbuja-chat suya pensando">escribiendo…</div>' : "");

    chat.scrollTop = chat.scrollHeight;
  }

  function tocablesEn(texto) {
    return APP.diccionario.trocear(texto).map(function (p) {
      if (!p.palabra) return d.esc(p.texto);
      return '<span class="tocable" data-accion="palabra" data-palabra="' + d.esc(p.texto) + '">' +
        d.esc(p.texto) + "</span>";
    }).join("");
  }

  function pintarBarraTutor(sePuede) {
    const barra = d.$("#tutor-barra", raiz);
    if (!barra) return;
    if (!sePuede) {
      barra.innerHTML = '<div class="tarjeta"><p class="chico apagado">Llegaste al tope de hoy. ' +
        "Vuelve mañana: el tope está para que no se dispare la cuenta.</p></div>";
      return;
    }
    barra.innerHTML =
      '<div class="chat-barra">' +
      '<input class="campo" id="tutor-campo" type="text" placeholder="Escribe en inglés…" ' +
      'autocomplete="off" autocapitalize="sentences" ' + (tutorEsperando ? "disabled" : "") + ">" +
      (APP.tutor.sePuedeDictar()
        ? '<button class="micro chico" data-accion="tutor-micro" aria-label="Hablar">🎤</button>'
        : "") +
      /* Enviar va como icono y no como "Enviar". En un teléfono de 390 px, la
       * palabra le come el ancho al campo y el texto que escribes se ve
       * cortado, que es justo lo que no puede pasar cuando lo que haces es
       * escribir. */
      '<button class="btn redondo" data-accion="tutor-enviar" aria-label="Enviar"' +
      (tutorEsperando ? " disabled" : "") + ">➤</button>" +
      "</div>" +
      (APP.tutor.historial().length
        ? '<button class="btn hueco chico" style="margin-top:8px" data-accion="tutor-nueva">Empezar otra conversación</button>'
        : "");
  }

  function enviarAlTutor(texto) {
    const limpio = String(texto || "").trim();
    if (!limpio || tutorEsperando) return;

    APP.tutor.anotar("yo", limpio);
    tutorEsperando = true;
    pintarChat();
    pintarBarraTutor(true);

    APP.tutor.mandar(limpio).then(function (r) {
      tutorEsperando = false;
      APP.tutor.anotar("tutor", r.respuesta, r.correccion);
      pintarChat();
      pintarBarraTutor(true);
      // Se lee en voz alta: la mitad de la gracia de conversar es oírlo.
      if (A().estado().ajustes.sonido !== false) APP.audio.hablar(r.respuesta);
      APP.almacen.contar("tutor");
    }).catch(function (e) {
      tutorEsperando = false;
      pintarChat();
      pintarBarraTutor(true);
      d.avisar("No se pudo enviar", e.message || "Prueba otra vez.");
    });
  }

  function dictarAlTutor() {
    const campo = d.$("#tutor-campo", raiz);
    const boton = d.$("[data-accion=tutor-micro]", raiz);
    if (boton) boton.classList.add("grabando");
    APP.audio.escuchar({
      parcial: function (t) { if (campo) campo.value = t; },
      fin: function (t) {
        if (boton) boton.classList.remove("grabando");
        if (campo && t) campo.value = t;
      },
      error: function () {
        if (boton) boton.classList.remove("grabando");
        d.avisar("No te escuché", "Revisa que el navegador tenga permiso para usar el micrófono.");
      },
    });
  }

  /* ---------------- Exámenes y nivelación ---------------- */

  function verNivel(id) {
    const n = APP.curriculo.nivel(id);
    hoja(
      '<div class="ficha-cabecera"><span class="emo-grande">' + n.emo + "</span>" +
      "<h2>" + d.esc(n.titulo) + ' <span class="mcer">' + d.esc(n.mcer) + "</span></h2></div>" +
      '<p class="chico apagado">' + d.esc(n.resumen) + "</p>" +
      '<div class="mini apagado" style="margin-top:14px">Al terminarlo vas a poder</div>' +
      "<ul class=\"puedes\">" +
      n.puedes.map(function (x) { return "<li>" + d.esc(x) + "</li>"; }).join("") +
      "</ul>" +
      '<div style="height:10px"></div><button class="btn hueco" data-accion="cerrar-hoja">Cerrar</button>'
    );
  }

  function abrirExamen(id) {
    const n = APP.curriculo.nivel(id);
    const a = A().estado().ajustes;
    const puedeHablar = a.microfono !== false && APP.audio.hayMicrofono();
    const puedeOir = a.sonido !== false && APP.audio.hayVoz();

    function arrancar(callado) {
      /* Si no puede hablar ahora, se decide ANTES de empezar y el examen se
       * arma sin preguntas orales, repartiéndolas entre leer y escribir.
       * Preguntar acá y no a mitad de camino es lo correcto: saltarlas una a
       * una cuenta como falladas y hunde la nota por estar en un bus, no por
       * no saber inglés. */
      const ex = APP.examen.armar(id, {
        sinVoz: !puedeOir,
        sinMicro: !puedeHablar || callado,
      });
      APP.leccion.iniciar({
        ejercicios: ex.preguntas,
        titulo: "Examen · " + n.titulo,
        modo: "examen",
        examen: ex,
        corazones: false,
        alTerminar: pintar,
      });
    }

    const muestra = APP.examen.armar(id, { sinVoz: !puedeOir, sinMicro: !puedeHablar });

    hoja(
      '<div class="centro"><div class="diploma-emo">📝</div></div>' +
      '<h2 class="centro">Examen de ' + d.esc(n.titulo) + "</h2>" +
      '<p class="chico apagado">' + muestra.total + " preguntas de las cuatro destrezas. " +
      "No se pierden vidas y no te digo si acertaste hasta el final: así mide lo que sabes " +
      "y no cómo te vas adaptando.</p>" +
      '<p class="chico apagado">Se aprueba con ' + APP.examen.PARA_APROBAR +
      "%, y se puede repetir todas las veces que quieras.</p>" +
      '<button class="btn" data-accion="empezar-examen">Empezar</button>' +
      (puedeHablar
        ? '<div style="height:8px"></div>' +
          '<button class="btn hueco chico" data-accion="examen-callado">' +
          "No puedo hablar en voz alta ahora</button>"
        : "") +
      '<div style="height:8px"></div>' +
      '<button class="btn hueco" data-accion="cerrar-hoja">Ahora no</button>',
      function (acc, b, velo) {
        if (acc !== "empezar-examen" && acc !== "examen-callado") return;
        velo.remove();
        arrancar(acc === "examen-callado");
      }
    );
  }

  function abrirNivelacion() {
    const pr = APP.examen.nivelacion();
    hoja(
      '<div class="centro"><div class="diploma-emo">🧭</div></div>' +
      '<h2 class="centro">Prueba de nivel</h2>' +
      '<p class="chico apagado">' + pr.total + " preguntas, de más fácil a más difícil. " +
      "No se aprueba ni se reprueba: sólo sirve para dejarte donde te corresponde.</p>" +
      '<p class="chico apagado">Si no sabes una, déjala: contestar al azar te dejaría en un ' +
      "nivel que no es el tuyo.</p>" +
      '<button class="btn" data-accion="empezar-nivelacion">Empezar</button>' +
      '<div style="height:8px"></div>' +
      '<button class="btn hueco" data-accion="cerrar-hoja">Ahora no</button>',
      function (acc, b, velo) {
        if (acc !== "empezar-nivelacion") return;
        velo.remove();
        APP.leccion.iniciar({
          ejercicios: pr.preguntas,
          titulo: "Prueba de nivel",
          modo: "examen",
          examen: Object.assign({}, pr, { nivel: null, nivelacion: true }),
          corazones: false,
          alTerminar: pintar,
        });
      }
    );
  }

  /* La clase que abre una unidad. Se enseña la regla antes de practicarla: un
   * adulto entiende "he lleva -s" en diez segundos leyéndolo, y en veinte
   * ejercicios adivinándolo. */
  function claseAntesDe(l, seguir) {
    const temas = (l.clase || []).map(function (id) { return APP.datosGramatica.tema(id); })
      .filter(Boolean);

    /* Si la lección no declara clase pero practica una regla, la explicación
     * de esa regla hace de clase. Así nunca se practica algo que no se ha
     * explicado, y sobre todo nunca se explica una cosa para practicar otra,
     * que es peor: deja la sensación de que la explicación no servía. */
    if (!temas.length && l.reglas && l.reglas.length) {
      const re = APP.datosReglas.regla(l.reglas[0]);
      if (re) {
        fichaReglaComoClase(re, seguir);
        return;
      }
    }
    if (!temas.length) return seguir();

    let i = 0;
    function mostrar() {
      const t = temas[i];
      const ultimo = i === temas.length - 1;
      hoja(
        '<div class="ficha-cabecera"><span class="emo-grande">' + t.emo + "</span>" +
        "<h2>" + d.esc(t.titulo) + "</h2></div>" +
        '<div class="explicacion">' + permitirNegrita(t.explicacion) + "</div>" +
        (t.tabla ? tablaTocable(t.tabla) : "") +
        '<div class="trampa"><div class="mal">✗ ' + tocablesEn(t.trampa.mal) + "</div>" +
        '<div class="bien">✓ ' + tocablesEn(t.trampa.bien) + "</div>" +
        '<div class="mini" style="margin-top:6px">' + d.esc(t.trampa.porque) + "</div></div>" +
        '<div class="mini apagado centro" style="margin-top:10px">' +
        "Toca cualquier palabra en inglés para ver qué significa.</div>" +
        '<button class="btn" style="margin-top:14px" data-accion="clase-seguir">' +
        (ultimo ? "Entendido, a practicar" : "Siguiente") + "</button>" +
        (temas.length > 1
          ? '<div class="mini apagado centro" style="margin-top:8px">' + (i + 1) + " de " + temas.length + "</div>"
          : ""),
        function (acc, b, velo) {
          if (acc !== "clase-seguir") return;
          velo.remove();
          i++;
          if (i < temas.length) mostrar();
          else seguir();
        }
      );
    }
    mostrar();
  }

  function fichaReglaComoClase(re, seguir) {
    hoja(
      '<div class="ficha-cabecera"><span class="emo-grande">' + re.emo + "</span>" +
      "<h2>" + d.esc(re.titulo) + "</h2></div>" +
      '<div class="clave-regla">' + d.esc(re.clave) + "</div>" +
      '<div class="explicacion">' + permitirNegrita(re.regla) + "</div>" +
      (re.tabla ? tablaTocable(re.tabla) : "") +
      '<div class="trampa"><div class="mal">✗ ' + tocablesEn(re.error.mal) + "</div>" +
      '<div class="bien">✓ ' + tocablesEn(re.error.bien) + "</div></div>" +
      '<div class="mini apagado centro" style="margin-top:10px">' +
      "Toca cualquier palabra en inglés para ver qué significa.</div>" +
      '<button class="btn" style="margin-top:14px" data-accion="clase-seguir">Entendido, a practicar</button>',
      function (acc, b, velo) {
        if (acc !== "clase-seguir") return;
        velo.remove();
        seguir();
      }
    );
  }

  /* Las tablas de las clases llevan ejemplos en inglés —"I work here"— y hasta
   * ahora no había forma de saber qué era "work". Esperar que alguien que
   * empieza ya conozca las palabras de los ejemplos es justo el supuesto que
   * hace que una explicación no se entienda. */
  function tablaTocable(t) {
    return '<div class="tabla-caja"><table class="tabla"><thead><tr>' +
      t.cabecera.map(function (c) { return "<th>" + d.esc(c) + "</th>"; }).join("") +
      "</tr></thead><tbody>" +
      t.filas.map(function (f) {
        return "<tr>" + f.map(function (c) { return "<td>" + tocablesEn(c) + "</td>"; }).join("") + "</tr>";
      }).join("") +
      "</tbody></table></div>";
  }

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

    // Enter manda el mensaje al tutor: en una conversación, tener que buscar el
    // botón cada vez rompe el ritmo.
    raiz.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" || ev.target.id !== "tutor-campo") return;
      ev.preventDefault();
      const t = ev.target.value;
      ev.target.value = "";
      enviarAlTutor(t);
    });

    raiz.addEventListener("input", function (ev) {
      if (ev.target.id === "dic-campo") return pintarBusqueda(ev.target.value);
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
        vista = null;
        tab = b.getAttribute("data-tab");
        pintar();
        return;
      }
      if (a === "desplegar") {
        const id = b.getAttribute("data-id");
        desplegadas[id] = !desplegadas[id];
        return pintar();
      }
      if (a === "leccion") return abrirLeccion(b.getAttribute("data-id"));
      if (a === "repaso") return repaso();
      if (a === "errores") return errores();
      if (a === "tema") return tema(b.getAttribute("data-id"));
      if (a === "reglas") { vista = "reglas"; return pintar(); }
      if (a === "tutor") { vista = "tutor"; return pintar(); }
      if (a === "tutor-enviar") {
        const c = d.$("#tutor-campo", raiz);
        const t = c ? c.value : "";
        if (c) c.value = "";
        return enviarAlTutor(t);
      }
      if (a === "tutor-micro") return dictarAlTutor();
      if (a === "tutor-tema") {
        const t = APP.tutor.ARRANQUES[parseInt(b.getAttribute("data-i"), 10)];
        if (!t) return;
        if (!t.en) {
          const c = d.$("#tutor-campo", raiz);
          if (c) c.focus();
          return;
        }
        return enviarAlTutor(t.en);
      }
      if (a === "tutor-nueva") {
        APP.tutor.reiniciar();
        pintarChat();
        return pintarBarraTutor(true);
      }
      if (a === "regla") return fichaRegla(b.getAttribute("data-id"));
      if (a === "regla-sugerida") {
        const re = APP.reglas.sugerida(3);
        if (re) fichaRegla(re.id);
        return;
      }
      if (a === "examen") return abrirExamen(b.getAttribute("data-id"));
      if (a === "ver-nivel") return verNivel(b.getAttribute("data-id"));
      if (a === "nivelacion") return abrirNivelacion();
      if (a === "saltar-nivelacion") {
        A().estado().ajustes.nivelacionHecha = true;
        A().guardar();
        return pintar();
      }
      if (a === "palabra") return palabra(b.getAttribute("data-palabra"));
      if (a === "volver") { vista = null; return pintar(); }
      if (a === "gramatica") return pantallaGramatica();
      if (a === "verbos") return pantallaVerbos();
      if (a === "sonidos") return pantallaSonidos();
      if (a === "frasario") return frasario();
      if (a === "canciones") return canciones();
      if (a === "audio") return APP.audio.hablar(b.getAttribute("data-texto"));

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
    palabra: palabra,
    enganchar: enganchar,
    aplicarTema: aplicarTema,
    irA: function (t) { tab = t; pintar(); },
  };
})();
