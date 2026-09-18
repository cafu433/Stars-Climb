/* Conjugar: de las cinco formas de un verbo a los ocho tiempos que se usan.
 *
 * La idea es que el banco de datos guarde lo mínimo (base, pasado, participio)
 * y que todo lo demás salga de reglas. Así agregar un verbo son tres palabras,
 * y agregar un tiempo verbal se hace una sola vez acá en vez de cien veces en
 * los datos.
 *
 * Las excepciones existen y están nombradas: "be" es irregular en todo y tiene
 * su propia tabla; el resto se arma con auxiliares.
 */
(function () {
  "use strict";

  const PERSONAS = [
    { id: "i", en: "I", es: "yo", plural: false, tercera: false },
    { id: "you", en: "You", es: "tú", plural: true, tercera: false },
    { id: "he", en: "She", es: "ella", plural: false, tercera: true },
    { id: "we", en: "We", es: "nosotros", plural: true, tercera: false },
    { id: "they", en: "They", es: "ellos", plural: true, tercera: false },
  ];

  const TIEMPOS = [
    { id: "presente", nombre: "Presente simple", es: "Lo que haces siempre",
      ejemplo: "I work here", cuando: "Rutinas, hechos y lo que es verdad en general." },
    { id: "presente-cont", nombre: "Presente continuo", es: "Lo que estás haciendo ahora",
      ejemplo: "I am working", cuando: "Lo que pasa en este momento o en esta temporada." },
    { id: "pasado", nombre: "Pasado simple", es: "Lo que pasó y terminó",
      ejemplo: "I worked yesterday", cuando: "Algo terminado, casi siempre con un “cuándo”." },
    { id: "pasado-cont", nombre: "Pasado continuo", es: "Lo que estabas haciendo",
      ejemplo: "I was working", cuando: "Algo en curso en el pasado, normalmente interrumpido por otra cosa." },
    { id: "perfecto", nombre: "Presente perfecto", es: "Lo que has hecho",
      ejemplo: "I have worked here for years", cuando: "El pasado que todavía importa ahora. En español suele ser “he trabajado”." },
    { id: "futuro", nombre: "Futuro con will", es: "Lo que harás",
      ejemplo: "I will work tomorrow", cuando: "Decisiones del momento, promesas y predicciones." },
    { id: "futuro-going", nombre: "Futuro con going to", es: "Lo que vas a hacer",
      ejemplo: "I am going to work", cuando: "Planes ya decididos antes de hablar." },
    { id: "condicional", nombre: "Condicional", es: "Lo que harías",
      ejemplo: "I would work", cuando: "Situaciones hipotéticas y peticiones educadas." },
  ];

  /* Reglas de escritura. Se calculan en vez de guardarse porque fallan poco, y
   * cuando fallan el verbo trae el campo escrito a mano. */

  function tercera(v) {
    if (v.tercera) return v.tercera;
    const b = v.base;
    if (/[sxz]$|ch$|sh$|o$/.test(b)) return b + "es";
    if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + "ies";
    return b + "s";
  }

  function gerundio(v) {
    if (v.gerundio) return v.gerundio;
    const b = v.base;
    if (/ie$/.test(b)) return b.slice(0, -2) + "ying"; // die → dying
    /* La -e final muda se cae (make → making), pero sólo si lo que queda sigue
     * siendo una raíz. Sin ese "length > 2", "be" perdía su única vocal y salía
     * "bing" en vez de "being". */
    if (/[^aeiou]e$/.test(b) && b.length > 2) return b.slice(0, -1) + "ing";
    return b + "ing";
  }

  function pasadoDe(v, persona) {
    // "be" es el único que cambia de forma según la persona en pasado.
    if (v.base === "be") return persona && persona.plural ? "were" : "was";
    return v.pasado;
  }

  function serPresente(persona) {
    if (persona.id === "i") return "am";
    return persona.tercera ? "is" : "are";
  }

  function serPasado(persona) {
    return persona.plural ? "were" : "was";
  }

  function haber(persona) {
    return persona.tercera ? "has" : "have";
  }

  /* La conjugación propiamente tal: devuelve la frase completa, con sujeto,
   * para que se pueda leer, escuchar y repetir tal cual. */
  function conjugar(v, tiempo, persona) {
    const suj = persona.en;
    const ger = gerundio(v);

    switch (tiempo) {
      case "presente":
        if (v.base === "be") return suj + " " + serPresente(persona);
        return suj + " " + (persona.tercera ? tercera(v) : v.base);
      case "presente-cont":
        if (v.base === "be") return suj + " " + serPresente(persona) + " being";
        return suj + " " + serPresente(persona) + " " + ger;
      case "pasado":
        return suj + " " + pasadoDe(v, persona);
      case "pasado-cont":
        if (v.base === "be") return suj + " " + serPasado(persona) + " being";
        return suj + " " + serPasado(persona) + " " + ger;
      case "perfecto":
        return suj + " " + haber(persona) + " " + v.participio;
      case "futuro":
        return suj + " will " + v.base;
      case "futuro-going":
        return suj + " " + serPresente(persona) + " going to " + v.base;
      case "condicional":
        return suj + " would " + v.base;
      default:
        return suj + " " + v.base;
    }
  }

  function conFrase(v, tiempo, persona) {
    // La conjugación sola ("She works") se entiende a medias; con complemento
    // ("She works from home") se lee como algo que alguien diría de verdad.
    const base = conjugar(v, tiempo, persona);
    return v.obj ? base + " " + v.obj : base;
  }

  function tabla(v) {
    // Todas las formas de un verbo, para la pantalla de consulta.
    return TIEMPOS.map(function (t) {
      return {
        tiempo: t,
        filas: PERSONAS.map(function (p) {
          return { persona: p, texto: conjugar(v, t.id, p) };
        }),
      };
    });
  }

  function formasPrincipales(v) {
    return [
      { etiqueta: "Base", valor: v.base, ayuda: "La del diccionario" },
      { etiqueta: "3ª persona", valor: tercera(v), ayuda: "he / she / it" },
      { etiqueta: "Pasado", valor: v.pasado + (v.pasado2 ? " / " + v.pasado2 : ""), ayuda: "Pasado simple" },
      { etiqueta: "Participio", valor: v.participio, ayuda: "have / has + …" },
      { etiqueta: "Gerundio", valor: gerundio(v), ayuda: "is / was + …" },
    ];
  }

  /* ---------------- Ejercicios ----------------
   * Se devuelven con la misma forma que usa el resto de la aplicación, así la
   * pantalla de lección los dibuja sin saber que vienen del módulo de verbos.
   */

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

  function unicas(lista) {
    const vistas = {};
    return lista.filter(function (x) {
      if (!x || vistas[x]) return false;
      vistas[x] = true;
      return true;
    });
  }

  function idTarjeta(v, que) {
    return "verbo:" + v.base + ":" + que;
  }

  function ejercicioPasado(v) {
    /* El pasado de los irregulares es lo que hay que memorizar sí o sí, y el
     * distractor correcto es siempre el error real: agregarle -ed. */
    const correcta = v.pasado;
    const opciones = unicas([correcta, v.base + "ed", tercera(v), v.participio]).slice(0, 3);
    if (opciones.length < 2) return null;
    return {
      tipo: "hueco",
      tarjetaId: idTarjeta(v, "pasado"),
      enunciado: "Completa en pasado",
      oracion: "Yesterday she ___ (" + v.base + ")" + (v.obj ? " " + v.obj : "") + ".",
      opciones: revolver(opciones).map(function (o) {
        return { texto: o, correcta: o === correcta };
      }),
      respuesta: correcta,
      explicacion: v.irregular
        ? "“" + v.base + "” es irregular: su pasado es “" + v.pasado + "”, no “" + v.base + "ed”." +
          (v.nota ? " " + v.nota : "")
        : "Verbo regular: " + v.base + " + -ed.",
      traduccion: v.es,
    };
  }

  function ejercicioParticipio(v) {
    const correcta = v.participio;
    const opciones = unicas([correcta, v.pasado, v.base, v.base + "ed"]).slice(0, 3);
    if (opciones.length < 2) return null;
    return {
      tipo: "hueco",
      tarjetaId: idTarjeta(v, "participio"),
      enunciado: "Completa el presente perfecto",
      oracion: "She has ___ (" + v.base + ")" + (v.obj ? " " + v.obj : "") + ".",
      opciones: revolver(opciones).map(function (o) {
        return { texto: o, correcta: o === correcta };
      }),
      respuesta: correcta,
      explicacion:
        v.pasado === v.participio
          ? "Acá el pasado y el participio se escriben igual: “" + v.participio + "”."
          : "Ojo: el pasado es “" + v.pasado + "”, pero después de “has” va el participio, “" + v.participio + "”.",
      traduccion: v.es,
    };
  }

  function ejercicioTercera(v) {
    const correcta = tercera(v);
    const opciones = unicas([correcta, v.base, gerundio(v)]).slice(0, 3);
    if (opciones.length < 2) return null;
    return {
      tipo: "hueco",
      tarjetaId: idTarjeta(v, "tercera"),
      enunciado: "Completa en presente",
      oracion: "She ___ (" + v.base + ")" + (v.obj ? " " + v.obj : "") + " every day.",
      opciones: revolver(opciones).map(function (o) {
        return { texto: o, correcta: o === correcta };
      }),
      respuesta: correcta,
      explicacion:
        "Con he/she/it el verbo lleva -s: “" + correcta + "”. Es el error más repetido de los hispanohablantes.",
      traduccion: v.es,
    };
  }

  function ejercicioFuturo(v) {
    const correcta = "will " + v.base;
    const opciones = unicas([correcta, "will " + v.pasado, "will " + tercera(v)]).slice(0, 3);
    if (opciones.length < 2) return null;
    return {
      tipo: "hueco",
      tarjetaId: idTarjeta(v, "futuro"),
      enunciado: "Completa en futuro",
      oracion: "Tomorrow she ___ (" + v.base + ")" + (v.obj ? " " + v.obj : "") + ".",
      opciones: revolver(opciones).map(function (o) {
        return { texto: o, correcta: o === correcta };
      }),
      respuesta: correcta,
      explicacion: "Después de “will” el verbo va siempre en su forma base, sin -s y sin -ed.",
      traduccion: v.es,
    };
  }

  function ejercicioSignificado(v, banco) {
    const otros = revolver(banco.filter(function (x) { return x.base !== v.base; })).slice(0, 3);
    if (otros.length < 3) return null;
    return {
      tipo: "elige-es",
      tarjetaId: idTarjeta(v, "significado"),
      enunciado: "¿Qué significa?",
      prompt: v.base,
      audio: v.base,
      opciones: revolver(
        [{ texto: v.es, correcta: true }].concat(
          otros.map(function (o) { return { texto: o.es, correcta: false }; })
        )
      ),
      respuesta: v.es,
      nota: v.nota,
    };
  }

  function ejercicioEscribir(v, tiempo) {
    const persona = alAzar(PERSONAS);
    const frase = conFrase(v, tiempo, persona);
    return {
      tipo: "escribe",
      tarjetaId: idTarjeta(v, tiempo),
      enunciado: "Escríbelo en inglés",
      prompt: pistaEnEspanol(v, tiempo, persona),
      respuesta: frase,
      audioAlAcertar: frase,
    };
  }

  function pistaEnEspanol(v, tiempo, persona) {
    // No se traduce la frase entera —traducir bien cada tiempo verbal al
    // español daría para otro proyecto— sino que se da el sujeto, el verbo y
    // el tiempo, que es lo que hay que producir.
    const t = TIEMPOS.filter(function (x) { return x.id === tiempo; })[0];
    return persona.es + " · " + v.es + " · " + (t ? t.es.toLowerCase() : tiempo);
  }

  function ejercicioHablar(v, tiempo) {
    if (!APP.audio.hayMicrofono()) return null;
    const persona = alAzar(PERSONAS);
    const frase = conFrase(v, tiempo, persona);
    return {
      tipo: "habla",
      tarjetaId: idTarjeta(v, "voz"),
      enunciado: "Dilo en voz alta",
      prompt: frase,
      traduccion: v.es,
      audio: frase,
      respuesta: frase,
    };
  }

  /* ---------------- Sesiones ---------------- */

  function banco(filtro) {
    let v = APP.datosVerbos.VERBOS;
    if (filtro === "irregulares") v = v.filter(function (x) { return x.irregular; });
    else if (filtro === "regulares") v = v.filter(function (x) { return !x.irregular; });
    else if (filtro === "esenciales") v = v.filter(function (x) { return x.nivel === 1; });
    return v;
  }

  function peso(id) {
    const t = APP.srs.tarjeta(id);
    if (!t.rep && !t.fallos) return 3;
    if (APP.srs.vencida(id)) return 5;
    return Math.max(0.4, 3 * (1 - APP.srs.fuerza(id)));
  }

  function sortear(lista, n, que) {
    // Mismo criterio que el resto de la aplicación: primero lo que toca
    // repasar, después lo nuevo, y lo ya sabido de vez en cuando.
    const pool = lista.slice();
    const out = [];
    while (out.length < n && pool.length) {
      const pesos = pool.map(function (v) { return peso(idTarjeta(v, que)); });
      const total = pesos.reduce(function (a, b) { return a + b; }, 0);
      let r = Math.random() * total;
      let i = 0;
      while (i < pool.length - 1 && r > pesos[i]) { r -= pesos[i]; i++; }
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }

  const CONSTRUCTORES = {
    pasado: ejercicioPasado,
    participio: ejercicioParticipio,
    presente: ejercicioTercera,
    futuro: ejercicioFuturo,
  };

  function sesion(modo, n) {
    /* modo: "presente" | "pasado" | "futuro" | "participio" | "irregulares" |
     *       "significado" | "mixto" */
    const cuantos = n || 12;
    const lista = banco(modo === "irregulares" ? "irregulares" : null);
    const todos = APP.datosVerbos.VERBOS;
    const out = [];

    if (modo === "significado") {
      sortear(lista, cuantos, "significado").forEach(function (v) {
        const e = ejercicioSignificado(v, todos);
        if (e) out.push(e);
      });
      return out;
    }

    if (modo === "irregulares") {
      // Los irregulares se drillan en pasado y participio, que es donde duelen.
      sortear(lista, cuantos, "pasado").forEach(function (v, i) {
        const e = i % 3 === 2 ? ejercicioParticipio(v) : ejercicioPasado(v);
        if (e) out.push(e);
      });
      return out;
    }

    if (modo === "mixto") {
      const tipos = ["presente", "pasado", "futuro", "participio"];
      sortear(lista, cuantos, "pasado").forEach(function (v, i) {
        const e = CONSTRUCTORES[tipos[i % tipos.length]](v);
        if (e) out.push(e);
      });
      return out;
    }

    const construir = CONSTRUCTORES[modo] || ejercicioPasado;
    const elegidos = sortear(lista, cuantos, modo);
    elegidos.forEach(function (v, i) {
      // Uno de cada cuatro se produce escribiendo en vez de eligiendo: elegir
      // entre tres opciones se aprende antes de saber decirlo.
      const escribir = i > 0 && i % 4 === 3 && APP.almacen.estado().ajustes.teclado !== false;
      const e = escribir ? ejercicioEscribir(v, modo === "participio" ? "perfecto" : modo) : construir(v);
      if (e) out.push(e);
    });
    return out;
  }

  function sesionDeUnVerbo(v, n) {
    // Practicar un verbo concreto, desde su ficha.
    const out = [];
    const constructores = [ejercicioTercera, ejercicioPasado, ejercicioParticipio, ejercicioFuturo];
    constructores.forEach(function (f) {
      const e = f(v);
      if (e) out.push(e);
    });
    const hablar = ejercicioHablar(v, alAzar(["presente", "pasado", "futuro"]));
    if (hablar) out.push(hablar);
    if (APP.almacen.estado().ajustes.teclado !== false) {
      out.push(ejercicioEscribir(v, alAzar(["presente", "pasado", "perfecto"])));
    }
    return out.slice(0, n || 8);
  }

  window.APP = window.APP || {};
  APP.verbos = {
    PERSONAS: PERSONAS,
    TIEMPOS: TIEMPOS,
    tercera: tercera,
    gerundio: gerundio,
    conjugar: conjugar,
    conFrase: conFrase,
    tabla: tabla,
    formasPrincipales: formasPrincipales,
    banco: banco,
    sesion: sesion,
    sesionDeUnVerbo: sesionDeUnVerbo,
    idTarjeta: idTarjeta,
  };
})();
