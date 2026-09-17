/* Repaso espaciado: qué toca repasar hoy y qué ya está aprendido.
 *
 * Es la diferencia real con practicar al azar. Cada palabra o frase tiene su
 * propio calendario: la que sale fácil no vuelve a aparecer en semanas, la que
 * cuesta vuelve mañana. Así el tiempo se gasta en lo que todavía no se sabe.
 *
 * El algoritmo es SM-2 (el de Anki) simplificado: un factor de facilidad por
 * tarjeta que sube cuando se acierta y baja cuando se falla, multiplicando el
 * intervalo anterior. Se simplifica en un punto: en vez de pedir a la persona
 * que califique del 0 al 5, la calidad se deduce de cómo respondió (a la
 * primera, con ayuda, o mal), que es lo que la aplicación ya sabe.
 */
(function () {
  "use strict";

  const A = function () { return APP.almacen; };

  // Primeros intervalos fijos, en días. Los saltos grandes recién empiezan
  // después de tres aciertos seguidos: antes de eso una tarjeta "fácil" suele
  // ser sólo una tarjeta recién vista.
  const PRIMEROS = [1, 3, 7];

  function tarjeta(id) {
    const s = A().estado().srs[id];
    if (s) return s;
    return { ef: 2.5, intervalo: 0, rep: 0, proximo: null, aciertos: 0, fallos: 0 };
  }

  function fuerza(id) {
    /* Un 0 a 1 para pintar la barra de "cuánto lo tengo". Se basa en el
     * intervalo alcanzado: a los 30 días de intervalo se considera aprendido. */
    const t = tarjeta(id);
    if (!t.rep) return 0;
    return Math.min(1, t.intervalo / 30);
  }

  function vencida(id) {
    const t = tarjeta(id);
    if (!t.proximo) return true;
    return t.proximo <= A().hoy();
  }

  /* calidad: 2 = a la primera, 1 = costó (segundo intento o con pista), 0 = mal */
  function registrar(id, calidad) {
    const e = A().estado();
    const t = Object.assign({}, tarjeta(id));

    if (calidad <= 0) {
      // Fallar reinicia la escalera pero no el factor de facilidad completo:
      // una tarjeta que se supo diez veces y se falla una no vuelve a cero.
      t.rep = 0;
      t.intervalo = 1;
      t.ef = Math.max(1.3, t.ef - 0.2);
      t.fallos += 1;
    } else {
      t.rep += 1;
      t.aciertos += 1;
      if (calidad === 1) {
        t.ef = Math.max(1.3, t.ef - 0.08);
      } else {
        t.ef = Math.min(2.8, t.ef + 0.06);
      }
      if (t.rep <= PRIMEROS.length) {
        t.intervalo = PRIMEROS[t.rep - 1];
      } else {
        t.intervalo = Math.round(t.intervalo * t.ef);
      }
    }
    t.proximo = A().diaMas(A().hoy(), Math.max(1, t.intervalo));
    e.srs[id] = t;
    A().guardar();
    return t;
  }

  function vistas() {
    return Object.keys(A().estado().srs);
  }

  function pendientes(limite) {
    /* Las tarjetas que tocan hoy, las más atrasadas primero. Sólo entran las
     * ya vistas: el repaso repasa, no enseña cosas nuevas (para eso está el
     * camino). */
    const srs = A().estado().srs;
    const hoy = A().hoy();
    const lista = Object.keys(srs)
      .filter(function (id) {
        return APP.datos.porId(id) && (!srs[id].proximo || srs[id].proximo <= hoy);
      })
      .sort(function (a, b) {
        const pa = srs[a].proximo || "0000-00-00";
        const pb = srs[b].proximo || "0000-00-00";
        if (pa !== pb) return pa < pb ? -1 : 1;
        // A igualdad de fecha, primero lo que más se ha fallado.
        return (srs[b].fallos || 0) - (srs[a].fallos || 0);
      });
    return limite ? lista.slice(0, limite) : lista;
  }

  function debiles(limite) {
    /* Lo que más cuesta, esté vencido o no: alimenta el repaso de errores y la
     * pantalla de progreso. */
    const srs = A().estado().srs;
    return Object.keys(srs)
      .filter(function (id) { return APP.datos.porId(id) && srs[id].fallos > 0; })
      .sort(function (a, b) {
        const da = (srs[a].fallos || 0) - (srs[a].aciertos || 0);
        const db = (srs[b].fallos || 0) - (srs[b].aciertos || 0);
        return db - da;
      })
      .slice(0, limite || 20);
  }

  function resumen() {
    const srs = A().estado().srs;
    const ids = Object.keys(srs).filter(function (id) { return APP.datos.porId(id); });
    let aprendidas = 0;
    let enCurso = 0;
    ids.forEach(function (id) {
      if (fuerza(id) >= 1) aprendidas += 1;
      else enCurso += 1;
    });
    return {
      total: APP.datos.TARJETAS.length,
      vistas: ids.length,
      aprendidas: aprendidas,
      enCurso: enCurso,
      pendientes: pendientes().length,
    };
  }

  function porTema() {
    // Cuánto se lleva de cada tema, para la pantalla de progreso.
    const out = {};
    APP.datos.TARJETAS.forEach(function (t) {
      const s = (out[t.skill] = out[t.skill] || { total: 0, vistas: 0, fuerza: 0 });
      s.total += 1;
      const f = fuerza(t.id);
      if (f > 0 || A().estado().srs[t.id]) s.vistas += 1;
      s.fuerza += f;
    });
    Object.keys(out).forEach(function (k) {
      out[k].promedio = out[k].total ? out[k].fuerza / out[k].total : 0;
    });
    return out;
  }

  window.APP = window.APP || {};
  APP.srs = {
    tarjeta: tarjeta,
    fuerza: fuerza,
    vencida: vencida,
    registrar: registrar,
    vistas: vistas,
    pendientes: pendientes,
    debiles: debiles,
    resumen: resumen,
    porTema: porTema,
  };
})();
