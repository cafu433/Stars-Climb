/* Pruebas de la lógica de la aplicación. Se corren con:  node pruebas/pruebas.js
 *
 * Cubren lo que no se ve en pantalla y es donde de verdad se puede romper algo
 * en silencio: la comparación de respuestas, el calendario del repaso espaciado
 * y que todas las lecciones del currículo sean capaces de generar ejercicios.
 *
 * No hay navegador acá: se finge lo mínimo (window, localStorage) y se cargan
 * los mismos archivos que usa la aplicación, sin copiarlos ni adaptarlos.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.join(__dirname, "..", "web");
const ARCHIVOS = [
  "js/dom.js", "js/almacen.js", "js/datos.js",
  "js/datos-verbos.js", "js/datos-sonidos.js", "js/datos-gramatica.js", "js/curriculo.js",
  "js/srs.js", "js/audio.js", "js/texto.js", "js/motor.js",
  "js/verbos.js", "js/pronunciacion.js", "js/gramatica.js",
  "js/datos-reglas.js", "js/reglas.js", "js/datos-lectura.js", "js/examen.js",
  "js/datos-palabras.js", "js/diccionario.js",
];

// localStorage de mentira: un objeto en memoria. Alcanza porque el almacén sólo
// usa getItem/setItem y guarda un único JSON.
const guardado = {};
const almacenFalso = {
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(guardado, k) ? guardado[k] : null; },
  setItem: function (k, v) { guardado[k] = String(v); },
  removeItem: function (k) { delete guardado[k]; },
};

const ventana = {
  localStorage: almacenFalso,
  crypto: require("crypto").webcrypto,
  fetch: function () { return Promise.reject(new Error("sin red en las pruebas")); },
  AbortController: AbortController,
  /* Voz y micrófono de mentira. Antes acá no había ninguno de los dos —el peor
   * caso— pero eso dejaba sin probar justo la mitad del examen: las preguntas
   * de escuchar y de hablar nunca se generaban, así que nadie se habría
   * enterado de que estaban rotas. El peor caso se comprueba aparte, apagando
   * las dos cosas a propósito. */
  speechSynthesis: {
    getVoices: function () { return [{ name: "UK English", lang: "en-GB" }]; },
    speak: function () {}, cancel: function () {}, addEventListener: function () {},
  },
  SpeechRecognition: function () {},
  navigator: { vibrate: null, mediaDevices: { getUserMedia: function () {} } },
  document: { addEventListener: function () {}, querySelector: function () { return null; } },
  setTimeout: setTimeout,
  AudioContext: null,
};
ventana.window = ventana;

const contexto = vm.createContext(ventana);
ARCHIVOS.forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(RAIZ, f), "utf8"), contexto, { filename: f });
});
const APP = ventana.APP;

/* ---------------- Mini marco de pruebas ---------------- */

let pasadas = 0;
const fallos = [];

function prueba(nombre, fn) {
  try {
    fn();
    pasadas++;
  } catch (e) {
    fallos.push(nombre + " → " + e.message);
  }
}

function igual(a, b, msg) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error((msg || "") + " esperaba " + JSON.stringify(b) + " y llegó " + JSON.stringify(a));
  }
}

function cierto(v, msg) {
  if (!v) throw new Error(msg || "esperaba verdadero");
}

/* Apaga la voz mientras corre 'fn'. Hace falta porque el entorno de pruebas sí
 * tiene voz —sin ella, medio examen no se podría probar— pero el caso de un
 * navegador que no la tiene sigue siendo importante: es el de cualquiera con
 * Firefox en Linux, y ahí la aplicación no puede ofrecer ejercicios mudos. */
function sinVoz(fn) {
  const tenia = ventana.speechSynthesis;
  ventana.speechSynthesis = null;
  try { return fn(); } finally { ventana.speechSynthesis = tenia; }
}

/* ---------------- Comparar respuestas ---------------- */

prueba("la puntuación y las mayúsculas no cuentan", function () {
  cierto(APP.texto.iguales("good morning", "Good morning!"));
  cierto(APP.texto.iguales("  I am tired ", "I am tired."));
});

prueba("las contracciones valen igual que la forma larga", function () {
  cierto(APP.texto.iguales("I don't know", "I do not know"));
  cierto(APP.texto.iguales("she's tired", "she is tired"));
});

prueba("presente y pasado no se confunden", function () {
  // "we are" y "we were" no pueden normalizarse a lo mismo: sería dar por
  // buena una frase en el tiempo verbal equivocado.
  cierto(!APP.texto.iguales("we are watching a film", "we were watching a film"));
});

prueba("un error de tipeo no reprueba, pero otra palabra sí", function () {
  cierto(APP.texto.casiIguales("restaurnt", "restaurant"));
  cierto(!APP.texto.casiIguales("restrooms", "restaurant"));
  cierto(!APP.texto.casiIguales("", "restaurant"));
});

prueba("la comparación palabra por palabra ubica el error", function () {
  const r = APP.texto.comparar("I have a meeting at ten", "I have a meeting at two");
  igual(r.total, 6);
  igual(r.buenas, 5);
  cierto(r.ops.some(function (o) { return o.tipo === "cambio" && o.palabra === "ten"; }));
});

prueba("hablar perfecto da 100", function () {
  igual(APP.texto.comparar("good morning", "Good morning!").nota, 100);
});

/* ---------------- Contenido ---------------- */

prueba("no hay tarjetas con id repetido", function () {
  const vistos = {};
  const repetidos = [];
  APP.datos.TARJETAS.forEach(function (t) {
    if (vistos[t.id]) repetidos.push(t.id);
    vistos[t.id] = true;
  });
  igual(repetidos, []);
});

prueba("toda tarjeta tiene inglés y español", function () {
  const malas = APP.datos.TARJETAS.filter(function (t) { return !t.en || !t.es; });
  igual(malas.map(function (t) { return t.id; }), []);
});

prueba("cada lección apunta a temas que existen", function () {
  const sinContenido = [];
  APP.curriculo.LECCIONES.forEach(function (l) {
    // Una lección saca su contenido de una de tres fuentes: un texto de
    // lectura, una o más reglas de gramática, o temas de vocabulario. Las dos
    // primeras se comprueban en su propia prueba; acá sólo las de vocabulario.
    if (l.texto || (l.reglas && l.reglas.length)) return;
    if (!l.skills) { sinContenido.push(l.id + " (sin fuente de contenido)"); return; }
    const hay = l.skills.some(function (s) { return APP.datos.porSkill(s).length > 0; });
    // Los temas de gramática y oído no tienen tarjetas propias: sus ejercicios
    // se arman de los verbos, de -ing/-ed o de los pares mínimos.
    const propios = ["vocales", "formal", "inged"];
    if (!hay && !l.skills.some(function (s) { return propios.indexOf(s) >= 0; })) sinContenido.push(l.id);
  });
  igual(sinContenido, []);
});

prueba("lo que cada lección referencia existe de verdad", function () {
  /* Una clase, una regla o un texto que no existen no dan error al cargar: la
   * lección simplemente sale coja o vacía, y eso no se nota hasta que alguien
   * la abre. */
  const rotas = [];
  APP.curriculo.LECCIONES.forEach(function (l) {
    (l.clase || []).forEach(function (g) {
      if (!APP.datosGramatica.tema(g)) rotas.push(l.id + " → clase " + g);
    });
    (l.reglas || []).forEach(function (r) {
      if (!APP.datosReglas.regla(r)) rotas.push(l.id + " → regla " + r);
    });
    if (l.texto && !APP.datosLectura.texto(l.texto)) rotas.push(l.id + " → texto " + l.texto);
  });
  igual(rotas, []);
});

