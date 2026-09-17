/* Pronunciación: entrenar el oído antes que la boca.
 *
 * El orden importa y es al revés de lo que parece. No se puede pronunciar una
 * diferencia que no se oye: si "ship" y "sheep" suenan igual, decirlas distinto
 * es imposible. Por eso el módulo empieza siempre escuchando —pares mínimos,
 * dos palabras que sólo cambian en la vocal— y sólo después pide repetir.
 *
 * Los ejercicios salen con la misma forma que los del resto de la aplicación,
 * así que la pantalla de lección los dibuja sin saber de dónde vienen.
 */
(function () {
  "use strict";

  const D = function () { return APP.datosSonidos; };

  function revolver(a) {
    const x = a.slice();
    for (let i = x.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = x[i]; x[i] = x[j]; x[j] = t;
    }
    return x;
  }

  function alAzar(a) {
    return a[Math.floor(Math.random() * a.length)];
  }

  function idTarjeta(sonidoId, que) {
    return "sonido:" + sonidoId + ":" + (que || "oido");
  }

  /* ---------------- Escuchar y distinguir ---------------- */

  function ejercicioPar(par) {
    if (!APP.audio.hayVoz()) return null;
    const objetivo = Math.random() < 0.5 ? par.a : par.b;
    const sonidoA = D().sonido(par.sonidoA);
    const sonidoB = D().sonido(par.sonidoB);
    const elObjetivo = objetivo === par.a ? sonidoA : sonidoB;

    return {
      tipo: "escucha-elige",
      tarjetaId: idTarjeta(elObjetivo.id, "oido"),
      enunciado: "¿Qué palabra escuchaste?",
      audio: objetivo,
      autoAudio: true,
      opciones: revolver([
        { texto: par.a, simbolo: sonidoA.simbolo, correcta: objetivo === par.a },
        { texto: par.b, simbolo: sonidoB.simbolo, correcta: objetivo === par.b },
      ]),
      respuesta: objetivo,
      explicacion:
        "“" + par.a + "” lleva /" + sonidoA.simbolo + "/ y “" + par.b + "” lleva /" +
        sonidoB.simbolo + "/. " + elObjetivo.comoSuena,
      traduccion: par.es,
    };
  }

  function ejercicioIdentificar(sonido) {
    /* Al revés que el anterior: se oye una palabra y hay que decir qué sonido
     * tiene. Obliga a poner nombre a lo que se oye, que es lo que permite
     * después corregirse solo. */
    if (!APP.audio.hayVoz()) return null;
    const palabra = alAzar(sonido.ejemplos);
    const otros = revolver(
      D().SONIDOS.filter(function (s) { return s.id !== sonido.id && s.tipo === sonido.tipo; })
    ).slice(0, 3);
    if (otros.length < 2) return null;

    return {
      tipo: "escucha-elige",
      tarjetaId: idTarjeta(sonido.id, "identificar"),
      enunciado: "¿Qué vocal tiene esta palabra?",
      audio: palabra,
      autoAudio: true,
      opciones: revolver(
        [{ texto: "/" + sonido.simbolo + "/", correcta: true }].concat(
          otros.map(function (s) { return { texto: "/" + s.simbolo + "/", correcta: false }; })
        )
      ),
      respuesta: "/" + sonido.simbolo + "/",
      explicacion: "“" + palabra + "” lleva /" + sonido.simbolo + "/. " + sonido.comoSuena,
    };
  }

  function ejercicioHablar(sonido) {
    if (!APP.audio.hayMicrofono()) return null;
    const palabra = alAzar(sonido.ejemplos);
    return {
      tipo: "habla",
      tarjetaId: idTarjeta(sonido.id, "voz"),
      enunciado: "Dilo en voz alta",
      prompt: palabra,
      traduccion: "/" + sonido.simbolo + "/ — " + sonido.comoSuena,
      audio: palabra,
      respuesta: palabra,
    };
  }

  function ejercicioParHablado(par) {
    /* Decir las dos palabras seguidas es más difícil y más útil que decir una:
     * obliga a producir la diferencia, no sólo el sonido. */
    if (!APP.audio.hayMicrofono()) return null;
    const frase = par.a + " " + par.b;
    return {
      tipo: "habla",
      tarjetaId: idTarjeta(par.sonidoA, "par-voz"),
      enunciado: "Di las dos, marcando la diferencia",
      prompt: frase,
      traduccion: par.es,
      audio: frase,
      respuesta: frase,
    };
  }

  /* ---------------- Sesiones ---------------- */

  function peso(id) {
    const t = APP.srs.tarjeta(id);
    if (!t.rep && !t.fallos) return 3;
    if (APP.srs.vencida(id)) return 5;
    return Math.max(0.4, 3 * (1 - APP.srs.fuerza(id)));
  }

  function sortear(lista, n, aId) {
    const pool = lista.slice();
    const out = [];
    while (out.length < n && pool.length) {
      const pesos = pool.map(function (x) { return peso(aId(x)); });
      const total = pesos.reduce(function (a, b) { return a + b; }, 0);
      let r = Math.random() * total;
      let i = 0;
      while (i < pool.length - 1 && r > pesos[i]) { r -= pesos[i]; i++; }
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }

  function sesionDeUnSonido(sonidoId, n) {
    // Todo lo que se puede practicar de un sonido concreto, de oír a decir.
    const s = D().sonido(sonidoId);
    if (!s) return [];
    const out = [];
    const pares = D().paresDe(sonidoId);

    pares.slice(0, 4).forEach(function (p) {
      const e = ejercicioPar(p);
      if (e) out.push(e);
    });

    const id = ejercicioIdentificar(s);
    if (id) out.push(id);

    // El schwa no tiene pares mínimos —sólo aparece en sílabas sin acento— así
    // que su práctica es identificarlo y repetirlo, no distinguirlo.
    if (!pares.length) {
      const otro = ejercicioIdentificar(s);
      if (otro) out.push(otro);
    }

    const hablar = ejercicioHablar(s);
    if (hablar) out.push(hablar);
    if (pares.length) {
      const parHablado = ejercicioParHablado(pares[0]);
      if (parHablado) out.push(parHablado);
    }

    return out.slice(0, n || 10);
  }

  function sesionMezcla(filtro, n) {
    /* filtro: "simple" | "diptongo" | null (todos)
     * Mezcla pares mínimos de todos los sonidos, priorizando los que cuestan. */
    const cuantos = n || 12;
    let pares = D().PARES;
    if (filtro) {
      pares = pares.filter(function (p) {
        const a = D().sonido(p.sonidoA);
        const b = D().sonido(p.sonidoB);
        return (a && a.tipo === filtro) || (b && b.tipo === filtro);
      });
    }
    const elegidos = sortear(pares, cuantos, function (p) { return idTarjeta(p.sonidoA, "oido"); });
    const out = [];
    elegidos.forEach(function (p, i) {
      // Uno de cada cuatro se practica hablando, para que no sea sólo oído.
      const e = i > 0 && i % 4 === 3 ? ejercicioParHablado(p) || ejercicioPar(p) : ejercicioPar(p);
      if (e) out.push(e);
    });
    return out;
  }

  function progresoDeSonido(sonidoId) {
    // Cuánto se lleva de un sonido: promedio de sus tarjetas de oído y de voz.
    const ids = [idTarjeta(sonidoId, "oido"), idTarjeta(sonidoId, "identificar"), idTarjeta(sonidoId, "voz")];
    let suma = 0;
    ids.forEach(function (id) { suma += APP.srs.fuerza(id); });
    return suma / ids.length;
  }

  window.APP = window.APP || {};
  APP.pronunciacion = {
    sesionDeUnSonido: sesionDeUnSonido,
    sesionMezcla: sesionMezcla,
    progresoDeSonido: progresoDeSonido,
    idTarjeta: idTarjeta,
  };
})();
