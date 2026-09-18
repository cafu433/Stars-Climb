/* Practicar una regla hasta que salga sola.
 *
 * El módulo de gramática explica; éste automatiza, que es lo otro y no lo
 * mismo. Entender que "he" lleva -s se consigue leyendo una vez; decirlo sin
 * pensarlo se consigue haciéndolo doscientas veces. Para lo segundo hacen
 * falta ejercicios que no se acaben y que no se puedan contestar de memoria,
 * que es lo que resuelve 'generar' en datos-reglas.js.
 *
 * La tanda sube de exigencia sola, en tres etapas:
 *
 *   0  elegir entre opciones — para cuando la regla es nueva
 *   1  escribir la respuesta — es bastante más difícil y es lo que la fija
 *   2  dominada — se deja de insistir y pasa al repaso de mantenimiento
 *
 * Que suba sola importa: quedarse siempre en opciones da la sensación de
 * saberlo sin saberlo, porque reconocer la respuesta entre tres es mucho más
 * fácil que producirla. Y empezar escribiendo, cuando la regla es nueva, sólo
 * consigue que se falle todo y se abandone.
 */
(function () {
  "use strict";

  const APP = window.APP;
  const LARGO = 12;

  /* Evita que salga dos veces seguidas el mismo ejercicio. Es más importante
   * de lo que parece: repetido al hilo se contesta sin leer, de memoria corta,
   * y esa repetición no enseña nada. */
  /* 'forzar' permite pedir explícitamente ejercicios de elegir o de escribir,
   * sin mirar el dominio. Lo usa la lección por etapas: primero una tanda de
   * reconocer y después una de escribir, en la misma sesión. Sin esto, una
   * lección sólo podía dar uno de los dos y la etapa de escribir no existía
   * hasta ocho aciertos después. */
  function tanda(reglaId, cuantos, forzar) {
    const regla = APP.datosReglas.regla(reglaId);
    if (!regla) return [];

    const n = cuantos || LARGO;
    const escribir = forzar === "escribir"
      ? true
      : forzar === "elegir"
        ? false
        : APP.almacen.etapaRegla(reglaId) >= 1;
    const out = [];
    const vistas = {};
    let intentos = 0;

    while (out.length < n && intentos < n * 30) {
      intentos++;
      const e = regla.generar();
      const huella = e.frase + "|" + e.ok;
      if (vistas[huella]) continue;
      vistas[huella] = true;
      out.push(armar(regla, e, escribir));
    }

    // Si la regla tiene pocas variantes, se completa repitiendo antes que
    // devolver una tanda a medias.
    while (out.length < n) {
      out.push(armar(regla, regla.generar(), escribir));
    }
    return out;
  }

  function armar(regla, e, escribir) {
    return {
      tipo: escribir ? "regla-escribe" : "regla-elige",
      regla: regla.id,
      tituloRegla: regla.titulo,
      frase: e.frase,
      // La traducción de apoyo se arma juntando trozos, así que a veces empieza
      // con el sujeto en minúscula ("yo estoy cansada"). Se corrige acá y no en
      // cada generador, que son diecisiete.
      es: mayuscula(e.es),
      // En modo escribir no se mandan opciones: enseñarlas sería regalar la
      // respuesta, y el punto de esta etapa es producirla sin ayuda.
      opciones: escribir ? null : e.opciones,
      ok: e.ok,
      porque: e.porque,
      clave: regla.clave,
    };
  }

  /* La frase completa, con el hueco ya relleno. Es lo que se muestra al
   * corregir: ver la oración entera bien escrita enseña más que ver la palabra
   * suelta fuera de contexto. */
  function resuelta(ej, respuesta) {
    const r = respuesta === undefined ? ej.ok : respuesta;
    // Algunas respuestas traen dos huecos separados por " / " (Have / been).
    if (r.indexOf(" / ") > 0 && ej.frase.split("___").length === 3) {
      const partes = r.split(" / ");
      const trozos = ej.frase.split("___");
      return trozos[0] + partes[0] + trozos[1] + partes[1] + trozos[2];
    }
    return ej.frase.replace("___", r);
  }

  /* Se acepta con holgura: mayúsculas, espacios de más y el apóstrofo curvo
   * que ponen los teclados de iPhone. Lo que no se acepta es otra respuesta,
   * aunque se le parezca: el punto del ejercicio es justo esa distinción. */
  function correcta(ej, respuesta) {
    return normalizar(respuesta) === normalizar(ej.ok);
  }

  function mayuscula(t) {
    const x = String(t || "");
    return x ? x.charAt(0).toUpperCase() + x.slice(1) : x;
  }

  function normalizar(t) {
    return String(t || "")
      .toLowerCase()
      .replace(/[‘’ʼ]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/^[\s.]+|[\s.]+$/g, "");
  }

  function anotar(ej, acierto) {
    return APP.almacen.anotarRegla(ej.regla, acierto);
  }

  /* Qué practicar ahora, si no se elige nada: primero lo empezado y no
   * dominado, después lo que no se ha tocado nunca. Así una tanda suelta no
   * abre siempre una regla nueva y deja diez a medias. */
  function sugerida(nivelMaximo) {
    const candidatas = APP.datosReglas.delNivel(nivelMaximo || 3);
    const empezadas = [];
    const nuevas = [];
    candidatas.forEach(function (r) {
      const e = APP.almacen.regla(r.id);
      if (e.dominada) return;
      (e.vistos > 0 ? empezadas : nuevas).push(r);
    });
    // Entre las empezadas, la que peor va: es la que más falta hace.
    empezadas.sort(function (a, b) {
      return APP.almacen.regla(a.id).seguidos - APP.almacen.regla(b.id).seguidos;
    });
    return empezadas[0] || nuevas[0] || candidatas[0] || null;
  }

  function resumen(nivelMaximo) {
    const lista = APP.datosReglas.delNivel(nivelMaximo || 3);
    let dominadas = 0;
    let empezadas = 0;
    lista.forEach(function (r) {
      const e = APP.almacen.regla(r.id);
      if (e.dominada) dominadas++;
      else if (e.vistos > 0) empezadas++;
    });
    return {
      total: lista.length,
      dominadas: dominadas,
      empezadas: empezadas,
      sinEmpezar: lista.length - dominadas - empezadas,
    };
  }

  /* Cuánto le falta a una regla para la etapa siguiente, para poder dibujar la
   * barra de avance. */
  function avance(reglaId) {
    const e = APP.almacen.regla(reglaId);
    const etapa = APP.almacen.etapaRegla(reglaId);
    if (etapa === 2) return { etapa: 2, hechos: 1, faltan: 0, de: 1 };
    const meta = etapa === 0 ? APP.almacen.PARA_ESCRIBIR : APP.almacen.PARA_DOMINAR;
    const desde = etapa === 0 ? 0 : APP.almacen.PARA_ESCRIBIR;
    return {
      etapa: etapa,
      hechos: Math.max(0, e.seguidos - desde),
      de: meta - desde,
      faltan: Math.max(0, meta - e.seguidos),
    };
  }

  APP.reglas = {
    LARGO: LARGO,
    tanda: tanda,
    resuelta: resuelta,
    correcta: correcta,
    anotar: anotar,
    sugerida: sugerida,
    resumen: resumen,
    avance: avance,
  };
})();
