/* Comparar lo que escribió o dijo la persona con la respuesta esperada.
 *
 * La regla de fondo: corregir el inglés, no la puntuación ni el teclado del
 * teléfono. Escribir "i dont know" cuando la respuesta es "I don't know" está
 * bien; escribir "I know" no lo está.
 */
(function () {
  "use strict";

  /* Contracciones y variantes de escritura que valen lo mismo.
   *
   * Se expanden ("dont" → "do not") en vez de acortarse: así la frase conserva
   * la misma cantidad de palabras y el porcentaje de "cuánto dijiste bien" no
   * se distorsiona por escribir "I'm" en vez de "I am".
   *
   * Dos que no están, a propósito: "its" (chocaría con el posesivo) y "were"
   * (chocaría con el pasado de "be", y daría por buena una frase en el tiempo
   * verbal equivocado).
   */
  const EXPANSIONES = {
    dont: "do not", doesnt: "does not", didnt: "did not",
    isnt: "is not", arent: "are not", wasnt: "was not", werent: "were not",
    cant: "can not", cannot: "can not", wont: "will not", couldnt: "could not",
    wouldnt: "would not", shouldnt: "should not", havent: "have not", hasnt: "has not",
    im: "i am", youre: "you are", hes: "he is", shes: "she is", theyre: "they are",
    ive: "i have", youve: "you have", weve: "we have", theyve: "they have",
    lets: "let us", thats: "that is", whats: "what is", wheres: "where is",
  };

  // Diferencias de ortografía entre inglés británico y americano: las dos se
  // aceptan, porque el objetivo es el inglés, no el país.
  const VARIANTES = {
    favourite: "favorite", colour: "color", flavour: "flavor",
    grey: "gray", aeroplane: "airplane", travelling: "traveling",
    ok: "okay", theatre: "theater", centre: "center",
  };

  function normalizar(texto) {
    const limpio = (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // tildes: "cafe" y "café" son lo mismo
      .replace(/[\u2019\u2018`]/g, "'")
      .replace(/[^a-z0-9' ]+/g, " ")
      .replace(/'/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!limpio) return "";
    return limpio
      .split(" ")
      .map(function (p) {
        // hasOwnProperty y no un acceso directo: si no, una palabra como
        // "constructor" encontraría algo heredado de Object y devolvería basura.
        if (Object.prototype.hasOwnProperty.call(EXPANSIONES, p)) return EXPANSIONES[p];
        if (Object.prototype.hasOwnProperty.call(VARIANTES, p)) return VARIANTES[p];
        return p;
      })
      .join(" ");
  }

  function palabras(texto) {
    const n = normalizar(texto);
    return n ? n.split(" ") : [];
  }

  function iguales(a, b) {
    return normalizar(a) === normalizar(b);
  }

  function distancia(a, b) {
    // Levenshtein clásico, sobre caracteres o sobre palabras según lo que se
    // le pase (arreglos o strings: ambos se indexan igual).
    const m = a.length;
    const n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
      prev = cur;
    }
    return prev[n];
  }

  function casiIguales(escrito, esperado) {
    /* Un typo no debería costar una vida. Se acepta una diferencia de una letra
     * por cada seis caracteres, con un mínimo de una: "restaurnt" pasa,
     * "restaurant" contra "restrooms" no. */
    const a = normalizar(escrito);
    const b = normalizar(esperado);
    if (!a) return false;
    if (a === b) return true;
    const tolerancia = Math.max(1, Math.floor(b.length / 6));
    return distancia(a, b) <= tolerancia;
  }

  /* Diferencia palabra por palabra, para mostrarle qué dijo de más, de menos o
   * distinto cuando practica hablando. Es lo que convierte "60%" en algo que
   * enseña: sin esto, la nota no dice dónde estuvo el problema. */
  function comparar(esperado, dicho) {
    const a = palabras(esperado);
    const b = palabras(dicho);
    const m = a.length;
    const n = b.length;

    // Tabla completa de Levenshtein para poder reconstruir el camino.
    const d = [];
    for (let i = 0; i <= m; i++) {
      d.push(new Array(n + 1).fill(0));
      d[i][0] = i;
    }
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        d[i][j] = Math.min(
          d[i - 1][j] + 1,
          d[i][j - 1] + 1,
          d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }

    const ops = [];
    let i = m;
    let j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        ops.unshift({ tipo: "ok", palabra: a[i - 1] });
        i--; j--;
      } else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) {
        ops.unshift({ tipo: "cambio", palabra: a[i - 1], dicho: b[j - 1] });
        i--; j--;
      } else if (j > 0 && d[i][j] === d[i][j - 1] + 1) {
        ops.unshift({ tipo: "sobra", palabra: b[j - 1] });
        j--;
      } else {
        ops.unshift({ tipo: "falta", palabra: a[i - 1] });
        i--;
      }
    }

    const buenas = ops.filter(function (o) { return o.tipo === "ok"; }).length;
    const nota = m ? Math.round((buenas / m) * 100) : 0;
    return { ops: ops, nota: nota, total: m, buenas: buenas };
  }

  function fichas(frase) {
    /* Corta la frase en fichas para el ejercicio de armar. Se corta por
     * espacios y no por palabras "de verdad": la persona ve exactamente las
     * piezas que tiene que ordenar, con su puntuación pegada. */
    return (frase || "").trim().split(/\s+/);
  }

  window.APP = window.APP || {};
  APP.texto = {
    normalizar: normalizar,
    palabras: palabras,
    iguales: iguales,
    casiIguales: casiIguales,
    distancia: distancia,
    comparar: comparar,
    fichas: fichas,
  };
})();
