/* Los 100 verbos que de verdad se usan, con todas sus formas.
 *
 * Un verbo inglés tiene cinco formas y con esas cinco se arman todos los
 * tiempos. Por eso el banco guarda las cinco y no una lista de tiempos: el
 * módulo de verbos construye presente, pasado, futuro, continuo y perfecto a
 * partir de acá, y agregar un tiempo nuevo no obliga a reescribir los datos.
 *
 *   base        speak      la forma del diccionario
 *   tercera     speaks     he / she / it en presente
 *   pasado      spoke      pasado simple
 *   participio  spoken     para los perfectos (have spoken) y la pasiva
 *   gerundio    speaking   para los continuos (is speaking)
 *
 * "tercera" y "gerundio" se calculan con reglas y sólo se escriben acá cuando
 * la regla falla; así no hay cien campos que mantener a mano y equivocarse.
 *
 * "obj" es un complemento natural: sin él las frases de práctica salían raras
 * ("The manager feels every day"), y una frase que no se entiende no enseña
 * nada.
 *
 * "nivel" ordena por utilidad real, no por dificultad gramatical: 1 son los
 * que aparecen en cualquier conversación, 3 los que se agradecen después.
 */
(function () {
  "use strict";

  const VERBOS = [
    // ---------- Nivel 1: los imprescindibles ----------
    { base: "be", pasado: "was", pasado2: "were", participio: "been", tercera: "is", es: "ser / estar", obj: "tired", irregular: true, nivel: 1 },
    { base: "have", pasado: "had", participio: "had", tercera: "has", es: "tener", obj: "a meeting", irregular: true, nivel: 1 },
    { base: "do", pasado: "did", participio: "done", tercera: "does", es: "hacer", obj: "the paperwork", irregular: true, nivel: 1 },
    { base: "go", pasado: "went", participio: "gone", tercera: "goes", es: "ir", obj: "to the office", irregular: true, nivel: 1 },
    { base: "say", pasado: "said", participio: "said", es: "decir", obj: "hello", irregular: true, nivel: 1 },
    { base: "get", pasado: "got", participio: "got", gerundio: "getting", es: "obtener / conseguir", obj: "an email", irregular: true, nivel: 1 },
    { base: "make", pasado: "made", participio: "made", es: "hacer / fabricar", obj: "coffee", irregular: true, nivel: 1 },
    { base: "know", pasado: "knew", participio: "known", es: "saber / conocer", obj: "the answer", irregular: true, nivel: 1 },
    { base: "think", pasado: "thought", participio: "thought", es: "pensar", obj: "about work", irregular: true, nivel: 1 },
    { base: "take", pasado: "took", participio: "taken", es: "tomar / llevar", obj: "the bus", irregular: true, nivel: 1 },
    { base: "see", pasado: "saw", participio: "seen", es: "ver", obj: "her family", irregular: true, nivel: 1 },
    { base: "come", pasado: "came", participio: "come", es: "venir", obj: "early", irregular: true, nivel: 1 },
    { base: "want", pasado: "wanted", participio: "wanted", es: "querer", obj: "more time", irregular: false, nivel: 1 },
    { base: "give", pasado: "gave", participio: "given", es: "dar", obj: "advice", irregular: true, nivel: 1 },
    { base: "use", pasado: "used", participio: "used", es: "usar", obj: "the computer", irregular: false, nivel: 1 },
    { base: "find", pasado: "found", participio: "found", es: "encontrar", obj: "the invoice", irregular: true, nivel: 1 },
    { base: "work", pasado: "worked", participio: "worked", es: "trabajar", obj: "from home", irregular: false, nivel: 1 },
    { base: "eat", pasado: "ate", participio: "eaten", es: "comer", obj: "at home", irregular: true, nivel: 1 },
    { base: "speak", pasado: "spoke", participio: "spoken", es: "hablar", obj: "English", irregular: true, nivel: 1 },
    { base: "live", pasado: "lived", participio: "lived", es: "vivir", obj: "in Santiago", irregular: false, nivel: 1 },
    { base: "need", pasado: "needed", participio: "needed", es: "necesitar", obj: "more time", irregular: false, nivel: 1 },
    { base: "like", pasado: "liked", participio: "liked", es: "gustar", obj: "this song", irregular: false, nivel: 1 },
    { base: "look", pasado: "looked", participio: "looked", es: "mirar / parecer", obj: "tired", irregular: false, nivel: 1 },
    { base: "call", pasado: "called", participio: "called", es: "llamar", obj: "the supplier", irregular: false, nivel: 1 },
    { base: "ask", pasado: "asked", participio: "asked", es: "preguntar / pedir", obj: "a question", irregular: false, nivel: 1 },
    { base: "help", pasado: "helped", participio: "helped", es: "ayudar", obj: "the team", irregular: false, nivel: 1 },
    { base: "put", pasado: "put", participio: "put", gerundio: "putting", es: "poner", obj: "the files away", irregular: true, nivel: 1 },
    { base: "tell", pasado: "told", participio: "told", es: "contar / decir", obj: "the truth", irregular: true, nivel: 1 },
    { base: "feel", pasado: "felt", participio: "felt", es: "sentir", obj: "better", irregular: true, nivel: 1 },
    { base: "leave", pasado: "left", participio: "left", es: "irse / dejar", obj: "at six", irregular: true, nivel: 1 },

    // ---------- Nivel 2: la conversación diaria ----------
    { base: "write", pasado: "wrote", participio: "written", es: "escribir", obj: "reports", irregular: true, nivel: 2 },
    { base: "read", pasado: "read", participio: "read", es: "leer", obj: "the news", irregular: true, nivel: 2, nota: "Se escribe igual en las tres formas, pero el pasado se pronuncia /red/." },
    { base: "buy", pasado: "bought", participio: "bought", es: "comprar", obj: "the tickets", irregular: true, nivel: 2 },
    { base: "sell", pasado: "sold", participio: "sold", es: "vender", obj: "the old car", irregular: true, nivel: 2 },
    { base: "pay", pasado: "paid", participio: "paid", es: "pagar", obj: "the invoice", irregular: true, nivel: 2 },
    { base: "send", pasado: "sent", participio: "sent", es: "enviar", obj: "the report", irregular: true, nivel: 2 },
    { base: "study", pasado: "studied", participio: "studied", tercera: "studies", es: "estudiar", obj: "English", irregular: false, nivel: 2 },
    { base: "play", pasado: "played", participio: "played", es: "jugar / tocar", obj: "tennis", irregular: false, nivel: 2 },
    { base: "begin", pasado: "began", participio: "begun", gerundio: "beginning", es: "empezar", obj: "at nine", irregular: true, nivel: 2 },
    { base: "run", pasado: "ran", participio: "run", gerundio: "running", es: "correr", obj: "in the park", irregular: true, nivel: 2 },
    { base: "bring", pasado: "brought", participio: "brought", es: "traer", obj: "the documents", irregular: true, nivel: 2 },
    { base: "buy", pasado: "bought", participio: "bought", es: "comprar", obj: "the tickets", irregular: true, nivel: 2, oculto: true },
    { base: "understand", pasado: "understood", participio: "understood", es: "entender", obj: "the problem", irregular: true, nivel: 2 },
    { base: "keep", pasado: "kept", participio: "kept", es: "guardar / mantener", obj: "the receipts", irregular: true, nivel: 2 },
    { base: "let", pasado: "let", participio: "let", gerundio: "letting", es: "dejar / permitir", obj: "me know", irregular: true, nivel: 2 },
    { base: "meet", pasado: "met", participio: "met", es: "conocer / reunirse", obj: "the client", irregular: true, nivel: 2 },
    { base: "pass", pasado: "passed", participio: "passed", tercera: "passes", es: "pasar / aprobar", obj: "the exam", irregular: false, nivel: 2 },
    { base: "start", pasado: "started", participio: "started", es: "empezar", obj: "early", irregular: false, nivel: 2 },
    { base: "stop", pasado: "stopped", participio: "stopped", gerundio: "stopping", es: "parar", obj: "the machine", irregular: false, nivel: 2 },
    { base: "try", pasado: "tried", participio: "tried", tercera: "tries", es: "intentar / probar", obj: "again", irregular: false, nivel: 2 },
    { base: "wait", pasado: "waited", participio: "waited", es: "esperar", obj: "for the bus", irregular: false, nivel: 2 },
    { base: "walk", pasado: "walked", participio: "walked", es: "caminar", obj: "to work", irregular: false, nivel: 2 },
    { base: "watch", pasado: "watched", participio: "watched", tercera: "watches", es: "ver / mirar", obj: "a film", irregular: false, nivel: 2 },
    { base: "listen", pasado: "listened", participio: "listened", es: "escuchar", obj: "to music", irregular: false, nivel: 2 },
    { base: "learn", pasado: "learned", pasado2: "learnt", participio: "learned", es: "aprender", obj: "something new", irregular: false, nivel: 2, nota: "En inglés británico también se acepta “learnt”." },
    { base: "teach", pasado: "taught", participio: "taught", tercera: "teaches", es: "enseñar", obj: "English", irregular: true, nivel: 2 },
    { base: "open", pasado: "opened", participio: "opened", es: "abrir", obj: "the door", irregular: false, nivel: 2 },
    { base: "close", pasado: "closed", participio: "closed", es: "cerrar", obj: "the account", irregular: false, nivel: 2 },
    { base: "drive", pasado: "drove", participio: "driven", es: "conducir / manejar", obj: "to the office", irregular: true, nivel: 2 },
    { base: "sleep", pasado: "slept", participio: "slept", es: "dormir", obj: "eight hours", irregular: true, nivel: 2 },
    { base: "drink", pasado: "drank", participio: "drunk", es: "beber / tomar", obj: "coffee", irregular: true, nivel: 2 },
    { base: "sit", pasado: "sat", participio: "sat", gerundio: "sitting", es: "sentarse", obj: "at the front", irregular: true, nivel: 2 },
    { base: "stand", pasado: "stood", participio: "stood", es: "estar de pie", obj: "in line", irregular: true, nivel: 2 },
    { base: "wear", pasado: "wore", participio: "worn", es: "usar / llevar puesto", obj: "a coat", irregular: true, nivel: 2 },
    { base: "win", pasado: "won", participio: "won", gerundio: "winning", es: "ganar", obj: "the contract", irregular: true, nivel: 2 },
    { base: "lose", pasado: "lost", participio: "lost", es: "perder", obj: "the keys", irregular: true, nivel: 2 },
    { base: "spend", pasado: "spent", participio: "spent", es: "gastar / pasar tiempo", obj: "too much", irregular: true, nivel: 2 },
    { base: "cost", pasado: "cost", participio: "cost", es: "costar", obj: "a fortune", irregular: true, nivel: 2 },
    { base: "change", pasado: "changed", participio: "changed", es: "cambiar", obj: "the date", irregular: false, nivel: 2 },
    { base: "check", pasado: "checked", participio: "checked", es: "revisar", obj: "the numbers", irregular: false, nivel: 2 },
    { base: "answer", pasado: "answered", participio: "answered", es: "responder", obj: "the email", irregular: false, nivel: 2 },
    { base: "arrive", pasado: "arrived", participio: "arrived", es: "llegar", obj: "on time", irregular: false, nivel: 2 },
    { base: "travel", pasado: "travelled", participio: "travelled", gerundio: "travelling", es: "viajar", obj: "for work", irregular: false, nivel: 2, nota: "Ortografía británica con doble L; en EE.UU. se escribe “traveled”." },
    { base: "cook", pasado: "cooked", participio: "cooked", es: "cocinar", obj: "dinner", irregular: false, nivel: 2 },
    { base: "clean", pasado: "cleaned", participio: "cleaned", es: "limpiar", obj: "the kitchen", irregular: false, nivel: 2 },
    { base: "wake", pasado: "woke", participio: "woken", es: "despertar", obj: "up early", irregular: true, nivel: 2 },

    // ---------- Nivel 3: para expresarse con más soltura ----------
    { base: "become", pasado: "became", participio: "become", es: "convertirse en", obj: "a manager", irregular: true, nivel: 3 },
    { base: "believe", pasado: "believed", participio: "believed", es: "creer", obj: "the story", irregular: false, nivel: 3 },
    { base: "build", pasado: "built", participio: "built", es: "construir", obj: "a house", irregular: true, nivel: 3 },
    { base: "choose", pasado: "chose", participio: "chosen", es: "elegir", obj: "the best option", irregular: true, nivel: 3 },
    { base: "cut", pasado: "cut", participio: "cut", gerundio: "cutting", es: "cortar", obj: "the costs", irregular: true, nivel: 3 },
    { base: "decide", pasado: "decided", participio: "decided", es: "decidir", obj: "tomorrow", irregular: false, nivel: 3 },
    { base: "explain", pasado: "explained", participio: "explained", es: "explicar", obj: "the delay", irregular: false, nivel: 3 },
    { base: "fall", pasado: "fell", participio: "fallen", es: "caer", obj: "asleep", irregular: true, nivel: 3 },
    { base: "fly", pasado: "flew", participio: "flown", tercera: "flies", es: "volar", obj: "to Lima", irregular: true, nivel: 3 },
    { base: "forget", pasado: "forgot", participio: "forgotten", gerundio: "forgetting", es: "olvidar", obj: "the password", irregular: true, nivel: 3 },
    { base: "grow", pasado: "grew", participio: "grown", es: "crecer / cultivar", obj: "fast", irregular: true, nivel: 3 },
    { base: "hear", pasado: "heard", participio: "heard", es: "oír", obj: "the news", irregular: true, nivel: 3 },
    { base: "hold", pasado: "held", participio: "held", es: "sostener / celebrar", obj: "a meeting", irregular: true, nivel: 3 },
    { base: "improve", pasado: "improved", participio: "improved", es: "mejorar", obj: "her English", irregular: false, nivel: 3 },
    { base: "include", pasado: "included", participio: "included", es: "incluir", obj: "the taxes", irregular: false, nivel: 3 },
    { base: "lead", pasado: "led", participio: "led", es: "liderar / llevar a", obj: "the team", irregular: true, nivel: 3 },
    { base: "mean", pasado: "meant", participio: "meant", es: "significar / querer decir", obj: "something else", irregular: true, nivel: 3 },
    { base: "offer", pasado: "offered", participio: "offered", es: "ofrecer", obj: "a discount", irregular: false, nivel: 3 },
    { base: "order", pasado: "ordered", participio: "ordered", es: "pedir / ordenar", obj: "the materials", irregular: false, nivel: 3 },
    { base: "prefer", pasado: "preferred", participio: "preferred", gerundio: "preferring", es: "preferir", obj: "the morning", irregular: false, nivel: 3 },
    { base: "receive", pasado: "received", participio: "received", es: "recibir", obj: "the payment", irregular: false, nivel: 3 },
    { base: "remember", pasado: "remembered", participio: "remembered", es: "recordar", obj: "the meeting", irregular: false, nivel: 3 },
    { base: "sign", pasado: "signed", participio: "signed", es: "firmar", obj: "the contract", irregular: false, nivel: 3 },
    { base: "sing", pasado: "sang", participio: "sung", es: "cantar", obj: "in English", irregular: true, nivel: 3 },
    { base: "swim", pasado: "swam", participio: "swum", gerundio: "swimming", es: "nadar", obj: "every morning", irregular: true, nivel: 3 },
    { base: "throw", pasado: "threw", participio: "thrown", es: "lanzar / botar", obj: "it away", irregular: true, nivel: 3 },
    { base: "wish", pasado: "wished", participio: "wished", tercera: "wishes", es: "desear", obj: "good luck", irregular: false, nivel: 3 },
  ];

  // El banco se limpia acá y no a mano: al escribir cien verbos es fácil
  // repetir uno sin darse cuenta, y un duplicado se preguntaría dos veces.
  const vistos = {};
  const LIMPIO = VERBOS.filter(function (v) {
    if (v.oculto || vistos[v.base]) return false;
    vistos[v.base] = true;
    return true;
  });

  window.APP = window.APP || {};
  APP.datosVerbos = { VERBOS: LIMPIO };
})();
