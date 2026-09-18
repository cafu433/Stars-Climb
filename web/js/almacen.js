/* Todo el progreso vive en el teléfono.
 *
 * No hay servidor ni cuenta: se guarda en localStorage. Eso hace que la
 * aplicación funcione sin internet y sin registrarse, que es justo lo que se
 * quiere de una aplicación de práctica diaria. El precio es que borrar los
 * datos del navegador borra el avance, y por eso existen exportar/importar.
 *
 * Toda escritura pasa por guardar(), y toda lectura por estado(): así el resto
 * del código nunca toca localStorage directo y agregar un campo nuevo es
 * agregarlo a POR_DEFECTO.
 */
(function () {
  "use strict";

  /* La llave del almacenamiento conserva el nombre viejo a propósito: cambiarla
   * dejaría huérfano el progreso de quien ya venía usando la aplicación, y no
   * se gana nada. El nombre de la aplicación es cosa de la portada, no de los
   * datos guardados. */
  const LLAVE = "ingles.v1";
  const LLAVE_APARATO = "ingles.aparato";

  const POR_DEFECTO = {
    version: 1,
    creado: null,
    // Momento del último guardado, en milisegundos. Lo usa la sincronización
    // para decidir cuál de dos copias manda en los datos que no se pueden
    // fusionar (los ajustes, por ejemplo: o son unos o son otros).
    guardadoEn: 0,
    /* xp, racha, vidas, logros y desafio ya no se usan en ninguna pantalla: la
     * capa de juego se quitó entera. Se siguen guardando y fusionando por una
     * razón concreta: el progreso que ya está en los teléfonos y en las cuentas
     * los trae, y borrarlos de la fusión los perdería sin avisar. No cuestan
     * nada y algún día pueden servir para responder "¿cuánto llevabas antes?".
     */
    xp: 0,
    // XP por día, en formato AAAA-MM-DD. Alimenta la meta diaria, la racha y
    // el gráfico de la semana; guardar el detalle en vez de sólo el total
    // permite dibujar la semana sin ningún cálculo extra.
    xpPorDia: {},
    /* Minutos de estudio por día. Reemplaza al XP como medida de avance, y no
     * es un cambio cosmético: los puntos miden cuánto has tocado la pantalla y
     * los minutos miden cuánto has estudiado. Se puede juntar mucho XP
     * contestando rápido cosas que ya sabías.
     *
     * Se guarda igual que xpPorDia —repartido por día y por aparato— para que
     * practicar en el teléfono y en el computador el mismo día sume, en vez de
     * que uno pise al otro. */
    minutosPorDia: {},
    metaDiaria: 30,
    racha: { dias: 0, ultimoDia: null, mejor: 0, escudos: 2 },
    vidas: { n: 5, desde: null },
    lecciones: {},
    srs: {},
    errores: [],
    logros: {},
    // Contadores sueltos para los logros (lecciones perfectas, frases dichas
    // en voz alta, repasos terminados). Se guardan aparte porque no se pueden
    // deducir del resto del estado sin inventar historia.
    contadores: {},
    // Mejores marcas por modo de juego (el contrarreloj, por ahora). Van
    // aparte de los contadores porque no se suman: se superan.
    records: {},
    // Dominio de cada regla de gramática. Va aparte del repaso espaciado porque
    // no es lo mismo: una tarjeta se recuerda o no se recuerda, pero una regla
    // se domina y entonces deja de necesitar opciones y se pasa a escribir.
    reglas: {},
    // Estado de cada nivel: si está abierto y cómo fue su examen final.
    niveles: {},
    // El desafío del día: qué se lleva hecho hoy y si ya se cobró el premio.
    desafio: null,
    canciones: [],
    ajustes: {
      velocidad: 0.9,
      sonido: true,
      vibrar: true,
      tema: "auto",
      acento: "en-GB",
      // Las vidas se pueden apagar: quien practica en serio no necesita que la
      // aplicación la eche a los cinco errores.
      corazones: true,
      // Con el teclado apagado, los ejercicios de escribir se reemplazan por
      // fichas: en el teléfono escribir en inglés es lento y frustra.
      teclado: true,
      microfono: true,
      // Cuándo se sincronizó por última vez con la cuenta, y qué falló si
      // algo falló (ver js/cuenta.js). Sin cuenta, quedan en cero y la
      // aplicación funciona igual con el avance sólo en este aparato.
      ultimaSync: 0,
      ultimoErrorSync: "",
      // Dos cosas distintas, y conviene que lo sean (ver js/puerta.js).
      //
      // 'entroComo' es el último correo usado en este aparato, y sirve sólo
      // para dejarlo escrito en la pantalla de entrada. Si al caducar la
      // sesión se borrara también esto, habría que teclear el correo entero
      // cada vez, que es justo la molestia que no hace falta.
      //
      // 'aparatoAbierto' es el permiso de usar la aplicación sin volver a
      // escribir la contraseña. Se quita al salir y cuando el servidor dice
      // que la sesión ya no vale — pero NO cuando el servidor no contesta:
      // quedarse sin señal no debería dejarte fuera.
      entroComo: "",
      aparatoAbierto: false,
    },
  };

  let cache = null;
  let idAparato = null;

  /* Cada aparato tiene un identificador propio, guardado aparte del progreso y
   * nunca sincronizado.
   *
   * Existe por una razón concreta: el XP se cuenta por aparato y por día. Si se
   * guardara un solo número por día, practicar 180 puntos en el teléfono y 60
   * en el computador el mismo día daría 180 al juntarlos —no hay forma de
   * distinguir "los mismos 180 vistos dos veces" de "180 y 60 aparte—. Contando
   * por aparato, la suma da 240 y no se pierde nada.
   */
  function aparato() {
    if (idAparato) return idAparato;
    try {
      idAparato = localStorage.getItem(LLAVE_APARATO);
    } catch (e) {
      idAparato = null;
    }
    if (!idAparato) {
      idAparato = "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      try {
        localStorage.setItem(LLAVE_APARATO, idAparato);
      } catch (e) {
        /* sin almacenamiento: el id vive lo que dure la sesión */
      }
    }
    return idAparato;
  }

  /* Un "contador repartido": un número por aparato, y el total es la suma.
   * Al juntar dos copias se toma el mayor de cada aparato, nunca la suma, así
   * que sincronizar dos veces seguidas no infla el total. */
  function sumarEnAparato(mapa, cuanto) {
    const m = normalizarContador(mapa);
    const id = aparato();
    m[id] = (m[id] || 0) + cuanto;
    return m;
  }

  function totalContador(mapa) {
    const m = normalizarContador(mapa);
    return Object.keys(m).reduce(function (suma, k) { return suma + (m[k] || 0); }, 0);
  }

  function normalizarContador(valor) {
    // Las versiones anteriores guardaban un número suelto. Se convierte a la
    // forma nueva sin perderlo, atribuyéndolo a un aparato "de antes".
    if (typeof valor === "number") return { legado: valor };
    if (!valor || typeof valor !== "object") return {};
    return valor;
  }

  function fusionarRepartidos(a, b) {
    /* Junta dos mapas de contadores repartidos (día → aparato → número, o
     * clave → aparato → número). Normaliza también los valores que están en un
     * solo lado, para que después de sincronizar no queden mezclados el formato
     * viejo (un número) y el nuevo. */
    const out = {};
    Object.keys(a || {}).forEach(function (k) { out[k] = normalizarContador(a[k]); });
    Object.keys(b || {}).forEach(function (k) {
      out[k] = k in out ? fusionarContadores(out[k], b[k]) : normalizarContador(b[k]);
    });
    return out;
  }

  function fusionarContadores(a, b) {
    const x = normalizarContador(a);
    const y = normalizarContador(b);
    const out = {};
    Object.keys(x).forEach(function (k) { out[k] = x[k]; });
    Object.keys(y).forEach(function (k) { out[k] = Math.max(out[k] || 0, y[k]); });
    return out;
  }

  function hoy() {
    // Fecha local, no UTC: en Chile la medianoche UTC son las 20:00 o 21:00, y
    // con UTC la racha cambiaría de día en plena tarde.
    const d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function diaMas(fecha, n) {
    const p = fecha.split("-").map(Number);
    const d = new Date(p[0], p[1] - 1, p[2] + n);
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function clonarPorDefecto() {
    return JSON.parse(JSON.stringify(POR_DEFECTO));
  }

  function fusionar(guardado) {
    // Fusión superficial con los valores por defecto: una versión nueva de la
    // aplicación puede agregar campos y el progreso viejo sigue sirviendo.
    const base = clonarPorDefecto();
    if (!guardado || typeof guardado !== "object") return base;
    Object.keys(base).forEach(function (k) {
      const v = guardado[k];
      if (v === undefined || v === null) return;
      // base[k] puede ser null (por ejemplo "creado"): Object.assign sobre null
      // revienta, así que esos se copian tal cual.
      if (base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
        base[k] = Object.assign(base[k], v);
      } else {
        base[k] = v;
      }
    });
    return base;
  }

  function estado() {
    if (cache) return cache;
    let guardado = null;
    try {
      const crudo = localStorage.getItem(LLAVE);
      if (crudo) guardado = JSON.parse(crudo);
    } catch (e) {
      // Modo incógnito o almacenamiento bloqueado: se sigue en memoria.
      guardado = null;
    }
    cache = fusionar(guardado);
    if (!cache.creado) cache.creado = hoy();
    return cache;
  }

  function guardar() {
    const e = estado();
    e.guardadoEn = Date.now();
    try {
      localStorage.setItem(LLAVE, JSON.stringify(e));
    } catch (e) {
      /* si no se puede escribir, la sesión sigue funcionando en memoria */
    }
    (oyentes || []).forEach(function (f) {
      f(cache);
    });
  }

  let oyentes = [];
  function alCambiar(f) {
    oyentes.push(f);
  }

  /* ---------------- Vidas ----------------
   * Cinco vidas, una se recupera cada 10 minutos. Se calcula al leer en vez de
   * con un temporizador: así el tiempo corre igual con la aplicación cerrada,
   * que es lo que la persona espera.
   */
  const MINUTOS_POR_VIDA = 10;
  const MAX_VIDAS = 5;

  function vidas() {
    const e = estado();
    if (e.vidas.n >= MAX_VIDAS) return MAX_VIDAS;
    if (!e.vidas.desde) {
      e.vidas.n = MAX_VIDAS;
      return MAX_VIDAS;
    }
    const pasados = (Date.now() - e.vidas.desde) / 60000;
    const ganadas = Math.floor(pasados / MINUTOS_POR_VIDA);
    if (ganadas > 0) {
      e.vidas.n = Math.min(MAX_VIDAS, e.vidas.n + ganadas);
      e.vidas.desde = e.vidas.n >= MAX_VIDAS ? null : e.vidas.desde + ganadas * MINUTOS_POR_VIDA * 60000;
      guardar();
    }
    return e.vidas.n;
  }

  function segundosParaVida() {
    const e = estado();
    if (vidas() >= MAX_VIDAS || !e.vidas.desde) return 0;
    const pasados = (Date.now() - e.vidas.desde) / 1000;
    return Math.max(0, Math.round(MINUTOS_POR_VIDA * 60 - (pasados % (MINUTOS_POR_VIDA * 60))));
  }

  function perderVida() {
    const e = estado();
    const actuales = vidas();
    e.vidas.n = Math.max(0, actuales - 1);
    if (e.vidas.n < MAX_VIDAS && !e.vidas.desde) e.vidas.desde = Date.now();
    guardar();
    return e.vidas.n;
  }

  function llenarVidas() {
    const e = estado();
    e.vidas.n = MAX_VIDAS;
    e.vidas.desde = null;
    guardar();
  }

  /* ---------------- XP, meta y racha ---------------- */

  function sumarXp(n) {
    const e = estado();
    const d = hoy();
    e.xpPorDia[d] = sumarEnAparato(e.xpPorDia[d], n);
    e.xp = totalXp();
    actualizarRacha(d);
    guardar();
  }

  function xpDelDia(fecha) {
    return totalContador(estado().xpPorDia[fecha]);
  }

  function totalXp() {
    const e = estado();
    return Object.keys(e.xpPorDia).reduce(function (suma, f) {
      return suma + totalContador(e.xpPorDia[f]);
    }, 0);
  }

  /* ---------------- Tiempo de estudio ---------------- */

  function sumarMinutos(n) {
    if (!n || n <= 0) return;
    const e = estado();
    const d = hoy();
    e.minutosPorDia[d] = sumarEnAparato(e.minutosPorDia[d], n);
    // Los días estudiados salen de acá, así que anotar el minuto es también
    // anotar el día: no hay dos contadores que se puedan desincronizar.
    guardar();
  }

  function minutosDelDia(dia) {
    return totalContador(estado().minutosPorDia[dia || hoy()]);
  }

  function minutosTotales() {
    return sumaDeTodo(estado().minutosPorDia);
  }

  function minutosDeLaSemana() {
    let total = 0;
    for (let i = 0; i < 7; i++) total += minutosDelDia(diaMas(hoy(), -i));
    return total;
  }

  function diasEstudiados() {
    const m = estado().minutosPorDia;
    return Object.keys(m).filter(function (d) { return totalContador(m[d]) > 0; }).length;
  }

  function xpDeHoy() {
    return xpDelDia(hoy());
  }

  function metaCumplida() {
    return xpDeHoy() >= estado().metaDiaria;
  }

  function actualizarRacha(d) {
    const e = estado();
    if (!metaCumplida()) return;
    if (e.racha.ultimoDia === d) return;
    if (e.racha.ultimoDia === diaMas(d, -1)) {
      e.racha.dias += 1;
    } else {
      e.racha.dias = 1;
    }
    e.racha.ultimoDia = d;
    e.racha.mejor = Math.max(e.racha.mejor, e.racha.dias);
  }

  function rachaViva() {
    /* La racha se muestra viva si la meta se cumplió hoy o ayer: mientras el
     * día no termine, no tiene sentido dar por perdida una racha de 40 días
     * sólo porque todavía no se practica. Si se saltó un día completo, se
     * gasta un escudo antes de romperla. */
    const e = estado();
    const d = hoy();
    if (!e.racha.ultimoDia) return 0;
    if (e.racha.ultimoDia === d || e.racha.ultimoDia === diaMas(d, -1)) return e.racha.dias;
    if (e.racha.ultimoDia === diaMas(d, -2) && e.racha.escudos > 0) {
      e.racha.escudos -= 1;
      e.racha.ultimoDia = diaMas(d, -1);
      guardar();
      return e.racha.dias;
    }
    if (e.racha.dias !== 0) {
      e.racha.dias = 0;
      guardar();
    }
    return 0;
  }

  function semana() {
    // Los últimos siete días, del más antiguo al de hoy, para el gráfico.
    const e = estado();
    const d = hoy();
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const f = diaMas(d, -i);
      out.push({ fecha: f, xp: totalContador(e.xpPorDia[f]), minutos: totalContador(e.minutosPorDia[f]) });
    }
    return out;
  }

  function nivel() {
    /* El nivel sube cada vez más lento: los primeros llegan rápido para
     * enganchar y después cuesta, que es lo que hace que signifiquen algo.
     * 100 XP el primero, y cada uno pide 40 más que el anterior. */
    const xp = estado().xp;
    let n = 1;
    let falta = 100;
    let acum = 0;
    while (xp >= acum + falta) {
      acum += falta;
      falta += 40;
      n += 1;
    }
    return { nivel: n, desde: acum, hasta: acum + falta, xp: xp };
  }

  /* ---------------- Lecciones ---------------- */

  function leccion(id) {
    const e = estado();
    return e.lecciones[id] || { coronas: 0, veces: 0, mejor: 0 };
  }

  function terminarLeccion(id, precision) {
    const e = estado();
    const l = leccion(id);
    // La corona sólo sube con 80% o más: repetir una lección apretando
    // cualquier cosa no debería contar como dominarla.
    const sube = precision >= 0.8 && l.coronas < 5;
    e.lecciones[id] = {
      coronas: l.coronas + (sube ? 1 : 0),
      veces: l.veces + 1,
      mejor: Math.max(l.mejor, precision),
      ultima: hoy(),
    };
    guardar();
    return e.lecciones[id];
  }

  function leccionAbierta(id) {
    /* Una lección se abre cuando la anterior tiene al menos una corona. La
     * primera siempre está abierta. */
    const lista = APP.curriculo.LECCIONES;
    const i = lista.findIndex(function (l) { return l.id === id; });
    if (i <= 0) return true;
    return leccion(lista[i - 1].id).coronas > 0;
  }

  function siguienteLeccion() {
    const lista = APP.curriculo.LECCIONES;
    for (let i = 0; i < lista.length; i++) {
      if (leccion(lista[i].id).coronas === 0) return lista[i];
    }
    return lista[lista.length - 1];
  }

  /* ---------------- Cuaderno de errores ---------------- */

  function record(clave, valor) {
    /* Guarda una marca sólo si es mejor que la anterior. Devuelve true cuando
     * se rompió el récord, que es lo que la pantalla necesita saber para
     * celebrarlo. */
    const e = estado();
    const previo = e.records[clave] || 0;
    if (valor <= previo) return false;
    e.records[clave] = valor;
    guardar();
    return true;
  }

  function mejorMarca(clave) {
    return estado().records[clave] || 0;
  }

  function contar(clave, cuanto) {
    const e = estado();
    e.contadores[clave] = sumarEnAparato(e.contadores[clave], cuanto === undefined ? 1 : cuanto);
    guardar();
    return cuenta(clave);
  }

  function cuenta(clave) {
    return totalContador(estado().contadores[clave]);
  }

  /* ---------------- Reglas de gramática ---------------- */

  // Cuántos aciertos seguidos hacen falta para pasar de elegir a escribir, y
  // para dar la regla por dominada. Ocho y ocho: bastantes para que no sea
  // suerte, pocos para que no aburra.
  const PARA_ESCRIBIR = 8;
  const PARA_DOMINAR = 16;

  function regla(id) {
    const r = estado().reglas[id];
    return r || { vistos: 0, aciertos: 0, seguidos: 0, dominada: false, ultima: null };
  }

  /* En qué etapa está una regla:
   *   0  recién empezada: se elige entre opciones
   *   1  se entiende: ahora hay que escribirla, que es lo que de verdad la fija
   *   2  dominada: sigue apareciendo en el repaso, pero ya no hace falta
   *      dedicarle una tanda entera
   */
  function etapaRegla(id) {
    const r = regla(id);
    if (r.dominada) return 2;
    return r.seguidos >= PARA_ESCRIBIR ? 1 : 0;
  }

  function anotarRegla(id, acierto) {
    const e = estado();
    const r = e.reglas[id] || { vistos: 0, aciertos: 0, seguidos: 0, dominada: false, ultima: null };
    r.vistos += 1;
    if (acierto) {
      r.aciertos += 1;
      r.seguidos += 1;
      if (r.seguidos >= PARA_DOMINAR) r.dominada = true;
    } else {
      // Un fallo no borra el dominio, pero sí devuelve a la etapa anterior:
      // si se falla escribiendo, conviene volver a verla unas cuantas veces.
      r.seguidos = 0;
    }
    r.ultima = hoy();
    e.reglas[id] = r;
    guardar();
    return r;
  }

  /* ---------------- Niveles y sus exámenes ---------------- */

  function nivel_(id) {
    const n = estado().niveles[id];
    return n || { abierto: false, aprobado: false, mejor: 0, veces: 0, fecha: null };
  }

  function abrirNivel(id) {
    const e = estado();
    const n = e.niveles[id] || { abierto: false, aprobado: false, mejor: 0, veces: 0, fecha: null };
    n.abierto = true;
    e.niveles[id] = n;
    guardar();
  }

  function anotarExamen(id, porcentaje, aprueba) {
    const e = estado();
    const n = e.niveles[id] || { abierto: true, aprobado: false, mejor: 0, veces: 0, fecha: null };
    n.veces += 1;
    n.mejor = Math.max(n.mejor || 0, porcentaje);
    if (aprueba && !n.aprobado) {
      n.aprobado = true;
      n.fecha = hoy();
    }
    e.niveles[id] = n;
    guardar();
    return n;
  }

  function anotarError(tarjetaId, dato) {
    const e = estado();
    const previo = e.errores.filter(function (x) { return x.id === tarjetaId; })[0];
    if (previo) {
      previo.veces += 1;
      previo.ultima = hoy();
      previo.superado = false;
    } else {
      e.errores.unshift(
        Object.assign({ id: tarjetaId, veces: 1, ultima: hoy(), superado: false }, dato || {})
      );
    }
    // El cuaderno es para mirar, no un archivo histórico: pasados 200 se
    // sueltan los más viejos para que la pantalla siga siendo útil.
    if (e.errores.length > 200) e.errores.length = 200;
    guardar();
  }

  function marcarSuperado(tarjetaId, valor) {
    const e = estado();
    const x = e.errores.filter(function (y) { return y.id === tarjetaId; })[0];
    if (x) {
      x.superado = valor === undefined ? !x.superado : !!valor;
      guardar();
    }
  }

  /* ---------------- Exportar / importar ----------------
   * Es la única red de seguridad que hay: si cambia de teléfono o borra los
   * datos del navegador, el archivo es lo que salva la racha.
   */
  function exportar() {
    return JSON.stringify(estado(), null, 2);
  }

  function importar(texto) {
    /* Restaurar junta el respaldo con lo que ya hay en este aparato, no lo
     * reemplaza: restaurar una copia de la semana pasada no puede costarle a
     * nadie la racha de esta. */
    const datos = JSON.parse(texto);
    if (!datos || typeof datos !== "object") throw new Error("El archivo no tiene el formato esperado");
    cache = fusionar(fusionarProgreso(estado(), fusionar(datos)));
    guardar();
  }

  /* ---------------- Fusionar dos copias del progreso ----------------
   *
   * Es el corazón de la sincronización, y la razón de que sea seguro tener la
   * aplicación abierta en el teléfono y en el computador a la vez: no gana
   * "la última que guardó", se juntan las dos. Si practicó vocabulario en el
   * computador y frases en el teléfono, al sincronizar quedan las dos cosas.
   *
   * La regla general es quedarse con lo mejor de cada lado, porque el progreso
   * sólo crece. Las excepciones están comentadas una por una.
   */
  function maximo(a, b) {
    if (a === undefined || a === null) return b;
    if (b === undefined || b === null) return a;
    return a > b ? a : b;
  }

  function fusionarPorLlave(a, b, comoFusionar) {
    const out = {};
    Object.keys(a || {}).forEach(function (k) { out[k] = a[k]; });
    Object.keys(b || {}).forEach(function (k) {
      out[k] = k in out ? comoFusionar(out[k], b[k]) : b[k];
    });
    return out;
  }

  function fusionarProgreso(a, b) {
    if (!a) return b;
    if (!b) return a;
    // "reciente" decide los campos que no se pueden sumar ni comparar.
    const reciente = (b.guardadoEn || 0) >= (a.guardadoEn || 0) ? b : a;
    const antiguo = reciente === b ? a : b;
    const xpFusionado = fusionarRepartidos(a.xpPorDia, b.xpPorDia);
    const totalFusionado = sumaDeTodo(xpFusionado);

    return {
      version: maximo(a.version, b.version),
      creado: a.creado && b.creado ? (a.creado < b.creado ? a.creado : b.creado) : a.creado || b.creado,
      guardadoEn: maximo(a.guardadoEn, b.guardadoEn),

      // El XP se junta por día y por aparato: practicar 180 en el teléfono y 60
      // en el computador el mismo día tiene que dar 240, no 180.
      // Si ninguna de las dos copias tiene detalle por día (progreso muy viejo),
      // se cae al total guardado; si lo tiene, el total se recalcula del detalle
      // y así no puede quedar desfasado.
      xp: totalFusionado === 0 ? maximo(a.xp, b.xp) : totalFusionado,
      xpPorDia: xpFusionado,
      minutosPorDia: fusionarRepartidos(a.minutosPorDia, b.minutosPorDia),
      metaDiaria: reciente.metaDiaria,

      racha: {
        dias: maximo(a.racha.dias, b.racha.dias),
        mejor: maximo(a.racha.mejor, b.racha.mejor),
        ultimoDia: maximo(a.racha.ultimoDia, b.racha.ultimoDia),
        // Los escudos son lo único que se gasta: si en un aparato ya se usó
        // uno, se da por usado. Regalarlo de vuelta haría que la racha se
        // pudiera salvar dos veces con el mismo escudo.
        escudos: Math.min(a.racha.escudos, b.racha.escudos),
      },

      // Las vidas son del momento, no del progreso: manda la copia más nueva.
      vidas: reciente.vidas,

      lecciones: fusionarPorLlave(a.lecciones, b.lecciones, function (x, y) {
        return {
          coronas: maximo(x.coronas, y.coronas),
          veces: maximo(x.veces, y.veces),
          mejor: maximo(x.mejor, y.mejor),
          ultima: maximo(x.ultima, y.ultima),
        };
      }),

      srs: fusionarPorLlave(a.srs, b.srs, function (x, y) {
        // Gana la tarjeta con más historia: la que se ha practicado más veces
        // es la que tiene el calendario mejor calibrado. A igualdad, la que
        // está programada más lejos, que es la que se supo mejor.
        const vx = (x.aciertos || 0) + (x.fallos || 0);
        const vy = (y.aciertos || 0) + (y.fallos || 0);
        if (vx !== vy) return vx > vy ? x : y;
        return (x.proximo || "") >= (y.proximo || "") ? x : y;
      }),

      errores: fusionarErrores(a.errores, b.errores),

      // Un logro ganado no se pierde, y se queda con la fecha en que se ganó
      // por primera vez.
      logros: fusionarPorLlave(a.logros, b.logros, function (x, y) {
        return x < y ? x : y;
      }),

      /* El dominio de una regla no se pierde nunca: si en algún aparato quedó
       * dominada, lo está. Los contadores se quedan con el mayor —pueden
       * quedar cortos si se practicó en los dos, pero eso sólo desafina una
       * estadística, mientras que perder el dominio devolvería a alguien a
       * elegir entre opciones algo que ya escribe solo. */
      reglas: fusionarPorLlave(a.reglas, b.reglas, function (x, y) {
        return {
          vistos: maximo(x.vistos, y.vistos),
          aciertos: maximo(x.aciertos, y.aciertos),
          seguidos: maximo(x.seguidos, y.seguidos),
          dominada: !!(x.dominada || y.dominada),
          ultima: maximo(x.ultima, y.ultima),
        };
      }),

      // Un nivel aprobado tampoco se cierra de vuelta.
      niveles: fusionarPorLlave(a.niveles, b.niveles, function (x, y) {
        return {
          abierto: !!(x.abierto || y.abierto),
          aprobado: !!(x.aprobado || y.aprobado),
          mejor: maximo(x.mejor, y.mejor),
          veces: maximo(x.veces, y.veces),
          // La fecha que se guarda es la de la primera vez que se aprobó.
          fecha: x.fecha && y.fecha ? (x.fecha < y.fecha ? x.fecha : y.fecha) : x.fecha || y.fecha,
        };
      }),

      contadores: fusionarRepartidos(a.contadores, b.contadores),
      records: fusionarPorLlave(a.records, b.records, maximo),
      desafio: fusionarDesafio(a.desafio, b.desafio),
      canciones: fusionarCanciones(a.canciones, b.canciones),
      ajustes: Object.assign({}, antiguo.ajustes, reciente.ajustes),
    };
  }

  function sumaDeTodo(xpPorDia) {
    return Object.keys(xpPorDia).reduce(function (suma, f) {
      return suma + totalContador(xpPorDia[f]);
    }, 0);
  }

  function fusionarDesafio(a, b) {
    /* El desafío es de hoy. Si las dos copias son del mismo día se suman los
     * avances —practicó un poco en cada aparato— y se da por cobrado si ya se
     * cobró en alguno. Si son de días distintos, manda el más nuevo. */
    if (!a) return b || null;
    if (!b) return a;
    if (a.fecha !== b.fecha) return a.fecha > b.fecha ? a : b;
    return {
      fecha: a.fecha,
      progreso: Math.max(a.progreso || 0, b.progreso || 0),
      cobrado: !!(a.cobrado || b.cobrado),
    };
  }

  function fusionarErrores(a, b) {
    const porId = {};
    (a || []).concat(b || []).forEach(function (e) {
      const previo = porId[e.id];
      if (!previo) {
        porId[e.id] = Object.assign({}, e);
        return;
      }
      previo.veces = maximo(previo.veces, e.veces);
      previo.ultima = maximo(previo.ultima, e.ultima);
      // Superado sólo si en las dos copias lo está: si en un aparato todavía
      // se estaba fallando, sigue en el cuaderno.
      previo.superado = previo.superado && e.superado;
    });
    return Object.keys(porId)
      .map(function (k) { return porId[k]; })
      .sort(function (x, y) { return (y.ultima || "") > (x.ultima || "") ? 1 : -1; })
      .slice(0, 200);
  }

  function fusionarCanciones(a, b) {
    const vistas = {};
    const out = [];
    (a || []).concat(b || []).forEach(function (c) {
      const clave = (c.titulo || "") + "|" + (c.artista || "");
      if (vistas[clave]) return;
      vistas[clave] = true;
      out.push(c);
    });
    return out;
  }

  function reemplazarEstado(nuevo) {
    cache = fusionar(nuevo);
    guardar();
  }

  function borrarTodo() {
    cache = clonarPorDefecto();
    cache.creado = hoy();
    guardar();
  }

  window.APP = window.APP || {};
  APP.almacen = {
    estado: estado,
    guardar: guardar,
    alCambiar: alCambiar,
    hoy: hoy,
    diaMas: diaMas,
    MAX_VIDAS: MAX_VIDAS,
    vidas: vidas,
    segundosParaVida: segundosParaVida,
    perderVida: perderVida,
    llenarVidas: llenarVidas,
    sumarXp: sumarXp,
    sumarMinutos: sumarMinutos,
    minutosDelDia: minutosDelDia,
    minutosTotales: minutosTotales,
    minutosDeLaSemana: minutosDeLaSemana,
    diasEstudiados: diasEstudiados,
    xpDeHoy: xpDeHoy,
    totalXp: totalXp,
    aparato: aparato,
    metaCumplida: metaCumplida,
    rachaViva: rachaViva,
    semana: semana,
    nivel: nivel,
    leccion: leccion,
    terminarLeccion: terminarLeccion,
    leccionAbierta: leccionAbierta,
    siguienteLeccion: siguienteLeccion,
    contar: contar,
    cuenta: cuenta,
    PARA_ESCRIBIR: PARA_ESCRIBIR,
    PARA_DOMINAR: PARA_DOMINAR,
    regla: regla,
    etapaRegla: etapaRegla,
    anotarRegla: anotarRegla,
    nivelCurso: nivel_,
    abrirNivel: abrirNivel,
    anotarExamen: anotarExamen,
    record: record,
    mejorMarca: mejorMarca,
    anotarError: anotarError,
    marcarSuperado: marcarSuperado,
    exportar: exportar,
    importar: importar,
    fusionarProgreso: fusionarProgreso,
    reemplazarEstado: reemplazarEstado,
    borrarTodo: borrarTodo,
  };
})();
