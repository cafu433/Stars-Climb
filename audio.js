/* Voz: escuchar inglés, hablar inglés y los sonidos de acierto/error.
 *
 * Todo con lo que trae el navegador (SpeechSynthesis y SpeechRecognition) y con
 * WebAudio para los efectos. Cero archivos y cero servidor: la aplicación
 * completa sigue funcionando en modo avión.
 */
(function () {
  "use strict";

  let vozElegida = null;
  let vocesListas = false;

  function cargarVoces() {
    if (!window.speechSynthesis) return [];
    const voces = window.speechSynthesis.getVoices() || [];
    if (voces.length) vocesListas = true;
    return voces;
  }

  function acento() {
    try {
      return APP.almacen.estado().ajustes.acento || "en-GB";
    } catch (e) {
      return "en-GB";
    }
  }

  function elegirVoz() {
    const voces = cargarVoces();
    if (!voces.length) return null;
    const pref = acento();
    /* Orden de preferencia: el acento pedido exacto, después cualquier inglés,
     * y recién al final la voz por defecto. Las voces locales van primero
     * porque las que vienen por red se cortan sin avisar cuando no hay señal. */
    const exacta = voces.filter(function (v) { return v.lang === pref; });
    const locales = exacta.filter(function (v) { return v.localService; });
    if (locales.length) return locales[0];
    if (exacta.length) return exacta[0];
    const ingles = voces.filter(function (v) { return v.lang && v.lang.indexOf("en") === 0; });
    if (ingles.length) return ingles[0];
    return null;
  }

  if (window.speechSynthesis) {
    cargarVoces();
    // En Chrome la lista llega asíncrona: sin esto, la primera palabra del día
    // se dice con la voz del sistema (en español) y suena a chiste.
    window.speechSynthesis.onvoiceschanged = function () {
      vozElegida = null;
      cargarVoces();
    };
  }

  function hablar(texto, opciones) {
    const o = opciones || {};
    if (!window.speechSynthesis || !texto) {
      if (o.error) o.error("sin-voz");
      return;
    }
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      /* algunos navegadores tiran si no había nada sonando */
    }
    const u = new SpeechSynthesisUtterance(texto);
    if (!vozElegida) vozElegida = elegirVoz();
    if (vozElegida) u.voice = vozElegida;
    u.lang = acento();
    u.rate = o.velocidad || velocidad();
    u.pitch = 1;
    u.volume = 1;
    if (o.inicio) u.onstart = o.inicio;
    if (o.fin) u.onend = o.fin;
    u.onerror = function (ev) {
      if (o.error) o.error((ev && ev.error) || "error");
    };
    /* Android deja el motor de voz "pausado" después de un cancel() y el
     * speak() siguiente se pierde en silencio, sin error. El resume() con un
     * respiro de 60 ms lo devuelve a la vida; es feo pero es la única forma
     * conocida de que suene siempre. */
    setTimeout(function () {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(u);
      } catch (e) {
        if (o.error) o.error("excepcion");
      }
    }, 60);
  }

  function velocidad() {
    try {
      return APP.almacen.estado().ajustes.velocidad || 0.9;
    } catch (e) {
      return 0.9;
    }
  }

  function callar() {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      /* nada que callar */
    }
  }

  function hayVoz() {
    return !!window.speechSynthesis;
  }

  /* ---------------- Micrófono ---------------- */

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function hayMicrofono() {
    return !!SR;
  }

  let reconocedor = null;

  function escuchar(opciones) {
    const o = opciones || {};
    if (!SR) {
      if (o.error) o.error("sin-microfono");
      return null;
    }
    detenerEscucha();
    const r = new SR();
    r.lang = acento();
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 3;

    let final = "";
    r.onresult = function (ev) {
      let parcial = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const texto = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) final += texto + " ";
        else parcial += texto;
      }
      if (o.parcial) o.parcial((final + " " + parcial).trim(), ev);
    };
    r.onerror = function (ev) {
      if (o.error) o.error((ev && ev.error) || "error");
    };
    r.onend = function () {
      if (o.fin) o.fin(final.trim());
      reconocedor = null;
    };
    try {
      r.start();
    } catch (e) {
      if (o.error) o.error("no-arranca");
      return null;
    }
    reconocedor = r;
    return r;
  }

  function detenerEscucha() {
    if (reconocedor) {
      try {
        reconocedor.stop();
      } catch (e) {
        /* ya estaba detenido */
      }
      reconocedor = null;
    }
  }

  /* ---------------- Efectos ----------------
   * Tonos cortos generados al vuelo. Un archivo de sonido sería más rico, pero
   * pesaría y habría que descargarlo: acá el acierto suena instantáneo incluso
   * la primera vez que se abre la aplicación.
   */
  let ctx = null;

  function contexto() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tono(frecuencias, duracion, volumen) {
    let permitido = true;
    try {
      permitido = APP.almacen.estado().ajustes.sonido;
    } catch (e) {
      /* antes de que exista el estado, suena */
    }
    if (!permitido) return;
    const c = contexto();
    if (!c) return;
    frecuencias.forEach(function (f, i) {
      const osc = c.createOscillator();
      const gan = c.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const t0 = c.currentTime + i * duracion * 0.6;
      gan.gain.setValueAtTime(0, t0);
      gan.gain.linearRampToValueAtTime(volumen, t0 + 0.01);
      gan.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);
      osc.connect(gan);
      gan.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + duracion + 0.02);
    });
  }

  function vibrar(patron) {
    try {
      if (APP.almacen.estado().ajustes.vibrar && navigator.vibrate) navigator.vibrate(patron);
    } catch (e) {
      /* sin vibración */
    }
  }

  /* La escala de la racha: cada acierto seguido suena un paso más arriba.
   *
   * Es el detalle que más se nota jugando. Un mismo "tin" repetido veinte veces
   * es ruido; una escala que sube convierte la racha en algo que se oye, y
   * cortarla se siente antes de leer el error en la pantalla. Son las notas de
   * una escala pentatónica mayor, que suenan bien en cualquier orden.
   */
  const ESCALA = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760];

  const efectos = {
    bien: function (racha) {
      const paso = Math.min(ESCALA.length - 1, Math.max(0, (racha || 0) - 1));
      tono([ESCALA[paso], ESCALA[paso] * 1.5], 0.12, 0.11);
      vibrar(20);
    },
    mal: function () {
      tono([200, 150], 0.18, 0.12);
      vibrar([40, 60, 40]);
    },
    completo: function () {
      tono([523, 659, 784, 1047, 1319], 0.18, 0.13);
      vibrar([30, 40, 30, 40, 60]);
    },
    // Para cuando se rompe un récord: la misma fanfarria, más arriba y más larga.
    record: function () {
      tono([659, 880, 1047, 1319, 1760], 0.2, 0.14);
      vibrar([50, 60, 50, 60, 120]);
    },
    // El reloj del contrarreloj cuando quedan pocos segundos.
    tic: function () {
      tono([1200], 0.04, 0.06);
    },
    toque: function () {
      tono([440], 0.05, 0.05);
    },
  };

  window.APP = window.APP || {};
  APP.audio = {
    hablar: hablar,
    callar: callar,
    hayVoz: hayVoz,
    hayMicrofono: hayMicrofono,
    escuchar: escuchar,
    detenerEscucha: detenerEscucha,
    efectos: efectos,
    vibrar: vibrar,
    voces: cargarVoces,
    reiniciarVoz: function () { vozElegida = null; },
  };
})();
