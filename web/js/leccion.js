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

  const XP_BASE = 10;
  const XP_COMBO = 5;

  /* Contrarreloj: un minuto, y cada acierto compra dos segundos más.
   *
   * Los números están puestos para que una buena racha se sienta imparable
   * —acertando rápido el reloj sube en vez de bajar— y un par de errores
   * duelan sin cortar la partida de golpe. */
  const SEGUNDOS_CONTRARRELOJ = 60;
  const SEGUNDOS_POR_ACIERTO = 2;
  const SEGUNDOS_POR_ERROR = 3;

  let tictac = null;

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
      combo: 0,
      mejorCombo: 0,
      xp: 0,
      inicio: Date.now(),
      reintentos: [],
      respuesta: null,
      corregido: null,
      falladosIds: [],
      reloj: null,
      /* En modo examen se guarda qué se acertó y qué no, pero no se enseña
       * hasta el final. Saber al instante si acertaste cambia cómo contestas
       * las siguientes —te confías o te bloqueas— y entonces ya no se está
       * midiendo lo que sabes. */
      examen: op.examen || null,
      aciertosExamen: {},
    };

    if (S.modo === "contrarreloj") {
      S.reloj = { fin: Date.now() + SEGUNDOS_CONTRARRELOJ * 1000, ultimoTic: 0 };
    }

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
    if (S.reloj) arrancarReloj();
  }

  function arrancarReloj() {
    detenerReloj();
    tictac = setInterval(function () {
      if (!S || !S.reloj) return detenerReloj();
      const quedan = segundosQuedan();
      // Sólo se redibuja la barra, no la pantalla entera: repintar el ejercicio
      // cada segundo perdería lo que la persona lleva tocado.
      const barra = d.$("#reloj-barra", raiz);
      const numero = d.$("#reloj-numero", raiz);
      if (barra) barra.style.width = Math.min(100, (quedan / SEGUNDOS_CONTRARRELOJ) * 100) + "%";
      if (numero) numero.textContent = quedan;
      if (quedan <= 5 && quedan > 0 && S.reloj.ultimoTic !== quedan) {
        S.reloj.ultimoTic = quedan;
        APP.audio.efectos.tic();
      }
      if (quedan <= 0) {
        detenerReloj();
        terminar();
      }
    }, 250);
  }

  function detenerReloj() {
    if (tictac) {
      clearInterval(tictac);
      tictac = null;
    }
  }

  function segundosQuedan() {
    if (!S || !S.reloj) return 0;
    return Math.max(0, Math.ceil((S.reloj.fin - Date.now()) / 1000));
  }

  function ajuste(k) {
    return APP.almacen.estado().ajustes[k];
  }

  function cerrar() {
    detenerReloj();
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
    if (S.reloj) return cabeceraReloj();
    const vidas = APP.almacen.vidas();
    return (
      '<div class="barra">' +
      '<button class="icono-btn" data-accion="salir" aria-label="Salir">✕</button>' +
      '<div class="barra-prog"><i style="width:' + avance + '%"></i></div>' +
      (S.corazones
        ? '<span class="contador vidas">❤️ <span class="n">' + vidas + "</span></span>"
        : '<span class="contador gemas">⚡ <span class="n">' + S.xp + "</span></span>") +
      "</div>" +
      (S.combo >= 3
        ? '<div class="centro mini fuerte" style="color:#ff9600;margin:-4px 0 6px">🔥 ' +
          S.combo + " seguidas · x" + multiplicador().toFixed(1) + " XP</div>"
        : "")
    );
  }

  function cabeceraReloj() {
    const quedan = segundosQuedan();
    return (
      '<div class="barra">' +
      '<button class="icono-btn" data-accion="salir" aria-label="Salir">✕</button>' +
      '<div class="reloj"><i id="reloj-barra" style="width:' +
      Math.min(100, (quedan / SEGUNDOS_CONTRARRELOJ) * 100) + '%"></i></div>' +
      '<span class="contador"><span id="reloj-numero" class="n">' + quedan + "</span>s</span>" +
      '<span class="contador gemas">✓ <span class="n">' + S.aciertos + "</span></span>" +
      "</div>" +
      (S.combo >= 3
        ? '<div class="centro mini fuerte" style="color:#ff9600;margin:-4px 0 6px">🔥 ' +
          S.combo + " seguidas</div>"
        : "")
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
      out += '<div class="prompt-grande">' + d.esc(ej.prompt) + "</div>";
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
          "<span>" + d.esc(o.texto) + "</span></button>"
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
          "<span>" + d.esc(o.texto) + "</span>" +
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
      '<div class="tarjeta plana"><div class="fuerte">' + d.esc(ej.prompt) + "</div></div>" +
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
      '<div class="tarjeta"><div class="prompt-grande" style="font-size:22px">' + d.esc(ej.prompt) + "</div>" +
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
      d.esc(partes[0]) + '<span style="color:var(--azul)">_____</span>' + d.esc(partes[1] || "") +
      "</div></div>" +
      '<div class="opciones">' +
      ej.opciones.map(function (o, i) {
        return '<button class="opcion' + claseOpcion(ej, o, i) + '" data-accion="opcion" data-i="' + i + '"><span>' + d.esc(o.texto) + "</span></button>";
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

  function cabeceraRegla(ej) {
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

    if (S.reloj) {
      // En contrarreloj se responde tocando y se sigue solo: un botón de
      // "comprobar" en el medio son dos toques por pregunta y mata el ritmo.
      const c = S.corregido;
      pie.innerHTML = c
        ? '<div class="pie ' + (c.correcto ? "bien" : "mal") + '">' +
          '<div class="pie-titulo">' +
          (c.correcto ? "+" + SEGUNDOS_POR_ACIERTO + "s" : "−" + SEGUNDOS_POR_ERROR + "s · " + d.esc(actual().respuesta)) +
          "</div></div>"
        : '<div class="pie"><div class="apagado chico centro">Toca la respuesta. Cada acierto suma ' +
          SEGUNDOS_POR_ACIERTO + " segundos.</div></div>";
      return;
    }

    if (S.corregido) {
      const c = S.corregido;
      pie.className = "";
      pie.innerHTML =
        '<div class="pie ' + (c.correcto ? "bien" : "mal") + ' entrada-animada">' +
        '<div class="pie-titulo">' +
        APP.mascota.svg(c.correcto ? "feliz" : "triste", 44) +
        "<span>" + (c.correcto ? elogio() : "Casi") + "</span></div>" +
        (c.detalle ? '<div class="detalle">' + c.detalle + "</div>" : "") +
        '<button class="btn ' + (c.correcto ? "" : "rojo") + '" data-accion="continuar">Continuar</button>' +
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
    pie.innerHTML =
      '<div class="pie">' +
      '<button class="btn" data-accion="comprobar"' + (listo ? "" : " disabled") + ">" +
      etiqueta + "</button>" +
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
  function elogio() {
    return ELOGIOS[Math.floor(Math.random() * ELOGIOS.length)];
  }

  function multiplicador() {
    // El combo sube hasta 1.5x y ahí se queda: premia la concentración sin que
    // una racha de suerte valga más que terminar la lección.
    return Math.min(1.5, 1 + Math.floor(S.combo / 5) * 0.1);
  }

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
      if (!correcto && ej.frase) {
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
      APP.audio.efectos.bien(S.combo);
      if (S.botonTocado) APP.fiesta.chispas(S.botonTocado);
    } else {
      APP.audio.efectos.mal();
    }
    S.botonTocado = null;

    if (S.reloj) {
      S.reloj.fin += (correcto ? SEGUNDOS_POR_ACIERTO : -SEGUNDOS_POR_ERROR) * 1000;
      pintar();
      // Un respiro corto para ver la respuesta buena cuando se falló, y casi
      // nada cuando se acertó: el ritmo es la mitad de la gracia del modo.
      setTimeout(function () {
        if (S && S.reloj) continuar();
      }, correcto ? 380 : 950);
      return;
    }

    if (correcto && ej.audioAlAcertar) decir(ej.audioAlAcertar);
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
      S.combo += 1;
      S.mejorCombo = Math.max(S.mejorCombo, S.combo);
      S.xp += Math.round(XP_BASE * multiplicador()) + (S.combo % 5 === 0 ? XP_COMBO : 0);
    } else {
      S.fallos += 1;
      S.combo = 0;
      /* Vuelve a preguntarse antes de terminar: corregir en caliente es lo que
       * hace que el error no se repita mañana. En contrarreloj no, porque la
       * lista ya da vueltas sola; y en un examen tampoco, porque repreguntar
       * lo fallado convertiría la nota en "cuántas veces lo intentaste". */
      if (!S.reloj && !S.examen) S.reintentos.push(ej);
      if (ej.tarjetaId) S.falladosIds.push(ej.tarjetaId);
      if (S.corazones) {
        const quedan = APP.almacen.perderVida();
        if (quedan <= 0) {
          setTimeout(sinVidas, 900);
        }
      }
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

    if (S.reloj) {
      if (segundosQuedan() <= 0) return terminar();
      // La lista da vueltas: en contrarreloj se acaba el tiempo, no las
      // preguntas.
      if (S.i >= S.ejercicios.length) S.i = 0;
      return pintar();
    }

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
    APP.almacen.sumarXp(S.xp);

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

    APP.fiesta.confeti({ cantidad: 90 });
    raiz.innerHTML =
      '<div class="leccion-caja"><div class="leccion-cuerpo" style="display:flex;flex-direction:column;justify-content:center">' +
      '<div class="centro confeti"><div class="diploma-emo">' + n.emo + "</div></div>" +
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
    APP.almacen.sumarXp(S.xp);

    const nivel = APP.curriculo.nivel(S.examen.nivel);
    const siguiente = APP.examen.nivelDespuesDe(S.examen.nivel);
    const nombreSiguiente = siguiente ? APP.curriculo.nivel(siguiente).titulo : null;

    if (r.aprueba) {
      APP.audio.efectos.completo();
      APP.fiesta.confeti({ cantidad: 160 });
    }

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
      '<div class="centro confeti">' + (r.aprueba ? '<div class="diploma-emo">🎓</div>' : APP.mascota.svg("pensando", 120)) + "</div>" +
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
    detenerReloj();
    if (S.examen) return terminarExamen();
    if (S.reloj) return terminarContrarreloj();
    const precision = S.total ? S.aciertos / (S.aciertos + S.fallos || 1) : 0;
    const segundos = Math.round((Date.now() - S.inicio) / 1000);
    let extra = 0;
    if (S.fallos === 0) extra = 20;
    else if (precision >= 0.8) extra = 10;
    const xpTotal = S.xp + extra;

    APP.almacen.sumarXp(xpTotal);
    if (S.fallos === 0) APP.almacen.contar("perfectas");
    if (S.modo === "repaso") APP.almacen.contar("repasos");

    // Desafío del día: se le cuenta lo que corresponda a esta sesión.
    if (S.modo === "camino") APP.desafio.anotar("lecciones", 1);
    if (S.fallos === 0) APP.desafio.anotar("perfecta", 1);
    if (S.modo === "repaso") APP.desafio.anotar("repaso", S.aciertos);
    if (S.modo === "errores") APP.desafio.anotar("errores", S.aciertos);
    let leccionInfo = null;
    if (S.leccionId) leccionInfo = APP.almacen.terminarLeccion(S.leccionId, precision);
    if (S.modo === "repaso" && S.fallos === 0) APP.almacen.llenarVidas();

    const nuevos = APP.logros.revisar();
    APP.audio.efectos.completo();
    APP.fiesta.confeti({ cantidad: S.fallos === 0 ? 130 : 70 });
    // Se sube en cuanto termina, sin esperar respuesta: si falla, la próxima
    // sincronización lo arregla, y mientras tanto no se le hace esperar.
    APP.cuenta.sincronizarSiCorresponde(1);

    raiz.innerHTML =
      '<div class="leccion-caja"><div class="leccion-cuerpo" style="display:flex;flex-direction:column;justify-content:center">' +
      '<div class="centro confeti">' +
      APP.mascota.svg(precision >= 0.8 ? "fiesta" : "feliz", 130) + "</div>" +
      '<h1 class="centro">' + (S.fallos === 0 ? "¡Lección perfecta!" : precision >= 0.8 ? "¡Lección terminada!" : "¡Terminaste!") + "</h1>" +
      '<p class="centro apagado">' +
      (S.fallos === 0
        ? "Sin un solo error. Eso es dominio, no suerte."
        : precision >= 0.8
        ? "Muy bien. Lo que fallaste vuelve en el repaso de mañana."
        : "Lo importante es que llegaste al final. Repite esta lección mañana.") +
      "</p>" +
      '<div class="premio">' +
      caja("XP ganado", "+" + xpTotal) +
      caja("Precisión", Math.round(precision * 100) + "%", true) +
      caja("Tiempo", d.minutos(segundos), true) +
      caja("Mejor racha", S.mejorCombo + " 🔥") +
      "</div>" +
      (leccionInfo && leccionInfo.coronas
        ? '<div class="aviso centro">👑 Corona ' + leccionInfo.coronas + " de 5 en esta lección</div>"
        : "") +
      (nuevos.length
        ? '<div class="aviso ojo"><b>¡Logro nuevo!</b> ' +
          nuevos.map(function (l) { return l.emo + " " + d.esc(l.nombre); }).join(" · ") + "</div>"
        : "") +
      (S.falladosIds.length
        ? '<div class="chico apagado centro">Se anotaron ' + S.falladosIds.length +
          " en tu cuaderno de errores.</div>"
        : "") +
      "</div>" +
      '<div class="pie"><button class="btn" data-accion="cerrar">Seguir</button></div>' +
      "</div>";
  }

  function terminarContrarreloj() {
    const xp = S.xp;
    APP.almacen.sumarXp(xp);
    const marca = S.aciertos;
    APP.desafio.anotar("contrarreloj", marca);
    const anterior = APP.almacen.mejorMarca("contrarreloj");
    const esRecord = APP.almacen.record("contrarreloj", marca);
    const nuevos = APP.logros.revisar();

    if (esRecord) {
      APP.audio.efectos.record();
      APP.fiesta.confeti({ cantidad: 130 });
    } else {
      APP.audio.efectos.completo();
      if (marca >= 10) APP.fiesta.confeti({ cantidad: 60 });
    }

    raiz.innerHTML =
      '<div class="leccion-caja"><div class="leccion-cuerpo" style="display:flex;flex-direction:column;justify-content:center">' +
      '<div class="centro confeti">' + APP.mascota.svg(esRecord ? "fiesta" : "feliz", 120) + "</div>" +
      '<h1 class="centro">' + (esRecord ? "¡Récord nuevo!" : "Se acabó el tiempo") + "</h1>" +
      '<div class="centro" style="font-size:64px;font-weight:800;color:var(--verde);line-height:1">' +
      marca + "</div>" +
      '<p class="centro apagado">respuestas correctas en un minuto</p>' +
      '<div class="premio">' +
      caja("XP ganado", "+" + xp) +
      caja("Mejor racha", S.mejorCombo + " 🔥", true) +
      caja("Tu récord", esRecord ? marca + " 🥇" : anterior, true) +
      caja("Fallos", S.fallos) +
      "</div>" +
      (esRecord && anterior
        ? '<div class="aviso centro">Le ganaste a tu marca anterior de ' + anterior + ".</div>"
        : "") +
      (nuevos.length
        ? '<div class="aviso ojo"><b>¡Logro nuevo!</b> ' +
          nuevos.map(function (l) { return l.emo + " " + d.esc(l.nombre); }).join(" · ") + "</div>"
        : "") +
      "</div>" +
      '<div class="pie"><button class="btn" data-accion="otra-vez">Otra vez</button>' +
      '<div style="height:8px"></div>' +
      '<button class="btn hueco" data-accion="cerrar">Volver</button></div>' +
      "</div>";
  }

  function caja(titulo, valor, azul) {
    return (
      '<div class="caja' + (azul ? " azul" : "") + '"><div class="tit">' + d.esc(titulo) +
      '</div><div class="val">' + d.esc(valor) + "</div></div>"
    );
  }

  function sinVidas() {
    /* Quedarse sin vidas nunca deja a la persona afuera: puede recuperarlas
     * practicando (que es exactamente lo que le conviene hacer), esperar, o
     * apagar las vidas para siempre si el sistema no le acomoda. */
    const velo = document.createElement("div");
    velo.className = "velo";
    velo.innerHTML =
      '<div class="hoja">' +
      '<div class="centro">' + APP.mascota.svg("triste", 96) + "</div>" +
      '<h2 class="centro">Te quedaste sin vidas</h2>' +
      '<p class="centro apagado chico">Recuperas una cada 10 minutos. La siguiente llega en ' +
      d.minutos(APP.almacen.segundosParaVida()) + ".</p>" +
      '<button class="btn" data-accion="recuperar">Recuperar practicando</button>' +
      '<div style="height:8px"></div>' +
      '<button class="btn hueco" data-accion="sin-vidas-off">Prefiero practicar sin vidas</button>' +
      '<div style="height:8px"></div>' +
      '<button class="btn hueco" data-accion="salir-velo">Salir</button>' +
      "</div>";
    document.body.appendChild(velo);
    velo.addEventListener("click", function (ev) {
      const b = ev.target.closest("[data-accion]");
      if (!b) return;
      const a = b.getAttribute("data-accion");
      velo.remove();
      if (a === "recuperar") {
        cerrar();
        APP.pantallas.repasoDeRescate();
      } else if (a === "sin-vidas-off") {
        APP.almacen.estado().ajustes.corazones = false;
        APP.almacen.llenarVidas();
        S.corazones = false;
        pintar();
      } else {
        cerrar();
        APP.pantallas.pintar();
      }
    });
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
        if (S.reloj) {
          S.botonTocado = b;
          return comprobar();
        }
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
          S.combo = 0;
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
        S.xp += XP_BASE;
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
          APP.desafio.anotar("hablar", 1);
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
