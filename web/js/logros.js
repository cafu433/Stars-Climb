/* Logros: las metas que dan ganas de volver mañana.
 *
 * Se comprueban al terminar cada sesión, no con un temporizador: así el aviso
 * aparece justo cuando se ganó, que es cuando significa algo.
 *
 * Cada logro es una condición sobre el estado guardado. Ninguno pide gastar
 * dinero ni mirar publicidad, y ninguno se pierde una vez ganado.
 */
(function () {
  "use strict";

  const A = function () { return APP.almacen; };

  const LOGROS = [
    { id: "primer-paso", emo: "🎯", nombre: "Primer paso", pista: "Termina tu primera lección",
      cond: function (e) { return Object.keys(e.lecciones).length >= 1; } },
    { id: "perfecta", emo: "💯", nombre: "Sin un error", pista: "Termina una lección sin fallar",
      cond: function () { return A().cuenta("perfectas") >= 1; } },
    { id: "racha-3", emo: "🔥", nombre: "Tres días", pista: "Cumple la meta tres días seguidos",
      cond: function (e) { return e.racha.mejor >= 3; } },
    { id: "racha-7", emo: "📅", nombre: "Una semana", pista: "Siete días seguidos",
      cond: function (e) { return e.racha.mejor >= 7; } },
    { id: "racha-30", emo: "🏅", nombre: "Un mes entero", pista: "Treinta días seguidos",
      cond: function (e) { return e.racha.mejor >= 30; } },
    { id: "xp-500", emo: "⚡", nombre: "500 XP", pista: "Junta 500 puntos",
      cond: function (e) { return e.xp >= 500; } },
    { id: "xp-2000", emo: "🌟", nombre: "2.000 XP", pista: "Junta 2.000 puntos",
      cond: function (e) { return e.xp >= 2000; } },
    { id: "palabras-50", emo: "📚", nombre: "50 palabras", pista: "Practica 50 palabras distintas",
      cond: function () { return APP.srs.resumen().vistas >= 50; } },
    { id: "palabras-200", emo: "🎓", nombre: "200 palabras", pista: "Practica 200 palabras distintas",
      cond: function () { return APP.srs.resumen().vistas >= 200; } },
    { id: "aprendidas-50", emo: "🧠", nombre: "50 aprendidas", pista: "Ten 50 palabras en memoria firme",
      cond: function () { return APP.srs.resumen().aprendidas >= 50; } },
    { id: "unidad-1", emo: "🏆", nombre: "Unidad completa", pista: "Termina todas las lecciones de una unidad",
      cond: function () {
        return APP.curriculo.UNIDADES.some(function (u) {
          return u.lecciones.every(function (l) { return A().leccion(l.id).coronas > 0; });
        });
      } },
    { id: "voz", emo: "🎤", nombre: "En voz alta", pista: "Di 25 frases hablando",
      cond: function () { return A().cuenta("habladas") >= 25; } },
    { id: "repasadora", emo: "♻️", nombre: "Repaso al día", pista: "Termina 10 repasos",
      cond: function () { return A().cuenta("repasos") >= 10; } },
    { id: "madrugadora", emo: "🌅", nombre: "Madrugadora", pista: "Practica antes de las 8 de la mañana",
      cond: function () { return A().cuenta("madrugada") > 0; } },
    { id: "nocturna", emo: "🌙", nombre: "Noctámbula", pista: "Practica después de las 11 de la noche",
      cond: function () { return A().cuenta("noche") > 0; } },
  ];

  function revisar() {
    /* Devuelve sólo los logros ganados en esta pasada: son los que se muestran
     * en la pantalla de fin de lección. */
    const e = A().estado();
    const hora = new Date().getHours();
    // Se marca una sola vez: contar() suma, y estos dos son un sí o un no.
    if (hora < 8 && A().cuenta("madrugada") === 0) A().contar("madrugada");
    if (hora >= 23 && A().cuenta("noche") === 0) A().contar("noche");

    const nuevos = [];
    LOGROS.forEach(function (l) {
      if (e.logros[l.id]) return;
      let cumple = false;
      try {
        cumple = l.cond(e);
      } catch (err) {
        cumple = false;
      }
      if (cumple) {
        e.logros[l.id] = A().hoy();
        nuevos.push(l);
      }
    });
    A().guardar();
    return nuevos;
  }

  function todos() {
    const e = A().estado();
    return LOGROS.map(function (l) {
      return Object.assign({}, l, { ganado: !!e.logros[l.id], fecha: e.logros[l.id] || null });
    });
  }

  window.APP = window.APP || {};
  APP.logros = { revisar: revisar, todos: todos, LOGROS: LOGROS };
})();
