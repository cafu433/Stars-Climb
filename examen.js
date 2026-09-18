/* Los exámenes de nivel y la prueba de nivelación.
 *
 * Un examen no es una lección larga. Se diferencia en cuatro cosas, y las
 * cuatro son a propósito:
 *
 *   sin vidas          equivocarse no te echa; acá se mide, no se enseña
 *   sin corregir sobre la marcha   saber al instante si acertaste cambia cómo
 *                      contestas las siguientes, y entonces ya no se está
 *                      midiendo lo que sabes sino cómo te vas adaptando
 *   las cuatro destrezas  si fueran sólo alternativas se podría aprobar
 *                      adivinando, y reconocer una respuesta entre tres es
 *                      mucho más fácil que producirla
 *   se puede repetir   suspender no cierra nada, sólo dice qué falta
 *
 * Las preguntas salen del contenido del propio nivel, generadas de sus mismas
 * lecciones. Así el examen no puede preguntar algo que el nivel no enseñó, que
 * es la queja justa de cualquiera que reprueba un examen mal hecho.
 */
(function () {
  "use strict";

  const APP = window.APP;

  // Cuántas de cada destreza. Leer y escribir pesan más porque son la mitad
  // del idioma y porque son las que se pueden medir sin depender de que el
  // teléfono tenga micrófono.
  const RECETA = { leer: 8, escribir: 8, escuchar: 4, hablar: 4 };
  const PARA_APROBAR = 70;

  /* Ojo: acá van los tipos que produce el motor, que NO son los que declara
   * una lección. La lección pide "escribe-en" o "dictado"; el ejercicio que
   * sale de los dos lleva tipo "escribe". Mapear por el nombre declarado
   * dejaba fuera del examen todos los ejercicios de escribir sin dar ningún
   * error: el examen salía con cero preguntas escritas y nadie se enteraba.
   *
   * Y "escribe" es de dos destrezas según de dónde venga: escribir una
   * traducción entrena escribir; escribir lo que se oye entrena escuchar. Los
   * distingue 'autoAudio', que sólo lleva el dictado. */
  const DE_DESTREZA = {
    leer: ["elige-en", "elige-es", "pares", "hueco", "regla-elige", "lectura-pregunta"],
    escribir: ["arma", "escribe", "regla-escribe"],
    escuchar: ["escucha-elige"],
    hablar: ["habla"],
  };

  function destrezaDe(ej) {
    if (ej.tipo === "escribe") return ej.autoAudio ? "escuchar" : "escribir";
    for (const d in DE_DESTREZA) {
      if (DE_DESTREZA[d].indexOf(ej.tipo) >= 0) return d;
    }
    return null;
  }

  function revolver(lista) {
    const c = lista.slice();
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = c[i]; c[i] = c[j]; c[j] = t;
    }
    return c;
  }

  /* Se genera de golpe un montón de ejercicios de las lecciones del nivel y
   * después se reparten por destreza. Sale más barato y más variado que pedir
   * uno a uno de un tipo concreto, que obliga a reintentar cuando el tema que
   * tocó no admite ese tipo. */
  function cantera(nivelId) {
    const lecciones = revolver(APP.curriculo.leccionesDelNivel(nivelId));
    const pozo = { leer: [], escribir: [], escuchar: [], hablar: [] };
    const vistos = {};

    lecciones.forEach(function (l) {
      if (l.texto) return; // los textos se tratan aparte, enteros

      /* Se piden dos tandas: la lección tal cual, y otra forzando los tipos
       * que producen escribir y hablar. Sin la segunda, un nivel cuyas
       * lecciones son casi todas de reconocer no daría de dónde sacar
       * preguntas de producción, y el examen mediría medio idioma. */
      let pozoLocal = APP.motor.sesionLeccion(l);
      if (l.skills && l.skills.length) {
        pozoLocal = pozoLocal.concat(
          APP.motor.sesionLeccion({
            skills: l.skills,
            tipos: ["escribe-en", "arma-en", "arma-es", "habla", "dictado"],
            n: 6,
          })
        );
      }
      pozoLocal.forEach(function (e) {
        const d = destrezaDe(e);
        if (!d) return;
        const huella = e.tipo + "|" + (e.frase || e.respuesta || e.pregunta || JSON.stringify(e.opciones || ""));
        if (vistos[huella]) return;
        vistos[huella] = true;
        pozo[d].push(e);
      });
    });
    return pozo;
  }

  /* Un texto del nivel con sus preguntas: es la única forma honesta de medir
   * si se lee de corrido, que no es lo mismo que entender frases sueltas. */
  function trozoDeLectura(nivelId) {
    const conTexto = APP.curriculo.leccionesDelNivel(nivelId).filter(function (l) { return l.texto; });
    if (!conTexto.length) return [];
    const l = revolver(conTexto)[0];
    const s = APP.motor.sesionLeccion(l);
    // El texto y hasta tres preguntas suyas; más alargaría demasiado el examen.
    return s.slice(0, 4);
  }

  function armar(nivelId, opciones) {
    const op = opciones || {};
    const pozo = cantera(nivelId);
    const puede = {
      escuchar: op.sinVoz ? false : true,
      hablar: op.sinMicro ? false : true,
    };

    const receta = Object.assign({}, RECETA);
    /* Si el teléfono no tiene voz o micrófono, esas preguntas no se pueden
     * hacer. En vez de dejar el examen corto —lo que bajaría la nota de
     * cualquiera por un problema del aparato— se reparten entre leer y
     * escribir. */
    APP.curriculo.DESTREZAS.forEach(function (d) {
      if (puede[d] === false || !pozo[d].length) {
        const sobran = receta[d] || 0;
        receta[d] = 0;
        receta.leer += Math.ceil(sobran / 2);
        receta.escribir += Math.floor(sobran / 2);
      }
    });

    const preguntas = [];
    APP.curriculo.DESTREZAS.forEach(function (d) {
      revolver(pozo[d]).slice(0, receta[d]).forEach(function (e) {
        preguntas.push(Object.assign({}, e, { destreza: d }));
      });
    });

    const mezcladas = revolver(preguntas);
    // La lectura va al final y en bloque: el texto tiene que quedar pegado a
    // sus preguntas, y separarlos con otras cosas en medio sería absurdo.
    const lectura = trozoDeLectura(nivelId).map(function (e) {
      return Object.assign({}, e, { destreza: "leer" });
    });

    const todas = mezcladas.concat(lectura);
    return {
      nivel: nivelId,
      preguntas: todas,
      // El texto no se cuenta como pregunta: no se responde.
      total: todas.filter(function (p) { return p.tipo !== "lectura-texto"; }).length,
      paraAprobar: PARA_APROBAR,
    };
  }

  /* Corregir. Las respuestas llegan como un objeto {indice: acierto}, que es
   * lo que la pantalla ya sabe calcular con las mismas reglas de comparación
   * que usa una lección normal: así el examen no puede ser más estricto ni más
   * blando que la práctica. */
  function corregir(examen, aciertos) {
    const porDestreza = {};
    APP.curriculo.DESTREZAS.forEach(function (d) {
      porDestreza[d] = { bien: 0, de: 0 };
    });

    let bien = 0;
    let de = 0;
    examen.preguntas.forEach(function (p, i) {
      if (p.tipo === "lectura-texto") return;
      de++;
      const ok = !!aciertos[i];
      if (ok) bien++;
      const d = porDestreza[p.destreza];
      if (d) { d.de++; if (ok) d.bien++; }
    });

    const porcentaje = de ? Math.round((bien / de) * 100) : 0;
    const aprueba = porcentaje >= PARA_APROBAR;

    // La destreza más floja, para poder decir qué practicar. Sólo se miran las
    // que de verdad se preguntaron.
    let floja = null;
    APP.curriculo.DESTREZAS.forEach(function (d) {
      const x = porDestreza[d];
      if (!x.de) return;
      const tasa = x.bien / x.de;
      if (!floja || tasa < floja.tasa) floja = { destreza: d, tasa: tasa, bien: x.bien, de: x.de };
    });

    return {
      bien: bien,
      de: de,
      porcentaje: porcentaje,
      aprueba: aprueba,
      paraAprobar: PARA_APROBAR,
      porDestreza: porDestreza,
      floja: floja,
    };
  }

  function guardar(examen, resultado) {
    const n = APP.almacen.anotarExamen(examen.nivel, resultado.porcentaje, resultado.aprueba);
    if (resultado.aprueba) {
      const siguiente = nivelDespuesDe(examen.nivel);
      if (siguiente) APP.almacen.abrirNivel(siguiente);
    }
    return n;
  }

  function nivelDespuesDe(id) {
    const ns = APP.curriculo.NIVELES;
    for (let i = 0; i < ns.length - 1; i++) {
      if (ns[i].id === id) return ns[i + 1].id;
    }
    return null;
  }

  /* Un nivel está abierto si es el primero, si se aprobó el anterior, o si la
   * prueba de nivelación lo abrió. Nunca se cierra de vuelta. */
  function abierto(id) {
    const ns = APP.curriculo.NIVELES;
    if (ns.length && ns[0].id === id) return true;
    if (APP.almacen.nivelCurso(id).abierto) return true;
    for (let i = 1; i < ns.length; i++) {
      if (ns[i].id === id) return APP.almacen.nivelCurso(ns[i - 1].id).aprobado;
    }
    return false;
  }

  /* ---------------- La prueba de nivelación ----------------
   *
   * Quince preguntas que van de lo más fácil a lo más difícil. No es un examen:
   * no se aprueba ni se reprueba, sólo sirve para no hacerle empezar en "Hola"
   * a alguien que ya sabe presentarse. Aburrirse las tres primeras semanas es
   * la forma más común de abandonar un curso de idiomas.
   */
  function nivelacion() {
    const preguntas = [];
    APP.curriculo.NIVELES.forEach(function (n) {
      const pozo = cantera(n.id);
      // Cinco de cada nivel, de leer y escribir: se puede hacer en cualquier
      // teléfono y en cualquier sitio, sin depender del micrófono ni de estar
      // en un lugar donde se pueda hablar en voz alta.
      const mezcla = revolver(pozo.leer).slice(0, 3).concat(revolver(pozo.escribir).slice(0, 2));
      mezcla.forEach(function (e) {
        preguntas.push(Object.assign({}, e, { deNivel: n.id }));
      });
    });
    return { preguntas: preguntas, total: preguntas.length };
  }

  /* Dónde empezar. La regla es deliberadamente generosa por abajo: mandar a
   * alguien a un nivel que le queda grande lo deja perdido y sin saber por
   * qué, mientras que empezar un poco por debajo se arregla solo en dos días
   * saltando lecciones. */
  function recomendar(prueba, aciertos) {
    const porNivel = {};
    APP.curriculo.NIVELES.forEach(function (n) { porNivel[n.id] = { bien: 0, de: 0 }; });
    prueba.preguntas.forEach(function (p, i) {
      const x = porNivel[p.deNivel];
      if (!x) return;
      x.de++;
      if (aciertos[i]) x.bien++;
    });

    // Se sube de nivel sólo si el anterior sale claramente bien: 80%.
    let recomendado = APP.curriculo.NIVELES[0].id;
    for (let i = 0; i < APP.curriculo.NIVELES.length - 1; i++) {
      const id = APP.curriculo.NIVELES[i].id;
      const x = porNivel[id];
      if (x.de && x.bien / x.de >= 0.8) recomendado = APP.curriculo.NIVELES[i + 1].id;
      else break;
    }
    return { nivel: recomendado, porNivel: porNivel };
  }

  function aplicarNivelacion(rec) {
    // Se abren todos los niveles hasta el recomendado, sin darlos por
    // aprobados: el examen final sigue estando ahí para quien lo quiera.
    const ns = APP.curriculo.NIVELES;
    for (let i = 0; i < ns.length; i++) {
      APP.almacen.abrirNivel(ns[i].id);
      if (ns[i].id === rec.nivel) break;
    }
  }

  APP.examen = {
    PARA_APROBAR: PARA_APROBAR,
    armar: armar,
    corregir: corregir,
    guardar: guardar,
    abierto: abierto,
    nivelDespuesDe: nivelDespuesDe,
    nivelacion: nivelacion,
    recomendar: recomendar,
    aplicarNivelacion: aplicarNivelacion,
    destrezaDe: destrezaDe,
  };
})();
