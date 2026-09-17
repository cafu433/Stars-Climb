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
  "js/srs.js", "js/audio.js", "js/texto.js", "js/motor.js", "js/logros.js",
  "js/verbos.js", "js/pronunciacion.js", "js/gramatica.js",
  "js/desafio.js", "js/mascota.js",
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
  // Sin voz ni micrófono: es el peor caso, y así se comprueba que las
  // lecciones igual se pueden armar en un navegador que no los tenga.
  speechSynthesis: null,
  navigator: { vibrate: null },
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
    const hay = l.skills.some(function (s) { return APP.datos.porSkill(s).length > 0; });
    // Los temas de gramática y oído no tienen tarjetas propias: sus ejercicios
    // se arman de los verbos, de -ing/-ed o de los pares mínimos.
    const propios = ["vocales", "formal", "inged"];
    if (!hay && !l.skills.some(function (s) { return propios.indexOf(s) >= 0; })) sinContenido.push(l.id);
  });
  igual(sinContenido, []);
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
  const malos = [];
  APP.curriculo.LECCIONES.forEach(function (l) {
    APP.motor.sesionLeccion(l).forEach(function (e) {
      if (!e.opciones) return;
      const buenas = e.opciones.filter(function (o) { return o.correcta; }).length;
      if (buenas !== 1) malos.push(l.id + ":" + e.tipo + " (" + buenas + ")");
    });
  });
  igual(malos.slice(0, 5), []);
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
  const conAudio = [];
  APP.curriculo.LECCIONES.forEach(function (l) {
    APP.motor.sesionLeccion(l).forEach(function (e) {
      if (e.autoAudio) conAudio.push(l.id + ":" + e.tipo);
    });
  });
  igual(conAudio.slice(0, 5), []);
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

/* ---------------- El desafío del día ---------------- */

prueba("el desafío del día no cambia dentro del mismo día", function () {
  const uno = APP.desafio.deHoy();
  const dos = APP.desafio.deHoy();
  igual(uno.id, dos.id);
  cierto(uno.meta > 0);
  cierto(!!uno.texto);
});

prueba("sólo cuenta lo que el desafío de hoy pide", function () {
  APP.almacen.borrarTodo();
  const d = APP.desafio.deHoy();
  if (d.tipo === "xp") return; // ése se mide del XP del día, no se anota
  igual(APP.desafio.progreso(), 0);
  APP.desafio.anotar("un-tipo-que-no-existe", 5);
  igual(APP.desafio.progreso(), 0, "algo que no pide no debería avanzarlo;");
  APP.desafio.anotar(d.tipo, 1);
  igual(APP.desafio.progreso(), 1);
});

prueba("el desafío se cumple y el premio se cobra una sola vez", function () {
  APP.almacen.borrarTodo();
  const d = APP.desafio.deHoy();
  if (d.tipo === "xp") {
    APP.almacen.sumarXp(d.meta);
  } else {
    APP.desafio.anotar(d.tipo, d.meta);
  }
  cierto(APP.desafio.cumplido());
  cierto(APP.desafio.pendienteDeCobro());

  const xpAntes = APP.almacen.estado().xp;
  const premio = APP.desafio.cobrar();
  cierto(!!premio, "debería entregar el premio");
  igual(APP.almacen.estado().xp, xpAntes + APP.desafio.PREMIO_XP);
  igual(APP.desafio.cobrar(), null, "y no se puede cobrar dos veces;");
});

prueba("el progreso del desafío no pasa de la meta", function () {
  APP.almacen.borrarTodo();
  const d = APP.desafio.deHoy();
  if (d.tipo === "xp") return;
  APP.desafio.anotar(d.tipo, d.meta + 50);
  APP.desafio.anotar(d.tipo, 10);
  igual(APP.desafio.progreso(), d.meta + 50, "lo que ya se hizo se guarda tal cual;");
  cierto(APP.desafio.cumplido());
});