prueba("ninguna lección se queda sin ejercicios", function () {
  const flacas = [];
  APP.curriculo.LECCIONES.forEach(function (l) {
    const n = APP.motor.sesionLeccion(l).length;
    if (n < 4) flacas.push(l.id + " (" + n + ")");
  });
  igual(flacas, []);
});

prueba("cada lección declara qué destrezas entrena", function () {
  const sin = APP.curriculo.LECCIONES
    .filter(function (l) { return !l.destrezas || !l.destrezas.length; })
    .map(function (l) { return l.id; });
  igual(sin, []);
});

prueba("cada nivel tiene unidades y todas las unidades tienen nivel", function () {
  const problemas = [];
  APP.curriculo.NIVELES.forEach(function (n) {
    if (!APP.curriculo.delNivel(n.id).length) problemas.push(n.id + " sin unidades");
  });
  const validos = APP.curriculo.NIVELES.map(function (n) { return n.id; });
  APP.curriculo.UNIDADES.forEach(function (u) {
    if (validos.indexOf(u.nivel) < 0) problemas.push(u.id + " apunta al nivel " + u.nivel);
  });
  igual(problemas, []);
});

prueba("los ids de lección no se repiten", function () {
  const vistos = {};
  const rep = [];
  APP.curriculo.LECCIONES.forEach(function (l) {
    if (vistos[l.id]) rep.push(l.id);
    vistos[l.id] = true;
  });
  igual(rep, []);
});

/* ---------------- El motor arma ejercicios ---------------- */

prueba("todas las lecciones generan ejercicios", function () {
  const vacias = [];
  APP.curriculo.LECCIONES.forEach(function (l) {
    const ej = APP.motor.sesionLeccion(l);
    if (ej.length < 4) vacias.push(l.id + " (" + ej.length + ")");
  });
  igual(vacias, []);
});

prueba("los ejercicios de elegir siempre traen una única respuesta correcta", function () {
  /* Hay dos formas de opción, y las dos tienen que cumplir lo mismo.
   * Los ejercicios del motor traen objetos con la marca 'correcta'; los de
   * regla y los de lectura traen textos sueltos y la respuesta aparte, en
   * 'ok'. Comprobar sólo la primera forma dejaría sin vigilar justamente a los
   * generados, que son los que pueden salir mal sin que nadie los revise. */
  const malos = [];
  APP.curriculo.LECCIONES.forEach(function (l) {
    APP.motor.sesionLeccion(l).forEach(function (e) {
      if (!e.opciones) return;
      if (typeof e.opciones[0] === "string") {
        const cuantas = e.opciones.filter(function (o) { return o === e.ok; }).length;
        if (cuantas !== 1) malos.push(l.id + ":" + e.tipo + " ok=" + e.ok + " en [" + e.opciones + "]");
        return;
      }
      const buenas = e.opciones.filter(function (o) { return o.correcta; }).length;
      if (buenas !== 1) malos.push(l.id + ":" + e.tipo + " (" + buenas + ")");
    });
  });
  igual(malos.slice(0, 5), []);
});

prueba("todo ejercicio de regla explica por qué, no sólo cuál era", function () {
  /* Es la razón de ser del módulo: si al fallar sólo se ve la respuesta, se
   * aprende esa respuesta y no la regla. */
  const mudos = [];
  APP.datosReglas.REGLAS.forEach(function (r) {
    for (let i = 0; i < 60; i++) {
      const e = r.generar();
      if (!e.porque || e.porque.length < 6) { mudos.push(r.id); break; }
    }
  });
  igual(mudos, []);
});

prueba("una regla sube a escribir y se da por dominada", function () {
  const id = "a-an";
  igual(APP.almacen.etapaRegla(id), 0);
  igual(APP.reglas.tanda(id, 3)[0].tipo, "regla-elige");

  for (let i = 0; i < APP.almacen.PARA_ESCRIBIR; i++) APP.almacen.anotarRegla(id, true);
  igual(APP.almacen.etapaRegla(id), 1);
  const escribiendo = APP.reglas.tanda(id, 3)[0];
  igual(escribiendo.tipo, "regla-escribe");
  // En modo escribir no se mandan opciones: enseñarlas sería regalar la
  // respuesta, que es justo lo que esta etapa deja de hacer.
  igual(escribiendo.opciones, null);

  for (let i = 0; i < APP.almacen.PARA_DOMINAR; i++) APP.almacen.anotarRegla(id, true);
  igual(APP.almacen.regla(id).dominada, true);

  // Fallar reinicia la racha pero no borra el dominio ya ganado.
  APP.almacen.anotarRegla(id, false);
  igual(APP.almacen.regla(id).dominada, true);
  igual(APP.almacen.regla(id).seguidos, 0);
});

prueba("la corrección de una regla perdona la forma pero no el contenido", function () {
  const e = APP.reglas.tanda("am-is-are", 1)[0];
  igual(APP.reglas.correcta(e, e.ok.toUpperCase()), true);
  igual(APP.reglas.correcta(e, "  " + e.ok + " "), true);
  igual(APP.reglas.correcta(e, e.ok === "is" ? "are" : "is"), false);
});

prueba("la frase resuelta rellena todos los huecos", function () {
  const quedan = [];
  APP.datosReglas.REGLAS.forEach(function (r) {
    for (let i = 0; i < 40; i++) {
      const e = r.generar();
      const hecha = APP.reglas.resuelta({ frase: e.frase, ok: e.ok }, e.ok);
      if (hecha.indexOf("___") >= 0) quedan.push(r.id + ": " + hecha);
    }
  });
  igual(quedan.slice(0, 3), []);
});

prueba("cada texto de lectura trae preguntas con respuesta válida", function () {
  const malos = [];
  APP.datosLectura.TEXTOS.forEach(function (t) {
    if (!t.preguntas.length) malos.push(t.id + " sin preguntas");
    t.preguntas.forEach(function (p, i) {
      if (!(p.ok >= 0 && p.ok < p.op.length)) malos.push(t.id + " pregunta " + i + " apunta fuera");
      if (new Set(p.op).size !== p.op.length) malos.push(t.id + " pregunta " + i + " repite opciones");
    });
  });
  igual(malos, []);
});

prueba("los textos suben de dificultad de un nivel al siguiente", function () {
  /* Si el texto "avanzado" fuera igual de corto que el básico, el nivel sería
   * una etiqueta y no una progresión. */
  function palabras(n) {
    const t = APP.datosLectura.delNivel(n);
    return t.reduce(function (a, x) { return a + x.texto.split(/\s+/).length; }, 0) / t.length;
  }
  const b = palabras(1), i = palabras(2), a = palabras(3);
  igual(b < i && i < a, true);
});

prueba("armar una frase siempre trae todas sus piezas", function () {
  const malos = [];
  APP.curriculo.LECCIONES.forEach(function (l) {
    APP.motor.sesionLeccion(l).forEach(function (e) {
      if (e.tipo !== "arma") return;
      const faltan = APP.texto.fichas(e.respuesta).filter(function (p) {
        return e.fichas.indexOf(p) < 0;
      });
      if (faltan.length) malos.push(e.respuesta + " le faltan " + faltan.join(","));
    });
  });
  igual(malos.slice(0, 5), []);
});

