/* Tocar una palabra y saber qué es.
 *
 * Es la función que más veces se usa y la que menos se nota: leyendo cualquier
 * cosa en un idioma que no dominas, tropiezas con una palabra cada dos líneas.
 * Si averiguarla cuesta salir de la aplicación, abrir un traductor y volver,
 * no se averigua: se salta. Y saltarla es justo lo que impide aprenderla.
 *
 * Busca en lo que la aplicación ya tiene —448 tarjetas, 102 verbos con todas
 * sus formas, los sonidos de las vocales— así que funciona sin internet, que
 * es cuando más falta hace: en el metro, en la sala de espera.
 *
 * Lo que no encuentra, lo dice. Inventar una traducción sería peor que no dar
 * ninguna: enseñaría algo falso con toda la confianza del mundo. Cuando hay
 * internet y una cuenta con el tutor configurado, se puede preguntar ahí.
 */
(function () {
  "use strict";

  const APP = window.APP;

  /* Para buscar se quitan el puntuado y las mayúsculas, pero NO el apóstrofo:
   * "don't" y "dont" son cosas distintas, y "it's" no es "its". */
  function limpiar(palabra) {
    return String(palabra || "")
      .toLowerCase()
      .replace(/[‘’ʼ]/g, "'")
      .replace(/^[^a-z']+|[^a-z']+$/g, "");
  }

  let indice = null;

  function construir() {
    if (indice) return indice;
    indice = {};

    function meter(clave, ficha) {
      const k = limpiar(clave);
      if (!k) return;
      // La primera definición manda: las tarjetas de vocabulario son más
      // precisas que una frase donde la palabra aparece de pasada.
      if (!indice[k]) indice[k] = ficha;
    }

    // 1. El vocabulario: es lo más fiable, una palabra con su traducción.
    APP.datos.TARJETAS.forEach(function (t) {
      if (t.tipo !== "palabra") return;
      meter(t.en, {
        en: t.en, es: t.es, icon: t.icon || null, nota: t.nota || null,
        de: "vocabulario", skill: t.skill,
      });
    });

    /* 2. Los verbos, con todas sus formas apuntando al infinitivo: quien
     * tropieza con "bought" necesita saber que es el pasado de "buy", no
     * quedarse sin nada porque "bought" no esté en ninguna lista.
     *
     * Ojo con de dónde se sacan. Hay dos listas de verbos: la vieja de
     * APP.datos.VERBOS, con 37 y el campo llamado "past", y el banco de
     * APP.datosVerbos, con 102 y los campos pasado/participio. Usar la
     * primera dejaba fuera todos los pasados sin dar ningún error, porque
     * v.pasado salía undefined y la forma simplemente no se indexaba. */
    const banco = (APP.datosVerbos && APP.datosVerbos.VERBOS) || [];
    banco.forEach(function (v) {
      const formas = [
        [v.base, "base"],
        [v.pasado, "pasado de " + v.base],
        [v.participio, "participio de " + v.base],
        [APP.verbos.tercera(v), "he/she/it " + v.base],
        [APP.verbos.gerundio(v), "-ing de " + v.base],
      ];
      if (v.pasado2) formas.push([v.pasado2, "pasado de " + v.base]);
      formas.forEach(function (f) {
        meter(f[0], {
          en: f[0], es: v.es, de: "verbo", verbo: v.base, forma: f[1],
          irregular: !!v.irregular, nota: v.nota || null,
        });
      });
    });

    // 3. El glosario de los textos de lectura: ya viene palabra por palabra y
    // con la traducción escrita para ese contexto.
    ((APP.datosLectura && APP.datosLectura.TEXTOS) || []).forEach(function (t) {
      (t.glosario || []).forEach(function (g) {
        meter(g.en, { en: g.en, es: g.es, de: "glosario" });
        // Las de varias palabras ("out of stock") también por la primera.
        if (g.en.indexOf(" ") > 0) meter(g.en.split(" ")[0], { en: g.en, es: g.es, de: "glosario" });
      });
    });

    // 4. Las palabras corrientes que aparecen en las frases del curso pero no
    // son tema de vocabulario de nadie: hello, invoice, because.
    ((APP.datosPalabras && APP.datosPalabras.PALABRAS) || []).forEach(function (w) {
      meter(w.en, { en: w.en, es: w.es, de: "palabra", clase: w.clase || null, nota: w.nota || null });
    });

    // 5. Las expresiones y phrasal verbs de varias palabras se indexan por su
    // primera palabra, para poder ofrecerlas cuando se toca ahí.
    APP.datos.TARJETAS.forEach(function (t) {
      if (t.tipo !== "palabra" || t.en.indexOf(" ") < 0) return;
      const primera = limpiar(t.en.split(" ")[0]);
      if (!primera) return;
      (compuestas[primera] = compuestas[primera] || []).push(t);
    });

    return indice;
  }

  const compuestas = {};

  /* Busca una palabra. Si no está tal cual, se prueban las terminaciones
   * regulares antes de rendirse: "invoices" no está en la lista pero "invoice"
   * sí, y decir "no la tengo" teniéndola sería absurdo. */
  function buscar(palabra) {
    const idx = construir();
    const k = limpiar(palabra);
    if (!k) return null;

    if (idx[k]) return Object.assign({ buscado: palabra }, idx[k]);

    const pruebas = [];

    if (/ies$/.test(k)) pruebas.push(k.slice(0, -3) + "y");
    if (/es$/.test(k)) pruebas.push(k.slice(0, -2));
    if (/s$/.test(k)) pruebas.push(k.slice(0, -1));
    if (/'s$/.test(k)) pruebas.push(k.slice(0, -2));
    if (/ed$/.test(k)) {
      pruebas.push(k.slice(0, -2), k.slice(0, -1));
      if (/(.)\1ed$/.test(k)) pruebas.push(k.slice(0, -3));      // stopped → stop
      if (/ied$/.test(k)) pruebas.push(k.slice(0, -3) + "y");     // studied → study
    }
    if (/ing$/.test(k)) {
      pruebas.push(k.slice(0, -3), k.slice(0, -3) + "e");
      if (/(.)\1ing$/.test(k)) pruebas.push(k.slice(0, -4));      // stopping → stop
    }
    /* Comparativos y superlativos. Sin esto, "cheaper" y "bigger" no se
     * encontraban aunque "cheap" y "big" estuvieran: son de las palabras que
     * más salen en los ejercicios de comparar, justo donde hace falta poder
     * mirar qué significa la palabra de base. */
    if (/ier$/.test(k)) pruebas.push(k.slice(0, -3) + "y");       // heavier → heavy
    if (/iest$/.test(k)) pruebas.push(k.slice(0, -4) + "y");
    if (/er$/.test(k)) {
      pruebas.push(k.slice(0, -2), k.slice(0, -1));
      // La consonante doblada está ANTES del -er, no al final de la palabra:
      // "bigger" es bigg+er. Mirar sólo el final dejaba fuera todo este grupo.
      if (/(.)\1er$/.test(k)) pruebas.push(k.slice(0, -3));       // bigger → big
    }
    if (/est$/.test(k)) {
      pruebas.push(k.slice(0, -3), k.slice(0, -2));
      if (/(.)\1est$/.test(k)) pruebas.push(k.slice(0, -4));
    }

    for (let i = 0; i < pruebas.length; i++) {
      const otra = idx[pruebas[i]];
      if (otra) {
        return Object.assign({ buscado: palabra, derivadaDe: pruebas[i] }, otra);
      }
    }
    return null;
  }

  /* Expresiones que empiezan por esta palabra: tocando "look" conviene ofrecer
   * también "look for" y "look after", porque significan otra cosa y es
   * exactamente donde se equivoca un hispanohablante. */
  function expresionesCon(palabra) {
    construir();
    const k = limpiar(palabra);
    return (compuestas[k] || []).map(function (t) {
      return { en: t.en, es: t.es, nota: t.nota || null };
    });
  }

  /* Cómo suena. No hay transcripción fonética por palabra —no la tenemos, e
   * inventarla sería peor que callarse— pero sí se pueden señalar los sonidos
   * de vocal que la aplicación enseña y que aparecen en la palabra, que es lo
   * que de verdad le cuesta a un hispanohablante. */
  function sonidosDe(palabra) {
    const k = limpiar(palabra);
    if (!k || !APP.datosSonidos) return [];
    const out = [];
    (APP.datosSonidos.SONIDOS || []).forEach(function (s) {
      const pega = (s.ejemplos || []).some(function (e) {
        const w = limpiar(typeof e === "string" ? e : e.en || e.palabra || "");
        return w === k;
      });
      if (pega) out.push({ id: s.id, simbolo: s.simbolo, comoSuena: s.comoSuena, trampa: s.trampa });
    });
    return out;
  }

  /* Trocea un texto en palabras y separadores, conservando todo. La pantalla
   * envuelve las palabras en algo que se puede tocar y deja el resto tal cual,
   * de modo que el texto se sigue leyendo igual. */
  function trocear(texto) {
    const piezas = [];
    const re = /[A-Za-z][A-Za-z'’]*/g;
    let ultimo = 0;
    let m;
    while ((m = re.exec(texto)) !== null) {
      if (m.index > ultimo) piezas.push({ palabra: false, texto: texto.slice(ultimo, m.index) });
      piezas.push({ palabra: true, texto: m[0] });
      ultimo = m.index + m[0].length;
    }
    if (ultimo < texto.length) piezas.push({ palabra: false, texto: texto.slice(ultimo) });
    return piezas;
  }

  /* Todo lo que se sabe de una palabra, de una vez: es lo que muestra la
   * ficha. 'encontrada' en false no es un error, es una respuesta: significa
   * "esta palabra no está en el curso", y se dice tal cual. */
  function ficha(palabra) {
    const base = buscar(palabra);
    return {
      palabra: palabra,
      encontrada: !!base,
      definicion: base,
      expresiones: expresionesCon(palabra),
      sonidos: sonidosDe(palabra),
    };
  }

  APP.diccionario = {
    buscar: buscar,
    ficha: ficha,
    trocear: trocear,
    expresionesCon: expresionesCon,
    sonidosDe: sonidosDe,
    limpiar: limpiar,
  };
})();
