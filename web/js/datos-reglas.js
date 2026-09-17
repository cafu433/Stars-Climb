/* Las reglas del inglés, una por una, con ejercicios que se generan solos.
 *
 * Esto es lo que en los libros de gramática (el Murphy, el Azar) ocupa dos
 * páginas enfrentadas: a la izquierda una regla explicada corta, a la derecha
 * ejercicios de esa regla y de ninguna otra. El formato funciona porque separa
 * dos cosas que la práctica mezclada confunde: entender la regla y
 * automatizarla. Se entiende una vez; se automatiza a base de repetir.
 *
 * La ventaja de hacerlo en pantalla y no en papel es que los ejercicios se
 * generan: en un libro son veinte y se acaban, acá no se acaban nunca y nunca
 * salen en el mismo orden, así que no se aprende la respuesta de memoria.
 *
 * Cada regla trae:
 *   regla    la explicación, contrastada con el español
 *   tabla    la forma de un vistazo
 *   clave    la frase de una línea que hay que recordar
 *   error    el error típico, mal y bien
 *   generar  una función que devuelve un ejercicio distinto cada vez
 *
 * Los ejercicios que devuelve 'generar' tienen todos la misma forma:
 *   { frase, es, opciones, ok, porque }
 * donde 'frase' lleva ___ en el hueco y 'porque' explica la respuesta cuando
 * se falla. Sin ese 'porque', equivocarse enseña sólo cuál era la respuesta.
 */