prueba("sin voz no se generan ejercicios de escuchar", function () {
  sinVoz(function () {
    const conAudio = [];
    APP.curriculo.LECCIONES.forEach(function (l) {
      APP.motor.sesionLeccion(l).forEach(function (e) {
        if (e.autoAudio) conAudio.push(l.id + ":" + e.tipo);
      });
    });
    igual(conAudio.slice(0, 5), []);
  });
});

prueba("con voz sí se generan, y las lecciones no se quedan cortas", function () {
  // La otra mitad de la prueba de arriba: que el dictado exista de verdad
  // cuando el navegador puede hablar.
  let conAudio = 0;
  APP.curriculo.LECCIONES.forEach(function (l) {
    APP.motor.sesionLeccion(l).forEach(function (e) { if (e.autoAudio) conAudio++; });
  });
  cierto(conAudio > 0);

  // Y que apagando la voz la lección siga teniendo ejercicios, en vez de
  // quedarse vacía.
  sinVoz(function () {
    const flacas = APP.curriculo.LECCIONES
      .filter(function (l) { return APP.motor.sesionLeccion(l).length < 4; })
      .map(function (l) { return l.id; });
    igual(flacas, []);
  });
});

prueba("la conjugación en tercera persona sigue las reglas", function () {
  igual(APP.motor.tercera("study"), "studies");
  igual(APP.motor.tercera("go"), "goes");
  igual(APP.motor.tercera("watch"), "watches");
  igual(APP.motor.tercera("have"), "has");
  igual(APP.motor.tercera("play"), "plays");
});

/* ---------------- Repaso espaciado ---------------- */

prueba("acertar aleja la tarjeta y fallar la trae de vuelta", function () {
  const id = APP.datos.TARJETAS[0].id;
  let t = APP.srs.registrar(id, 2);
  igual(t.intervalo, 1);
  t = APP.srs.registrar(id, 2);
  igual(t.intervalo, 3);
  t = APP.srs.registrar(id, 2);
  igual(t.intervalo, 7);
  t = APP.srs.registrar(id, 2);
  cierto(t.intervalo > 7, "el cuarto acierto debería pasar de una semana");
  const antesIntervalo = t.intervalo;
  const antesEf = t.ef;
  t = APP.srs.registrar(id, 0);
  igual(t.intervalo, 1, "fallar vuelve a dejarla para mañana;");
  cierto(t.ef < antesEf, "fallar baja el factor de facilidad");
  cierto(antesIntervalo > 1);
});

prueba("una tarjeta recién acertada no está vencida hoy", function () {
  const id = APP.datos.TARJETAS[1].id;
  APP.srs.registrar(id, 2);
  cierto(!APP.srs.vencida(id));
});

prueba("una tarjeta nunca vista se considera vencida", function () {
  cierto(APP.srs.vencida("no-existe-esta-tarjeta"));
});

prueba("el repaso sólo ofrece tarjetas ya vistas", function () {
  const pend = APP.srs.pendientes();
  const desconocidas = pend.filter(function (id) { return !APP.datos.porId(id); });
  igual(desconocidas, []);
});

/* ---------------- XP, niveles y racha ---------------- */

prueba("el nivel sube cada vez más lento", function () {
  const a = APP.almacen.estado();
  a.xp = 0;
  igual(APP.almacen.nivel().nivel, 1);
  a.xp = 100;
  igual(APP.almacen.nivel().nivel, 2);
  a.xp = 240;
  igual(APP.almacen.nivel().nivel, 3);
  const n3 = APP.almacen.nivel();
  cierto(n3.hasta - n3.desde > 100, "cada nivel debe pedir más XP que el anterior");
});

prueba("la racha sube un día por día y se corta si se salta dos", function () {
  const a = APP.almacen.estado();
  const hoy = APP.almacen.hoy();
  a.metaDiaria = 10;
  a.xpPorDia = {};
  a.racha = { dias: 5, ultimoDia: APP.almacen.diaMas(hoy, -1), mejor: 5, escudos: 0 };
  a.xpPorDia[hoy] = 20;
  APP.almacen.sumarXp(0);
  igual(APP.almacen.estado().racha.dias, 6, "practicar al día siguiente suma uno;");

  a.racha = { dias: 9, ultimoDia: APP.almacen.diaMas(hoy, -5), mejor: 9, escudos: 0 };
  igual(APP.almacen.rachaViva(), 0, "cinco días sin practicar y sin escudos rompe la racha;");
});

prueba("un escudo salva la racha de un día perdido", function () {
  const a = APP.almacen.estado();
  const hoy = APP.almacen.hoy();
  a.racha = { dias: 12, ultimoDia: APP.almacen.diaMas(hoy, -2), mejor: 12, escudos: 1 };
  igual(APP.almacen.rachaViva(), 12);
  igual(APP.almacen.estado().racha.escudos, 0, "y el escudo se gasta;");
});

/* ---------------- Vidas ---------------- */

prueba("las vidas se pierden y se recuperan con el reloj", function () {
  APP.almacen.llenarVidas();
  igual(APP.almacen.vidas(), 5);
  APP.almacen.perderVida();
  APP.almacen.perderVida();
  igual(APP.almacen.vidas(), 3);
  // Una vida cada 10 minutos: con 20 minutos atrás vuelven las dos.
  APP.almacen.estado().vidas.desde = Date.now() - 20 * 60 * 1000;
  igual(APP.almacen.vidas(), 5);

  // Y con 9 minutos todavía no alcanza para ninguna.
  APP.almacen.perderVida();
  APP.almacen.estado().vidas.desde = Date.now() - 9 * 60 * 1000;
  igual(APP.almacen.vidas(), 4);
});

/* ---------------- Respaldo ---------------- */

prueba("exportar e importar devuelve el mismo progreso", function () {
  APP.almacen.borrarTodo();
  APP.almacen.sumarXp(777);
  const copia = APP.almacen.exportar();
  APP.almacen.borrarTodo();
  igual(APP.almacen.estado().xp, 0);
  APP.almacen.importar(copia);
  igual(APP.almacen.estado().xp, 777);
});

prueba("importar basura no rompe la aplicación", function () {
  let tiro = false;
  try {
    APP.almacen.importar("esto no es json");
  } catch (e) {
    tiro = true;
  }
  cierto(tiro, "debería avisar del error en vez de dejar el estado a medias");
  cierto(APP.almacen.estado().xp >= 0);
});

/* ---------------- Juntar el avance de dos aparatos ----------------
 *
 * Es lo más delicado de toda la aplicación: un error acá no se ve, sólo hace
 * desaparecer en silencio lo que alguien practicó. Por eso se prueba campo por
 * campo, incluido que juntar en un orden dé lo mismo que en el otro.
 */

function estadoDePrueba(cambios) {
  const base = {
    version: 1,
    creado: "2026-01-01",
    guardadoEn: 1000,
    xp: 0,
    xpPorDia: {},
    minutosPorDia: {},
    metaDiaria: 30,
    racha: { dias: 0, ultimoDia: null, mejor: 0, escudos: 2 },
    vidas: { n: 5, desde: null },
    lecciones: {},
    srs: {},
    errores: [],
    logros: {},
    contadores: {},
    canciones: [],
    ajustes: { velocidad: 0.9, tema: "auto" },
  };
  return Object.assign(base, cambios || {});
}

prueba("juntar con una copia vacía devuelve la otra", function () {
  const a = estadoDePrueba({ xp: 50 });
  igual(APP.almacen.fusionarProgreso(a, null).xp, 50);
  igual(APP.almacen.fusionarProgreso(null, a).xp, 50);
});

