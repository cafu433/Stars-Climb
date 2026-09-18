/* Practicar una regla de gramática justo después de leerla.
 *
 * Una explicación que se lee y no se usa se olvida esa misma tarde. Por eso
 * cada tema tiene su botón de practicar, y los ejercicios salen de los propios
 * ejemplos del tema: lo que acaba de leer es lo que le va a tocar armar.
 *
 * El ejercicio propio de este módulo es "la trampa": se muestran la frase mal y
 * la frase bien, y hay que elegir. Es incómodo a propósito —la incorrecta suele
 * ser la que uno diría— y por eso se pega.
 */
(function () {
  "use strict";

  function revolver(a) {
    const x = a.slice();
    for (let i = x.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = x[i]; x[i] = x[j]; x[j] = t;
    }
    return x;
  }

  function idTarjeta(tema, que) {
    return "gramatica:" + tema.id + ":" + que;
  }

  function ejercicioTrampa(tema) {
    /* Elegir entre la frase mal y la bien. Se marca cuál es cuál sólo después
     * de responder: verlas juntas antes de decidir haría el ejercicio trivial. */
    return {
      tipo: "elige-en",
      tarjetaId: idTarjeta(tema, "trampa"),
      enunciado: "¿Cuál está bien dicha?",
      prompt: tema.titulo,
      opciones: revolver([
        { texto: tema.trampa.bien, correcta: true },
        { texto: tema.trampa.mal, correcta: false },
      ]),
      respuesta: tema.trampa.bien,
      explicacion: tema.trampa.porque,
      audioAlAcertar: tema.trampa.bien,
    };
  }

  function fichas(frase) {
    return (frase || "").trim().split(/\s+/);
  }

  function ejercicioArmar(tema, ejemplo, banco) {
    const piezas = fichas(ejemplo.en);
    if (piezas.length < 3) return null;
    // Un par de fichas de más, sacadas de otros ejemplos del mismo tema: si
    // sobran justo las palabras que no van, el ejercicio enseña algo.
    const usadas = {};
    piezas.forEach(function (p) { usadas[p.toLowerCase()] = true; });
    const senuelo = [];
    banco.forEach(function (o) {
      if (o.en === ejemplo.en) return;
      fichas(o.en).forEach(function (p) {
        if (!usadas[p.toLowerCase()] && !/^[A-Z]/.test(p) && senuelo.indexOf(p) < 0) senuelo.push(p);
      });
    });
    return {
      tipo: "arma",
      tarjetaId: idTarjeta(tema, "arma:" + ejemplo.en.slice(0, 20)),
      enunciado: "Arma la frase en inglés",
      prompt: ejemplo.es,
      respuesta: ejemplo.en,
      fichas: revolver(piezas.concat(revolver(senuelo).slice(0, 2))),
      audioAlAcertar: ejemplo.en,
      idioma: "en",
    };
  }

  function ejercicioEscribir(tema, ejemplo) {
    if (ejemplo.en.split(/\s+/).length > 9) return null;
    return {
      tipo: "escribe",
      tarjetaId: idTarjeta(tema, "escribe:" + ejemplo.en.slice(0, 20)),
      enunciado: "Escríbelo en inglés",
      prompt: ejemplo.es,
      respuesta: ejemplo.en,
      audioAlAcertar: ejemplo.en,
    };
  }

  function ejercicioTraducir(tema, ejemplo, banco) {
    const otros = revolver(banco.filter(function (o) { return o.en !== ejemplo.en; })).slice(0, 3);
    if (otros.length < 3) return null;
    return {
      tipo: "elige-es",
      tarjetaId: idTarjeta(tema, "traduce:" + ejemplo.en.slice(0, 20)),
      enunciado: "¿Qué significa?",
      prompt: ejemplo.en,
      audio: ejemplo.en,
      opciones: revolver(
        [{ texto: ejemplo.es, correcta: true }].concat(
          otros.map(function (o) { return { texto: o.es, correcta: false }; })
        )
      ),
      respuesta: ejemplo.es,
    };
  }

  function ejercicioDictado(tema, ejemplo) {
    if (!APP.audio.hayVoz()) return null;
    if (ejemplo.en.split(/\s+/).length > 9) return null;
    return {
      tipo: "escribe",
      tarjetaId: idTarjeta(tema, "dictado:" + ejemplo.en.slice(0, 20)),
      enunciado: "Escucha y escribe lo que oyes",
      audio: ejemplo.en,
      autoAudio: true,
      respuesta: ejemplo.en,
      traduccion: ejemplo.es,
    };
  }

  function sesionDeUnTema(tema, n) {
    if (!tema) return [];
    const out = [ejercicioTrampa(tema)];
    const banco = tema.ejemplos;
    const teclado = APP.almacen.estado().ajustes.teclado !== false;

    revolver(banco).forEach(function (ej, i) {
      let e = null;
      if (i % 3 === 0) e = ejercicioArmar(tema, ej, banco);
      else if (i % 3 === 1) e = ejercicioTraducir(tema, ej, banco);
      else e = teclado ? ejercicioEscribir(tema, ej) : ejercicioArmar(tema, ej, banco);
      if (e) out.push(e);
    });

    // Uno de dictado al final, si hay voz: obliga a oír la estructura, no sólo
    // a reconocerla escrita.
    const dictado = ejercicioDictado(tema, banco[0]);
    if (dictado) out.push(dictado);

    return out.slice(0, n || 10);
  }

  function sesionMezcla(n) {
    /* Un repaso de todas las trampas juntas. Es el ejercicio más útil del
     * módulo: son exactamente los errores que hay que dejar de cometer. */
    const temas = APP.datosGramatica.TEMAS;
    const pesados = temas.slice().sort(function (a, b) {
      return APP.srs.fuerza(idTarjeta(a, "trampa")) - APP.srs.fuerza(idTarjeta(b, "trampa"));
    });
    return revolver(pesados.slice(0, n || 12)).map(ejercicioTrampa);
  }

  function progresoDeTema(tema) {
    return APP.srs.fuerza(idTarjeta(tema, "trampa"));
  }

  window.APP = window.APP || {};
  APP.gramatica = {
    sesionDeUnTema: sesionDeUnTema,
    sesionMezcla: sesionMezcla,
    progresoDeTema: progresoDeTema,
    idTarjeta: idTarjeta,
  };
})();
