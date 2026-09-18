/* La cuenta: tu avance guardado fuera del teléfono.
 *
 * La regla de la que cuelga todo el diseño: **la cuenta es opcional y viene
 * después**. La aplicación funciona entera sin haber entrado nunca, sin
 * internet y sin registrarse; el progreso vive en el teléfono igual que
 * siempre. Entrar sólo agrega una copia en el servidor.
 *
 * Eso tiene dos consecuencias concretas:
 *
 *  - Registrarse no borra lo que ya practicaste. Al entrar por primera vez, lo
 *    que hay en el teléfono se junta con lo que haya en la cuenta, en vez de
 *    que uno pise al otro.
 *  - Quedarse sin señal no rompe nada. Si el servidor no contesta, se sigue
 *    practicando con lo local y se sube en la próxima sincronización.
 *
 * El servidor guarda el documento entero y no lo entiende. Juntar dos avances
 * sin perder nada lo hace fusionarProgreso() en almacen.js, que ya existía para
 * los ratos sin conexión y está probado.
 */
(function () {
  "use strict";

  const A = function () { return APP.almacen; };

  // La API vive en el mismo sitio que la aplicación, así que basta una ruta
  // relativa: no hay dirección que configurar ni CORS que pelear.
  const RAIZ = "/api";
  const ESPERA = 20000; // el plan gratuito de Render duerme y tarda en despertar

  let sesion = { conectado: false, email: null, comprobada: false, respondio: false };
  let sincronizando = false;
  let ultimoIntento = 0;

  function ajustes() {
    return A().estado().ajustes;
  }

  function pedir(ruta, opciones) {
    const o = opciones || {};
    const control = new AbortController();
    const reloj = setTimeout(function () { control.abort(); }, o.espera || ESPERA);

    return fetch(RAIZ + ruta, {
      method: o.metodo || "GET",
      // Sin esto la cookie de sesión no viaja y el servidor no sabe quién eres.
      credentials: "same-origin",
      headers: o.cuerpo ? { "Content-Type": "application/json" } : {},
      body: o.cuerpo ? (typeof o.cuerpo === "string" ? o.cuerpo : JSON.stringify(o.cuerpo)) : undefined,
      signal: control.signal,
    }).then(
      function (r) { clearTimeout(reloj); return r; },
      function (e) {
        clearTimeout(reloj);
        throw new Error(e && e.name === "AbortError"
          ? "El servidor no respondió a tiempo"
          : "No se pudo conectar");
      }
    );
  }

  function leerError(r) {
    return r.json().then(
      function (d) { return new Error((d && d.error) || "Algo falló"); },
      function () { return new Error("Algo falló en el servidor"); }
    );
  }

  /* ---------------- Sesión ---------------- */

  function comprobarSesion() {
    return pedir("/yo")
      .then(function (r) { return r.ok ? r.json() : { conectado: false }; })
      .then(function (d) {
        sesion = {
          conectado: !!d.conectado, email: d.email || null,
          comprobada: true, respondio: true,
        };
        if (sesion.conectado && sesion.email) {
          ajustes().entroComo = sesion.email;
          ajustes().aparatoAbierto = true;
          A().guardar();
        }
        return sesion;
      })
      .catch(function () {
        /* Sin conexión no se sabe. Se marca 'respondio: false' porque la
         * diferencia importa: que el servidor diga "no hay sesión" es motivo
         * para pedir la clave, pero que no conteste no lo es — si no, quedarse
         * sin señal te dejaría fuera de tu propia aplicación. */
        sesion.comprobada = true;
        sesion.respondio = false;
        return sesion;
      });
  }

  function registrar(email, clave) {
    return pedir("/registro", { metodo: "POST", cuerpo: { email: email, clave: clave } })
      .then(function (r) {
        if (!r.ok) return leerError(r).then(function (e) { throw e; });
        return r.json();
      })
      .then(function (d) {
        sesion = { conectado: true, email: d.email, comprobada: true, respondio: true };
        ajustes().entroComo = d.email;
        ajustes().aparatoAbierto = true;
        A().guardar();
        // Recién creada la cuenta, lo primero es subir lo que ya se practicó.
        return sincronizar().then(function () { return sesion; });
      });
  }

  function entrar(email, clave) {
    return pedir("/entrar", { metodo: "POST", cuerpo: { email: email, clave: clave } })
      .then(function (r) {
        if (!r.ok) return leerError(r).then(function (e) { throw e; });
        return r.json();
      })
      .then(function (d) {
        sesion = { conectado: true, email: d.email, comprobada: true, respondio: true };
        ajustes().entroComo = d.email;
        ajustes().aparatoAbierto = true;
        A().guardar();
        return sincronizar().then(function () { return sesion; });
      });
  }

  function salir() {
    /* Salir deja el progreso en el teléfono tal como está. No se borra: la
     * persona sigue pudiendo practicar, y si vuelve a entrar se junta todo. */
    return pedir("/salir", { metodo: "POST" })
      .catch(function () { /* si el servidor no contesta, se sale igual */ })
      .then(function () {
        sesion = { conectado: false, email: null, comprobada: true, respondio: true };
        ajustes().ultimaSync = 0;
        // Salir cierra la puerta: en este aparato habrá que volver a entrar.
        // El correo se deja escrito, que no es ningún secreto y ahorra tener
        // que teclearlo otra vez.
        ajustes().aparatoAbierto = false;
        A().guardar();
        return sesion;
      });
  }

  function cambiarClave(actual, nueva) {
    return pedir("/cambiar-clave", { metodo: "POST", cuerpo: { actual: actual, nueva: nueva } })
      .then(function (r) {
        if (!r.ok) return leerError(r).then(function (e) { throw e; });
        return true;
      });
  }

  function borrarCuenta(clave) {
    return pedir("/borrar-cuenta", { metodo: "POST", cuerpo: { clave: clave } })
      .then(function (r) {
        if (!r.ok) return leerError(r).then(function (e) { throw e; });
        sesion = { conectado: false, email: null, comprobada: true };
        return true;
      });
  }

  /* ---------------- Sincronizar ---------------- */

  function sincronizar() {
    if (!sesion.conectado) return Promise.resolve({ ok: false, motivo: "sin-cuenta" });
    if (sincronizando) return Promise.resolve({ ok: false, motivo: "en-curso" });
    sincronizando = true;
    ultimoIntento = Date.now();

    return pedir("/progreso")
      .then(function (r) {
        if (r.status === 401) {
          // La sesión caducó; se avisa en vez de fallar en silencio.
          sesion = { conectado: false, email: null, comprobada: true };
          throw new Error("Tu sesión caducó. Vuelve a entrar.");
        }
        if (!r.ok) return leerError(r).then(function (e) { throw e; });
        return r.json();
      })
      .then(function (remoto) {
        // {"vacio": true} es una cuenta recién creada: no hay nada que juntar.
        const otro = remoto && remoto.vacio ? null : remoto;
        A().reemplazarEstado(A().fusionarProgreso(A().estado(), otro));
        return pedir("/progreso", { metodo: "PUT", cuerpo: JSON.stringify(A().estado()) });
      })
      .then(function (r) {
        if (!r.ok) return leerError(r).then(function (e) { throw e; });
        ajustes().ultimaSync = Date.now();
        ajustes().ultimoErrorSync = "";
        A().guardar();
        return { ok: true };
      })
      .catch(function (e) {
        ajustes().ultimoErrorSync = e.message;
        A().guardar();
        return { ok: false, motivo: e.message };
      })
      .then(function (resultado) {
        sincronizando = false;
        return resultado;
      });
  }

  function sincronizarSiCorresponde(minimoMinutos) {
    /* Sincronización automática con freno: al abrir, al volver a la aplicación
     * y al terminar una lección. Sin el freno, cambiar de pestaña diez veces
     * dispararía diez sincronizaciones. */
    if (!sesion.conectado) return Promise.resolve({ ok: false, motivo: "sin-cuenta" });
    const minimo = (minimoMinutos === undefined ? 2 : minimoMinutos) * 60000;
    if (Date.now() - ultimoIntento < minimo) return Promise.resolve({ ok: false, motivo: "reciente" });
    return sincronizar();
  }

  function arrancar() {
    /* Al abrir: se pregunta quién está conectado y, si hay cuenta, se baja lo
     * que haya en el servidor antes de dibujar los números. */
    return comprobarSesion().then(function (s) {
      if (!s.conectado) return { ok: false, motivo: "sin-cuenta" };
      return sincronizar();
    });
  }

  function estado() {
    const a = ajustes();
    return {
      conectado: sesion.conectado,
      email: sesion.email,
      comprobada: sesion.comprobada,
      respondio: sesion.respondio,
      // Lo último que se supo en este aparato, aunque ahora no haya señal.
      entroComo: a.entroComo || "",
      aparatoAbierto: !!a.aparatoAbierto,
      sincronizando: sincronizando,
      ultima: a.ultimaSync || 0,
      ultimoError: a.ultimoErrorSync || "",
    };
  }

  window.APP = window.APP || {};
  APP.cuenta = {
    estado: estado,
    arrancar: arrancar,
    registrar: registrar,
    entrar: entrar,
    salir: salir,
    cambiarClave: cambiarClave,
    borrarCuenta: borrarCuenta,
    sincronizar: sincronizar,
    sincronizarSiCorresponde: sincronizarSiCorresponde,
  };
})();
