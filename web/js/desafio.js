/* El desafío del día.
 *
 * La racha sola premia aparecer; esto premia hacer algo distinto. Cada día pide
 * otra cosa —una lección perfecta, veinte palabras de repaso, hablar cinco
 * frases— y eso empuja a usar partes de la aplicación que si no se quedarían
 * sin abrir.
 *
 * Cuál toca se calcula del día, no al azar: así es el mismo durante todo el
 * día aunque se cierre y se vuelva a abrir, y no hay nada que guardar para
 * saber cuál era.
 */
(function () {
  "use strict";

  const A = function () { return APP.almacen; };

  const DESAFIOS = [
    { id: "lecciones2", emo: "🛤️", tipo: "lecciones", meta: 2,
      texto: "Termina 2 lecciones del camino", unidad: "lecciones" },
    { id: "perfecta", emo: "💯", tipo: "perfecta", meta: 1,
      texto: "Termina una lección sin fallar ni una", unidad: "lección perfecta" },
    { id: "repaso20", emo: "♻️", tipo: "repaso", meta: 20,
      texto: "Repasa 20 palabras", unidad: "palabras" },
    { id: "contrarreloj12", emo: "⏱️", tipo: "contrarreloj", meta: 12,
      texto: "Acierta 12 en un contrarreloj", unidad: "aciertos" },
    { id: "hablar5", emo: "🎤", tipo: "hablar", meta: 5,
      texto: "Di 5 frases en voz alta", unidad: "frases" },
    { id: "xp100", emo: "⚡", tipo: "xp", meta: 100,
      texto: "Junta 100 XP hoy", unidad: "XP" },
    { id: "errores", emo: "📕", tipo: "errores", meta: 8,
      texto: "Corrige 8 cosas de tu cuaderno de errores", unidad: "corregidas" },
  ];

  const PREMIO_XP = 25;

  function semilla(fecha) {
    // Un número estable a partir de la fecha. No necesita ser una buena función
    // de dispersión: sólo repartir siete opciones a lo largo de los días.
    let n = 0;
    for (let i = 0; i < fecha.length; i++) n = (n * 31 + fecha.charCodeAt(i)) % 100000;
    return n;
  }

  function deHoy() {
    const hoy = A().hoy();
    return DESAFIOS[semilla(hoy) % DESAFIOS.length];
  }

  function estado() {
    const e = A().estado();
    const hoy = A().hoy();
    if (!e.desafio || e.desafio.fecha !== hoy) {
      e.desafio = { fecha: hoy, progreso: 0, cobrado: false };
      A().guardar();
    }
    return e.desafio;
  }

  function progreso() {
    const d = deHoy();
    // El XP del día ya se lleva contado en otra parte: pedirlo prestado evita
    // llevar dos cuentas que se pueden desincronizar.
    if (d.tipo === "xp") return A().xpDeHoy();
    return estado().progreso;
  }

  function cumplido() {
    return progreso() >= deHoy().meta;
  }

  function anotar(tipo, cantidad) {
    /* Lo llaman las pantallas cuando pasa algo. Si lo que pasó no es lo que
     * pide el desafío de hoy, no hace nada: así el que llama no tiene que
     * saber cuál es el desafío. */
    const d = deHoy();
    if (d.tipo !== tipo || d.tipo === "xp") return false;
    const est = estado();
    if (est.progreso >= d.meta) return false;
    est.progreso += cantidad === undefined ? 1 : cantidad;
    A().guardar();
    return est.progreso >= d.meta;
  }

  function cobrar() {
    /* Se entrega el premio una sola vez al día. Devuelve lo que se ganó para
     * que la pantalla pueda mostrarlo, o null si no había nada que cobrar. */
    const est = estado();
    if (est.cobrado || !cumplido()) return null;
    est.cobrado = true;
    A().guardar();
    A().sumarXp(PREMIO_XP);
    // Un escudo de racha, hasta un máximo de tres: si se acumularan sin tope
    // dejarían de significar algo.
    const e = A().estado();
    let escudo = false;
    if (e.racha.escudos < 3) {
      e.racha.escudos += 1;
      escudo = true;
      A().guardar();
    }
    return { xp: PREMIO_XP, escudo: escudo };
  }

  function pendienteDeCobro() {
    return cumplido() && !estado().cobrado;
  }

  window.APP = window.APP || {};
  APP.desafio = {
    deHoy: deHoy,
    progreso: progreso,
    cumplido: cumplido,
    anotar: anotar,
    cobrar: cobrar,
    pendienteDeCobro: pendienteDeCobro,
    PREMIO_XP: PREMIO_XP,
  };
})();
