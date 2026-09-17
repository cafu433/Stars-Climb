/* El motor: convierte contenido en ejercicios.
 *
 * Una lección no trae ejercicios escritos a mano; trae temas y tipos
 * permitidos, y acá se arman en el momento. Por eso repetir una lección no es
 * repetir las mismas diez pantallas: cambian las palabras, cambian los
 * distractores y cambia la forma de preguntar.
 *
 * La elección de qué preguntar no es al azar. Prioriza lo que está por vencer
 * en el repaso espaciado y lo que se ha fallado antes; lo que ya está aprendido
 * aparece sólo de vez en cuando, para no gastar la sesión en lo que ya sabe.
 */
(function () {
  "use strict";

  const D = function () { return APP.datos; };

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

  function tercera(base) {
    if (base === "have") return "has";
    if (base === "be") return "is";
    if (base === "go") return "goes";
    if (base === "do") return "does";
    if (/[sxz]$|ch$|sh$/.test(base)) return base + "es";
    if (/[^aeiou]y$/.test(base)) return base.slice(0, -1) + "ies";
    return base + "s";
  }

  function gerundio(base) {
    if (base === "be") return "being";
    if (/[^aeiou]e$/.test(base)) return base.slice(0, -1) + "ing";
    if (/^(run|put|begin|get|sit|stop|plan)$/.test(base)) return base + base.slice(-1) + "ing";
    return base + "ing";
  }

  /* ---------------- Elegir qué preguntar ----------------
   * Cada tarjeta candidata recibe un peso; después se sortea con ese peso. No
   * se toman "las N con más peso" a propósito: eso haría que la misma lección
   * repitiera siempre las mismas palabras difíciles y nunca mostrara el resto.
   */
  function peso(id) {
    const t = APP.srs.tarjeta(id);
    if (!t.rep && !t.fallos) return 3; // nueva: interesa mostrarla
    if (APP.srs.vencida(id)) return 5; // toca repasarla hoy
    const f = APP.srs.fuerza(id);
    return Math.max(0.4, 3 * (1 - f)); // cuanto más floja, más probable
  }

  function sortear(candidatos, n) {
    const pool = candidatos.slice();
    const salida = [];
    while (salida.length < n && pool.length) {
      const pesos = pool.map(function (c) { return peso(c.id); });
      const total = pesos.reduce(function (a, b) { return a + b; }, 0);
      let r = Math.random() * total;
      let i = 0;
      while (i < pool.length - 1 && r > pesos[i]) {
        r -= pesos[i];
        i++;
      }
      salida.push(pool.splice(i, 1)[0]);
    }
    return salida;
  }

  function candidatas(skills, filtro) {
    let out = [];
    skills.forEach(function (s) {
      out = out.concat(D().porSkill(s));
    });
    if (filtro) out = out.filter(filtro);
    return out;
  }

  function distractores(tarjeta, banco, campo, n) {
    /* Los distractores buenos se parecen a la respuesta: mismo tema y largo
     * parecido. Un distractor obviamente absurdo convierte el ejercicio en un
     * "aprieta el más largo" y no enseña nada. */
    const otros = banco.filter(function (t) { return t.id !== tarjeta.id && t[campo]; });
    const mismoTema = otros.filter(function (t) { return t.skill === tarjeta.skill; });
    const fuente = mismoTema.length >= n ? mismoTema : otros;
    const objetivo = (tarjeta[campo] || "").length;
    const ordenados = revolver(fuente).sort(function (a, b) {
      return Math.abs(a[campo].length - objetivo) - Math.abs(b[campo].length - objetivo);
    });
    const vistos = {};
    const out = [];
    ordenados.forEach(function (t) {
      if (out.length >= n) return;
      const clave = APP.texto.normalizar(t[campo]);
      if (vistos[clave] || clave === APP.texto.normalizar(tarjeta[campo])) return;
      vistos[clave] = true;
      out.push(t);
    });
    return out;
  }

  /* ---------------- Constructores por tipo ----------------
   * Cada uno devuelve un ejercicio o null. Devolver null es legítimo: significa
   * "con este contenido este ejercicio no tiene sentido" (armar una frase con
   * una palabra suelta, por ejemplo) y el generador simplemente prueba otro.
   */

  const constructores = {
    "elige-en": function (t, banco) {
      const malos = distractores(t, banco, "en", 3);
      if (malos.length < 3) return null;
      const opciones = revolver(
        [{ texto: t.en, icon: t.icon, correcta: true }].concat(
          malos.map(function (m) { return { texto: m.en, icon: m.icon, correcta: false }; })
        )
      );
      return {
        tipo: "elige-en",
        tarjetaId: t.id,
        enunciado: "¿Cómo se dice en inglés?",
        prompt: t.es,
        promptIcon: t.icon,
        promptHex: t.hex,
        opciones: opciones,
        audioAlAcertar: t.en,
        respuesta: t.en,
        nota: t.nota,
      };
    },

    "elige-es": function (t, banco) {
      const malos = distractores(t, banco, "es", 3);
      if (malos.length < 3) return null;
      const opciones = revolver(
        [{ texto: t.es, correcta: true }].concat(
          malos.map(function (m) { return { texto: m.es, correcta: false }; })
        )
      );
      return {
        tipo: "elige-es",
        tarjetaId: t.id,
        enunciado: "¿Qué significa?",
        prompt: t.en,
        promptIcon: t.icon,
        audio: t.en,
        opciones: opciones,
        respuesta: t.es,
        nota: t.nota,
      };
    },

    "escucha-elige": function (t, banco) {
      if (!APP.audio.hayVoz()) return null;
      const malos = distractores(t, banco, "en", 3);
      if (malos.length < 3) return null;
      const opciones = revolver(
        [{ texto: t.en, correcta: true }].concat(
          malos.map(function (m) { return { texto: m.en, correcta: false }; })
        )
      );
      return {
        tipo: "escucha-elige",
        tarjetaId: t.id,
        enunciado: "¿Qué escuchaste?",
        audio: t.en,
        autoAudio: true,
        opciones: opciones,
        respuesta: t.en,
        traduccion: t.es,
      };
    },

    "arma-en": function (t, banco) {
      const piezas = APP.texto.fichas(t.en);
      if (piezas.length < 3) return null;
      return {
        tipo: "arma",
        tarjetaId: t.id,
        enunciado: "Arma la frase en inglés",
        prompt: t.es,
        respuesta: t.en,
        fichas: revolver(piezas.concat(fichasSenuelo(t, banco, piezas))),
        audioAlAcertar: t.en,
        idioma: "en",
      };
    },

    "arma-es": function (t) {
      const piezas = APP.texto.fichas(t.es);
      if (piezas.length < 3) return null;
      return {
        tipo: "arma",
        tarjetaId: t.id,
        enunciado: "Arma la traducción",
        prompt: t.en,
        audio: t.en,
        respuesta: t.es,
        fichas: revolver(piezas),
        idioma: "es",
      };
    },

    "escribe-en": function (t) {
      if (t.en.split(/\s+/).length > 9) return null;
      return {
        tipo: "escribe",
        tarjetaId: t.id,
        enunciado: "Escríbelo en inglés",
        prompt: t.es,
        promptIcon: t.icon,
        respuesta: t.en,
        audioAlAcertar: t.en,
      };
    },

    dictado: function (t) {
      if (!APP.audio.hayVoz()) return null;
      if (t.en.split(/\s+/).length > 9) return null;
      return {
        tipo: "escribe",
        tarjetaId: t.id,
        enunciado: "Escucha y escribe lo que oyes",
        audio: t.en,
        autoAudio: true,
        respuesta: t.en,
        traduccion: t.es,
      };
    },

    habla: function (t) {
      if (!APP.audio.hayMicrofono()) return null;
      return {
        tipo: "habla",
        tarjetaId: t.id,
        enunciado: "Dilo en voz alta",
        prompt: t.en,
        traduccion: t.es,
        audio: t.en,
        respuesta: t.en,
      };
    },
  };

  function fichasSenuelo(t, banco, piezas) {
    /* Dos fichas de más para que armar la frase no sea "usa todas las que hay".
     * Salen de otras frases del mismo tema: palabras plausibles, no ruido. */
    const otras = banco
      .filter(function (x) { return x.id !== t.id && x.tipo === "frase"; })
      .slice(0, 40);
    const usadas = {};
    piezas.forEach(function (p) { usadas[p.toLowerCase()] = true; });
    const pool = [];
    otras.forEach(function (o) {
      APP.texto.fichas(o.en).forEach(function (p) {
        if (!usadas[p.toLowerCase()] && !/^[A-Z]/.test(p)) pool.push(p);
      });
    });
    return revolver(pool).slice(0, Math.min(2, Math.max(0, 8 - piezas.length)));
  }

  /* ---------------- Ejercicios de gramática y oído ----------------
   * Estos no salen de una tarjeta de vocabulario, así que se arman aparte y no
   * alimentan el repaso espaciado (no hay una "palabra" que se olvide).
   */

  function ejercicioVerbo(tiempo) {
    const v = alAzar(D().VERBOS);
    const sujetos = ["She", "He", "My sister", "The manager"];
    const sujeto = alAzar(sujetos);
    const obj = v.obj ? " " + v.obj : "";
    let correcta;
    let opciones;
    let oracion;
    let explicacion;

    if (tiempo === "pasado") {
      correcta = v.past;
      oracion = "Yesterday " + sujeto.toLowerCase() + " ___ (" + v.base + ")" + obj + ".";
      if (v.base === "be") {
        // was/were merece su propio ejercicio: es la confusión más común y no
        // se arregla con el distractor de siempre ("beed" no lo dice nadie).
        opciones = ["was", "were", "is"];
        explicacion = "Con he/she/it el pasado de “be” es “was”. “Were” va con you/we/they.";
      } else {
        opciones = [correcta, v.base + "ed", tercera(v.base)];
        explicacion =
          v.past === v.base + "ed"
            ? "Pasado regular: " + v.base + " + -ed."
            : v.past === v.base
            ? "Ojo: el pasado de “" + v.base + "” se escribe igual que el presente, pero cambia la pronunciación."
            : "Verbo irregular: el pasado de “" + v.base + "” es “" + v.past + "”, no “" + v.base + "ed”.";
      }
    } else if (tiempo === "futuro") {
      correcta = "will " + v.base;
      oracion = "Tomorrow " + sujeto.toLowerCase() + " ___ (" + v.base + ")" + obj + ".";
      opciones = [correcta, v.past, "will " + v.past];
      explicacion = "Futuro con will: siempre “will” + el verbo en su forma base, sin -s ni -ed.";
    } else {
      correcta = tercera(v.base);
      oracion = sujeto + " ___ (" + v.base + ")" + obj + " every day.";
      opciones = [correcta, v.base, gerundio(v.base)];
      explicacion =
        "Presente simple con he/she/it: el verbo lleva -s (“" + correcta + "”). Es el error más repetido de los hispanohablantes.";
    }

    const unicas = [];
    opciones.forEach(function (o) { if (unicas.indexOf(o) < 0) unicas.push(o); });
    if (unicas.length < 2) return null;
    return {
      tipo: "hueco",
      enunciado: "Completa la frase",
      oracion: oracion,
      opciones: revolver(unicas).map(function (o) {
        return { texto: o, correcta: o === correcta };
      }),
      respuesta: correcta,
      explicacion: explicacion,
      traduccion: v.es,
    };
  }

  function ejercicioInged() {
    const it = alAzar(D().INGED);
    return {
      tipo: "hueco",
      enunciado: "Completa la frase",
      oracion: it.sentence,
      opciones: revolver(it.options).map(function (o) {
        return { texto: o, correcta: o === it.correct };
      }),
      respuesta: it.correct,
      explicacion: it.es,
    };
  }

  function ejercicioMinimos() {
    if (!APP.audio.hayVoz()) return null;
    const p = alAzar(D().VOCALES);
    const objetivo = Math.random() < 0.5 ? p.a : p.b;
    return {
      tipo: "escucha-elige",
      enunciado: "¿Qué palabra escuchaste?",
      audio: objetivo,
      autoAudio: true,
      opciones: revolver([
        { texto: p.a, simbolo: p.symbolA, correcta: objetivo === p.a },
        { texto: p.b, simbolo: p.symbolB, correcta: objetivo === p.b },
      ]),
      respuesta: objetivo,
      explicacion: p.tip,
    };
  }

  function ejercicioRegistro() {
    const p = alAzar(D().FORMAL);
    const formal = Math.random() < 0.5;
    return {
      tipo: "elige-en",
      enunciado: formal ? "¿Cuál es la forma formal?" : "¿Cuál es la forma informal?",
      prompt: p.situation,
      opciones: revolver([
        { texto: p.formal, correcta: formal },
        { texto: p.informal, correcta: !formal },
      ]),
      respuesta: formal ? p.formal : p.informal,
      explicacion: "Formal: “" + p.formal + "”. Informal: “" + p.informal + "”.",
    };
  }

  function ejercicioPares(candidatas) {
    const elegidas = sortear(candidatas.filter(function (t) { return t.tipo === "palabra"; }), 5);
    if (elegidas.length < 4) return null;
    return {
      tipo: "pares",
      enunciado: "Une cada palabra con su significado",
      izquierda: revolver(elegidas.map(function (t) { return { id: t.id, texto: t.en, lado: "en" }; })),
      derecha: revolver(elegidas.map(function (t) { return { id: t.id, texto: t.es, lado: "es" }; })),
      tarjetas: elegidas.map(function (t) { return t.id; }),
    };
  }

  const ESPECIALES = {
    verbo: function (skills) {
      const tiempo = skills.indexOf("pasado") >= 0 ? "pasado" : skills.indexOf("futuro") >= 0 ? "futuro" : "presente";
      return ejercicioVerbo(tiempo);
    },
    hueco: function (skills) {
      if (skills.indexOf("inged") >= 0) return ejercicioInged();
      const tiempo = skills.indexOf("pasado") >= 0 ? "pasado" : skills.indexOf("futuro") >= 0 ? "futuro" : "presente";
      return Math.random() < 0.5 ? ejercicioInged() : ejercicioVerbo(tiempo);
    },
    minimos: ejercicioMinimos,
    registro: ejercicioRegistro,
  };

  /* ---------------- Armar una sesión ---------------- */

  function generar(tipo, tarjeta, banco) {
    const f = constructores[tipo];
    if (!f) return null;
    return f(tarjeta, banco);
  }

  function repetido(lista, ej) {
    // No preguntar dos veces la misma tarjeta dentro de una sesión corta: es lo
    // que más se nota y lo que más molesta.
    if (!ej.tarjetaId) return false;
    return lista.some(function (x) { return x.tarjetaId === ej.tarjetaId; });
  }

  /* Una lección de leer: el texto primero, y después sus preguntas. Va aparte
   * del resto porque no se arma por tarjetas: el texto es la unidad, y
   * trocearlo en ejercicios sueltos perdería justo lo que se entrena, que es
   * seguir una idea a lo largo de varias frases. */
  function sesionLectura(leccion) {
    const t = APP.datosLectura && APP.datosLectura.texto(leccion.texto);
    if (!t) return [];
    const out = [{ tipo: "lectura-texto", texto: t.id, titulo: t.titulo, cuerpo: t.texto, glosario: t.glosario, emo: t.emo }];
    revolver(t.preguntas.slice()).forEach(function (p, i) {
      out.push({
        tipo: "lectura-pregunta",
        texto: t.id,
        id: t.id + "-p" + i,
        pregunta: p.p,
        opciones: p.op.slice(),
        ok: p.op[p.ok],
        /* En qué idioma está la pregunta. Importa para el diccionario: en el
         * nivel 1 las preguntas van en español —para que la dificultad esté en
         * entender el texto y no la pregunta— y hacer tocables esas palabras
         * daría "esta palabra no está en el curso" sobre «olvida», que es
         * absurdo y hace dudar de si el diccionario sirve. */
        idioma: t.nivel === 1 ? "es" : "en",
      });
    });
    return out;
  }

  /* Tandas de una o varias reglas, repartidas. Cuando la lección pide dos
   * reglas se alternan en vez de darse una detrás de otra: mezcladas obligan a
   * decidir cuál aplica, que es la mitad de la dificultad real. */
  function sesionReglas(leccion) {
    const ids = leccion.reglas || [];
    if (!ids.length || !APP.reglas) return [];
    const porRegla = ids.map(function (id) {
      return APP.reglas.tanda(id, Math.ceil((leccion.n || 12) / ids.length) + 2);
    });
    const out = [];
    let i = 0;
    while (out.length < (leccion.n || 12)) {
      let quedaba = false;
      for (let r = 0; r < porRegla.length; r++) {
        if (porRegla[r][i]) { out.push(porRegla[r][i]); quedaba = true; }
        if (out.length >= (leccion.n || 12)) break;
      }
      if (!quedaba) break;
      i++;
    }
    return out;
  }

  function sesionLeccion(leccion) {
    if (leccion.texto) return sesionLectura(leccion);

    // Una lección puede pedir reglas, ejercicios normales, o las dos cosas.
    if (!leccion.reglas) return sesionNormal(leccion);

    const total = leccion.n || 12;
    if (!leccion.tipos) return sesionReglas(leccion);

    /* Con las dos cosas se reparte: dos tercios de regla y un tercio de uso.
     * El reparto tiene que hacerse ANTES de generar, no recortando después:
     * pedir las dos tandas completas y luego cortar a 'n' dejaba fuera todos
     * los ejercicios normales, porque los de regla iban primero y ya llenaban
     * el cupo. La lección quedaba siendo sólo drill sin que nada lo avisara. */
    const cuantasReglas = Math.max(1, Math.round(total * 0.65));
    const deReglas = sesionReglas(Object.assign({}, leccion, { n: cuantasReglas }));
    const resto = sesionNormal(
      Object.assign({}, leccion, { n: Math.max(2, total - deReglas.length) })
    );
    return deReglas.concat(resto).slice(0, total);
  }

  function sesionNormal(leccion) {
    const banco = candidatas(leccion.skills);
    const palabras = banco.filter(function (t) { return t.tipo === "palabra"; });
    const frases = banco.filter(function (t) { return t.tipo === "frase"; });

    const tipos = leccion.tipos.slice();
    const especiales = tipos.filter(function (t) { return ESPECIALES[t]; });
    const normales = tipos.filter(function (t) { return constructores[t]; });

    const ejercicios = [];

    // "Unir pares" abre la lección cuando hay vocabulario: es el ejercicio más
    // suave y sirve de calentamiento antes de producir nada.
    if (tipos.indexOf("pares") >= 0) {
      const p = ejercicioPares(palabras);
      if (p) ejercicios.push(p);
    }

    let intentos = 0;
    let iTipo = 0;
    while (ejercicios.length < leccion.n && intentos < leccion.n * 12) {
      intentos++;

      // Se alternan los tipos en vez de sortearlos: garantiza variedad dentro
      // de la lección aunque el azar se ponga terco.
      if (especiales.length && (!normales.length || intentos % 3 === 0)) {
        const e = ESPECIALES[especiales[iTipo % especiales.length]](leccion.skills);
        iTipo++;
        if (e) ejercicios.push(e);
        continue;
      }
      if (!normales.length) break;

      const tipo = normales[iTipo % normales.length];
      iTipo++;
      const necesitaFrase = tipo === "arma-en" || tipo === "arma-es";
      const fuente = necesitaFrase ? frases : banco;
      if (!fuente.length) continue;
      const t = sortear(fuente, 1)[0];
      const ej = generar(tipo, t, banco);
      if (ej && !repetido(ejercicios, ej)) ejercicios.push(ej);
    }

    /* Red de seguridad: si con los tipos pedidos no se pudo armar casi nada
     * —por ejemplo en un navegador sin voz, donde los ejercicios de escuchar
     * no existen— se completa con ejercicios de reconocer. Vale más una
     * lección distinta a la planeada que una lección vacía. */
    if (ejercicios.length < Math.min(4, leccion.n)) {
      const respaldo = banco.length ? banco : D().TARJETAS;
      let vueltas = 0;
      while (ejercicios.length < Math.min(6, leccion.n) && vueltas < 60) {
        vueltas++;
        const t = sortear(respaldo, 1)[0];
        if (!t) break;
        const ej = generar("elige-es", t, respaldo) || generar("elige-en", t, respaldo);
        if (ej && !repetido(ejercicios, ej)) ejercicios.push(ej);
      }
    }

    return ejercicios.slice(0, leccion.n);
  }

  function sesionRepaso(n) {
    /* El repaso mezcla todo lo vencido, sin importar de qué unidad venga, y
     * usa siempre el tipo más exigente que la tarjeta permita: repasar es
     * comprobar que se sabe, no volver a reconocerlo entre cuatro opciones. */
    const ids = APP.srs.pendientes(n || 15);
    const banco = D().TARJETAS;
    const ejercicios = [];
    ids.forEach(function (id) {
      const t = D().porId(id);
      if (!t) return;
      const opciones = t.tipo === "frase"
        ? ["arma-en", "escribe-en", "dictado", "arma-es"]
        : ["escribe-en", "escucha-elige", "elige-en", "elige-es"];
      for (let i = 0; i < opciones.length; i++) {
        const ej = generar(opciones[i], t, banco);
        if (ej) {
          ejercicios.push(ej);
          break;
        }
      }
    });
    return ejercicios;
  }

  function sesionErrores(n) {
    const errores = APP.almacen.estado().errores.filter(function (e) { return !e.superado; });
    const banco = D().TARJETAS;
    const ejercicios = [];
    errores.slice(0, n || 12).forEach(function (e) {
      const t = D().porId(e.id);
      if (!t) return;
      const opciones = t.tipo === "frase" ? ["arma-en", "escribe-en"] : ["elige-en", "escribe-en", "elige-es"];
      for (let i = 0; i < opciones.length; i++) {
        const ej = generar(opciones[i], t, banco);
        if (ej) {
          ejercicios.push(ej);
          break;
        }
      }
    });
    return ejercicios;
  }

  function sesionTema(skill, n) {
    return sesionLeccion({
      skills: [skill],
      tipos: ["elige-en", "elige-es", "escucha-elige", "escribe-en", "arma-en", "pares"],
      n: n || 12,
    });
  }

  window.APP = window.APP || {};
  APP.motor = {
    sesionLeccion: sesionLeccion,
    sesionLectura: sesionLectura,
    sesionReglas: sesionReglas,
    sesionRepaso: sesionRepaso,
    sesionErrores: sesionErrores,
    sesionTema: sesionTema,
    revolver: revolver,
    tercera: tercera,
  };
})();
