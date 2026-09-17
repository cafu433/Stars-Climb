/* Conversar en inglés con un tutor, hablando o escribiendo.
 *
 * Es lo único de la aplicación que necesita internet, cuesta dinero y puede
 * no estar configurado. Las tres cosas se manejan diciendo la verdad: si no
 * está disponible se explica por qué y cómo se arregla, en vez de mostrar un
 * botón que no hace nada.
 *
 * La clave de la API no está acá ni puede estarlo: vive en el servidor. Este
 * archivo sólo habla con /api/tutor, que es de la misma dirección, así que la
 * cookie de sesión viaja sola.
 *
 * La conversación se guarda en memoria y nada más. No va al servidor ni al
 * almacenamiento del teléfono: alguien practicando cuenta cosas de su trabajo
 * y de su vida, y eso no hay por qué archivarlo en ninguna parte.
 */
(function () {
  "use strict";

  const APP = window.APP;
  const RAIZ = "/api/tutor";
  const ESPERA = 60000;

  // Los primeros temas. Tener de qué hablar es la mitad del problema: delante
  // de un cuadro de texto vacío no se le ocurre nada a nadie.
  const ARRANQUES = [
    { emo: "☕", es: "Tu día de hoy", en: "Tell me about your day." },
    { emo: "💼", es: "Tu trabajo", en: "What do you do for work?" },
    { emo: "✈️", es: "Un viaje", en: "Tell me about a trip you took." },
    { emo: "🍽️", es: "Pedir en un restaurante", en: "Let's practise ordering food. I'm the waiter." },
    { emo: "📞", es: "Llamar a un proveedor", en: "Let's practise a call with a supplier. I'm the supplier." },
    { emo: "🗣️", es: "Lo que tú quieras", en: "" },
  ];

  let conversacion = [];

  function estado() {
    return pedir("GET", "/estado").catch(function () {
      // Sin internet no se puede saber; se dice eso y no "no configurado",
      // que mandaría a revisar Render por nada.
      return { disponible: false, motivo: "sin_internet" };
    });
  }

  function mandar(texto) {
    return pedir("POST", "/mensaje", {
      texto: texto,
      historia: conversacion.map(function (t) {
        return { papel: t.papel, texto: t.texto };
      }),
    });
  }

  function pedir(metodo, ruta, cuerpo) {
    const corta = new AbortController();
    const reloj = setTimeout(function () { corta.abort(); }, ESPERA);

    return fetch(RAIZ + ruta, {
      method: metodo,
      credentials: "same-origin",
      headers: cuerpo ? { "Content-Type": "application/json" } : {},
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      signal: corta.signal,
    })
      .then(function (r) {
        clearTimeout(reloj);
        return r.json().then(function (d) {
          if (!r.ok) throw new Error(d.error || "Algo falló");
          return d;
        }).catch(function (e) {
          if (e instanceof Error && e.message !== "Algo falló") throw e;
          throw new Error("Algo falló");
        });
      })
      .catch(function (e) {
        clearTimeout(reloj);
        if (e.name === "AbortError") throw new Error("El tutor tardó demasiado.");
        throw e;
      });
  }

  function historial() { return conversacion.slice(); }
  function anotar(papel, texto, correccion) {
    conversacion.push({ papel: papel, texto: texto, correccion: correccion || null });
  }
  function reiniciar() { conversacion = []; }

  /* Si se puede dictar. No es lo mismo que tener micrófono para los ejercicios:
   * acá hace falta reconocimiento de voz del navegador, que Firefox no trae. */
  function sePuedeDictar() {
    return APP.audio.hayMicrofono();
  }

  APP.tutor = {
    ARRANQUES: ARRANQUES,
    estado: estado,
    mandar: mandar,
    historial: historial,
    anotar: anotar,
    reiniciar: reiniciar,
    sePuedeDictar: sePuedeDictar,
  };
})();