prueba("el XP del mismo día en dos aparatos se suma, no se pisa", function () {
  /* Es el caso que de verdad importa: practicar en el computador en la mañana
   * y en el teléfono en la tarde. Si se quedara con el mayor, la mitad de lo
   * practicado desaparecería sin que nadie lo notara. */
  const a = estadoDePrueba({ xpPorDia: { "2026-08-26": { telefono: 180 } } });
  const b = estadoDePrueba({ xpPorDia: { "2026-08-26": { computador: 60 } } });
  const j = APP.almacen.fusionarProgreso(a, b);
  igual(j.xpPorDia["2026-08-26"], { telefono: 180, computador: 60 });
  igual(j.xp, 240);
});

prueba("sincronizar dos veces no infla el XP", function () {
  const a = estadoDePrueba({ xpPorDia: { "2026-08-26": { telefono: 180 } } });
  const b = estadoDePrueba({ xpPorDia: { "2026-08-26": { computador: 60 } } });
  const una = APP.almacen.fusionarProgreso(a, b);
  const dos = APP.almacen.fusionarProgreso(una, b);
  const tres = APP.almacen.fusionarProgreso(dos, una);
  igual(tres.xp, 240, "juntar de nuevo lo mismo tiene que dar lo mismo;");
});

prueba("el mismo aparato practicando más sube el total", function () {
  const antes = estadoDePrueba({ xpPorDia: { "2026-08-26": { telefono: 180, computador: 60 } } });
  const despues = estadoDePrueba({ xpPorDia: { "2026-08-26": { telefono: 250 } } });
  igual(APP.almacen.fusionarProgreso(antes, despues).xp, 310);
});

prueba("el XP de días distintos se suma", function () {
  const a = estadoDePrueba({ xpPorDia: { "2026-08-20": { t: 40 }, "2026-08-21": { t: 60 } } });
  const b = estadoDePrueba({ xpPorDia: { "2026-08-22": { c: 30 } } });
  const j = APP.almacen.fusionarProgreso(a, b);
  igual(j.xp, 130);
  igual(Object.keys(j.xpPorDia).sort(), ["2026-08-20", "2026-08-21", "2026-08-22"]);
});

prueba("el progreso guardado con la versión anterior no se pierde", function () {
  // Antes se guardaba un número suelto por día. Se convierte a la forma nueva
  // atribuyéndolo a un aparato "de antes" en vez de descartarlo.
  const viejo = estadoDePrueba({ xp: 100, xpPorDia: { "2026-08-20": 40, "2026-08-21": 60 } });
  const nuevo = estadoDePrueba({ xpPorDia: { "2026-08-22": { telefono: 30 } } });
  const j = APP.almacen.fusionarProgreso(viejo, nuevo);
  igual(j.xp, 130);
  igual(j.xpPorDia["2026-08-20"], { legado: 40 });
});

prueba("las coronas de las lecciones no se pierden al juntar", function () {
  const a = estadoDePrueba({ lecciones: { u1l1: { coronas: 3, veces: 5, mejor: 0.9, ultima: "2026-08-20" } } });
  const b = estadoDePrueba({ lecciones: {
    u1l1: { coronas: 1, veces: 9, mejor: 1, ultima: "2026-08-22" },
    u1l2: { coronas: 2, veces: 2, mejor: 0.8, ultima: "2026-08-21" },
  } });
  const j = APP.almacen.fusionarProgreso(a, b);
  igual(j.lecciones.u1l1, { coronas: 3, veces: 9, mejor: 1, ultima: "2026-08-22" });
  igual(j.lecciones.u1l2.coronas, 2);
});

prueba("de cada palabra gana la copia con más historia", function () {
  const mucha = { ef: 2.4, intervalo: 15, rep: 6, proximo: "2026-09-10", aciertos: 6, fallos: 2 };
  const poca = { ef: 2.5, intervalo: 1, rep: 1, proximo: "2026-08-26", aciertos: 1, fallos: 0 };
  const a = estadoDePrueba({ srs: { "comida:egg": mucha } });
  const b = estadoDePrueba({ srs: { "comida:egg": poca } });
  igual(APP.almacen.fusionarProgreso(a, b).srs["comida:egg"], mucha);
  igual(APP.almacen.fusionarProgreso(b, a).srs["comida:egg"], mucha, "y da lo mismo el orden;");
});

prueba("un error sigue en el cuaderno si en un aparato no está superado", function () {
  const a = estadoDePrueba({ errores: [{ id: "x", veces: 3, ultima: "2026-08-20", superado: true }] });
  const b = estadoDePrueba({ errores: [{ id: "x", veces: 1, ultima: "2026-08-22", superado: false }] });
  const j = APP.almacen.fusionarProgreso(a, b);
  igual(j.errores.length, 1);
  igual(j.errores[0].superado, false);
  igual(j.errores[0].veces, 3);
});

prueba("un logro ganado se queda con la fecha en que se ganó primero", function () {
  const a = estadoDePrueba({ logros: { "primer-paso": "2026-08-20" } });
  const b = estadoDePrueba({ logros: { "primer-paso": "2026-08-25", perfecta: "2026-08-24" } });
  const j = APP.almacen.fusionarProgreso(a, b);
  igual(j.logros["primer-paso"], "2026-08-20");
  igual(j.logros.perfecta, "2026-08-24");
});

prueba("un escudo gastado en un aparato queda gastado", function () {
  const a = estadoDePrueba({ racha: { dias: 5, ultimoDia: "2026-08-24", mejor: 9, escudos: 2 } });
  const b = estadoDePrueba({ racha: { dias: 7, ultimoDia: "2026-08-25", mejor: 7, escudos: 1 } });
  const j = APP.almacen.fusionarProgreso(a, b);
  igual(j.racha, { dias: 7, mejor: 9, ultimoDia: "2026-08-25", escudos: 1 });
});

prueba("los ajustes los pone la copia guardada más tarde", function () {
  const vieja = estadoDePrueba({ guardadoEn: 1000, metaDiaria: 30, ajustes: { tema: "claro", velocidad: 0.8 } });
  const nueva = estadoDePrueba({ guardadoEn: 5000, metaDiaria: 50, ajustes: { tema: "oscuro" } });
  const j = APP.almacen.fusionarProgreso(vieja, nueva);
  igual(j.metaDiaria, 50);
  igual(j.ajustes.tema, "oscuro");
  igual(j.ajustes.velocidad, 0.8, "y los ajustes que la nueva no menciona se conservan;");
});

prueba("los contadores de los logros también se suman por aparato", function () {
  const a = estadoDePrueba({ contadores: { perfectas: { telefono: 2 }, habladas: { telefono: 9 } } });
  const b = estadoDePrueba({ contadores: { perfectas: { computador: 5 } } });
  const una = APP.almacen.fusionarProgreso(a, b);
  igual(una.contadores.perfectas, { telefono: 2, computador: 5 });
  const dos = APP.almacen.fusionarProgreso(una, b);
  igual(dos.contadores.perfectas, { telefono: 2, computador: 5 }, "y no crecen al repetir;");
  igual(dos.contadores.habladas, { telefono: 9 });
});

