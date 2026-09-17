/* Confeti y celebraciones.
 *
 * No es adorno gratis: el momento en que se termina una lección es el que hace
 * volver mañana, y un número que aparece de golpe no se siente como un logro.
 *
 * Se dibuja en un <canvas> encima de todo, con partículas de verdad, en vez de
 * animar cien elementos del documento: cien nodos animándose a la vez hacen
 * saltar la imagen en un teléfono modesto, y un canvas ni se despeina.
 */
(function () {
  "use strict";

  const COLORES = ["#58cc02", "#1cb0f6", "#ffc800", "#ff4b4b", "#ce82ff", "#ff9600"];

  function reducido() {
    // Quien pidió menos animaciones en su teléfono no quiere confeti.
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  }

  function confeti(opciones) {
    if (reducido()) return;
    const o = opciones || {};
    const cantidad = o.cantidad || 90;

    const lienzo = document.createElement("canvas");
    lienzo.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:200";
    document.body.appendChild(lienzo);

    const escala = window.devicePixelRatio || 1;
    const ancho = lienzo.offsetWidth;
    const alto = lienzo.offsetHeight;
    lienzo.width = ancho * escala;
    lienzo.height = alto * escala;
    const ctx = lienzo.getContext("2d");
    ctx.scale(escala, escala);

    // Salen desde abajo hacia arriba, como un cañón de fiesta, y caen. Que
    // suban primero hace que se vean incluso en pantallas cortas.
    const trozos = [];
    for (let i = 0; i < cantidad; i++) {
      trozos.push({
        x: ancho * (0.5 + (Math.random() - 0.5) * 0.5),
        y: alto + 10,
        vx: (Math.random() - 0.5) * 9,
        vy: -(10 + Math.random() * 12),
        giro: Math.random() * Math.PI,
        vGiro: (Math.random() - 0.5) * 0.35,
        ancho: 6 + Math.random() * 6,
        alto: 9 + Math.random() * 8,
        color: COLORES[Math.floor(Math.random() * COLORES.length)],
      });
    }

    const GRAVEDAD = 0.42;
    const ROCE = 0.995;
    let cuadros = 0;

    function dibujar() {
      cuadros++;
      ctx.clearRect(0, 0, ancho, alto);
      let vivos = 0;
      trozos.forEach(function (t) {
        t.vy += GRAVEDAD;
        t.vx *= ROCE;
        t.x += t.vx;
        t.y += t.vy;
        t.giro += t.vGiro;
        if (t.y < alto + 40) vivos++;
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.giro);
        ctx.fillStyle = t.color;
        // El alto varía con el giro: da la ilusión de un papel dando vueltas
        // sin tener que dibujar nada en tres dimensiones.
        ctx.fillRect(-t.ancho / 2, -t.alto / 2, t.ancho, t.alto * Math.abs(Math.cos(t.giro)));
        ctx.restore();
      });
      if (vivos > 0 && cuadros < 400) {
        requestAnimationFrame(dibujar);
      } else {
        lienzo.remove();
      }
    }
    requestAnimationFrame(dibujar);
  }

  function chispas(elemento) {
    /* Un destello corto sobre el botón que se acertó. Es la recompensa más
     * pequeña que existe y es la que más veces se ve en una sesión. */
    if (reducido() || !elemento) return;
    const caja = elemento.getBoundingClientRect();
    const capa = document.createElement("div");
    capa.style.cssText = "position:fixed;pointer-events:none;z-index:200;left:" +
      (caja.left + caja.width / 2) + "px;top:" + (caja.top + caja.height / 2) + "px";
    document.body.appendChild(capa);

    for (let i = 0; i < 8; i++) {
      const p = document.createElement("i");
      const angulo = (Math.PI * 2 * i) / 8;
      const dist = 26 + Math.random() * 18;
      p.style.cssText =
        "position:absolute;width:7px;height:7px;border-radius:50%;background:" +
        COLORES[i % COLORES.length] +
        ";transform:translate(-50%,-50%);transition:transform .45s cubic-bezier(.2,.8,.3,1),opacity .45s";
      capa.appendChild(p);
      // Dos cuadros de espera antes de mover: sin esto el navegador aplica el
      // estado final de una vez y no hay animación que ver.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          p.style.transform =
            "translate(-50%,-50%) translate(" + Math.cos(angulo) * dist + "px," +
            Math.sin(angulo) * dist + "px) scale(.3)";
          p.style.opacity = "0";
        });
      });
    }
    setTimeout(function () { capa.remove(); }, 600);
  }

  window.APP = window.APP || {};
  APP.fiesta = { confeti: confeti, chispas: chispas };
})();
