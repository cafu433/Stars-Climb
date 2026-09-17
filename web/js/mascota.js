/* Pelusa, la chinchilla.
 *
 * Una aplicación de práctica diaria necesita a alguien al otro lado. Sin eso,
 * fallar es sólo un número que baja; con alguien mirando, fallar da un poco de
 * pena y acertar da gusto. Es la parte más barata de programar y la que más
 * cambia cómo se siente usarla.
 *
 * Es una chinchilla y no un búho por dos razones: la chinchilla es chilena, y
 * es redonda —dos orejas grandes y un cuerpo en forma de huevo se dibujan con
 * cuatro elipses y quedan bien a cualquier tamaño—.
 *
 * Se dibuja en SVG en línea, sin imágenes que descargar: cambia de expresión
 * cambiando dos trazos, y funciona sin internet como todo lo demás.
 */
(function () {
  "use strict";

  // Colores propios, no los del tema: Pelusa tiene que verse igual de bien
  // sobre el fondo blanco y sobre el oscuro, y un gris de pelaje funciona en
  // los dos.
  const PELO = "#aebccb";
  const PELO_OSCURO = "#8c9dae";
  const PANZA = "#e8eef4";
  const OREJA = "#f2b8c6";
  const OJO = "#2b3a44";
  const NARIZ = "#e2879b";

  /* Cada expresión son sólo los ojos y la boca: el cuerpo no cambia nunca.
   * Así agregar un estado nuevo es agregar dos trazos, no dibujar otra
   * chinchilla. */
  const CARAS = {
    normal:
      '<circle cx="39" cy="56" r="5" fill="' + OJO + '"/>' +
      '<circle cx="61" cy="56" r="5" fill="' + OJO + '"/>' +
      '<circle cx="40.8" cy="54.2" r="1.8" fill="#fff"/>' +
      '<circle cx="62.8" cy="54.2" r="1.8" fill="#fff"/>' +
      '<path d="M45 70 q5 4 10 0" stroke="' + OJO + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>',

    feliz:
      // Ojos cerrados hacia arriba: es lo que hace que se lea "contenta" y no
      // "sorprendida", que es el error clásico al dibujar una cara alegre.
      '<path d="M33 57 q6 -7 12 0" stroke="' + OJO + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M55 57 q6 -7 12 0" stroke="' + OJO + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M43 68 q7 8 14 0" stroke="' + OJO + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="30" cy="65" r="4.5" fill="' + OREJA + '" opacity=".75"/>' +
      '<circle cx="70" cy="65" r="4.5" fill="' + OREJA + '" opacity=".75"/>',

    triste:
      /* Las cejas suben hacia adentro, no bajan: bajando hacia el centro la
       * cara se lee enojada, que es lo último que uno quiere ver después de
       * equivocarse. */
      '<circle cx="39" cy="59" r="4.5" fill="' + OJO + '"/>' +
      '<circle cx="61" cy="59" r="4.5" fill="' + OJO + '"/>' +
      '<circle cx="40.4" cy="57.6" r="1.5" fill="#fff"/>' +
      '<circle cx="62.4" cy="57.6" r="1.5" fill="#fff"/>' +
      '<path d="M32 52 q6 -4 12 -1" stroke="' + OJO + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M68 52 q-6 -4 -12 -1" stroke="' + OJO + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M45 73 q5 -4 10 0" stroke="' + OJO + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M35 64 q2 5 0 7 q-2 -2 0 -7z" fill="#7cc4f0"/>',

    fiesta:
      '<path d="M39 50 l1.8 4 4.2 .5 -3 3 .8 4.2 -3.8-2.2 -3.8 2.2 .8-4.2 -3-3 4.2-.5z" fill="' + OJO + '"/>' +
      '<path d="M61 50 l1.8 4 4.2 .5 -3 3 .8 4.2 -3.8-2.2 -3.8 2.2 .8-4.2 -3-3 4.2-.5z" fill="' + OJO + '"/>' +
      '<path d="M42 67 q8 10 16 0 z" fill="' + OJO + '"/>' +
      '<circle cx="29" cy="65" r="5" fill="' + OREJA + '" opacity=".8"/>' +
      '<circle cx="71" cy="65" r="5" fill="' + OREJA + '" opacity=".8"/>',

    pensando:
      '<circle cx="41" cy="56" r="4.5" fill="' + OJO + '"/>' +
      '<circle cx="63" cy="56" r="4.5" fill="' + OJO + '"/>' +
      '<circle cx="42.5" cy="54.4" r="1.6" fill="#fff"/>' +
      '<circle cx="64.5" cy="54.4" r="1.6" fill="#fff"/>' +
      '<path d="M33 47 q6 -3 11 0" stroke="' + OJO + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M45 70 h9" stroke="' + OJO + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>',

    dormida:
      '<path d="M33 57 q6 6 12 0" stroke="' + OJO + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '<path d="M55 57 q6 6 12 0" stroke="' + OJO + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '<path d="M46 70 q4 3 8 0" stroke="' + OJO + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<text x="79" y="46" font-size="15" fill="' + OJO + '" font-weight="800" opacity=".55">z</text>' +
      '<text x="88" y="34" font-size="10" fill="' + OJO + '" font-weight="800" opacity=".4">z</text>',
  };

  function svg(cara, tamano) {
    const t = tamano || 96;
    const c = CARAS[cara] ? cara : "normal";
    return (
      '<svg class="pelusa" viewBox="0 0 100 100" width="' + t + '" height="' + t +
      '" role="img" aria-label="Pelusa, la mascota">' +
      // Orejas: van primero para que el cuerpo las tape por abajo y se vean
      // nacidas de la cabeza en vez de pegadas encima.
      '<ellipse cx="27" cy="27" rx="13" ry="17" fill="' + PELO + '" transform="rotate(-18 27 27)"/>' +
      '<ellipse cx="73" cy="27" rx="13" ry="17" fill="' + PELO + '" transform="rotate(18 73 27)"/>' +
      '<ellipse cx="28" cy="29" rx="6.5" ry="9.5" fill="' + OREJA + '" transform="rotate(-18 28 29)"/>' +
      '<ellipse cx="72" cy="29" rx="6.5" ry="9.5" fill="' + OREJA + '" transform="rotate(18 72 29)"/>' +
      '<ellipse cx="50" cy="58" rx="33" ry="31" fill="' + PELO + '"/>' +
      '<ellipse cx="50" cy="70" rx="21" ry="17" fill="' + PANZA + '"/>' +
      // Bigotes
      '<g stroke="' + PELO_OSCURO + '" stroke-width="1.4" stroke-linecap="round">' +
      '<path d="M22 62 h-9"/><path d="M22 67 h-10"/>' +
      '<path d="M78 62 h9"/><path d="M78 67 h10"/></g>' +
      '<ellipse cx="50" cy="65" rx="3.4" ry="2.6" fill="' + NARIZ + '"/>' +
      CARAS[c] +
      "</svg>"
    );
  }

  /* Lo que dice según cómo va la cosa. Frases cortas, en chileno, sin
   * felicitaciones vacías: si no hay nada que decir, mejor callarse. */
  function saludo() {
    const a = APP.almacen;
    const racha = a.rachaViva();
    const pendientes = APP.srs.pendientes().length;
    const hora = new Date().getHours();

    if (a.metaCumplida()) {
      return { cara: "fiesta", texto: "Meta del día lista. Lo que hagas de acá es ganancia." };
    }
    if (pendientes >= 15) {
      return { cara: "pensando", texto: "Tienes " + pendientes + " palabras esperando repaso." };
    }
    if (racha >= 7) {
      return { cara: "feliz", texto: "¡" + racha + " días seguidos! No lo cortes hoy." };
    }
    if (racha >= 1) {
      return { cara: "feliz", texto: "Vas " + racha + (racha === 1 ? " día" : " días") + ". Una lección y sumas otro." };
    }
    if (hora >= 23 || hora < 6) {
      return { cara: "dormida", texto: "Yo tengo sueño, pero si tú puedes, dale." };
    }
    if (a.estado().xp === 0) {
      return { cara: "feliz", texto: "Hola, soy Pelusa. Partamos por la primera lección." };
    }
    return { cara: "normal", texto: "¿Practicamos un rato?" };
  }

  function burbuja(cara, texto, tamano) {
    return (
      '<div class="pelusa-fila">' + svg(cara, tamano || 66) +
      '<div class="pelusa-dice">' + APP.dom.esc(texto) + "</div></div>"
    );
  }

  window.APP = window.APP || {};
  APP.mascota = { svg: svg, saludo: saludo, burbuja: burbuja, CARAS: CARAS };
})();