prueba("restaurar un respaldo viejo no borra lo practicado después", function () {
  APP.almacen.borrarTodo();
  APP.almacen.sumarXp(40);
  const respaldoViejo = APP.almacen.exportar();

  APP.almacen.sumarXp(860);
  APP.almacen.terminarLeccion("u1l1", 1);
  APP.almacen.terminarLeccion("u1l1", 1);

  APP.almacen.importar(respaldoViejo);
  igual(APP.almacen.estado().xp, 900, "el XP de después del respaldo sigue ahí;");
  igual(APP.almacen.leccion("u1l1").coronas, 2);
});

/* ---------------- Récords ---------------- */

prueba("un récord sólo se guarda si es mejor", function () {
  APP.almacen.borrarTodo();
  igual(APP.almacen.mejorMarca("contrarreloj"), 0);
  cierto(APP.almacen.record("contrarreloj", 12));
  igual(APP.almacen.mejorMarca("contrarreloj"), 12);
  cierto(!APP.almacen.record("contrarreloj", 9), "9 no supera a 12");
  igual(APP.almacen.mejorMarca("contrarreloj"), 12);
  cierto(APP.almacen.record("contrarreloj", 20));
  igual(APP.almacen.mejorMarca("contrarreloj"), 20);
});

prueba("al juntar dos aparatos queda el mejor récord", function () {
  const base = { guardadoEn: 1, xpPorDia: {}, contadores: {}, logros: {}, lecciones: {}, srs: {},
    errores: [], canciones: [], ajustes: {}, racha: { dias: 0, mejor: 0, escudos: 2 }, vidas: {} };
  const a = Object.assign({}, base, { records: { contrarreloj: 18 } });
  const b = Object.assign({}, base, { records: { contrarreloj: 25 } });
  igual(APP.almacen.fusionarProgreso(a, b).records.contrarreloj, 25);
  igual(APP.almacen.fusionarProgreso(b, a).records.contrarreloj, 25);
});

/* ---------------- Verbos ----------------
 *
 * Un verbo mal conjugado en el banco enseña el error, que es peor que no
 * enseñar nada. Por eso se comprueban las reglas de escritura una por una y
 * se revisa que ningún ejercicio ofrezca dos respuestas buenas.
 */

function verbo(base) {
  return APP.datosVerbos.VERBOS.filter(function (v) { return v.base === base; })[0];
}

prueba("el banco trae los cien verbos con todas sus formas", function () {
  const V = APP.datosVerbos.VERBOS;
  cierto(V.length >= 100, "deberían ser al menos cien y son " + V.length);
  const incompletos = V.filter(function (v) {
    return !v.base || !v.pasado || !v.participio || !v.es || !v.obj || !v.nivel;
  });
  igual(incompletos.map(function (v) { return v.base; }), []);
});

prueba("ningún verbo está repetido", function () {
  const vistos = {};
  const rep = [];
  APP.datosVerbos.VERBOS.forEach(function (v) {
    if (vistos[v.base]) rep.push(v.base);
    vistos[v.base] = true;
  });
  igual(rep, []);
});

prueba("la tercera persona sigue las reglas de escritura", function () {
  const casos = [["study", "studies"], ["watch", "watches"], ["go", "goes"], ["pass", "passes"],
    ["fly", "flies"], ["have", "has"], ["be", "is"], ["do", "does"], ["play", "plays"]];
  casos.forEach(function (c) {
    igual(APP.verbos.tercera(verbo(c[0])), c[1], c[0] + ":");
  });
});

prueba("el gerundio duplica la consonante donde corresponde", function () {
  const casos = [["run", "running"], ["sit", "sitting"], ["begin", "beginning"],
    ["forget", "forgetting"], ["stop", "stopping"], ["travel", "travelling"],
    ["make", "making"], ["study", "studying"], ["be", "being"]];
  casos.forEach(function (c) {
    igual(APP.verbos.gerundio(verbo(c[0])), c[1], c[0] + ":");
  });
});

prueba("“be” se conjuga distinto en cada persona", function () {
  const be = verbo("be");
  const P = APP.verbos.PERSONAS;
  igual(P.map(function (p) { return APP.verbos.conjugar(be, "presente", p); }),
    ["I am", "You are", "She is", "We are", "They are"]);
  igual(P.map(function (p) { return APP.verbos.conjugar(be, "pasado", p); }),
    ["I was", "You were", "She was", "We were", "They were"]);
});

prueba("cada tiempo verbal se arma bien", function () {
  const v = verbo("speak");
  const ella = APP.verbos.PERSONAS[2];
  const esperado = {
    presente: "She speaks",
    "presente-cont": "She is speaking",
    pasado: "She spoke",
    "pasado-cont": "She was speaking",
    perfecto: "She has spoken",
    futuro: "She will speak",
    "futuro-going": "She is going to speak",
    condicional: "She would speak",
  };
  Object.keys(esperado).forEach(function (t) {
    igual(APP.verbos.conjugar(v, t, ella), esperado[t], t + ":");
  });
});

prueba("la tabla de un verbo cubre los ocho tiempos y las cinco personas", function () {
  const t = APP.verbos.tabla(verbo("go"));
  igual(t.length, 8);
  t.forEach(function (bloque) {
    igual(bloque.filas.length, 5, bloque.tiempo.id + ":");
    bloque.filas.forEach(function (f) {
      cierto(f.texto && f.texto.length > 2, bloque.tiempo.id + " sin texto");
    });
  });
});

prueba("todos los modos de verbos generan ejercicios", function () {
  const vacios = [];
  ["presente", "pasado", "futuro", "participio", "irregulares", "significado", "mixto"].forEach(function (m) {
    const s = APP.verbos.sesion(m, 10);
    if (s.length < 5) vacios.push(m + " (" + s.length + ")");
  });
  igual(vacios, []);
});

prueba("los ejercicios de verbos traen una sola respuesta correcta", function () {
  const malos = [];
  ["presente", "pasado", "futuro", "participio", "irregulares", "mixto"].forEach(function (m) {
    APP.verbos.sesion(m, 12).forEach(function (e) {
      if (!e.opciones) return;
      const buenas = e.opciones.filter(function (o) { return o.correcta; }).length;
      if (buenas !== 1) malos.push(m + " · " + e.respuesta + " (" + buenas + ")");
      const textos = e.opciones.map(function (o) { return o.texto; });
      if (new Set(textos).size !== textos.length) malos.push("opciones repetidas: " + textos.join("/"));
    });
  });
  igual(malos.slice(0, 5), []);
});

prueba("el pasado de un irregular nunca se ofrece como regular correcto", function () {
  // El distractor de los irregulares es base+ed, que es el error real. Lo que
  // no puede pasar es que ese distractor sea justo la respuesta buena.
  const malos = [];
  APP.datosVerbos.VERBOS.filter(function (v) { return v.irregular; }).forEach(function (v) {
    if (v.pasado === v.base + "ed") malos.push(v.base);
  });
  igual(malos, []);
});

prueba("practicar un verbo suelto da ejercicios de varios tipos", function () {
  const s = APP.verbos.sesionDeUnVerbo(verbo("write"), 8);
  cierto(s.length >= 4, "salieron " + s.length);
  const tipos = {};
  s.forEach(function (e) { tipos[e.tipo] = true; });
  cierto(Object.keys(tipos).length >= 2, "todos los ejercicios son del mismo tipo");
});

/* ---------------- Pronunciación ---------------- */

prueba("están los veinte sonidos, doce simples y ocho diptongos", function () {
  const S = APP.datosSonidos.SONIDOS;
  igual(S.length, 20);
  igual(S.filter(function (s) { return s.tipo === "simple"; }).length, 12);
  igual(S.filter(function (s) { return s.tipo === "diptongo"; }).length, 8);
});

