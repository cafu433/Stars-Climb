/* Los 20 sonidos vocálicos del inglés británico.
 *
 * El español tiene cinco vocales y cada una suena de una sola manera. El inglés
 * tiene veinte —doce vocales simples y ocho diptongos— y ahí está la mitad de
 * por qué cuesta entender y que te entiendan: "ship" y "sheep" son la misma
 * palabra para un oído español, y no lo son.
 *
 * Cada sonido trae:
 *   simbolo      el símbolo fonético, que es como se escribe en los diccionarios
 *   ejemplos     tres palabras corrientes donde aparece
 *   comoSuena    qué hacer con la boca, explicado sin jerga
 *   trampa       el error concreto que comete quien habla español
 *   confundeCon  el sonido con el que se confunde (para los pares mínimos)
 *
 * Los pares mínimos son la herramienta: dos palabras que sólo se diferencian en
 * ese sonido. Si se distinguen de oído, el sonido está aprendido.
 */
(function () {
  "use strict";

  const SONIDOS = [
    // ---------- Vocales simples ----------
    { id: "i-larga", simbolo: "iː", tipo: "simple", nombre: "i larga",
      ejemplos: ["sheep", "see", "three"],
      comoSuena: "Como la “i” española pero estirada y con la boca más tensa, sonriendo.",
      trampa: "Decirla corta la convierte en otra palabra: “sheep” (oveja) pasa a “ship” (barco).",
      confundeCon: "i-corta" },

    { id: "i-corta", simbolo: "ɪ", tipo: "simple", nombre: "i corta",
      ejemplos: ["ship", "sit", "big"],
      comoSuena: "Un sonido corto y relajado, a medio camino entre la “i” y la “e” españolas.",
      trampa: "No existe en español y se reemplaza por “i”, que suena a la palabra equivocada.",
      confundeCon: "i-larga" },

    { id: "e", simbolo: "e", tipo: "simple", nombre: "e",
      ejemplos: ["bed", "ten", "red"],
      comoSuena: "Prácticamente la “e” española. Es de los pocos que salen gratis.",
      trampa: "Casi ninguna. El problema es confundirla con æ, que se abre mucho más.",
      confundeCon: "a-abierta" },

    { id: "a-abierta", simbolo: "æ", tipo: "simple", nombre: "a abierta",
      ejemplos: ["cat", "bad", "hand"],
      comoSuena: "Entre la “a” y la “e”: se abre bien la boca y se estira hacia los lados.",
      trampa: "Decir una “a” española normal hace que “bad” suene a “bed”.",
      confundeCon: "e" },

    { id: "a-larga", simbolo: "ɑː", tipo: "simple", nombre: "a larga",
      ejemplos: ["car", "far", "heart"],
      comoSuena: "Una “a” larga y profunda, con la lengua atrás, como cuando el médico dice “aaah”.",
      trampa: "En inglés británico la “r” de “car” no se pronuncia: es sólo la vocal larga.",
      confundeCon: "a-central" },

    { id: "o-corta", simbolo: "ɒ", tipo: "simple", nombre: "o corta",
      ejemplos: ["hot", "box", "want"],
      comoSuena: "Una “o” corta con los labios redondeados y la boca bastante abierta.",
      trampa: "Alargarla la convierte en ɔː: “cot” pasa a “caught”.",
      confundeCon: "o-larga" },

    { id: "o-larga", simbolo: "ɔː", tipo: "simple", nombre: "o larga",
      ejemplos: ["door", "four", "talk"],
      comoSuena: "Una “o” larga con los labios bien redondeados, como soplando.",
      trampa: "Como la “r” británica no suena, “door” es casi sólo esta vocal estirada.",
      confundeCon: "o-corta" },

    { id: "u-corta", simbolo: "ʊ", tipo: "simple", nombre: "u corta",
      ejemplos: ["book", "good", "put"],
      comoSuena: "Corta y relajada, con los labios apenas redondeados.",
      trampa: "Estirarla la vuelve uː: “full” pasa a “fool”.",
      confundeCon: "u-larga" },

    { id: "u-larga", simbolo: "uː", tipo: "simple", nombre: "u larga",
      ejemplos: ["food", "blue", "school"],
      comoSuena: "Como la “u” española pero más larga y con los labios más adelantados.",
      trampa: "Es de las más fáciles; el cuidado está en no usarla donde va la corta.",
      confundeCon: "u-corta" },

    { id: "a-central", simbolo: "ʌ", tipo: "simple", nombre: "a central",
      ejemplos: ["cup", "love", "money"],
      comoSuena: "Una vocal corta y neutra, con la boca a medio abrir y sin tensión.",
      trampa: "Se cambia por “a” española y “cup” termina sonando como “cap”.",
      confundeCon: "a-abierta" },

    { id: "e-larga", simbolo: "ɜː", tipo: "simple", nombre: "e gutural larga",
      ejemplos: ["bird", "work", "learn"],
      comoSuena: "Un sonido largo, plano y desde el centro de la boca. No existe en español.",
      trampa: "Se reemplaza por “er” con la “r” marcada; en inglés británico esa “r” no suena.",
      confundeCon: "o-larga" },

    { id: "schwa", simbolo: "ə", tipo: "simple", nombre: "schwa",
      ejemplos: ["about", "teacher", "sofa"],
      comoSuena: "La vocal más floja que existe: boca relajada, sin esfuerzo. Suena a “e” apagada.",
      trampa: "Es el sonido más frecuente del inglés y aparece en todas las sílabas sin acento. Pronunciar cada vocal “completa” es lo que más delata a un hispanohablante.",
      confundeCon: "a-central" },

    // ---------- Diptongos ----------
    { id: "ei", simbolo: "eɪ", tipo: "diptongo", nombre: "e-i",
      ejemplos: ["day", "name", "eight"],
      comoSuena: "Empieza en “e” y se desliza hacia “i”, en un solo movimiento.",
      trampa: "Cortarlo en la “e” hace que “late” suene a “let”.",
      confundeCon: "ai" },

    { id: "ai", simbolo: "aɪ", tipo: "diptongo", nombre: "a-i",
      ejemplos: ["my", "time", "five"],
      comoSuena: "De “a” a “i”, igual que el “ay” español de “hay”.",
      trampa: "Casi ninguna: este sale natural.",
      confundeCon: "ei" },

    { id: "oi", simbolo: "ɔɪ", tipo: "diptongo", nombre: "o-i",
      ejemplos: ["boy", "coin", "noise"],
      comoSuena: "De “o” redondeada a “i”, como el “oy” de “hoy”.",
      trampa: "Tampoco tiene truco. Ojo sólo con no arrancarlo en “a”.",
      confundeCon: "ai" },

    { id: "ou", simbolo: "əʊ", tipo: "diptongo", nombre: "schwa-u",
      ejemplos: ["go", "home", "know"],
      comoSuena: "Arranca en una vocal neutra —no en “o”— y se cierra hacia “u”.",
      trampa: "Decir una “o” española pura suena muy marcado. En inglés americano es “oʊ”, más parecido a la “o”.",
      confundeCon: "au" },

    { id: "au", simbolo: "aʊ", tipo: "diptongo", nombre: "a-u",
      ejemplos: ["now", "house", "out"],
      comoSuena: "De “a” a “u”, como el “au” de “aula”.",
      trampa: "Sale natural; el cuidado es no confundirlo con əʊ al escuchar.",
      confundeCon: "ou" },

    { id: "ia", simbolo: "ɪə", tipo: "diptongo", nombre: "i-schwa",
      ejemplos: ["here", "near", "beer"],
      comoSuena: "De “i” corta hacia la vocal neutra, sin pronunciar la “r” final.",
      trampa: "Marcar la “r” de “here” es el error más típico en inglés británico.",
      confundeCon: "ea" },

    { id: "ea", simbolo: "eə", tipo: "diptongo", nombre: "e-schwa",
      ejemplos: ["hair", "where", "care"],
      comoSuena: "De “e” hacia la vocal neutra. Tampoco suena la “r”.",
      trampa: "Se confunde con ɪə: “here” y “hair” se distinguen sólo en cómo empiezan.",
      confundeCon: "ia" },

    { id: "ua", simbolo: "ʊə", tipo: "diptongo", nombre: "u-schwa",
      ejemplos: ["tour", "pure", "cure"],
      comoSuena: "De “u” corta hacia la vocal neutra.",
      trampa: "Está desapareciendo: muchos británicos hoy dicen “tour” con ɔː. Si te sale así, también está bien.",
      confundeCon: "o-larga" },
  ];

  /* Pares mínimos: dos palabras que se diferencian sólo en la vocal. Es la
   * herramienta que de verdad entrena el oído — si se distinguen escuchando,
   * el sonido está aprendido. */
  const PARES = [
    { a: "ship", b: "sheep", sonidoA: "i-corta", sonidoB: "i-larga", es: "barco / oveja" },
    { a: "bit", b: "beat", sonidoA: "i-corta", sonidoB: "i-larga", es: "poquito / latido" },
    { a: "live", b: "leave", sonidoA: "i-corta", sonidoB: "i-larga", es: "vivir / irse" },
    { a: "fill", b: "feel", sonidoA: "i-corta", sonidoB: "i-larga", es: "llenar / sentir" },
    { a: "full", b: "fool", sonidoA: "u-corta", sonidoB: "u-larga", es: "lleno / tonto" },
    { a: "pull", b: "pool", sonidoA: "u-corta", sonidoB: "u-larga", es: "tirar / piscina" },
    { a: "cat", b: "cut", sonidoA: "a-abierta", sonidoB: "a-central", es: "gato / cortar" },
    { a: "bad", b: "bud", sonidoA: "a-abierta", sonidoB: "a-central", es: "malo / brote" },
    { a: "match", b: "much", sonidoA: "a-abierta", sonidoB: "a-central", es: "partido / mucho" },
    { a: "bed", b: "bad", sonidoA: "e", sonidoB: "a-abierta", es: "cama / malo" },
    { a: "pen", b: "pan", sonidoA: "e", sonidoB: "a-abierta", es: "lápiz / sartén" },
    { a: "men", b: "man", sonidoA: "e", sonidoB: "a-abierta", es: "hombres / hombre" },
    { a: "luck", b: "lock", sonidoA: "a-central", sonidoB: "o-corta", es: "suerte / candado" },
    { a: "cot", b: "caught", sonidoA: "o-corta", sonidoB: "o-larga", es: "catre / atrapó" },
    { a: "not", b: "nought", sonidoA: "o-corta", sonidoB: "o-larga", es: "no / cero" },
    { a: "work", b: "walk", sonidoA: "e-larga", sonidoB: "o-larga", es: "trabajar / caminar" },
    { a: "bird", b: "bard", sonidoA: "e-larga", sonidoB: "a-larga", es: "pájaro / poeta" },
    { a: "heart", b: "hut", sonidoA: "a-larga", sonidoB: "a-central", es: "corazón / cabaña" },
    { a: "cart", b: "cut", sonidoA: "a-larga", sonidoB: "a-central", es: "carro / cortar" },
    { a: "day", b: "die", sonidoA: "ei", sonidoB: "ai", es: "día / morir" },
    { a: "late", b: "light", sonidoA: "ei", sonidoB: "ai", es: "tarde / luz" },
    { a: "boy", b: "buy", sonidoA: "oi", sonidoB: "ai", es: "niño / comprar" },
    { a: "now", b: "no", sonidoA: "au", sonidoB: "ou", es: "ahora / no" },
    { a: "cow", b: "co", sonidoA: "au", sonidoB: "ou", es: "vaca / (prefijo)", omitir: true },
    { a: "hear", b: "hair", sonidoA: "ia", sonidoB: "ea", es: "oír / pelo" },
    { a: "beer", b: "bear", sonidoA: "ia", sonidoB: "ea", es: "cerveza / oso" },
    { a: "poor", b: "paw", sonidoA: "ua", sonidoB: "o-larga", es: "pobre / pata" },
    { a: "sit", b: "seat", sonidoA: "i-corta", sonidoB: "i-larga", es: "sentarse / asiento" },
    { a: "hat", b: "hut", sonidoA: "a-abierta", sonidoB: "a-central", es: "sombrero / cabaña" },
    { a: "want", b: "won't", sonidoA: "o-corta", sonidoB: "ou", es: "querer / no lo hará" },
  ].filter(function (p) { return !p.omitir; });

  const porId = {};
  SONIDOS.forEach(function (s) { porId[s.id] = s; });

  window.APP = window.APP || {};
  APP.datosSonidos = {
    SONIDOS: SONIDOS,
    PARES: PARES,
    sonido: function (id) { return porId[id] || null; },
    paresDe: function (id) {
      return PARES.filter(function (p) { return p.sonidoA === id || p.sonidoB === id; });
    },
  };
})();