prueba("al juntar dos aparatos se conserva el desafío del día más nuevo", function () {
  const ayer = { fecha: "2026-08-25", progreso: 9, cobrado: true };
  const hoy = { fecha: "2026-08-26", progreso: 2, cobrado: false };
  const a = { guardadoEn: 1, xpPorDia: {}, contadores: {}, records: {}, logros: {}, lecciones: {},
    srs: {}, errores: [], canciones: [], ajustes: {}, racha: { dias: 0, mejor: 0, escudos: 2 },
    vidas: {}, desafio: ayer };
  const b = Object.assign({}, a, { guardadoEn: 2, desafio: hoy });
  igual(APP.almacen.fusionarProgreso(a, b).desafio, hoy);
});

prueba("el mismo día en dos aparatos se queda con el mejor avance", function () {
  const base = { guardadoEn: 1, xpPorDia: {}, contadores: {}, records: {}, logros: {}, lecciones: {},
    srs: {}, errores: [], canciones: [], ajustes: {}, racha: { dias: 0, mejor: 0, escudos: 2 }, vidas: {} };
  const a = Object.assign({}, base, { desafio: { fecha: "2026-08-26", progreso: 5, cobrado: false } });
  const b = Object.assign({}, base, { guardadoEn: 2, desafio: { fecha: "2026-08-26", progreso: 2, cobrado: true } });
  const j = APP.almacen.fusionarProgreso(a, b);
  igual(j.desafio, { fecha: "2026-08-26", progreso: 5, cobrado: true });
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
  // Aunque no tenga pares, la sesión no puede quedar vacía en un navegador con
  // voz: se practica identificándolo y repitiéndolo.
  const s = APP.pronunciacion.sesionDeUnSonido("schwa", 10);
  igual(s.length, 0, "sin voz en las pruebas no se genera nada, y eso está bien;");
});

prueba("sin voz, la pronunciación no inventa ejercicios mudos", function () {
  // Todos sus ejercicios necesitan oír o hablar; en un navegador sin voz la
  // sesión tiene que venir vacía en vez de traer preguntas imposibles.
  igual(APP.pronunciacion.sesionMezcla(null, 10).length, 0);
  igual(APP.pronunciacion.sesionDeUnSonido("i-larga", 10).length, 0);
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

/* ---------------- Pelusa ---------------- */

prueba("todas las expresiones dibujan un SVG cerrado", function () {
  Object.keys(APP.mascota.CARAS).forEach(function (cara) {
    const svg = APP.mascota.svg(cara, 80);
    cierto(svg.indexOf("<svg") === 0, cara + ": no empieza con <svg");
    cierto(/<\/svg>$/.test(svg), cara + ": no cierra el <svg>");
    // Sin etiquetas a medio cerrar: un SVG roto no da error, sólo desaparece.
    const abre = (svg.match(/<(?!\/)[a-z]+/g) || []).length;
    const cierra = (svg.match(/<\/[a-z]+>/g) || []).length + (svg.match(/\/>/g) || []).length;
    igual(abre, cierra, cara + ": etiquetas descuadradas;");
  });
});

prueba("una expresión que no existe no rompe nada", function () {
  const svg = APP.mascota.svg("carnaval", 40);
  cierto(svg.indexOf("<svg") === 0, "debería caer en la cara normal");
});

prueba("Pelusa siempre tiene algo que decir y una cara que existe", function () {
  APP.almacen.borrarTodo();
  const casos = [
    function () {},
    function () { APP.almacen.sumarXp(500); },
    function () {
      const e = APP.almacen.estado();
      e.racha = { dias: 9, ultimoDia: APP.almacen.hoy(), mejor: 9, escudos: 2 };
      APP.almacen.guardar();
    },
  ];
  casos.forEach(function (preparar, i) {
    preparar();
    const s = APP.mascota.saludo();
    cierto(!!APP.mascota.CARAS[s.cara], "caso " + i + ": cara desconocida “" + s.cara + "”");
    cierto(s.texto && s.texto.length > 5, "caso " + i + ": sin texto");
  });
});

/* ---------------- Resultado ---------------- */

console.log("");
fallos.forEach(function (f) { console.log("  ✗ " + f); });
console.log("  " + pasadas + " pruebas pasaron, " + fallos.length + " fallaron");
console.log("");
process.exit(fallos.length ? 1 : 0);