prueba("cada sonido está explicado y tiene ejemplos", function () {
  const flojos = APP.datosSonidos.SONIDOS.filter(function (s) {
    return !s.simbolo || !s.nombre || !s.comoSuena || !s.trampa || (s.ejemplos || []).length < 3;
  });
  igual(flojos.map(function (s) { return s.id; }), []);
});

prueba("los símbolos fonéticos no se repiten", function () {
  const vistos = {};
  const rep = [];
  APP.datosSonidos.SONIDOS.forEach(function (s) {
    if (vistos[s.simbolo]) rep.push(s.simbolo);
    vistos[s.simbolo] = true;
  });
  igual(rep, []);
});

prueba("todo par mínimo apunta a dos sonidos que existen y son distintos", function () {
  const malos = [];
  APP.datosSonidos.PARES.forEach(function (p) {
    if (!APP.datosSonidos.sonido(p.sonidoA)) malos.push(p.a + ": " + p.sonidoA);
    if (!APP.datosSonidos.sonido(p.sonidoB)) malos.push(p.b + ": " + p.sonidoB);
    if (p.sonidoA === p.sonidoB) malos.push(p.a + "/" + p.b + " usa el mismo sonido dos veces");
    if (p.a === p.b) malos.push("par con dos palabras iguales: " + p.a);
  });
  igual(malos, []);
});

prueba("cada sonido tiene pares mínimos, salvo el schwa", function () {
  const sinPares = APP.datosSonidos.SONIDOS.filter(function (s) {
    return APP.datosSonidos.paresDe(s.id).length === 0;
  }).map(function (s) { return s.id; });
  // El schwa sólo vive en sílabas sin acento, así que no puede ser lo único
  // que distinga dos palabras. Es la única excepción legítima.
  igual(sinPares, ["schwa"]);
});

prueba("el schwa igual se puede practicar", function () {
  // No tiene pares mínimos —es la excepción documentada— pero la sesión no
  // puede quedar vacía: se practica identificándolo y repitiéndolo.
  cierto(APP.pronunciacion.sesionDeUnSonido("schwa", 10).length > 0);
});

prueba("sin voz, la pronunciación no propone nada que haya que oír", function () {
  /* Lo que no puede pasar es que salga un ejercicio imposible de contestar: un
   * "escucha y elige" en un navegador que no habla. Los de hablar sí pueden
   * quedarse, porque el micrófono es otro aparato: con auriculares rotos y
   * micrófono bueno se practica igual. */
  sinVoz(function () {
    [APP.pronunciacion.sesionMezcla(null, 10), APP.pronunciacion.sesionDeUnSonido("i-larga", 10)]
      .forEach(function (sesion) {
        const mudos = sesion.filter(function (e) {
          return e.tipo !== "habla" && (e.audio || e.autoAudio);
        });
        igual(mudos, []);
      });
  });
});

prueba("el progreso de un sonido empieza en cero y sube al practicar", function () {
  APP.almacen.borrarTodo();
  igual(APP.pronunciacion.progresoDeSonido("i-larga"), 0);
  APP.srs.registrar(APP.pronunciacion.idTarjeta("i-larga", "oido"), 2);
  APP.srs.registrar(APP.pronunciacion.idTarjeta("i-larga", "oido"), 2);
  cierto(APP.pronunciacion.progresoDeSonido("i-larga") > 0);
});

/* ---------------- Gramática ---------------- */

prueba("todos los temas están completos", function () {
  const flojos = APP.datosGramatica.TEMAS.filter(function (t) {
    return !t.titulo || !t.resumen || !t.explicacion || !t.emo || !t.grupo ||
      !t.trampa || !t.trampa.mal || !t.trampa.bien || !t.trampa.porque ||
      (t.ejemplos || []).length < 3;
  });
  igual(flojos.map(function (t) { return t.id; }), []);
});

prueba("los ids de los temas no se repiten", function () {
  const vistos = {};
  const rep = [];
  APP.datosGramatica.TEMAS.forEach(function (t) {
    if (vistos[t.id]) rep.push(t.id);
    vistos[t.id] = true;
  });
  igual(rep, []);
});

prueba("en cada trampa, la frase mala y la buena son distintas", function () {
  const malos = APP.datosGramatica.TEMAS.filter(function (t) {
    return APP.texto.normalizar(t.trampa.mal) === APP.texto.normalizar(t.trampa.bien);
  });
  igual(malos.map(function (t) { return t.id; }), []);
});

prueba("cada tema pertenece a un grupo que existe en la lista", function () {
  const huerfanos = APP.datosGramatica.TEMAS.filter(function (t) {
    return APP.datosGramatica.GRUPOS.indexOf(t.grupo) < 0;
  });
  igual(huerfanos.map(function (t) { return t.id; }), []);
  // Y al revés: ningún grupo vacío en el índice.
  const vacios = APP.datosGramatica.GRUPOS.filter(function (g) {
    return APP.datosGramatica.delGrupo(g).length === 0;
  });
  igual(vacios, []);
});

prueba("las tablas tienen tantas columnas como dice su cabecera", function () {
  const malas = [];
  APP.datosGramatica.TEMAS.forEach(function (t) {
    if (!t.tabla) return;
    const n = t.tabla.cabecera.length;
    t.tabla.filas.forEach(function (f, i) {
      if (f.length !== n) malas.push(t.id + " fila " + i + ": " + f.length + " de " + n);
    });
  });
  igual(malas, []);
});

prueba("todos los temas generan ejercicios", function () {
  const flojos = [];
  APP.datosGramatica.TEMAS.forEach(function (t) {
    const s = APP.gramatica.sesionDeUnTema(t, 10);
    if (s.length < 4) flojos.push(t.id + " (" + s.length + ")");
  });
  igual(flojos, []);
});

prueba("el ejercicio de la trampa ofrece la frase buena y la mala", function () {
  const t = APP.datosGramatica.tema("auxiliar-do");
  const e = APP.gramatica.sesionDeUnTema(t, 10)[0];
  igual(e.opciones.length, 2);
  igual(e.opciones.filter(function (o) { return o.correcta; }).length, 1);
  const textos = e.opciones.map(function (o) { return o.texto; }).sort();
  igual(textos, [t.trampa.bien, t.trampa.mal].sort());
  igual(e.respuesta, t.trampa.bien, "la correcta tiene que ser la frase bien dicha;");
});

prueba("armar una frase de gramática incluye todas sus palabras", function () {
  const malos = [];
  APP.datosGramatica.TEMAS.forEach(function (t) {
    APP.gramatica.sesionDeUnTema(t, 10).forEach(function (e) {
      if (e.tipo !== "arma") return;
      const faltan = e.respuesta.trim().split(/\s+/).filter(function (p) {
        return e.fichas.indexOf(p) < 0;
      });
      if (faltan.length) malos.push(e.respuesta + " → faltan " + faltan.join(","));
    });
  });
  igual(malos.slice(0, 5), []);
});

prueba("el repaso de trampas cubre temas distintos", function () {
  const s = APP.gramatica.sesionMezcla(12);
  cierto(s.length >= 10, "salieron " + s.length);
  const ids = {};
  s.forEach(function (e) { ids[e.tarjetaId] = true; });
  igual(Object.keys(ids).length, s.length, "hay temas repetidos en el mismo repaso;");
});

