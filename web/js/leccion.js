/* La pantalla de ejercicios: donde de verdad se aprende.
 *
 * Una sesión es una lista de ejercicios ya armados por el motor. Acá sólo se
 * dibujan, se corrigen y se anota el resultado; el motor decide qué preguntar
 * y el repaso espaciado decide cuándo volver a preguntarlo.
 *
 * Tres decisiones que se apartan de Duolingo, a propósito:
 *  - lo que se falla vuelve a preguntarse al final de la misma sesión, no
 *    "algún día": el error se corrige mientras todavía se recuerda;
 *  - la corrección siempre dice por qué, no sólo qué era lo correcto;
 *  - quedarse sin vidas nunca deja a la persona sin poder practicar.
 */
(function () {
  "use strict";

  const d = APP.dom;
  let S = null;
  let raiz = null;

  /* Acá vivían el contrarreloj, las vidas, los puntos y la racha de aciertos.
   * Se quitaron enteros, no se escondieron: una capa de juego no es neutra.
   * El contrarreloj premia contestar rápido, y contestar rápido en un idioma
   * que estás aprendiendo significa contestar con lo que ya sabías; las vidas
   * meten urgencia, y la urgencia empuja a adivinar en vez de pensar. */

  function iniciar(op) {
    /* Si ya hay una lección abierta, se cierra antes. Sin esto, dos toques
     * rápidos en el mismo botón —o empezar un examen sin haber salido de lo
     * anterior— apilan dos capas: la de arriba funciona, la de abajo queda
     * viva debajo, y al cerrar la primera aparece la vieja como si nada. */
    if (raiz && raiz.parentNode) cerrar();

    S = {
      ejercicios: op.ejercicios.slice(),
      titulo: op.titulo || "Práctica",
      modo: op.modo || "practica",
      leccionId: op.leccionId || null,
      corazones: op.corazones !== false && ajuste("corazones") !== false,
      alTerminar: op.alTerminar || function () {},
      alRepetir: op.alRepetir || null,
      i: 0,
      total: op.ejercicios.length,
      aciertos: 0,
      fallos: 0,
      inicio: Date.now(),
      reintentos: [],
      respuesta: null,
      corregido: null,
      falladosIds: [],
      /* En modo examen se guarda qué se acertó y qué no, pero no se enseña
       * hasta el final. Saber al instante si acertaste cambia cómo contestas
       * las siguientes —te confías o te bloqueas— y entonces ya no se está
       * midiendo lo que sabes. */
      examen: op.examen || null,
      aciertosExamen: {},
    };

    if (!S.ejercicios.length) {
      d.avisar("Nada que practicar", "Avanza un poco en el camino y vuelve: el repaso se llena solo.");
      return;
    }

    raiz = document.createElement("div");
    raiz.className = "leccion";
    raiz.id = "leccion";
    document.body.appendChild(raiz);
    document.body.style.overflow = "hidden";
    engancharEventos();
    pintar();
  }

  function ajuste(k) {
    return APP.almacen.estado().ajustes[k];
  }

  function cerrar() {
    APP.audio.callar();
    APP.audio.detenerEscucha();
    if (raiz && raiz.parentNode) raiz.parentNode.removeChild(raiz);
    document.body.style.overflow = "";
    raiz = null;
    S = null;
  }

  function actual() {
    return S.ejercicios[S.i];
  }

  /* ---------------- Dibujo ---------------- */

  function pintar() {
    const ej = actual();
    const avance = Math.round((S.i / S.total) * 100);
    raiz.innerHTML =
      '<div class="leccion-caja">' +
      cabecera(avance) +
      '<div class="leccion-cuerpo" id="cuerpo">' + cuerpo(ej) + "</div>" +
      '<div id="pie"></div>' +
      "</div>";
    pintarPie();
    if (ej.autoAudio && ej.audio) setTimeout(function () { decir(ej.audio); }, 350);
    // Sin foco automático: abre el teclado y tapa media pantalla. Se deja que
    // lo abra ella cuando quiera escribir.
  }

  function cabecera(avance) {
    /* La barra dice dónde vas y nada más. Antes llevaba corazones y un contador
     * de puntos: dos cosas que no son inglés compitiendo por la atención con
     * el ejercicio, que sí lo es. */
    return (
      '<div class="barra">' +
      '<button class="icono-btn" data-accion="salir" aria-label="Salir">✕</button>' +
      '<div class="barra-prog"><i style="width:' + avance + '%"></i></div>' +
      '<span class="contador paso">' + Math.min(S.i + 1, S.total) + "/" + S.total + "</span>" +
      "</div>"
    );
  }

  function cuerpo(ej) {
    switch (ej.tipo) {
      case "elige-en":
      case "elige-es":
        return elegir(ej);
      case "escucha-elige":
        return escuchaElige(ej);
      case "arma":
        return armar(ej);
      case "escribe":
        return escribir(ej);
      case "habla":
        return hablar(ej);
      case "hueco":
        return hueco(ej);
      case "pares":
        return pares(ej);
      case "regla-elige":
        return reglaElige(ej);
      case "regla-escribe":
        return reglaEscribe(ej);
      case "lectura-texto":
        return lecturaTexto(ej);
      case "lectura-pregunta":
        return lecturaPregunta(ej);
      default:
        return "<p>Ejercicio desconocido.</p>";
    }
  }

  function bloquePrompt(ej) {
    let out = "";
    if (ej.promptHex) out += '<div class="muestra-color" style="background:' + d.esc(ej.promptHex) + '"></div>';
    else if (ej.promptIcon) out += '<div class="emoji-grande">' + d.esc(ej.promptIcon) + "</div>";
    if (ej.prompt) {
      out += '<div class="prompt-grande">' + marcar(ej.prompt, ej.promptEn) + "</div>";
      if (ej.audio) out += botonAudio(ej.audio, "Escuchar");
    }
    return out;
  }

  function claseOpcion(ej, o, i) {
    /* Después de comprobar, cada opción se pinta: verde la correcta, roja la
     * que eligió si estaba mal. Sin esto la corrección dice "casi" pero no
     * muestra dónde estuvo el error, que es la mitad de lo que enseña. */
    if (!S.corregido) return S.respuesta === i ? " elegida" : "";
    if (o.correcta) return " buena";
    if (S.respuesta === i) return " mala";
    return " tachada";
  }

  function botonAudio(texto, etiqueta, grande) {
    return (
      '<button class="btn azul ' + (grande ? "" : "chico") + '" data-accion="audio" data-texto="' +
      d.esc(texto) + '">🔊 ' + d.esc(etiqueta || "Escuchar") + "</button>"
    );
  }

  function elegir(ej) {
    return (
      '<div class="enunciado">' + d.esc(ej.enunciado) + "</div>" +
      bloquePrompt(ej) +
      '<div class="opciones" style="margin-top:16px">' +
      ej.opciones.map(function (o, i) {
        return (
          '<button class="opcion' + claseOpcion(ej, o, i) + '" data-accion="opcion" data-i="' + i + '">' +
          (o.icon ? '<span class="emo">' + d.esc(o.icon) + "</span>" : "") +
          "<span>" + marcar(o.texto, ej.opcionesEn) + "</span></button>"
        );
      }).join("") +
      "</div>"
    );
  }

  function escuchaElige(ej) {
    return (
      '<div class="enunciado">' + d.esc(ej.enunciado) + "</div>" +
      '<div class="centro" style="margin:18px 0 22px">' +
      '<button class="micro" data-accion="audio" data-texto="' + d.esc(ej.audio) + '" aria-label="Escuchar">🔊</button>' +
      '<div><button class="btn hueco chico" data-accion="audio-lento" data-texto="' + d.esc(ej.audio) + '">🐢 Más lento</button></div>' +
      "</div>" +
      '<div class="opciones">' +
      ej.opciones.map(function (o, i) {
        return (
          '<button class="opcion' + claseOpcion(ej, o, i) + '" data-accion="opcion" data-i="' + i + '">' +
          "<span>" + marcar(o.texto, ej.opcionesEn) + "</span>" +
          (o.simbolo ? '<span class="ipa">/' + d.esc(o.simbolo) + "/</span>" : "") +
          "</button>"
        );
      }).join("") +
      "</div>"
    );
  }

  function armar(ej) {
    const puestas = S.respuesta || [];
    return (
      '<div class="enunciado">' + d.esc(ej.enunciado) + "</div>" +
      (ej.audio ? '<div style="margin-bottom:10px">' + botonAudio(ej.audio) + "</div>" : "") +
      '<div class="tarjeta plana"><div class="fuerte">' + marcar(ej.prompt, ej.promptEn) + "</div></div>" +
      '<div class="renglon" id="renglon">' +
      puestas.map(function (p, i) {
        return '<button class="ficha" data-accion="quitar" data-i="' + i + '">' + d.esc(p.texto) + "</button>";
      }).join("") +
      "</div>" +
      '<div class="banco">' +
      ej.fichas.map(function (f, i) {
        const usada = puestas.some(function (p) { return p.origen === i; });
        return (
          '<button class="ficha' + (usada ? " fantasma" : "") + '" data-accion="poner" data-i="' + i + '"' +
          (usada ? " disabled" : "") + ">" + d.esc(f) + "</button>"
        );
      }).join("") +
      "</div>"
    );
  }

  function escribir(ej) {
    const sinTeclado = ajuste("teclado") === false;
    return (
      '<div class="enunciado">' + d.esc(ej.enunciado) + "</div>" +
      (ej.audio
        ? '<div class="centro" style="margin:6px 0 16px"><button class="micro" data-accion="audio" data-texto="' +
          d.esc(ej.audio) + '" aria-label="Escuchar">🔊</button>' +
          '<div><button class="btn hueco chico" data-accion="audio-lento" data-texto="' + d.esc(ej.audio) + '">🐢 Más lento</button></div></div>'
        : bloquePrompt(ej)) +
      // Al corregir se deja lo que escribió, en gris y sin poder editarlo:
      // comparar su respuesta con la correcta es la mitad de la corrección, y
      // si el campo se vacía no queda con qué compararla.
      '<textarea class="campo" id="campo" rows="3" autocapitalize="none" autocorrect="off" spellcheck="false" ' +
      (S.corregido ? "readonly " : "") + 'placeholder="Escribe acá…">' +
      (S.corregido ? d.esc(S.respuesta || "") : "") + "</textarea>" +
      (sinTeclado
        ? '<div class="aviso ojo mini">Tienes el teclado desactivado en Ajustes; estos ejercicios igual necesitan escribir.</div>'
        : "") +
      // Una vez corregido ya no hay nada que rendirse: el botón sólo confundiría.
      (S.corregido
        ? ""
        : '<button class="btn hueco chico" style="margin-top:10px" data-accion="rendirse">No me acuerdo, muéstramelo</button>')
    );
  }

  function hablar(ej) {
    const grabando = S.respuesta && S.respuesta.grabando;
    return (
      '<div class="enunciado">' + d.esc(ej.enunciado) + "</div>" +
      '<div class="tarjeta"><div class="prompt-grande" style="font-size:22px">' +
      marcar(ej.prompt, ej.promptEn) + "</div>" +
      '<div class="apagado chico">' + d.esc(ej.traduccion || "") + "</div>" +
      '<div style="margin-top:10px">' + botonAudio(ej.audio) + "</div></div>" +
      '<div class="centro">' +
      '<button class="micro' + (grabando ? " grabando" : "") + '" data-accion="micro" aria-label="Grabar">🎤</button>' +
      '<div class="apagado chico">' + (grabando ? "Escuchando… habla ahora" : "Toca y di la frase") + "</div>" +
      (S.respuesta && S.respuesta.texto
        ? '<div class="tarjeta plana" style="margin-top:14px;text-align:left">Escuché: <span class="fuerte">' +
          d.esc(S.respuesta.texto) + "</span></div>"
        : "") +
      "</div>" +
      (S.corregido
        ? ""
        : '<button class="btn hueco chico" style="margin-top:14px" data-accion="saltar-habla">' +
          (S.examen ? "Saltar (cuenta como fallada)" : "Ahora no puedo hablar") + "</button>")
    );
  }

  function hueco(ej) {
    const partes = ej.oracion.split("___");
    return (
      '<div class="enunciado">' + d.esc(ej.enunciado) + "</div>" +
      '<div class="tarjeta"><div class="prompt-grande" style="font-size:22px">' +
      marcar(partes[0], ej.oracionEn) + '<span style="color:var(--azul)">_____</span>' +
      marcar(partes[1] || "", ej.oracionEn) +
      "</div></div>" +
      '<div class="opciones">' +
      ej.opciones.map(function (o, i) {
        return '<button class="opcion' + claseOpcion(ej, o, i) + '" data-accion="opcion" data-i="' + i + '"><span>' +
          marcar(o.texto, ej.opcionesEn) + "</span></button>";
      }).join("") +
      "</div>"
    );
  }

  function pares(ej) {
    const est = S.respuesta || { unidas: {}, sel: null, error: null };
    function col(lista, lado) {
      return lista.map(function (x, i) {
        const resuelta = est.unidas[x.id];
        const sel = est.sel && est.sel.lado === lado && est.sel.i === i;
        const err = est.error && est.error.lado === lado && est.error.i === i;
        return (
          '<button class="par' + (resuelta ? " resuelta unida" : "") + (sel ? " elegida" : "") +
          (err ? " error" : "") + '" data-accion="par" data-lado="' + lado + '" data-i="' + i + '">' +
          d.esc(x.texto) + "</button>"
        );
      }).join("");
    }
    return (
      '<div class="enunciado">' + d.esc(ej.enunciado) + "</div>" +
      '<div class="pares"><div style="display:grid;gap:10px">' + col(ej.izquierda, "en") + "</div>" +
      '<div style="display:grid;gap:10px">' + col(ej.derecha, "es") + "</div></div>"
    );
  }

  /* ---------------- Pie: comprobar y corregir ---------------- */

  /* ---------------- Reglas ----------------
   *
   * La frase se parte por el hueco y el hueco se dibuja como tal. Ver dónde
   * falta la palabra —y no un enunciado que la describe— es lo que convierte
   * el ejercicio en algo que se contesta sin leer dos veces. */
  function huecoPartido(ej, relleno) {
    const trozos = String(ej.frase).split("___");
    let out = "";
    trozos.forEach(function (t, i) {
      out += d.esc(t);
      if (i < trozos.length - 1) {
        out += '<span class="hueco-regla">' + (relleno ? d.esc(relleno) : "&nbsp;&nbsp;&nbsp;&nbsp;") + "</span>";
      }
    });
    return out;
  }

  /* Una frase que es sólo el hueco —"___" o "___ …"— no es una frase: es una
   * pregunta suelta, como "¿cómo se dice 'el auto'?". Dibujarla igual dejaba
   * una raya azul flotando sin nada alrededor y la pregunta de verdad en letra
   * chica debajo, que es justo al revés de lo que hay que leer primero. */
  function sinContexto(ej) {
    return String(ej.frase).replace(/_{3}/g, "").replace(/[\s…·.]/g, "") === "";
  }

  function cabeceraRegla(ej) {
    if (sinContexto(ej)) {
      return (
        '<div class="enunciado">' + d.esc(ej.tituloRegla) + "</div>" +
        '<div class="prompt-grande">' + d.esc(ej.es) + "</div>"
      );
    }
    return (
      '<div class="enunciado">' + d.esc(ej.tituloRegla) + "</div>" +
      '<div class="frase-regla">' + huecoPartido(ej) + "</div>" +
      (ej.es ? '<div class="mini apagado centro">' + d.esc(ej.es) + "</div>" : "")
    );
  }

  function reglaElige(ej) {
    return (
      cabeceraRegla(ej) +
      '<div class="opciones" style="margin-top:18px">' +
      ej.opciones.map(function (o, i) {
        let clase = "";
        if (!S.corregido) clase = S.respuesta === i ? " elegida" : "";
        else if (o === ej.ok) clase = " buena";
        else if (S.respuesta === i) clase = " mala";
        else clase = " tachada";
        return (
          '<button class="opcion' + clase + '" data-accion="opcion" data-i="' + i + '">' +
          "<span>" + d.esc(o) + "</span></button>"
        );
      }).join("") +
      "</div>"
    );
  }

  function reglaEscribe(ej) {
    return (
      cabeceraRegla(ej) +
      '<input class="campo" id="campo" type="text" autocomplete="off" autocapitalize="off" ' +
      'autocorrect="off" spellcheck="false" placeholder="Escribe lo que falta" ' +
      (S.corregido ? "disabled" : "") + ' value="' + d.esc(S.respuesta || "") + '">' +
      '<div class="mini apagado centro" style="margin-top:10px">Sólo la palabra que va en el hueco.</div>'
    );
  }

  /* ---------------- Lectura ---------------- */

  function lecturaTexto(ej) {
    /* El texto se entrega entero y sin preguntas: se lee primero. Cada palabra
     * queda tocable, que es lo que permite seguir leyendo en vez de abandonar
     * en la primera que no se entiende. */
    const parrafos = String(ej.cuerpo).split(/\n\n+/).map(function (p) {
      return "<p>" + tocables(p) + "</p>";
    }).join("");

    return (
      '<div class="enunciado">' + d.esc(ej.emo || "📖") + " " + d.esc(ej.titulo) + "</div>" +
      '<div class="lectura">' + parrafos + "</div>" +
      (ej.glosario && ej.glosario.length
        ? '<div class="glosario"><div class="mini apagado">Palabras que quizá no conozcas</div>' +
          ej.glosario.map(function (g) {
            return '<div class="glosa"><b>' + d.esc(g.en) + "</b> · " + d.esc(g.es) + "</div>";
          }).join("") + "</div>"
        : "") +
      '<div class="mini apagado centro" style="margin-top:14px">' +
      "Toca cualquier palabra para ver qué significa.</div>"
    );
  }

  function lecturaPregunta(ej) {
    // Sólo se hace tocable el inglés. Una pregunta en español no tiene nada
    // que consultar, y ofrecerlo sólo produce "no está en el curso".
    const marcar = ej.idioma === "es" ? d.esc : tocables;
    return (
      '<div class="enunciado">' + marcar(ej.pregunta) + "</div>" +
      '<div class="opciones" style="margin-top:16px">' +
      ej.opciones.map(function (o, i) {
        let clase = "";
        if (!S.corregido) clase = S.respuesta === i ? " elegida" : "";
        else if (o === ej.ok) clase = " buena";
        else if (S.respuesta === i) clase = " mala";
        else clase = " tachada";
        return (
          '<button class="opcion izq' + clase + '" data-accion="opcion" data-i="' + i + '">' +
          "<span>" + marcar(o) + "</span></button>"
        );
      }).join("") +
      "</div>"
    );
  }

  /* Envuelve cada palabra inglesa en algo que se puede tocar. El texto se
   * conserva exactamente: los separadores van tal cual, así que lo que se lee
   * es lo que se escribió. */
  /* Pinta un texto haciendo tocable cada palabra, o tal cual si está en
   * español. Se usa en todas partes: enunciados, opciones, fichas.
   *
   * Es la diferencia entre poder contestar y no poder. Una pregunta con una
   * palabra que no conoces no se contesta: se adivina, y adivinar no enseña.
   * Y el diccionario existía pero sólo funcionaba en los textos de lectura,
   * que es donde menos falta hace, porque ahí sí hay glosario. */
  function marcar(texto, enIngles) {
    return enIngles ? tocables(texto) : d.esc(texto);
  }

  function tocables(texto) {
    if (!APP.diccionario) return d.esc(texto);
    return APP.diccionario.trocear(texto).map(function (p) {
      if (!p.palabra) return d.esc(p.texto);
      return '<span class="tocable" data-accion="palabra" data-palabra="' + d.esc(p.texto) + '">' +
        d.esc(p.texto) + "</span>";
    }).join("");
  }

  function pintarPie() {
    const pie = d.$("#pie", raiz);
    if (!pie) return;
    const ej = actual();

    if (ej.tipo === "pares") {
      pie.innerHTML = '<div class="pie"><div class="apagado chico centro">Une las cinco parejas para seguir</div></div>';
      return;
    }

    if (S.corregido) {
      const c = S.corregido;
      pie.className = "";
      pie.innerHTML =
        /* Reconocer que no se sabe no merece el "Casi": no es un fallo, es haber
         * pedido que te lo enseñen, que es lo que hay que hacer cuando no se
         * sabe algo. */
        '<div class="pie ' + (c.correcto ? "bien" : c.rendida ? "neutro" : "mal") + ' entrada-animada">' +
        '<div class="pie-titulo">' +
        '<span class="marca">' + (c.correcto ? "✓" : c.rendida ? "→" : "✗") + "</span>" +
        "<span>" + (c.correcto ? "Correcto" : c.rendida ? "Ahora ya la sabes" : "No es ésa") + "</span></div>" +
        (c.detalle ? '<div class="detalle">' + c.detalle + "</div>" : "") +
        '<button class="btn ' + (c.correcto ? "" : c.rendida ? "azul" : "rojo") + '" data-accion="continuar">Continuar</button>' +
        "</div>";
      return;
    }

    const listo = hayRespuesta(ej);
    /* El botón dice lo que va a pasar. En un texto de lectura no hay nada que
     * comprobar —se lee y se sigue— y en un examen no se corrige hasta el
     * final, así que "Comprobar" prometería una corrección que no llega. */
    const etiqueta = ej.tipo === "lectura-texto"
      ? "Ya lo leí"
      : S.examen
        ? (S.i === S.ejercicios.length - 1 ? "Terminar el examen" : "Siguiente")
        : "Comprobar";
    /* "No la sé" al lado de comprobar.
     *
     * Sin esta salida, una pregunta que no se entiende obliga a adivinar, y
     * adivinar no enseña nada: si aciertas por suerte la aplicación cree que
     * lo sabes y no te la vuelve a preguntar. Decir "no la sé" da mejor
     * información que un acierto con un 25% de probabilidad.
     *
     * No cuesta vida a propósito. Si costara, saldría más barato adivinar, y
     * entonces el botón no lo usaría nadie.
     */
    const puedeRendirse = ej.tipo !== "lectura-texto" && ej.tipo !== "pares" && ej.tipo !== "habla";

    pie.innerHTML =
      '<div class="pie">' +
      '<button class="btn" data-accion="comprobar"' + (listo ? "" : " disabled") + ">" +
      etiqueta + "</button>" +
      (puedeRendirse
        ? '<button class="btn hueco chico" style="margin-top:8px" data-accion="no-se">' +
          "No la sé, muéstrame</button>"
        : "") +
      "</div>";
  }

  function hayRespuesta(ej) {
    // El texto de una lectura no se contesta: se lee y se sigue.
    if (ej.tipo === "lectura-texto") return true;
    if (ej.tipo === "arma") return S.respuesta && S.respuesta.length > 0;
    if (ej.tipo === "escribe" || ej.tipo === "regla-escribe") {
      const c = d.$("#campo", raiz);
      return !!(c && c.value.trim());
    }
    if (ej.tipo === "habla") return !!(S.respuesta && S.respuesta.texto);
    return S.respuesta !== null && S.respuesta !== undefined;
  }

  const ELOGIOS = ["¡Perfecto!", "¡Excelente!", "¡Muy bien!", "¡Eso es!", "¡Impecable!", "¡Vas volando!"];
  /* ---------------- Corrección ---------------- */

  function comprobar() {
    const ej = actual();
    let correcto = false;
    let detalle = "";
    let calidad = 0;

    if (ej.tipo === "elige-en" || ej.tipo === "elige-es" || ej.tipo === "escucha-elige" || ej.tipo === "hueco") {
      const o = ej.opciones[S.respuesta];
      correcto = !!(o && o.correcta);
      if (!correcto) detalle = "La respuesta correcta es: <b>" + d.esc(ej.respuesta) + "</b>";
      if (ej.explicacion) detalle += (detalle ? "<br>" : "") + d.esc(ej.explicacion);
      else if (correcto && ej.traduccion) detalle = d.esc(ej.traduccion);
      if (ej.nota) detalle += (detalle ? "<br>" : "") + "🇬🇧 " + d.esc(ej.nota);
      calidad = correcto ? 2 : 0;
    } else if (ej.tipo === "arma") {
      const dicho = S.respuesta.map(function (p) { return p.texto; }).join(" ");
      correcto = APP.texto.iguales(dicho, ej.respuesta);
      if (!correcto) detalle = "La frase es: <b>" + d.esc(ej.respuesta) + "</b>";
      calidad = correcto ? 2 : 0;
    } else if (ej.tipo === "escribe") {
      const dicho = (d.$("#campo", raiz) || {}).value || "";
      S.respuesta = dicho;
      const exacto = APP.texto.iguales(dicho, ej.respuesta);
      const casi = !exacto && APP.texto.casiIguales(dicho, ej.respuesta);
      correcto = exacto || casi;
      if (casi) detalle = "Se escribe: <b>" + d.esc(ej.respuesta) + "</b> — te faltó una letra, pero se entiende.";
      else if (!correcto) detalle = "La respuesta es: <b>" + d.esc(ej.respuesta) + "</b>";
      else if (ej.traduccion) detalle = d.esc(ej.traduccion);
      calidad = exacto ? 2 : casi ? 1 : 0;
    } else if (ej.tipo === "lectura-texto") {
      // No hay nada que corregir: leerlo ya es el ejercicio.
      correcto = true;
      calidad = 2;
    } else if (ej.tipo === "regla-elige" || ej.tipo === "lectura-pregunta") {
      correcto = ej.opciones[S.respuesta] === ej.ok;
      if (!correcto) detalle = "Es <b>" + d.esc(ej.ok) + "</b>";
      /* El porqué va siempre, se acierte o no. Acertando confirma que fue por
       * la razón correcta y no por suerte; fallando es lo único que enseña,
       * porque ver sólo la respuesta buena enseña esa respuesta y no la regla. */
      if (ej.porque) detalle += (detalle ? "<br>" : "") + d.esc(ej.porque);
      // La frase entera sólo si aporta algo: si era sólo el hueco, repetirla
      // es escribir la respuesta dos veces seguidas.
      if (!correcto && ej.frase && !sinContexto(ej)) {
        detalle += "<br><span class=\"mini\">" + d.esc(APP.reglas.resuelta(ej)) + "</span>";
      }
      calidad = correcto ? 2 : 0;
    } else if (ej.tipo === "regla-escribe") {
      const dicho = (d.$("#campo", raiz) || {}).value || "";
      S.respuesta = dicho;
      correcto = APP.reglas.correcta(ej, dicho);
      if (!correcto) {
        detalle = "Es <b>" + d.esc(ej.ok) + "</b>";
        detalle += "<br><span class=\"mini\">" + d.esc(APP.reglas.resuelta(ej)) + "</span>";
      }
      if (ej.porque) detalle += (detalle ? "<br>" : "") + d.esc(ej.porque);
      calidad = correcto ? 2 : 0;
    } else if (ej.tipo === "habla") {
      const r = APP.texto.comparar(ej.respuesta, (S.respuesta && S.respuesta.texto) || "");
      correcto = r.nota >= 70;
      detalle = pintarDiff(r) + '<div class="mini" style="margin-top:6px">' + r.nota + "% de las palabras salieron bien.</div>";
      calidad = r.nota >= 90 ? 2 : r.nota >= 70 ? 1 : 0;
    }

    registrar(ej, correcto, calidad);

    if (S.examen) {
      S.aciertosExamen[S.i] = correcto;
      S.respuesta = null;
      S.corregido = null;
      S.i += 1;
      if (S.i >= S.ejercicios.length) return terminar();
      pintar();
      return;
    }

    S.corregido = { correcto: correcto, detalle: detalle };
    if (correcto) {
      APP.audio.efectos.bien(0);
    } else {
      APP.audio.efectos.mal();
    }
    S.botonTocado = null;

    if (correcto && ej.audioAlAcertar) decir(ej.audioAlAcertar);
    pintar();
  }

  /* Muestra la respuesta sin castigar.
   *
   * Cuenta como no sabida —vuelve pronto en el repaso y se repregunta antes de
   * terminar la lección— pero no quita vida. La diferencia con fallar es real:
   * fallar es haberlo intentado, esto es reconocer que no se sabe, y lo segundo
   * merece que se lo enseñen, no que se lo castiguen.
   */
  function noLaSe() {
    const ej = actual();
    let detalle = "";

    if (ej.tipo === "regla-elige" || ej.tipo === "regla-escribe") {
      detalle = "Es <b>" + d.esc(ej.ok) + "</b>";
      if (ej.frase && !sinContexto(ej)) {
        detalle += "<br><span class=\"mini\">" + d.esc(APP.reglas.resuelta(ej)) + "</span>";
      }
      if (ej.porque) detalle += "<br>" + d.esc(ej.porque);
    } else if (ej.tipo === "lectura-pregunta") {
      detalle = "Es <b>" + d.esc(ej.ok) + "</b>";
    } else {
      detalle = "La respuesta es: <b>" + d.esc(ej.respuesta) + "</b>";
      if (ej.explicacion) detalle += "<br>" + d.esc(ej.explicacion);
      else if (ej.traduccion) detalle += "<br>" + d.esc(ej.traduccion);
      if (ej.nota) detalle += "<br>🇬🇧 " + d.esc(ej.nota);
    }

    // Se repregunta antes de terminar: que te la enseñen y no volver a verla
    // no sirve de nada. En un examen no, porque ahí se mide, no se enseña.
    if (!S.examen) S.reintentos.push(ej);
    if (ej.tarjetaId) {
      APP.srs.registrar(ej.tarjetaId, 0);
      const t = APP.datos.porId(ej.tarjetaId);
      if (t) APP.almacen.anotarError(t.id, { en: t.en, es: t.es, skill: t.skill });
    }
    if (ej.regla && APP.reglas) APP.reglas.anotar(ej, false);

    if (S.examen) {
      S.aciertosExamen[S.i] = false;
      S.respuesta = null;
      S.i += 1;
      if (S.i >= S.ejercicios.length) return terminar();
      pintar();
      return;
    }

    S.corregido = { correcto: false, rendida: true, detalle: detalle };
    if (ej.audio || ej.respuesta) decir(ej.audio || ej.respuesta);
    pintar();
  }

  function pintarDiff(r) {
    const clases = { ok: "ok", falta: "falta", cambio: "cambio", sobra: "sobra" };
    return (
      '<div class="diff">' +
      r.ops.map(function (o) {
        if (o.tipo === "cambio") {
          return '<span class="cambio">' + d.esc(o.palabra) + "</span> ";
        }
        return '<span class="' + clases[o.tipo] + '">' + d.esc(o.palabra) + "</span> ";
      }).join("") +
      "</div>" +
      '<div class="mini apagado">Verde: bien · Rojo: no se escuchó · Naranjo: sonó distinto · Tachado: sobró</div>'
    );
  }

  function registrar(ej, correcto, calidad) {
    if (correcto) {
      S.aciertos += 1;
    } else {
      S.fallos += 1;
      /* Vuelve a preguntarse antes de terminar: corregir en caliente es lo que
       * hace que el error no se repita mañana. En contrarreloj no, porque la
       * lista ya da vueltas sola; y en un examen tampoco, porque repreguntar
       * lo fallado convertiría la nota en "cuántas veces lo intentaste". */
      if (!S.examen) S.reintentos.push(ej);
      if (ej.tarjetaId) S.falladosIds.push(ej.tarjetaId);
      /* Equivocarse ya no cuesta nada. Las vidas existían para meter urgencia,
       * y la urgencia empuja a adivinar: si fallar te echa, arriesgas menos y
       * piensas menos. Acá el error es información —vuelve en el repaso y
       * queda anotado— y no un castigo. */
    }
    // El dominio de una regla se lleva aparte del repaso espaciado: no es lo
    // mismo recordar una palabra que automatizar una regla.
    if (ej.regla && APP.reglas) APP.reglas.anotar(ej, correcto);

    if (ej.tarjetaId) {
      APP.srs.registrar(ej.tarjetaId, calidad);
      if (!correcto) {
        const t = APP.datos.porId(ej.tarjetaId);
        if (t) APP.almacen.anotarError(t.id, { en: t.en, es: t.es, skill: t.skill });
      }
    }
  }

  function continuar() {
    S.corregido = null;
    S.respuesta = null;
    S.i += 1;

    if (S.i >= S.ejercicios.length) {
      if (S.reintentos.length) {
        // Segunda vuelta con lo fallado. No suma al total mostrado: la barra ya
        // llegó al final y volver a moverla se leería como un castigo.
        S.ejercicios = S.ejercicios.concat(S.reintentos);
        S.reintentos = [];
        pintar();
        return;
      }
      terminar();
      return;
    }
    pintar();
  }

  /* ---------------- Fin ---------------- */

  const NOMBRE_DESTREZA = { leer: "Leer", escribir: "Escribir", escuchar: "Escuchar", hablar: "Hablar" };
  const EMO_DESTREZA = { leer: "📖", escribir: "✍️", escuchar: "👂", hablar: "🗣️" };

  /* La prueba de nivel usa la misma pantalla que un examen —mismas preguntas,
   * misma forma de contestar— pero no termina igual: no hay nota ni aprobado,
   * sólo una recomendación de dónde empezar. Sin esta rama, además, reventaba:
   * su 'nivel' es null y buscar ese nivel en el currículo no devuelve nada. */
  function terminarNivelacion() {
    const rec = APP.examen.recomendar(S.examen, S.aciertosExamen);
    APP.examen.aplicarNivelacion(rec);
    APP.almacen.estado().ajustes.nivelacionHecha = true;
    APP.almacen.guardar();

    const n = APP.curriculo.nivel(rec.nivel);
    const primera = APP.curriculo.leccionesDelNivel(rec.nivel)[0];

    const detalle = APP.curriculo.NIVELES.map(function (x) {
      const p = rec.porNivel[x.id];
      if (!p || !p.de) return "";
      return '<div class="destreza-fila"><span class="emo">' + x.emo + "</span>" +
        '<span class="nombre">' + d.esc(x.titulo) + "</span>" +
        '<div class="barra-prog fina"><i style="width:' + Math.round((p.bien / p.de) * 100) +
        "%;background:" + x.color + '"></i></div>' +
        '<span class="cifra">' + p.bien + "/" + p.de + "</span></div>";
    }).join("");

    raiz.innerHTML =
      '<div class="leccion-caja"><div class="leccion-cuerpo" style="display:flex;flex-direction:column;justify-content:center">' +
      '<div class="centro"><div class="diploma-emo">' + n.emo + "</div></div>" +
      '<h1 class="centro">Empiezas en ' + d.esc(n.titulo) + "</h1>" +
      '<p class="centro apagado chico">' + d.esc(n.mcer) + " · " + d.esc(n.resumen) + "</p>" +
      '<div class="destrezas">' + detalle + "</div>" +
      '<p class="centro chico" style="margin-top:14px">Los niveles anteriores quedan abiertos por ' +
      "si quieres repasar algo. Y el examen final de cada uno sigue estando ahí.</p>" +
      (primera ? '<p class="centro chico">Empieza por <b>' + d.esc(primera.titulo) + "</b>.</p>" : "") +
      '<button class="btn" style="margin-top:18px" data-accion="cerrar">Ir al camino</button>' +
      "</div></div>";
  }

  function terminarExamen() {
    if (S.examen.nivelacion) return terminarNivelacion();
    const r = APP.examen.corregir(S.examen, S.aciertosExamen);
    APP.examen.guardar(S.examen, r);

    const nivel = APP.curriculo.nivel(S.examen.nivel);
    const siguiente = APP.examen.nivelDespuesDe(S.examen.nivel);
    const nombreSiguiente = siguiente ? APP.curriculo.nivel(siguiente).titulo : null;

    if (r.aprueba) APP.audio.efectos.completo();

    /* El desglose por destreza importa más que la nota. Un 68% puede ser
     * "vas bien salvo en escuchar" o "vas regular en todo", y son dos
     * consejos distintos; sólo el número no distingue. */
    const filas = APP.curriculo.DESTREZAS.map(function (dz) {
      const x = r.porDestreza[dz];
      if (!x.de) return "";
      const pct = Math.round((x.bien / x.de) * 100);
      return (
        '<div class="destreza-fila">' +
        '<span class="emo">' + EMO_DESTREZA[dz] + "</span>" +
        '<span class="nombre">' + NOMBRE_DESTREZA[dz] + "</span>" +
        '<div class="barra-prog fina"><i style="width:' + pct + "%;background:" +
        (pct >= 70 ? "#58cc02" : pct >= 50 ? "#ffc800" : "#ff4b4b") + '"></i></div>' +
        '<span class="cifra">' + x.bien + "/" + x.de + "</span></div>"
      );
    }).join("");

    raiz.innerHTML =
      '<div class="leccion-caja"><div class="leccion-cuerpo" style="display:flex;flex-direction:column;justify-content:center">' +
      '<div class="centro"><div class="diploma-emo">' + (r.aprueba ? "🎓" : "📘") + "</div></div>" +
      '<h1 class="centro">' + (r.aprueba ? "¡Aprobaste " + d.esc(nivel.titulo) + "!" : "Todavía no") + "</h1>" +
      '<div class="nota-grande ' + (r.aprueba ? "buena" : "") + '">' + r.porcentaje + "%</div>" +
      '<p class="centro apagado chico">' + r.bien + " de " + r.de + " · se aprueba con " + r.paraAprobar + "%</p>" +
      '<div class="destrezas">' + filas + "</div>" +
      '<p class="centro chico" style="margin-top:14px">' +
      (r.aprueba
        ? (nombreSiguiente
            ? "Se abrió el nivel <b>" + d.esc(nombreSiguiente) + "</b>."
            : "Terminaste el curso entero. En serio.")
        : (r.floja
            ? "Lo más flojo fue <b>" + NOMBRE_DESTREZA[r.floja.destreza].toLowerCase() +
              "</b> (" + r.floja.bien + " de " + r.floja.de + "). Practica eso y vuelve: " +
              "se puede repetir todas las veces que quieras."
            : "Practica un poco más y vuelve. Se puede repetir sin límite.")) +
      "</p>" +
      '<button class="btn" style="margin-top:18px" data-accion="cerrar">Volver al camino</button>' +
      "</div></div>";
  }

  function terminar() {
    if (S.examen) return terminarExamen();
    const precision = S.total ? S.aciertos / (S.aciertos + S.fallos || 1) : 0;
    const segundos = Math.round((Date.now() - S.inicio) / 1000);

    // Lo que se anota es el tiempo, no los puntos. Se puede juntar mucho XP
    // contestando rápido cosas que ya sabías; el tiempo no se puede inflar.
    APP.almacen.sumarMinutos(Math.max(1, Math.round(segundos / 60)));
    if (S.modo === "repaso") APP.almacen.contar("repasos");

    let leccionInfo = null;
    if (S.leccionId) leccionInfo = APP.almacen.terminarLeccion(S.leccionId, precision);

    APP.audio.efectos.completo();
    // Se sube en cuanto termina, sin esperar respuesta: si falla, la próxima
    // sincronización lo arregla, y mientras tanto no se le hace esperar.
    APP.cuenta.sincronizarSiCorresponde(1);

    raiz.innerHTML =
      '<div class="leccion-caja"><div class="leccion-cuerpo" style="display:flex;flex-direction:column;justify-content:center">' +
      '<h1 class="centro">' + d.esc(S.titulo) + "</h1>" +
      '<p class="centro apagado">' +
      (S.fallos === 0
        ? "Sin un solo error."
        : precision >= 0.8
        ? "Lo que fallaste vuelve en el repaso."
        : "Repite esta lección otro día: lo que costó hoy es justo lo que hay que volver a ver.") +
      "</p>" +
      '<div class="premio">' +
      caja("Aciertos", S.aciertos + " de " + (S.aciertos + S.fallos)) +
      caja("Tiempo", d.minutos(segundos), true) +
      "</div>" +
      (leccionInfo && leccionInfo.veces > 1
        ? '<div class="chico apagado centro">Vez ' + leccionInfo.veces + " de esta lección.</div>"
        : "") +
      (S.falladosIds.length
        ? '<div class="chico apagado centro">Se anotaron ' + S.falladosIds.length +
          " en tu cuaderno de errores.</div>"
        : "") +
      "</div>" +
      '<div class="pie"><button class="btn" data-accion="cerrar">Seguir</button></div>' +
      "</div>";
  }

  function caja(titulo, valor, azul) {
    return (
      '<div class="caja' + (azul ? " azul" : "") + '"><div class="tit">' + d.esc(titulo) +
      '</div><div class="val">' + d.esc(valor) + "</div></div>"
    );
  }

  /* ---------------- Interacción ---------------- */

  function decir(texto, lento) {
    APP.audio.hablar(texto, { velocidad: lento ? 0.55 : undefined });
  }

  function engancharEventos() {
    raiz.addEventListener("input", function (ev) {
      if (ev.target.id === "campo") pintarPie();
    });

    d.alTocar(raiz, "[data-accion]", function (b) {
      const a = b.getAttribute("data-accion");
      const ej = actual();

      if (a === "salir") return confirmarSalida();
      if (a === "cerrar") {
        const fin = S.alTerminar;
        cerrar();
        fin();
        return;
      }
      if (a === "no-se") return noLaSe();
      if (a === "palabra") {
        APP.pantallas.palabra(b.getAttribute("data-palabra"));
        return;
      }
      if (a === "otra-vez") {
        const otra = S.alRepetir;
        cerrar();
        if (otra) otra();
        return;
      }
      if (a === "audio") return decir(b.getAttribute("data-texto"));
      if (a === "audio-lento") return decir(b.getAttribute("data-texto"), true);
      if (S.corregido && a !== "continuar") return;

      if (a === "opcion") {
        S.respuesta = parseInt(b.getAttribute("data-i"), 10);
        APP.audio.efectos.toque();
        d.$$(".opcion", raiz).forEach(function (o) { o.classList.remove("elegida"); });
        b.classList.add("elegida");
        pintarPie();
        return;
      }

      if (a === "poner") {
        const i = parseInt(b.getAttribute("data-i"), 10);
        S.respuesta = (S.respuesta || []).concat([{ origen: i, texto: ej.fichas[i] }]);
        APP.audio.efectos.toque();
        pintar();
        return;
      }

      if (a === "quitar") {
        const i = parseInt(b.getAttribute("data-i"), 10);
        S.respuesta = (S.respuesta || []).filter(function (_, k) { return k !== i; });
        pintar();
        return;
      }

      if (a === "par") return tocarPar(b, ej);

      if (a === "micro") return grabar(ej);

      if (a === "saltar-habla") {
        /* En un examen saltar cuenta como no contestada, y sobre todo NO se
         * enseña la frase: decirla sería regalar la respuesta a mitad de la
         * prueba. Quien sepa que hoy no puede hablar lo dice antes de empezar
         * y el examen se arma sin preguntas orales, repartiéndolas entre leer
         * y escribir. */
        if (S.examen) {
          S.aciertosExamen[S.i] = false;
          S.fallos += 1;
          S.respuesta = null;
          S.i += 1;
          if (S.i >= S.ejercicios.length) return terminar();
          pintar();
          return;
        }
        // Practicando, saltar no cuenta como error: no siempre se puede hablar
        // en voz alta, y castigarlo empujaría a apagar el micrófono para siempre.
        S.corregido = { correcto: true, detalle: "Sin problema. La frase era: <b>" + d.esc(ej.respuesta) + "</b>" };
        pintar();
        return;
      }

      if (a === "rendirse") {
        S.respuesta = (d.$("#campo", raiz) || {}).value || "";
        S.corregido = { correcto: false, detalle: "Se escribe: <b>" + d.esc(ej.respuesta) + "</b>" };
        registrar(ej, false, 0);
        pintar();
        return;
      }

      if (a === "comprobar") return comprobar();
      if (a === "continuar") return continuar();
    });
  }

  function confirmarSalida() {
    // Recién empezada no se pregunta nada: interrumpir a alguien que apenas
    // tocó el primer ejercicio para confirmar que quiere salir es de más.
    if (S.i === 0 && !S.corregido) return salir();
    d.confirmar({
      titulo: "¿Salir de la lección?",
      texto: "Se pierde el avance de esta sesión. Lo que ya practicaste sí queda guardado.",
      si: "Salir",
      no: "Seguir practicando",
      peligroso: true,
      alConfirmar: salir,
    });
  }

  function salir() {
    cerrar();
    APP.pantallas.pintar();
  }

  function tocarPar(b, ej) {
    const est = S.respuesta || (S.respuesta = { unidas: {}, sel: null, error: null });
    const lado = b.getAttribute("data-lado");
    const i = parseInt(b.getAttribute("data-i"), 10);
    const item = (lado === "en" ? ej.izquierda : ej.derecha)[i];
    if (est.unidas[item.id]) return;

    if (!est.sel) {
      est.sel = { lado: lado, i: i, id: item.id };
      APP.audio.efectos.toque();
      pintar();
      return;
    }
    if (est.sel.lado === lado) {
      est.sel = { lado: lado, i: i, id: item.id };
      pintar();
      return;
    }
    if (est.sel.id === item.id) {
      est.unidas[item.id] = true;
      est.sel = null;
      est.error = null;
      APP.audio.efectos.bien(Object.keys(est.unidas).length);
      APP.srs.registrar(item.id, 2);
      pintar();
      if (Object.keys(est.unidas).length >= ej.izquierda.length) {
        S.aciertos += 1;
        setTimeout(function () {
          S.respuesta = null;
          S.i += 1;
          if (S.i >= S.ejercicios.length) terminar();
          else pintar();
        }, 450);
      }
      return;
    }
    est.error = { lado: lado, i: i };
    APP.audio.efectos.mal();
    APP.srs.registrar(item.id, 0);
    pintar();
    setTimeout(function () {
      if (S && S.respuesta) {
        S.respuesta.error = null;
        S.respuesta.sel = null;
        pintar();
      }
    }, 500);
  }

  function grabar(ej) {
    if (S.respuesta && S.respuesta.grabando) {
      APP.audio.detenerEscucha();
      return;
    }
    S.respuesta = { grabando: true, texto: "" };
    pintar();
    APP.audio.escuchar({
      parcial: function (texto) {
        if (S && S.respuesta) {
          S.respuesta.texto = texto;
          const caja = d.$(".tarjeta.plana", raiz);
          if (caja) caja.innerHTML = "Escuché: <span class='fuerte'>" + d.esc(texto) + "</span>";
        }
      },
      fin: function (texto) {
        if (!S) return;
        if (texto) {
          APP.almacen.contar("habladas");
        }
        S.respuesta = { grabando: false, texto: texto || (S.respuesta && S.respuesta.texto) || "" };
        pintar();
        if (S.respuesta.texto) setTimeout(comprobar, 250);
      },
      error: function (e) {
        if (!S) return;
        S.respuesta = { grabando: false, texto: "" };
        pintar();
        if (e === "not-allowed" || e === "service-not-allowed") {
          d.avisar(
            "Falta el permiso del micrófono",
            "El navegador no lo dio. Puedes saltarte estos ejercicios con “Ahora no puedo hablar”, " +
              "o apagarlos del todo en Ajustes."
          );
        }
      },
    });
  }

  window.APP = window.APP || {};
  APP.leccion = {
    iniciar: iniciar,
    cerrar: cerrar,
    // Estado de la sesión en curso: lo usan las pruebas automatizadas para
    // responder bien y comprobar que las lecciones se pueden terminar.
    sesion: function () { return S; },
  };
})();