(function () {
  "use strict";

  /* ---------------- Material para armar los ejercicios ---------------- */

  /* 'gen' y 'num' están para que la traducción de apoyo concuerde. Se anotan
   * porque no se pueden deducir: "you" en español puede ser hombre o mujer, y
   * escribir "cansado" a secas o "cansada" a secas sería inventarse un dato
   * sobre quien está practicando. Cuando no se sabe, gen es "?" y sale
   * "cansado/a", que es lo que hacen los libros. Cuando sí se sabe —he, she,
   * un plural— se pone la forma correcta y ya. */
  const SUJETOS = [
    { en: "I",        es: "yo",             vivo: true, gen: "?", num: "s", ser: "soy",   estar: "estoy",   be: "am",  bePas: "was",  serPas: "era",  estarPas: "estaba",  aux: "do",   auxPas: "did", have: "have", tiene: "tengo",   tercera: false },
    { en: "You",      es: "tú",             vivo: true, gen: "?", num: "s", ser: "eres",  estar: "estás",   be: "are", bePas: "were", serPas: "eras", estarPas: "estabas", aux: "do",   auxPas: "did", have: "have", tiene: "tienes",  tercera: false },
    { en: "He",       es: "él",             vivo: true, gen: "m", num: "s", ser: "es",    estar: "está",    be: "is",  bePas: "was",  serPas: "era",  estarPas: "estaba",  aux: "does", auxPas: "did", have: "has",  tiene: "tiene",   tercera: true },
    { en: "She",      es: "ella",           vivo: true, gen: "f", num: "s", ser: "es",    estar: "está",    be: "is",  bePas: "was",  serPas: "era",  estarPas: "estaba",  aux: "does", auxPas: "did", have: "has",  tiene: "tiene",   tercera: true },
    { en: "We",       es: "nosotros",       vivo: true, gen: "?", num: "p", ser: "somos", estar: "estamos", be: "are", bePas: "were", serPas: "éramos", estarPas: "estábamos", aux: "do", auxPas: "did", have: "have", tiene: "tenemos", tercera: false },
    { en: "They",     es: "ellos",          vivo: true, gen: "m", num: "p", ser: "son",   estar: "están",   be: "are", bePas: "were", serPas: "eran", estarPas: "estaban", aux: "do",   auxPas: "did", have: "have", tiene: "tienen",  tercera: false },
    { en: "My sister",es: "mi hermana",     vivo: true, gen: "f", num: "s", ser: "es",    estar: "está",    be: "is",  bePas: "was",  serPas: "era",  estarPas: "estaba",  aux: "does", auxPas: "did", have: "has",  tiene: "tiene",   tercera: true },
    { en: "The boss", es: "el jefe",        vivo: true, gen: "m", num: "s", ser: "es",    estar: "está",    be: "is",  bePas: "was",  serPas: "era",  estarPas: "estaba",  aux: "does", auxPas: "did", have: "has",  tiene: "tiene",   tercera: true },
    { en: "The invoices", es: "las facturas", vivo: false, gen: "f", num: "p", ser: "son", estar: "están",   be: "are", bePas: "were", serPas: "eran", estarPas: "estaban", aux: "do",   auxPas: "did", have: "have", tiene: "tienen",  tercera: false },
    { en: "My parents", es: "mis padres",   vivo: true, gen: "m", num: "p", ser: "son",   estar: "están",   be: "are", bePas: "were", serPas: "eran", estarPas: "estaban", aux: "do",   auxPas: "did", have: "have", tiene: "tienen",  tercera: false },
  ];

  /* Los complementos dicen si en español piden ser o estar: sin eso, la
   * traducción de apoyo saldría mal justo en la distinción que a un
   * hispanohablante le importa. */
  /* 'es' es la forma masculina singular y 'f' dice cómo flexiona:
   *   "o"   cansado / cansada / cansados / cansadas
   *   "e"   importante / importantes (no distingue género)
   *   "no"  locuciones que no cambian nunca: en la casa, de Chile
   */
  /* 'con' dice a qué sujetos les pega el complemento. Sin esto la combinación
   * libre produce frases absurdas —"las facturas estaban cansadas"— y en un
   * ejercicio de gramática eso no es gracioso: quien está aprendiendo se queda
   * dudando de si entendió mal la frase en vez de pensar en la regla. */
  const COMPLEMENTOS = [
    { en: "tired",          es: "cansado",       f: "o",  v: "estar", con: "vivo" },
    { en: "ready",          es: "listo",         f: "o",  v: "estar", con: "todo" },
    { en: "late",           es: "atrasado",      f: "o",  v: "estar", con: "todo" },
    { en: "busy",           es: "ocupado",       f: "o",  v: "estar", con: "vivo" },
    { en: "at home",        es: "en la casa",    f: "no", v: "estar", con: "vivo" },
    { en: "in the office",  es: "en la oficina", f: "no", v: "estar", con: "todo" },
    { en: "here",           es: "acá",           f: "no", v: "estar", con: "todo" },
    { en: "from Chile",     es: "de Chile",      f: "no", v: "ser",   con: "vivo", permanente: true },
    { en: "very expensive", es: "muy caro",      f: "o",  v: "ser",   con: "cosa" },
    { en: "new",            es: "nuevo",         f: "o",  v: "ser",   con: "cosa" },
    { en: "important",      es: "importante",    f: "e",  v: "ser",   con: "todo" },
    { en: "right",          es: "correcto",      f: "o",  v: "ser",   con: "cosa" },
  ];

  // Un complemento para este sujeto, de los que tienen sentido con él.
  function complementoPara(s, rnd) {
    const quiere = s.vivo ? "vivo" : "cosa";
    return alAzar(
      COMPLEMENTOS.filter(function (c) { return c.con === "todo" || c.con === quiere; }),
      rnd
    );
  }

  /* Concuerda el complemento con el sujeto. Cuando el género no se sabe se
   * deja "cansado/a", que es lo honesto: la aplicación no sabe quién está
   * practicando y no tiene por qué suponerlo. */
  function concordar(c, gen, num) {
    if (c.f === "no") return c.es;
    if (c.f === "e") return num === "p" ? c.es + "s" : c.es;
    const raiz = c.es.slice(0, -1);               // cansad-, muy car-
    if (num === "p") {
      if (gen === "m") return raiz + "os";
      if (gen === "f") return raiz + "as";
      return raiz + "os/as";
    }
    if (gen === "m") return c.es;
    if (gen === "f") return raiz + "a";
    return c.es + "/a";
  }

  /* Verbos elegidos para que salgan todas las reglas de escritura: la -s de
   * tercera persona en sus cuatro formas, el -ed y sus excepciones, y el -ing
   * con la e muda y la consonante doble. */
  const VERBOS = [
    { base: "work",  tercera: "works",   ing: "working",  pas: "worked",  es: "trabajar", obj: "here" },
    { base: "live",  tercera: "lives",   ing: "living",   pas: "lived",   es: "vivir",    obj: "in Santiago" },
    { base: "study", tercera: "studies", ing: "studying", pas: "studied", es: "estudiar", obj: "English" },
    { base: "go",    tercera: "goes",    ing: "going",    pas: "went",    es: "ir",       obj: "to the office", irregular: true },
    { base: "watch", tercera: "watches", ing: "watching", pas: "watched", es: "ver",      obj: "the news" },
    { base: "stop",  tercera: "stops",   ing: "stopping", pas: "stopped", es: "parar",    obj: "at six" },
    { base: "play",  tercera: "plays",   ing: "playing",  pas: "played",  es: "jugar",    obj: "tennis" },
    { base: "make",  tercera: "makes",   ing: "making",   pas: "made",    es: "hacer",    obj: "coffee", irregular: true },
    { base: "buy",   tercera: "buys",    ing: "buying",   pas: "bought",  es: "comprar",  obj: "the tickets", irregular: true },
    { base: "send",  tercera: "sends",   ing: "sending",  pas: "sent",    es: "enviar",   obj: "the report", irregular: true },
    { base: "pay",   tercera: "pays",    ing: "paying",   pas: "paid",    es: "pagar",    obj: "the invoice", irregular: true },
    { base: "need",  tercera: "needs",   ing: "needing",  pas: "needed",  es: "necesitar", obj: "more time" },
    { base: "call",  tercera: "calls",   ing: "calling",  pas: "called",  es: "llamar",   obj: "the supplier" },
    { base: "write", tercera: "writes",  ing: "writing",  pas: "wrote",   es: "escribir", obj: "reports", irregular: true },
    { base: "take",  tercera: "takes",   ing: "taking",   pas: "took",    es: "tomar",    obj: "the bus", irregular: true },
    { base: "finish",tercera: "finishes",ing: "finishing",pas: "finished",es: "terminar", obj: "at five" },
  ];

  function alAzar(lista, rnd) {
    return lista[Math.floor((rnd || Math.random)() * lista.length)];
  }

  // Las opciones se barajan para que la correcta no caiga siempre en el mismo
  // sitio: si no, se aprende la posición en vez de la regla.
  function barajar(lista, rnd) {
    const c = lista.slice();
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor((rnd || Math.random)() * (i + 1));
      const t = c[i]; c[i] = c[j]; c[j] = t;
    }
    return c;
  }

  /* ---------------- Las reglas ---------------- */

  const REGLAS = [
    /* ===================== El verbo to be ===================== */
    {
      id: "am-is-are",
      grupo: "El verbo to be",
      nivel: 1,
      emo: "🧍",
      titulo: "am, is, are",
      resumen: "Qué forma de “ser/estar” va con cada sujeto",
      regla:
        "En español “ser” y “estar” cambian mucho: soy, eres, es, somos, son. En inglés es la misma " +
        "idea pero con sólo tres formas, y no se puede elegir: cada sujeto lleva la suya, siempre.\n\n" +
        "<b>I</b> lleva <b>am</b>. <b>He, she, it</b> y cualquier cosa en singular llevan <b>is</b>. " +
        "<b>You, we, they</b> y cualquier cosa en plural llevan <b>are</b>.\n\n" +
        "Fíjate que <i>you</i> lleva <b>are</b> tanto para “tú” como para “ustedes”. Y que en inglés " +
        "una sola palabra, <i>be</i>, hace el trabajo de ser y de estar: “I am tired” es “estoy " +
        "cansada” y “I am Chilean” es “soy chilena”.",
      tabla: {
        cabecera: ["Sujeto", "Forma", "Ejemplo"],
        filas: [
          ["I", "am", "I am tired"],
          ["You", "are", "You are late"],
          ["He / She / It", "is", "She is my sister"],
          ["We", "are", "We are ready"],
          ["They", "are", "They are here"],
          ["singular (my sister)", "is", "My sister is a nurse"],
          ["plural (the invoices)", "are", "The invoices are wrong"],
        ],
      },
      clave: "I → am · él/ella/eso → is · todo lo demás → are",
      error: { mal: "I is tired.", bien: "I am tired." },
      generar: function (rnd) {
        const s = alAzar(SUJETOS, rnd);
        const c = complementoPara(s, rnd);
        return {
          frase: s.en + " ___ " + c.en + ".",
          es: s.es + " " + s[c.v] + " " + concordar(c, s.gen, s.num) + ".",
          opciones: ["am", "is", "are"],
          ok: s.be,
          porque: s.en + " → " + s.be,
        };
      },
    },

    {
      id: "was-were",
      grupo: "El verbo to be",
      nivel: 1,
      emo: "⏮️",
      titulo: "was, were",
      resumen: "El pasado de to be: sólo dos formas",
      regla:
        "El pasado de <i>be</i> es todavía más simple: sólo hay <b>dos</b> formas.\n\n" +
        "<b>I, he, she, it</b> → <b>was</b>. <b>You, we, they</b> → <b>were</b>.\n\n" +
        "La trampa es <i>you</i>: aunque sea una sola persona, lleva <b>were</b>. “You were right” " +
        "es “tenías razón”, hablándole a una sola persona.",
      tabla: {
        cabecera: ["Sujeto", "Forma", "Ejemplo"],
        filas: [
          ["I", "was", "I was at home"],
          ["He / She / It", "was", "She was tired"],
          ["You", "were", "You were right"],
          ["We", "were", "We were late"],
          ["They", "were", "They were busy"],
        ],
      },
      clave: "I, he, she, it → was · you, we, they → were",
      error: { mal: "You was right.", bien: "You were right." },
      generar: function (rnd) {
        const s = alAzar(SUJETOS, rnd);
        // Lo permanente no pega con "ayer": ser de Chile no se deja de ser.
        let c = complementoPara(s, rnd);
        while (c.permanente) c = complementoPara(s, rnd);
        const verboPas = c.v === "ser" ? s.serPas : s.estarPas;
        return {
          frase: s.en + " ___ " + c.en + " yesterday.",
          es: s.es + " " + verboPas + " " + concordar(c, s.gen, s.num) + " ayer.",
          opciones: ["was", "were"],
          ok: s.bePas,
          porque: s.en + " → " + s.bePas,
        };
      },
    },

    {
      id: "to-be-negativo",
      grupo: "El verbo to be",
      nivel: 1,
      emo: "🚫",
      titulo: "Negar con to be",
      resumen: "No hace falta “do”: basta con agregar not",
      regla:
        "Con <i>be</i> negar es fácil, porque no necesita ayuda de nadie: se le pega <b>not</b> " +
        "detrás y listo.\n\n" +
        "<i>I am not · you are not · she is not</i>. En el día a día casi siempre se contrae: " +
        "<b>isn't</b>, <b>aren't</b>. Con <i>I</i> la contracción es <b>I'm not</b> — “amn't” no existe.\n\n" +
        "Ojo: esto es sólo con <i>be</i>. Con cualquier otro verbo hace falta <i>don't</i> o " +
        "<i>doesn't</i>, que es otra regla.",
      tabla: {
        cabecera: ["Completo", "Contraído", "Español"],
        filas: [
          ["I am not", "I'm not", "no soy / no estoy"],
          ["You are not", "You aren't", "no eres / no estás"],
          ["She is not", "She isn't", "ella no es / no está"],
          ["We are not", "We aren't", "no somos / no estamos"],
          ["It was not", "It wasn't", "no era / no estaba"],
        ],
      },
      clave: "be + not. Nunca “don't be” para describir algo.",
      error: { mal: "She doesn't be ready.", bien: "She isn't ready." },
      generar: function (rnd) {
        const s = alAzar(SUJETOS, rnd);
        const c = complementoPara(s, rnd);
        const contra = { am: "'m not", is: " isn't", are: " aren't" };
        return {
          frase: s.en + "___ " + c.en + ".",
          es: s.es + " no " + s[c.v] + " " + concordar(c, s.gen, s.num) + ".",
          opciones: ["'m not", " isn't", " aren't"],
          ok: contra[s.be],
          porque: s.en + " " + s.be + " → " + s.en + contra[s.be],
        };
      },
    },

    /* ===================== El presente ===================== */
    {
      id: "tercera-s",
      grupo: "El presente",
      nivel: 1,
      emo: "➕",
      titulo: "La -s de he, she, it",
      resumen: "El único cambio que tiene el presente en inglés",
      regla:
        "En español el verbo cambia con cada persona: trabajo, trabajas, trabaja, trabajamos, " +
        "trabajan. En inglés <b>no cambia nunca</b>… salvo en una: <b>he, she, it</b>, que le " +
        "agrega una <b>-s</b>.\n\n" +
        "<i>I work · you work · <b>she works</b> · we work · they work</i>.\n\n" +
        "Es una letra sola y es el error más frecuente de todos, porque en español no hay nada " +
        "parecido. Cualquier sujeto singular que no seas tú ni yo lleva la -s: “my sister works”, " +
        "“the machine works”.\n\n" +
        "Cómo se escribe esa -s: normalmente <b>-s</b>; <b>-es</b> si el verbo termina en " +
        "s, x, z, ch, sh u o; y si termina en consonante + y, la y se cambia por <b>-ies</b>.",
      tabla: {
        cabecera: ["Verbo", "he / she / it", "Por qué"],
        filas: [
          ["work", "works", "lo normal"],
          ["go", "goes", "termina en o"],
          ["watch", "watches", "termina en ch"],
          ["finish", "finishes", "termina en sh"],
          ["study", "studies", "consonante + y"],
          ["play", "plays", "vocal + y: no cambia"],
          ["have", "has", "irregular"],
        ],
      },
      clave: "he, she, it → el verbo lleva -s. Nadie más.",
      error: { mal: "She work in an office.", bien: "She works in an office." },
      generar: function (rnd) {
        const s = alAzar(SUJETOS, rnd);
        const v = alAzar(VERBOS, rnd);
        return {
          frase: s.en + " ___ " + v.obj + ".",
          es: "(" + v.es + ") " + s.es + "…",
          opciones: barajar([v.base, v.tercera], rnd),
          ok: s.tercera ? v.tercera : v.base,
          porque: s.tercera
            ? s.en + " es he/she/it → lleva -s: " + v.tercera
            : s.en + " no es he/she/it → el verbo va sin -s: " + v.base,
        };
      },
    },

    {
      id: "do-does",
      grupo: "El presente",
      nivel: 1,
      emo: "❓",
      titulo: "do y does",
      resumen: "Para preguntar y para negar en presente",
      regla:
        "En español se pregunta cambiando la entonación: “trabajas acá?”. En inglés eso no basta: " +
        "hay que poner un <b>auxiliar</b> adelante, y ese auxiliar es <b>do</b> o <b>does</b>.\n\n" +
        "<b>does</b> con he, she, it. <b>do</b> con todos los demás.\n\n" +
        "Y acá está la parte que casi todos fallan: <b>cuando aparece does, la -s se va del " +
        "verbo</b>. La -s ya está puesta en el does, y no puede estar en los dos sitios. " +
        "“Does she works?” es el error clásico; es “<b>Does she work?</b>”.\n\n" +
        "Para negar es lo mismo: <i>don't</i> y <i>doesn't</i>, y el verbo también queda sin -s.",
      tabla: {
        cabecera: ["", "Pregunta", "Negación"],
        filas: [
          ["I / you / we / they", "Do you work?", "I don't work"],
          ["he / she / it", "Does she work?", "She doesn't work"],
          ["ojo", "Does she works? ✗", "She doesn't works ✗"],
        ],
      },
      clave: "Si hay does o doesn't, el verbo va sin -s.",
      error: { mal: "Does she works here?", bien: "Does she work here?" },
      generar: function (rnd) {
        const s = alAzar(SUJETOS, rnd);
        const v = alAzar(VERBOS, rnd);
        const pregunta = (rnd || Math.random)() < 0.5;
        if (pregunta) {
          return {
            frase: "___ " + s.en.toLowerCase() + " " + v.base + " " + v.obj + "?",
            es: "¿" + s.es + " " + v.es + "…?",
            opciones: ["Do", "Does"],
            ok: s.tercera ? "Does" : "Do",
            porque: s.tercera ? s.en + " → Does" : s.en + " → Do",
          };
        }
        return {
          frase: s.en + " ___ " + v.base + " " + v.obj + ".",
          es: s.es + " no " + v.es + "…",
          opciones: ["don't", "doesn't"],
          ok: s.tercera ? "doesn't" : "don't",
          porque:
            (s.tercera ? s.en + " → doesn't" : s.en + " → don't") +
            ", y el verbo queda sin -s: " + v.base,
        };
      },
    },

    {
      id: "ing",
      grupo: "El presente",
      nivel: 1,
      emo: "🔄",
      titulo: "El -ing",
      resumen: "Lo que está pasando ahora mismo",
      regla:
        "El <b>-ing</b> es lo que en español hacemos con “-ando / -iendo”: estoy trabaj<b>ando</b>, " +
        "está com<b>iendo</b>. Y se arma igual: <b>be + verbo-ing</b>.\n\n" +
        "<i>I am working · she is eating · they are waiting</i>.\n\n" +
        "Lo importante: el <i>be</i> <b>nunca</b> se puede saltar. “I working” no existe; tiene que " +
        "ser “I am working”.\n\n" +
        "Se usa para lo que pasa <b>en este momento</b> o en esta temporada. Para lo que haces " +
        "siempre va el presente simple: “I work here” (todos los días) es distinto de " +
        "“I am working” (ahora mismo).\n\n" +
        "Cómo se escribe: normalmente <b>+ing</b>; si termina en <b>e</b> muda, esa e se cae " +
        "(make → making); y si es una sílaba que termina en vocal + consonante, la consonante " +
        "se dobla (stop → stopping).",
      tabla: {
        cabecera: ["Verbo", "-ing", "Por qué"],
        filas: [
          ["work", "working", "lo normal"],
          ["make", "making", "se cae la e muda"],
          ["live", "living", "se cae la e muda"],
          ["stop", "stopping", "se dobla la consonante"],
          ["study", "studying", "la y no cambia"],
          ["be", "being", "la e se queda: es su única vocal"],
        ],
      },
      clave: "be + -ing. El be no se salta nunca.",
      error: { mal: "I working now.", bien: "I am working now." },
      generar: function (rnd) {
        const s = alAzar(SUJETOS, rnd);
        const v = alAzar(VERBOS, rnd);
        const deForma = (rnd || Math.random)() < 0.5;
        if (deForma) {
          const malas = [v.base + "ing", v.base + "ing"];
          const distintas = [v.ing];
          if (v.base + "ing" !== v.ing) distintas.push(v.base + "ing");
          if (/e$/.test(v.base)) distintas.push(v.base.slice(0, -1) + "ing");
          distintas.push(v.base + v.base.slice(-1) + "ing");
          const op = [];
          distintas.forEach(function (x) { if (op.indexOf(x) < 0 && op.length < 3) op.push(x); });
          void malas;
          return {
            frase: s.en + " " + s.be + " ___ " + v.obj + " now.",
            es: "(" + v.es + ") " + s.es + " está…",
            opciones: barajar(op, rnd),
            ok: v.ing,
            porque: v.base + " → " + v.ing,
          };
        }
        return {
          frase: s.en + " ___ " + v.ing + " " + v.obj + " now.",
          es: s.es + " está " + v.es + "… ahora.",
          opciones: ["am", "is", "are"],
          ok: s.be,
          porque: "Hace falta be, y con " + s.en + " es " + s.be,
        };
      },
    },

    /* ===================== El pasado ===================== */
    {
      id: "pasado-ed",
      grupo: "El pasado",
      nivel: 1,
      emo: "📅",
      titulo: "El pasado con -ed",
      resumen: "La regla general, y cómo se escribe",
      regla:
        "Acá hay una buena noticia: el pasado en inglés <b>no cambia con la persona</b>. " +
        "Una sola forma para todos: <i>I worked, you worked, she worked, we worked, they worked</i>. " +
        "Nada de trabajé, trabajaste, trabajó.\n\n" +
        "La mayoría de los verbos hacen el pasado agregando <b>-ed</b>. A esos se les llama " +
        "<b>regulares</b>.\n\n" +
        "Cómo se escribe: normalmente <b>-ed</b>; si ya termina en <b>e</b>, sólo se agrega " +
        "<b>-d</b> (live → lived); si termina en consonante + <b>y</b>, la y pasa a " +
        "<b>-ied</b> (study → studied); y si es una sílaba de vocal + consonante, la consonante " +
        "se dobla (stop → stopped).",
      tabla: {
        cabecera: ["Verbo", "Pasado", "Por qué"],
        filas: [
          ["work", "worked", "lo normal"],
          ["live", "lived", "ya tenía e: sólo -d"],
          ["study", "studied", "consonante + y → ied"],
          ["play", "played", "vocal + y: no cambia"],
          ["stop", "stopped", "se dobla la consonante"],
          ["finish", "finished", "lo normal"],
        ],
      },
      clave: "Una sola forma para todas las personas.",
      error: { mal: "She worked, I workeded.", bien: "She worked, I worked." },
      generar: function (rnd) {
        const regulares = VERBOS.filter(function (v) { return !v.irregular; });
        const v = alAzar(regulares, rnd);
        const s = alAzar(SUJETOS, rnd);
        const op = [v.pas];
        if (v.base + "ed" !== v.pas) op.push(v.base + "ed");
        if (/y$/.test(v.base)) op.push(v.base.slice(0, -1) + "ied");
        else op.push(v.base + "d");
        const unicas = [];
        op.forEach(function (x) { if (unicas.indexOf(x) < 0 && unicas.length < 3) unicas.push(x); });
        return {
          frase: s.en + " ___ " + v.obj + " last week.",
          es: "(" + v.es + ") " + s.es + "… la semana pasada.",
          opciones: barajar(unicas, rnd),
          ok: v.pas,
          porque: v.base + " → " + v.pas,
        };
      },
    },

    {
      id: "pasado-irregular",
      grupo: "El pasado",
      nivel: 2,
      emo: "🌀",
      titulo: "Los verbos irregulares",
      resumen: "Los que no llevan -ed y hay que saberse",
      regla:
        "Unos doscientos verbos no siguen la regla del -ed, y son justamente los que más se usan: " +
        "go, have, make, take, see, come, get, say.\n\n" +
        "No hay ninguna lógica que ayude, así que no hay atajo: se aprenden. La buena noticia es " +
        "que con unos sesenta ya te desenvuelves en casi cualquier conversación, y que también " +
        "acá <b>la forma es la misma para todas las personas</b>.\n\n" +
        "Lo que sí conviene tener claro es la diferencia entre la segunda y la tercera forma: " +
        "<i>went</i> es el pasado (I went), <i>gone</i> es el participio, el que va después de " +
        "have (I have gone).",
      tabla: {
        cabecera: ["Base", "Pasado", "Participio"],
        filas: [
          ["go", "went", "gone"],
          ["make", "made", "made"],
          ["take", "took", "taken"],
          ["buy", "bought", "bought"],
          ["send", "sent", "sent"],
          ["pay", "paid", "paid"],
          ["write", "wrote", "written"],
        ],
      },
      clave: "No hay regla: se aprenden. Misma forma para todas las personas.",
      error: { mal: "I goed to the office.", bien: "I went to the office." },
      generar: function (rnd) {
        const irr = VERBOS.filter(function (v) { return v.irregular; });
        const v = alAzar(irr, rnd);
        const s = alAzar(SUJETOS, rnd);
        return {
          frase: s.en + " ___ " + v.obj + " yesterday.",
          es: "(" + v.es + ") " + s.es + "… ayer.",
          opciones: barajar([v.pas, v.base + "ed", v.base], rnd),
          ok: v.pas,
          porque: v.base + " es irregular: su pasado es " + v.pas + ", no " + v.base + "ed",
        };
      },
    },

    {
      id: "did",
      grupo: "El pasado",
      nivel: 1,
      emo: "🔙",
      titulo: "did",
      resumen: "Preguntar y negar en pasado — y el verbo vuelve a la base",
      regla:
        "Para preguntar y negar en pasado hay un solo auxiliar, <b>did</b>, igual para todas las " +
        "personas. Más fácil que el presente, que tiene do y does.\n\n" +
        "Pero tiene la misma trampa, y más grande: <b>cuando aparece did, el verbo vuelve a su " +
        "forma base</b>. El pasado ya está marcado en el <i>did</i>, y no se marca dos veces.\n\n" +
        "“Did you went?” es el error más común de todos. Es “<b>Did you go?</b>”.\n\n" +
        "Lo mismo al negar: “I didn't went” está mal; es “<b>I didn't go</b>”.",
      tabla: {
        cabecera: ["Afirmando", "Preguntando", "Negando"],
        filas: [
          ["I went", "Did you go?", "I didn't go"],
          ["She worked", "Did she work?", "She didn't work"],
          ["They paid", "Did they pay?", "They didn't pay"],
          ["ojo", "Did you went? ✗", "I didn't went ✗"],
        ],
      },
      clave: "Con did, el verbo va en base. El pasado se marca una sola vez.",
      error: { mal: "Did you went to the meeting?", bien: "Did you go to the meeting?" },
      generar: function (rnd) {
        const v = alAzar(VERBOS, rnd);
        const s = alAzar(SUJETOS, rnd);
        const pregunta = (rnd || Math.random)() < 0.5;
        if (pregunta) {
          return {
            frase: "Did " + s.en.toLowerCase() + " ___ " + v.obj + "?",
            es: "¿" + s.es + " " + v.es + "… ?",
            opciones: barajar([v.base, v.pas], rnd),
            ok: v.base,
            porque: "Después de did el verbo va en base: " + v.base + ", no " + v.pas,
          };
        }
        return {
          frase: s.en + " didn't ___ " + v.obj + ".",
          es: s.es + " no " + v.es + "…",
          opciones: barajar([v.base, v.pas], rnd),
          ok: v.base,
          porque: "Después de didn't el verbo va en base: " + v.base,
        };
      },
    },

    /* ===================== El futuro ===================== */
    {
      id: "will-going",
      grupo: "El futuro",
      nivel: 2,
      emo: "⏭️",
      titulo: "will y going to",
      resumen: "Dos futuros, y no significan lo mismo",
      regla:
        "El inglés tiene dos maneras de hablar del futuro, y la diferencia es <b>cuándo lo " +
        "decidiste</b>.\n\n" +
        "<b>will</b> es la decisión del momento, la promesa, la predicción: alguien dice que el " +
        "teléfono está sonando y contestas “I'll get it”. Lo decidiste recién.\n\n" +
        "<b>going to</b> es el plan que ya existía antes de abrir la boca: “I'm going to call the " +
        "supplier tomorrow” — ya estaba en tu lista.\n\n" +
        "Con <i>will</i> el verbo va siempre en base, sin to y sin -s: <i>she will work</i>, nunca " +
        "“she will works”.",
      tabla: {
        cabecera: ["Se usa para", "Forma", "Ejemplo"],
        filas: [
          ["decisión del momento", "will + base", "I'll call her now"],
          ["promesa", "will + base", "I will send it today"],
          ["predicción", "will + base", "It will rain"],
          ["plan ya decidido", "be going to + base", "I'm going to resign"],
          ["algo que se ve venir", "be going to + base", "It's going to rain"],
        ],
      },
      clave: "will = lo decido ahora · going to = ya estaba decidido",
      error: { mal: "She will works tomorrow.", bien: "She will work tomorrow." },
      generar: function (rnd) {
        const v = alAzar(VERBOS, rnd);
        const s = alAzar(SUJETOS, rnd);
        const deForma = (rnd || Math.random)() < 0.5;
        if (deForma) {
          return {
            frase: s.en + " will ___ " + v.obj + " tomorrow.",
            es: "(" + v.es + ") " + s.es + "… mañana.",
            opciones: barajar([v.base, v.tercera, "to " + v.base], rnd),
            ok: v.base,
            porque: "Después de will el verbo va en base, sin -s y sin to: " + v.base,
          };
        }
        return {
          frase: s.en + " ___ going to " + v.base + " " + v.obj + ".",
          es: s.es + " va a " + v.es + "…",
          opciones: ["am", "is", "are"],
          ok: s.be,
          porque: "going to lleva be delante, y con " + s.en + " es " + s.be,
        };
      },
    },

    {
      id: "perfecto",
      grupo: "El pasado",
      nivel: 3,
      emo: "🔗",
      titulo: "Present perfect o pasado simple",
      resumen: "“He trabajado” y “trabajé” no se reparten igual que en español",
      regla:
        "Ésta cuesta porque en español las dos formas existen pero se usan distinto.\n\n" +
        "El <b>pasado simple</b> (<i>I worked</i>) va cuando el momento está cerrado y " +
        "normalmente dicho: <i>yesterday, last week, in 2019, two hours ago</i>.\n\n" +
        "El <b>present perfect</b> (<i>I have worked</i>) va cuando el pasado todavía toca el " +
        "presente: no se dice cuándo, o el periodo sigue abierto. Con <i>ever, never, already, " +
        "yet, since, for</i>.\n\n" +
        "La prueba rápida: <b>si en la frase hay un momento terminado, va pasado simple</b>. " +
        "“I have seen her yesterday” está mal justamente por eso: <i>yesterday</i> ya cerró.",
      tabla: {
        cabecera: ["Pasado simple", "Present perfect", ""],
        filas: [
          ["I saw her yesterday", "I have seen her", "con o sin cuándo"],
          ["She worked here in 2019", "She has worked here for years", "cerrado / sigue abierto"],
          ["Did you call him?", "Have you called him yet?", "¿ya?"],
          ["I went to Lima last year", "I have never been to Lima", "never"],
        ],
      },
      clave: "¿Hay un momento terminado en la frase? → pasado simple.",
      error: { mal: "I have seen her yesterday.", bien: "I saw her yesterday." },
      generar: function (rnd) {
        const casos = [
          { frase: "I ___ her yesterday.", es: "La vi ayer.", op: ["saw", "have seen"], ok: "saw", porque: "yesterday es un momento cerrado → pasado simple" },
          { frase: "She ___ here since 2019.", es: "Ella trabaja acá desde 2019.", op: ["worked", "has worked"], ok: "has worked", porque: "since abre un periodo que sigue → present perfect" },
          { frase: "___ you ever ___ to London?", es: "¿Alguna vez has ido a Londres?", op: ["Have / been", "Did / go"], ok: "Have / been", porque: "ever pregunta por la vida entera → present perfect" },
          { frase: "We ___ the invoice last Friday.", es: "Pagamos la factura el viernes pasado.", op: ["paid", "have paid"], ok: "paid", porque: "last Friday ya cerró → pasado simple" },
          { frase: "I ___ finished the report.", es: "Ya terminé el informe.", op: ["have already", "already"], ok: "have already", porque: "already va con present perfect" },
          { frase: "They ___ the email two hours ago.", es: "Enviaron el correo hace dos horas.", op: ["sent", "have sent"], ok: "sent", porque: "ago marca un momento cerrado → pasado simple" },
          { frase: "He ___ never ___ to a meeting late.", es: "Él nunca ha llegado tarde a una reunión.", op: ["has / come", "did / come"], ok: "has / come", porque: "never sin fecha → present perfect" },
          { frase: "___ you ___ the supplier yet?", es: "¿Ya llamaste al proveedor?", op: ["Have / called", "Did / call"], ok: "Have / called", porque: "yet va con present perfect" },
          { frase: "She ___ for this company since March.", es: "Ella trabaja en esta empresa desde marzo.", op: ["worked", "has worked"], ok: "has worked", porque: "since abre un periodo que sigue → present perfect" },
          { frase: "I ___ him at the conference in 2019.", es: "Lo conocí en la conferencia en 2019.", op: ["met", "have met"], ok: "met", porque: "in 2019 es un momento cerrado → pasado simple" },
          { frase: "We ___ three quotes so far.", es: "Hemos recibido tres cotizaciones hasta ahora.", op: ["received", "have received"], ok: "have received", porque: "so far mira un periodo todavía abierto → present perfect" },
          { frase: "The courier ___ an hour ago.", es: "El repartidor llegó hace una hora.", op: ["arrived", "has arrived"], ok: "arrived", porque: "ago marca un momento cerrado → pasado simple" },
          { frase: "I ___ that email twice this morning.", es: "He leído ese correo dos veces esta mañana.", op: ["read", "have read"], ok: "have read", porque: "this morning sigue abierta si todavía es la mañana → present perfect" },
          { frase: "They ___ the contract last Monday.", es: "Firmaron el contrato el lunes pasado.", op: ["signed", "have signed"], ok: "signed", porque: "last Monday ya cerró → pasado simple" },
          { frase: "He ___ in Santiago for ten years.", es: "Él lleva diez años viviendo en Santiago.", op: ["lived", "has lived"], ok: "has lived", porque: "for + periodo que sigue → present perfect" },
          { frase: "___ she ___ the report when you asked?", es: "¿Envió el informe cuando le pediste?", op: ["Did / send", "Has / sent"], ok: "Did / send", porque: "pregunta por un momento concreto y cerrado → pasado simple" },
          { frase: "We ___ never ___ a problem with them.", es: "Nunca hemos tenido un problema con ellos.", op: ["have / had", "did / have"], ok: "have / had", porque: "never sin fecha → present perfect" },
        ];
        const c = alAzar(casos, rnd);
        return { frase: c.frase, es: c.es, opciones: barajar(c.op, rnd), ok: c.ok, porque: c.porque };
      },
    },

    /* ===================== Las piezas sueltas ===================== */
    {
      id: "a-an",
      grupo: "Las piezas sueltas",
      nivel: 1,
      emo: "🅰️",
      titulo: "a o an",
      resumen: "Depende del sonido, no de la letra",
      regla:
        "<b>a</b> antes de sonido de consonante, <b>an</b> antes de sonido de vocal. " +
        "Sirve sólo para no tener que parar la boca entre dos vocales.\n\n" +
        "Lo importante es que manda el <b>sonido</b>, no la letra escrita. Por eso es " +
        "“<b>a</b> university” (suena “iuniversity”, empieza con sonido de y) pero " +
        "“<b>an</b> hour” (la h no se pronuncia, suena “auer”).\n\n" +
        "Y una cosa que en español no pasa: los oficios y las nacionalidades <b>llevan artículo</b>. " +
        "“Soy contadora” es “I am <b>an</b> accountant”, no “I am accountant”.",
      tabla: {
        cabecera: ["Se dice", "Por qué", ""],
        filas: [
          ["a car", "suena a consonante", ""],
          ["an invoice", "suena a vocal", ""],
          ["an hour", "la h es muda", "trampa"],
          ["a university", "suena “iu”", "trampa"],
          ["a European country", "suena “iu”", "trampa"],
          ["an honest man", "la h es muda", "trampa"],
        ],
      },
      clave: "Manda el sonido, no la letra.",
      error: { mal: "I am accountant.", bien: "I am an accountant." },
      generar: function (rnd) {
        const casos = [
          { p: "car", ok: "a" }, { p: "invoice", ok: "an" }, { p: "hour", ok: "an", porque: "la h de hour es muda: suena a vocal" },
          { p: "university", ok: "a", porque: "university suena “iuniversity”: sonido de consonante" },
          { p: "email", ok: "an" }, { p: "meeting", ok: "a" }, { p: "accountant", ok: "an" },
          { p: "office", ok: "an" }, { p: "supplier", ok: "a" }, { p: "old computer", ok: "an" },
          { p: "European supplier", ok: "a", porque: "European suena “iuropean”: sonido de consonante" },
          { p: "honest answer", ok: "an", porque: "la h de honest es muda" },
          { p: "report", ok: "a" }, { p: "engineer", ok: "an" }, { p: "useful tool", ok: "a", porque: "useful suena “iusful”" },
          { p: "answer", ok: "an" }, { p: "problem", ok: "a" }, { p: "order", ok: "an" },
          { p: "receipt", ok: "a" }, { p: "appointment", ok: "an" }, { p: "folder", ok: "a" },
          { p: "umbrella", ok: "an" }, { p: "uniform", ok: "a", porque: "uniform suena “iuniform”" },
          { p: "idea", ok: "an" }, { p: "contract", ok: "a" }, { p: "example", ok: "an" },
          { p: "quote", ok: "a" }, { p: "hotel", ok: "a", porque: "acá la h sí se pronuncia" },
          { p: "hour and a half", ok: "an", porque: "la h de hour es muda" },
          { p: "big box", ok: "a" }, { p: "empty office", ok: "an" }, { p: "one-hour meeting", ok: "a", porque: "one suena “uan”: sonido de consonante" },
        ];
        const c = alAzar(casos, rnd);
        return {
          frase: "I need ___ " + c.p + ".",
          es: "Necesito un/una " + c.p + ".",
          opciones: ["a", "an"],
          ok: c.ok,
          porque: c.porque || (c.ok === "an" ? c.p + " empieza con sonido de vocal" : c.p + " empieza con sonido de consonante"),
        };
      },
    },

    {
      id: "there-is-are",
      grupo: "Las piezas sueltas",
      nivel: 1,
      emo: "📍",
      titulo: "there is / there are",
      resumen: "Nuestro “hay”, que en inglés sí cambia con el número",
      regla:
        "En español “hay” es una sola palabra para todo: hay un problema, hay tres problemas. " +
        "En inglés cambia según lo que venga <b>después</b>.\n\n" +
        "<b>There is</b> + singular. <b>There are</b> + plural.\n\n" +
        "En pasado: <b>there was</b> y <b>there were</b>.\n\n" +
        "El error típico es traducir “hay” por <i>have</i>: “In my office have five people” no " +
        "existe. <i>Have</i> es tener (alguien tiene algo); <i>there is</i> es que algo existe.",
      tabla: {
        cabecera: ["Español", "Inglés", ""],
        filas: [
          ["hay una reunión", "there is a meeting", "singular"],
          ["hay tres facturas", "there are three invoices", "plural"],
          ["había un problema", "there was a problem", "pasado singular"],
          ["había dos personas", "there were two people", "pasado plural"],
          ["¿hay algún problema?", "is there a problem?", "se da vuelta"],
        ],
      },
      clave: "there is + singular · there are + plural. Nunca “have”.",
      error: { mal: "In my office have five people.", bien: "There are five people in my office." },
      generar: function (rnd) {
        /* Cantidad + cosa + lugar, combinados: son cientos de frases, y el
         * número que decide la respuesta cae en sitios distintos cada vez. */
        const UNO = [
          { en: "a meeting", es: "una reunión" },
          { en: "a problem", es: "un problema" },
          { en: "a new supplier", es: "un proveedor nuevo" },
          { en: "an invoice", es: "una factura" },
          { en: "one person", es: "una persona" },
          { en: "no coffee", es: "nada de café" },
          { en: "a mistake", es: "un error" },
          { en: "a message for you", es: "un mensaje para ti" },
        ];
        const VARIOS = [
          { en: "three invoices", es: "tres facturas" },
          { en: "two people", es: "dos personas" },
          { en: "some documents", es: "unos documentos" },
          { en: "many things", es: "muchas cosas" },
          { en: "four meetings", es: "cuatro reuniones" },
          { en: "several mistakes", es: "varios errores" },
          { en: "twenty boxes", es: "veinte cajas" },
        ];
        const LUGARES = [
          { en: "in the office", es: "en la oficina" },
          { en: "on the desk", es: "en el escritorio" },
          { en: "in the system", es: "en el sistema" },
          { en: "here", es: "acá" },
          { en: "at the meeting", es: "en la reunión" },
          { en: "in the folder", es: "en la carpeta" },
        ];
        const plural = (rnd || Math.random)() < 0.5;
        const cosa = alAzar(plural ? VARIOS : UNO, rnd);
        const lug = alAzar(LUGARES, rnd);
        const c = { c: cosa.en + " " + lug.en, n: plural ? 2 : 1, es: cosa.es + " " + lug.es };
        return {
          frase: "There ___ " + c.c + ".",
          es: "Hay " + c.es + ".",
          opciones: ["is", "are"],
          ok: c.n === 1 ? "is" : "are",
          porque: c.n === 1 ? "lo que viene después es singular → is" : "lo que viene después es plural → are",
        };
      },
    },

    {
      id: "have-has",
      grupo: "Las piezas sueltas",
      nivel: 1,
      emo: "🤲",
      titulo: "have y has",
      resumen: "Tener, y el auxiliar del present perfect",
      regla:
        "<b>have</b> con I, you, we, they. <b>has</b> con he, she, it. Es la misma regla de la -s " +
        "de tercera persona, sólo que <i>have</i> la hace de forma irregular: no es “haves”, es " +
        "<b>has</b>.\n\n" +
        "En pasado hay una sola forma para todos: <b>had</b>.\n\n" +
        "Y ojo con una diferencia del español: para la edad, el inglés usa <i>be</i>, no <i>have</i>. " +
        "“Tengo treinta años” es “I <b>am</b> thirty”, nunca “I have thirty years”.",
      tabla: {
        cabecera: ["Sujeto", "Presente", "Pasado"],
        filas: [
          ["I / you / we / they", "have", "had"],
          ["he / she / it", "has", "had"],
          ["negando", "don't have / doesn't have", "didn't have"],
          ["la edad", "I am thirty", "no “I have thirty”"],
        ],
      },
      clave: "he, she, it → has. Todos los demás → have.",
      error: { mal: "She have two children.", bien: "She has two children." },
      generar: function (rnd) {
        const cosas = [
          { en: "two children", es: "dos hijos" },
          { en: "a new car", es: "un auto nuevo" },
          { en: "a meeting at three", es: "una reunión a las tres" },
          // "no + sustantivo" niega en inglés sin tocar el verbo; en español
          // la negación se va al verbo, así que la traducción se arma aparte.
          { en: "no time today", es: "tiempo hoy", neg: true },
          { en: "the invoice here", es: "la factura acá" },
          { en: "a lot of work", es: "mucho trabajo" },
          { en: "a question", es: "una pregunta" },
          { en: "the wrong address", es: "la dirección equivocada" },
        ];
        // Tener algo es cosa de personas: "the invoices have a new car" no.
        const s = alAzar(SUJETOS.filter(function (x) { return x.vivo; }), rnd);
        const c = alAzar(cosas, rnd);
        return {
          frase: s.en + " ___ " + c.en + ".",
          es: s.es + (c.neg ? " no " : " ") + s.tiene + " " + c.es + ".",
          opciones: ["have", "has"],
          ok: s.have,
          porque: s.en + " → " + s.have,
        };
      },
    },

    {
      id: "plural-s",
      grupo: "Las piezas sueltas",
      nivel: 1,
      emo: "📚",
      titulo: "El plural",
      resumen: "-s, -es, y los que no siguen la regla",
      regla:
        "Casi todo hace el plural con <b>-s</b>. Se agrega <b>-es</b> cuando la palabra termina en " +
        "s, x, z, ch o sh, porque sin la e no se podría pronunciar. Y consonante + y pasa a " +
        "<b>-ies</b>.\n\n" +
        "Hay un puñado de irregulares que hay que saberse porque se usan mucho: " +
        "<i>child → children, man → men, woman → women, person → people</i>.\n\n" +
        "Y lo que más se olvida: <b>el adjetivo no lleva plural</b>. Es “two red cars”, nunca " +
        "“two reds cars”.",
      tabla: {
        cabecera: ["Singular", "Plural", "Por qué"],
        filas: [
          ["car", "cars", "lo normal"],
          ["box", "boxes", "termina en x"],
          ["watch", "watches", "termina en ch"],
          ["company", "companies", "consonante + y"],
          ["day", "days", "vocal + y: no cambia"],
          ["child", "children", "irregular"],
          ["person", "people", "irregular"],
        ],
      },
      clave: "El adjetivo nunca lleva plural.",
      error: { mal: "two reds cars", bien: "two red cars" },
      generar: function (rnd) {
        const casos = [
          { s: "car", p: "cars" }, { s: "box", p: "boxes", porque: "termina en x → -es" },
          { s: "company", p: "companies", porque: "consonante + y → -ies" },
          { s: "day", p: "days", porque: "vocal + y → sólo -s" },
          { s: "watch", p: "watches", porque: "termina en ch → -es" },
          { s: "child", p: "children", porque: "irregular" },
          { s: "person", p: "people", porque: "irregular" },
          { s: "invoice", p: "invoices" }, { s: "country", p: "countries", porque: "consonante + y → -ies" },
          { s: "office", p: "offices" }, { s: "man", p: "men", porque: "irregular" },
          { s: "address", p: "addresses", porque: "termina en s → -es" },
          { s: "woman", p: "women", porque: "irregular" }, { s: "foot", p: "feet", porque: "irregular" },
          { s: "city", p: "cities", porque: "consonante + y → -ies" },
          { s: "boss", p: "bosses", porque: "termina en s → -es" },
          { s: "key", p: "keys", porque: "vocal + y → sólo -s" },
          { s: "family", p: "families", porque: "consonante + y → -ies" },
          { s: "dish", p: "dishes", porque: "termina en sh → -es" },
          { s: "tax", p: "taxes", porque: "termina en x → -es" },
          { s: "price", p: "prices" }, { s: "client", p: "clients" },
          { s: "delivery", p: "deliveries", porque: "consonante + y → -ies" },
          { s: "church", p: "churches", porque: "termina en ch → -es" },
          { s: "tooth", p: "teeth", porque: "irregular" },
          { s: "holiday", p: "holidays", porque: "vocal + y → sólo -s" },
        ];
        const c = alAzar(casos, rnd);
        const op = [c.p];
        if (c.s + "s" !== c.p) op.push(c.s + "s");
        if (c.s + "es" !== c.p) op.push(c.s + "es");
        const unicas = [];
        op.forEach(function (x) { if (unicas.indexOf(x) < 0 && unicas.length < 3) unicas.push(x); });
        return {
          frase: "We have three ___.",
          es: "Tenemos tres " + c.s + "…",
          opciones: barajar(unicas, rnd),
          ok: c.p,
          porque: c.s + " → " + c.p + (c.porque ? " (" + c.porque + ")" : ""),
        };
      },
    },

    {
      id: "adjetivo-orden",
      grupo: "Las piezas sueltas",
      nivel: 1,
      emo: "🎨",
      titulo: "Dónde va el adjetivo",
      resumen: "Antes del sustantivo, al revés que en español",
      regla:
        "En español el adjetivo va <b>después</b>: “un auto rojo”. En inglés va <b>antes</b>: " +
        "“a red car”. Siempre, cuando acompaña a un sustantivo.\n\n" +
        "Y no cambia nunca: ni por género ni por número. Rojo, roja, rojos y rojas son las " +
        "cuatro la misma palabra, <b>red</b>.\n\n" +
        "La única vez que va al final es después de <i>be</i>: “The car <b>is red</b>”. Ahí no " +
        "acompaña al sustantivo, lo describe.",
      tabla: {
        cabecera: ["Español", "Inglés", ""],
        filas: [
          ["un auto rojo", "a red car", "adjetivo primero"],
          ["dos autos rojos", "two red cars", "red sin -s"],
          ["una reunión importante", "an important meeting", ""],
          ["El auto es rojo", "The car is red", "tras be sí va al final"],
        ],
      },
      clave: "Adjetivo + sustantivo. Y el adjetivo nunca cambia.",
      error: { mal: "I need a folder new.", bien: "I need a new folder." },
      generar: function (rnd) {
        /* Se combinan adjetivos y sustantivos en vez de usar pares fijos: con
         * siete ejemplos escritos a mano se aprende la lista, no la regla. Así
         * salen más de cien frases distintas y hay que pensarla cada vez.
         * Los sustantivos llevan su género para que la traducción de apoyo
         * concuerde, que es lo único que se complica al combinar. */
        const ADJ = [
          { en: "new", m: "nuevo", f: "nueva" },
          { en: "old", m: "viejo", f: "vieja" },
          { en: "red", m: "rojo", f: "roja" },
          { en: "long", m: "largo", f: "larga" },
          { en: "important", m: "importante", f: "importante" },
          { en: "difficult", m: "difícil", f: "difícil" },
          { en: "expensive", m: "caro", f: "cara" },
          { en: "small", m: "pequeño", f: "pequeña" },
        ];
        const SUS = [
          { en: "folder", es: "carpeta", g: "f", art: "una" },
          { en: "car", es: "auto", g: "m", art: "un" },
          { en: "email", es: "correo", g: "m", art: "un" },
          { en: "meeting", es: "reunión", g: "f", art: "una" },
          { en: "question", es: "pregunta", g: "f", art: "una" },
          { en: "computer", es: "computador", g: "m", art: "un" },
          { en: "supplier", es: "proveedor", g: "m", art: "un" },
          { en: "invoice", es: "factura", g: "f", art: "una" },
          { en: "report", es: "informe", g: "m", art: "un" },
        ];
        const a = alAzar(ADJ, rnd);
        const n = alAzar(SUS, rnd);
        return {
          frase: "I need a ___.",
          es: "Necesito " + n.art + " " + n.es + " " + a[n.g] + ".",
          opciones: barajar([a.en + " " + n.en, n.en + " " + a.en], rnd),
          ok: a.en + " " + n.en,
          porque: "El adjetivo va antes del sustantivo: " + a.en + " " + n.en,
        };
      },
    },

    {
      id: "comparativo",
      grupo: "Las piezas sueltas",
      nivel: 2,
      emo: "⚖️",
      titulo: "Comparar",
      resumen: "-er para las cortas, more para las largas",
      regla:
        "En español siempre es “más …”. En inglés depende del <b>largo</b> de la palabra.\n\n" +
        "Una o dos sílabas → se le agrega <b>-er</b>: <i>cheap → cheaper, big → bigger, " +
        "easy → easier</i>.\n\n" +
        "Tres sílabas o más → va <b>more</b> delante: <i>more expensive, more important, " +
        "more difficult</i>.\n\n" +
        "Nunca las dos cosas: “more cheaper” es el error clásico.\n\n" +
        "Y el “que” de la comparación es <b>than</b>, no “that”: <i>cheaper than this one</i>.\n\n" +
        "Irregulares que hay que saberse: <i>good → better</i>, <i>bad → worse</i>.",
      tabla: {
        cabecera: ["Adjetivo", "Comparativo", "Por qué"],
        filas: [
          ["cheap", "cheaper", "una sílaba"],
          ["big", "bigger", "se dobla la consonante"],
          ["easy", "easier", "y → ier"],
          ["expensive", "more expensive", "tres sílabas"],
          ["important", "more important", "tres sílabas"],
          ["good", "better", "irregular"],
          ["bad", "worse", "irregular"],
        ],
      },
      clave: "Corta → -er. Larga → more. Nunca las dos.",
      error: { mal: "This is more cheaper.", bien: "This is cheaper." },
      generar: function (rnd) {
        const casos = [
          { a: "cheap", ok: "cheaper", porque: "una sílaba → -er" },
          { a: "expensive", ok: "more expensive", porque: "tres sílabas → more" },
          { a: "big", ok: "bigger", porque: "una sílaba, se dobla la consonante" },
          { a: "important", ok: "more important", porque: "tres sílabas → more" },
          { a: "easy", ok: "easier", porque: "dos sílabas en y → -ier" },
          { a: "good", ok: "better", porque: "irregular" },
          { a: "bad", ok: "worse", porque: "irregular" },
          { a: "difficult", ok: "more difficult", porque: "tres sílabas → more" },
          { a: "fast", ok: "faster", porque: "una sílaba → -er" },
        ];
        const MAS = [
          { a: "cheap", ok: "cheaper", porque: "una sílaba → -er" },
          { a: "slow", ok: "slower", porque: "una sílaba → -er" },
          { a: "heavy", ok: "heavier", porque: "dos sílabas en y → -ier" },
          { a: "simple", ok: "simpler", porque: "dos sílabas: admite -er" },
          { a: "useful", ok: "more useful", porque: "no admite -er → more" },
          { a: "reliable", ok: "more reliable", porque: "cuatro sílabas → more" },
          { a: "complicated", ok: "more complicated", porque: "cuatro sílabas → more" },
          { a: "small", ok: "smaller", porque: "una sílaba → -er" },
        ];
        const CONTEXTOS = [
          { en: "This one is ___ than the other.", es: "Éste es más @ que el otro." },
          { en: "The new supplier is ___ than the old one.", es: "El proveedor nuevo es más @ que el antiguo." },
          { en: "Sending it by email is ___ than posting it.", es: "Mandarlo por correo es más @ que enviarlo por carta." },
          { en: "This option looks ___ than the first one.", es: "Esta opción se ve más @ que la primera." },
          { en: "Their price is ___ than ours.", es: "Su precio es más @ que el nuestro." },
        ];
        const c = alAzar(casos.concat(MAS), rnd);
        const ctx = alAzar(CONTEXTOS, rnd);
        const op = [c.ok];
        if (c.ok.indexOf("more ") === 0) op.push(c.a + "er");
        else op.push("more " + c.a);
        op.push("more " + c.ok);
        return {
          frase: ctx.en,
          es: ctx.es.replace("@", c.a),
          opciones: barajar(op.slice(0, 3), rnd),
          ok: c.ok,
          porque: c.a + " → " + c.ok + " (" + c.porque + ")",
        };
      },
    },
  ];

  const GRUPOS = [];
  REGLAS.forEach(function (r) {
    if (GRUPOS.indexOf(r.grupo) < 0) GRUPOS.push(r.grupo);
  });

  const porId = {};
  REGLAS.forEach(function (r) { porId[r.id] = r; });

  window.APP = window.APP || {};
  APP.datosReglas = {
    REGLAS: REGLAS,
    GRUPOS: GRUPOS,
    regla: function (id) { return porId[id] || null; },
    delGrupo: function (g) {
      return REGLAS.filter(function (r) { return r.grupo === g; });
    },
    delNivel: function (n) {
      return REGLAS.filter(function (r) { return r.nivel <= n; });
    },
  };
})();