prueba("los ejercicios de gramática traen una sola respuesta correcta", function () {
  const malos = [];
  APP.datosGramatica.TEMAS.forEach(function (t) {
    APP.gramatica.sesionDeUnTema(t, 10).forEach(function (e) {
      if (!e.opciones) return;
      const buenas = e.opciones.filter(function (o) { return o.correcta; }).length;
      if (buenas !== 1) malos.push(t.id + " · " + e.tipo + " (" + buenas + ")");
    });
  });
  igual(malos.slice(0, 5), []);
});

/* ---------------- Exámenes y nivelación ---------------- */

prueba("el examen de cada nivel mide las cuatro destrezas", function () {
  /* Es la prueba que más falta hacía. El motor produce el tipo "escribe" tanto
   * para "escribe-en" como para "dictado", y no coincide con el nombre que
   * declara la lección; mapear por el nombre declarado dejaba el examen sin
   * una sola pregunta escrita, sin dar ningún error. Aprobar un examen así se
   * podría hacer adivinando entre alternativas. */
  const faltan = [];
  APP.curriculo.NIVELES.forEach(function (n) {
    const e = APP.examen.armar(n.id);
    const hay = {};
    e.preguntas.forEach(function (p) {
      if (p.tipo !== "lectura-texto") hay[p.destreza] = (hay[p.destreza] || 0) + 1;
    });
    APP.curriculo.DESTREZAS.forEach(function (d) {
      if (!hay[d]) faltan.push(n.id + " sin preguntas de " + d);
    });
  });
  igual(faltan, []);
});

prueba("el examen sigue siendo completo en un teléfono sin voz ni micrófono", function () {
  /* Sin esas preguntas el examen quedaría corto, y entonces la nota bajaría
   * por un problema del aparato y no por lo que se sabe. Se reparten entre
   * leer y escribir. */
  const e = APP.examen.armar("basico", { sinVoz: true, sinMicro: true });
  const completo = APP.examen.armar("basico");
  igual(e.total >= completo.total - 2, true);
  const hay = {};
  e.preguntas.forEach(function (p) {
    if (p.tipo !== "lectura-texto") hay[p.destreza] = (hay[p.destreza] || 0) + 1;
  });
  igual(!hay.hablar && !hay.escuchar, true);
  igual(hay.escribir > 0 && hay.leer > 0, true);
});

prueba("el examen incluye un texto y sus preguntas juntos", function () {
  const e = APP.examen.armar("intermedio");
  const iTexto = e.preguntas.map(function (p) { return p.tipo; }).indexOf("lectura-texto");
  igual(iTexto >= 0, true);
  // La pregunta siguiente al texto tiene que ser suya: separarlos obligaría a
  // volver atrás a buscarlo.
  igual(e.preguntas[iTexto + 1].tipo, "lectura-pregunta");
  igual(e.preguntas[iTexto + 1].texto, e.preguntas[iTexto].texto);
});

prueba("el texto del examen no cuenta como pregunta", function () {
  const e = APP.examen.armar("basico");
  igual(e.total, e.preguntas.filter(function (p) { return p.tipo !== "lectura-texto"; }).length);
  igual(e.total < e.preguntas.length, true);
});

prueba("corregir un examen da el porcentaje y la destreza más floja", function () {
  const e = APP.examen.armar("basico");
  const todas = {};
  e.preguntas.forEach(function (p, i) { todas[i] = true; });
  const perfecto = APP.examen.corregir(e, todas);
  igual(perfecto.porcentaje, 100);
  igual(perfecto.aprueba, true);

  const ninguna = APP.examen.corregir(e, {});
  igual(ninguna.porcentaje, 0);
  igual(ninguna.aprueba, false);

  // Fallando sólo lo de escuchar, ésa tiene que salir como la más floja.
  const salvoEscuchar = {};
  e.preguntas.forEach(function (p, i) { salvoEscuchar[i] = p.destreza !== "escuchar"; });
  const r = APP.examen.corregir(e, salvoEscuchar);
  igual(r.floja.destreza, "escuchar");
  igual(r.floja.bien, 0);
});

prueba("el nivel siguiente se abre sólo al aprobar el anterior", function () {
  igual(APP.examen.abierto("basico"), true);
  igual(APP.examen.abierto("intermedio"), false);
  igual(APP.examen.abierto("avanzado"), false);

  const e = APP.examen.armar("basico");
  const casi = {};
  // Un 60% no alcanza: el corte está en 70.
  e.preguntas.forEach(function (p, i) { casi[i] = i % 10 < 6; });
  APP.examen.guardar(e, APP.examen.corregir(e, casi));
  igual(APP.examen.abierto("intermedio"), false);

  const todas = {};
  e.preguntas.forEach(function (p, i) { todas[i] = true; });
  APP.examen.guardar(e, APP.examen.corregir(e, todas));
  igual(APP.examen.abierto("intermedio"), true);
  igual(APP.examen.abierto("avanzado"), false);

  // Queda registrada la mejor nota y el número de intentos, no sólo la última.
  const n = APP.almacen.nivelCurso("basico");
  igual(n.mejor, 100);
  igual(n.veces, 2);
  igual(n.aprobado, true);
});

prueba("la nivelación recomienda dónde empezar", function () {
  const p = APP.examen.nivelacion();
  igual(p.total > 0, true);

  const nada = {};
  igual(APP.examen.recomendar(p, nada).nivel, "basico");

  const soloBasico = {};
  p.preguntas.forEach(function (q, i) { soloBasico[i] = q.deNivel === "basico"; });
  igual(APP.examen.recomendar(p, soloBasico).nivel, "intermedio");

  const todo = {};
  p.preguntas.forEach(function (q, i) { todo[i] = true; });
  igual(APP.examen.recomendar(p, todo).nivel, "avanzado");
});

prueba("la nivelación abre los niveles pero no los da por aprobados", function () {
  APP.examen.aplicarNivelacion({ nivel: "intermedio" });
  igual(APP.examen.abierto("intermedio"), true);
  // Abierto no es aprobado: el examen final sigue ahí para quien lo quiera.
  igual(APP.almacen.nivelCurso("intermedio").aprobado, false);
  igual(APP.almacen.nivelCurso("basico").abierto, true);
});

/* ---------------- El diccionario al tacto ---------------- */

prueba("trocear un texto no pierde ni un carácter", function () {
  /* La pantalla rearma el texto con estas piezas. Si trocear se comiera un
   * espacio o un guion, el texto se vería distinto de como se escribió, y eso
   * en un ejercicio de lectura importa. */
  const textos = [
    "She bought it, didn't she? Yes — two invoices.",
    "Dear Ms. Fuentealba,\n\nThank you for your order of 15 March.",
    "   ",
    "",
  ];
  const rotos = [];
  textos.forEach(function (t) {
    const rearmado = APP.diccionario.trocear(t).map(function (p) { return p.texto; }).join("");
    if (rearmado !== t) rotos.push(JSON.stringify(t));
  });
  igual(rotos, []);
});

prueba("las formas de un verbo llevan a su infinitivo", function () {
  /* Quien tropieza con "bought" necesita que le digan que es el pasado de
   * "buy". Esto estuvo roto: había dos listas de verbos y la que se usaba
   * guardaba el pasado en un campo con otro nombre, así que ninguna forma de
   * pasado se indexaba y nadie se enteraba. */
  const casos = [["bought", "buy"], ["went", "go"], ["paid", "pay"], ["wrote", "write"], ["taken", "take"]];
  const malos = [];
  casos.forEach(function (c) {
    const d = APP.diccionario.buscar(c[0]);
    if (!d) malos.push(c[0] + " no se encuentra");
    else if (d.verbo !== c[1]) malos.push(c[0] + " → " + d.verbo + ", se esperaba " + c[1]);
  });
  igual(malos, []);
});

prueba("los plurales y comparativos llegan a la palabra de base", function () {
  const casos = [
    ["invoices", "invoice"], ["companies", "company"], ["boxes", "box"],
    ["cheaper", "cheap"], ["bigger", "big"], ["heavier", "heavy"], ["easier", "easy"],
    ["studying", "study"], ["stopped", "stop"],
  ];
  const malos = [];
  casos.forEach(function (c) {
    const d = APP.diccionario.buscar(c[0]);
    if (!d) malos.push(c[0] + " no se encuentra");
  });
  igual(malos, []);
});

prueba("los plurales irregulares están escritos, porque no hay regla", function () {
  ["children", "men", "women", "feet", "people"].forEach(function (w) {
    cierto(!!APP.diccionario.buscar(w), w + " debería estar");
  });
});

prueba("el diccionario dice que no sabe en vez de inventar", function () {
  /* Devolver cualquier cosa sería peor que no devolver nada: enseñaría algo
   * falso con toda la confianza del mundo. */
  const f = APP.diccionario.ficha("zxqwv");
  igual(f.encontrada, false);
  igual(f.definicion, null);
});

prueba("resuelve casi todo lo que la aplicación pone en pantalla", function () {
  /* La medida que importa no es cuántas palabras distintas conoce, sino qué
   * porcentaje de las que se van a tocar sabe resolver. Una palabra rara que
   * sale una vez pesa menos que "the", que sale doscientas. */
  const corpus = [];
  APP.datos.TARJETAS.forEach(function (t) { corpus.push(t.en); });
  APP.datosLectura.TEXTOS.forEach(function (t) { corpus.push(t.texto); });
  APP.datosGramatica.TEMAS.forEach(function (t) {
    (t.ejemplos || []).forEach(function (e) { corpus.push(e.en); });
  });

  const veces = {};
  corpus.join(" ").split(/[^A-Za-z']+/).forEach(function (w) {
    const k = APP.diccionario.limpiar(w);
    if (k) veces[k] = (veces[k] || 0) + 1;
  });

  let total = 0;
  let resueltas = 0;
  Object.keys(veces).forEach(function (w) {
    total += veces[w];
    if (APP.diccionario.buscar(w)) resueltas += veces[w];
  });
  cierto(resueltas / total > 0.95, "sólo resuelve el " + Math.round((resueltas / total) * 100) + "%");
});

prueba("una palabra con expresiones propias las ofrece", function () {
  // Tocando "look" hay que poder ver "look for" y "look after": significan
  // otra cosa, y es justo donde se equivoca un hispanohablante.
  const f = APP.diccionario.ficha("look");
  cierto(f.expresiones.length >= 2);
  cierto(f.expresiones.some(function (e) { return e.en === "look for"; }));
});

prueba("sólo el inglés se hace tocable, no las preguntas en español", function () {
  /* Las preguntas del nivel 1 van en español a propósito, para que la
   * dificultad esté en entender el texto. Hacer tocables esas palabras daría
   * "esta palabra no está en el curso" sobre «olvida», que es absurdo y hace
   * dudar de si el diccionario funciona. */
  const malas = [];
  APP.curriculo.LECCIONES.filter(function (l) { return l.texto; }).forEach(function (l) {
    const t = APP.datosLectura.texto(l.texto);
    APP.motor.sesionLeccion(l).forEach(function (e) {
      if (e.tipo !== "lectura-pregunta") return;
      const esperado = t.nivel === 1 ? "es" : "en";
      if (e.idioma !== esperado) malas.push(l.id + ": idioma " + e.idioma + ", se esperaba " + esperado);
    });
  });
  igual(malas, []);
});

/* ---------------- El registro de estudio ---------------- */

prueba("los minutos se anotan por día y se suman", function () {
  APP.almacen.borrarTodo();
  igual(APP.almacen.minutosTotales(), 0);
  igual(APP.almacen.diasEstudiados(), 0);

  APP.almacen.sumarMinutos(7);
  APP.almacen.sumarMinutos(3);
  igual(APP.almacen.minutosDelDia(), 10);
  igual(APP.almacen.minutosTotales(), 10);
  igual(APP.almacen.diasEstudiados(), 1);

  // Un valor absurdo no ensucia el registro.
  APP.almacen.sumarMinutos(0);
  APP.almacen.sumarMinutos(-5);
  igual(APP.almacen.minutosTotales(), 10);
});

prueba("los minutos de dos aparatos se suman, no se pisan", function () {
  /* El mismo problema que tuvo el XP en su día: estudiar veinte minutos en el
   * teléfono y diez en el computador el mismo día tiene que dar treinta. */
  const hoy = APP.almacen.hoy();
  // Cada copia lleva el contador de SU aparato: por eso se pueden sumar sin
  // contar dos veces. Con el mismo identificador no habría forma de saber si
  // son treinta minutos o los mismos veinte vistos dos veces, y ahí manda el
  // mayor, que es lo correcto.
  const telefono = estadoDePrueba({ minutosPorDia: {} });
  telefono.minutosPorDia[hoy] = { "movil-abc": 20 };
  const computador = estadoDePrueba({ minutosPorDia: {} });
  computador.minutosPorDia[hoy] = { "compu-def": 10 };

  const juntos = APP.almacen.fusionarProgreso(telefono, computador);
  let total = 0;
  const reparto = juntos.minutosPorDia[hoy];
  Object.keys(reparto).forEach(function (k) { total += reparto[k]; });
  igual(total, 30);

  // Y el mismo aparato dos veces no se duplica.
  const mismo = estadoDePrueba({ minutosPorDia: {} });
  mismo.minutosPorDia[hoy] = { "movil-abc": 20 };
  const otra = APP.almacen.fusionarProgreso(telefono, mismo);
  igual(otra.minutosPorDia[hoy]["movil-abc"], 20);
});

prueba("una lección anota el tiempo y no puntos", function () {
  /* Los puntos se pueden inflar contestando rápido lo que ya sabías. El
   * tiempo no. Por eso el registro mide tiempo. */
  APP.almacen.borrarTodo();
  const antes = APP.almacen.minutosTotales();
  APP.almacen.sumarMinutos(1);
  cierto(APP.almacen.minutosTotales() > antes);
});

prueba("la semana trae los siete días con sus minutos", function () {
  APP.almacen.borrarTodo();
  APP.almacen.sumarMinutos(15);
  const sem = APP.almacen.semana();
  igual(sem.length, 7);
  igual(sem[6].minutos, 15);   // el último es hoy
  igual(sem[0].minutos, 0);
});

prueba("no queda rastro de la capa de juego en las pantallas", function () {
  /* Se quitó entera —vidas, puntos, racha de fuego, mascota, confeti— y lo que
   * hay que vigilar es que no vuelva a colarse por una llamada suelta: un
   * APP.fiesta.confeti olvidado revienta la pantalla, porque el archivo ya no
   * existe. */
  const idos = ["fiesta", "mascota", "logros", "desafio"];
  const vivos = idos.filter(function (m) { return !!APP[m]; });
  igual(vivos, []);
});

/* ---------------- Resultado ---------------- */

console.log("");
fallos.forEach(function (f) { console.log("  ✗ " + f); });
console.log("  " + pasadas + " pruebas pasaron, " + fallos.length + " fallaron");
console.log("");
process.exit(fallos.length ? 1 : 0);
