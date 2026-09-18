/* El curso: tres niveles, sus unidades y sus lecciones.
 *
 * Los niveles siguen el marco europeo (A1-A2, B1, B2) porque es el que usan
 * los institutos y las empresas: saber que vas "por B1" sirve fuera de la
 * aplicación, y "nivel 7 de 12" no le dice nada a nadie.
 *
 * Cada unidad puede abrir con una CLASE —uno o más temas de gramática que se
 * explican antes de practicar— y puede pedir REGLAS, que son tandas de
 * ejercicios de una sola regla. Ése es el orden con que se enseña un idioma en
 * el colegio y en los libros de gramática, y es bastante más rápido que
 * deducir la regla de los ejemplos: un adulto entiende "he lleva -s" en diez
 * segundos leyéndolo, y en veinte ejercicios adivinándolo.
 *
 * La primera unidad no enseña vocabulario: enseña a armar una frase. Está
 * antes que todo lo demás a propósito, porque saberse cien palabras sin saber
 * ponerlas en orden no sirve para hablar.
 *
 * ── Los ids no se tocan ──
 * El avance guardado en el teléfono se archiva por id de lección. Cambiar
 * "u1l1" por otra cosa dejaría huérfano el progreso de quien ya venía usando
 * la aplicación. Por eso las unidades viejas conservan su numeración aunque
 * ahora estén repartidas en niveles y el orden de aparición sea otro.
 */
(function () {
  "use strict";

  // Tipos de ejercicio disponibles, por dificultad creciente. Las lecciones los
  // nombran; si un tipo no se puede armar con el contenido del tema (por
  // ejemplo "arma la frase" en un tema que sólo tiene palabras sueltas), el
  // motor lo salta en silencio en vez de fallar.
  const RECONOCER = ["pares", "elige-en", "elige-es", "escucha-elige"];
  const PRODUCIR = ["arma-en", "arma-es", "escribe-en", "elige-en"];
  const COMPLETO = ["arma-en", "arma-es", "escribe-en", "dictado", "habla", "escucha-elige"];

  /* Qué destreza entrena cada tipo de ejercicio. Se deriva acá en vez de
   * anotarse lección por lección: así no se puede desincronizar, y la pantalla
   * de progreso puede decir con verdad "vas fuerte en leer y floja en hablar",
   * que es la información que de verdad sirve para saber qué practicar. */
  const DESTREZA = {
    pares: "leer", "elige-en": "leer", "elige-es": "leer", hueco: "leer",
    registro: "leer", lectura: "leer", minimos: "escuchar",
    "escucha-elige": "escuchar", dictado: "escuchar",
    "arma-en": "escribir", "arma-es": "escribir", "escribe-en": "escribir",
    verbo: "escribir", regla: "escribir",
    habla: "hablar",
  };

  const UNIDADES = [
    /* ================= BÁSICO ================= */
    {
      id: "u0",
      nivel: "basico",
      titulo: "Cómo se arma el inglés",
      resumen: "Las piezas: pronombres, verbos, adjetivos y el orden",
      color: "#6366f1",
      icon: "🧱",
      lecciones: [
        /* Practica pronombres, no saludos. Antes esta lección explicaba los
         * pronombres y a continuación preguntaba "Fue un gusto conocerte":
         * la clase y el ejercicio no tenían nada que ver, y eso deja la
         * sensación de que la explicación no servía para nada. */
        { id: "u0l1", titulo: "Los pronombres", clase: ["pronombres-sujeto"], reglas: ["pronombres"], n: 12 },
        { id: "u0l2", titulo: "El verbo to be", clase: ["to-be"], reglas: ["am-is-are"], n: 12 },
        { id: "u0l3", titulo: "A, an y the", clase: ["articulos"], reglas: ["a-an"], n: 12 },
        { id: "u0l4", titulo: "Uno y muchos", clase: ["plurales"], reglas: ["plural-s"], n: 12 },
        { id: "u0l5", titulo: "Los adjetivos", clase: ["adjetivos"], reglas: ["adjetivo-orden"], n: 12 },
        /* Sin 'clase': la regla tercera-s ya trae su propia explicación, y
         * anteponerle el tema "el orden de las palabras" enseñaba una cosa
         * para practicar otra. Cuando una lección pide una regla y no declara
         * clase, la ficha de la regla hace de clase. */
        { id: "u0l6", titulo: "La -s de he y she", reglas: ["tercera-s"], n: 12 },
        { id: "u0l7", titulo: "Preguntar y negar", clase: ["preguntas", "negacion"], reglas: ["do-does", "to-be-negativo"], n: 14 },
        { id: "u0l8", titulo: "Hay: there is", clase: ["there-is"], reglas: ["there-is-are", "have-has"], n: 12 },
        { id: "u0l9", titulo: "Todo junto", skills: ["saludos"], tipos: ["pares", "elige-en", "elige-es"], n: 12 },
      ],
    },
    {
      id: "u1",
      nivel: "basico",
      titulo: "Primeros pasos",
      resumen: "Saludar, decir quién eres y contar",
      color: "#58cc02",
      icon: "👋",
      lecciones: [
        { id: "u1l1", titulo: "Hola", skills: ["saludos"], tipos: RECONOCER, n: 10 },
        { id: "u1l2", titulo: "Números", skills: ["numeros"], tipos: RECONOCER, n: 12 },
        { id: "u1l3", titulo: "Colores", skills: ["colores"], tipos: RECONOCER, n: 12 },
        { id: "u1l4", titulo: "Preséntate", skills: ["saludos"], tipos: PRODUCIR, n: 12 },
        { id: "u1l5", titulo: "Todo junto", skills: ["saludos", "numeros", "colores"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u2",
      nivel: "basico",
      titulo: "Mi mundo",
      resumen: "Las cosas, la casa y la familia",
      color: "#1cb0f6",
      icon: "🏠",
      lecciones: [
        { id: "u2l1", titulo: "Cosas del día", skills: ["objetos"], tipos: RECONOCER, n: 12 },
        { id: "u2l2", titulo: "La casa", skills: ["casa"], tipos: RECONOCER, n: 12 },
        { id: "u2l3", titulo: "La familia", skills: ["familia"], tipos: RECONOCER, n: 12 },
        { id: "u2l4", titulo: "¿Dónde está?", clase: ["preposiciones"], skills: ["objetos", "casa"], tipos: PRODUCIR, n: 12 },
        { id: "u2l5", titulo: "Habla de los tuyos", skills: ["familia", "casa", "objetos"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u3",
      nivel: "basico",
      titulo: "Comida y salir",
      resumen: "Pedir en un restaurante sin miedo",
      color: "#ff9600",
      icon: "🍽️",
      lecciones: [
        { id: "u3l1", titulo: "Comida", skills: ["comida"], tipos: RECONOCER, n: 12 },
        { id: "u3l2", titulo: "En el restaurante", skills: ["restaurante"], tipos: PRODUCIR, n: 12 },
        { id: "u3l3", titulo: "El cuerpo", skills: ["cuerpo"], tipos: RECONOCER, n: 12 },
        { id: "u3l4", titulo: "Pedir y explicar", skills: ["restaurante", "comida"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u4",
      nivel: "basico",
      titulo: "Mi rutina",
      resumen: "El presente: lo que haces todos los días",
      color: "#ce82ff",
      icon: "⏰",
      lecciones: [
        { id: "u4l1", titulo: "Verbos del día", clase: ["auxiliar-do"], skills: ["presente"], tipos: ["verbo", "elige-es", "hueco"], n: 12 },
        { id: "u4l2", titulo: "Lo que pasa ahora", clase: ["tiempos"], reglas: ["ing"], n: 12 },
        { id: "u4l3", titulo: "Días y meses", skills: ["calendario"], tipos: RECONOCER, n: 12 },
        { id: "u4l4", titulo: "El clima", skills: ["clima"], tipos: RECONOCER, n: 12 },
        { id: "u4l5", titulo: "Cuenta tu rutina", skills: ["presente", "calendario"], tipos: PRODUCIR, n: 12 },
        { id: "u4l6", titulo: "Presente completo", skills: ["presente", "clima", "calendario"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u10",
      nivel: "basico",
      titulo: "El oído fino",
      resumen: "Los 20 sonidos de vocales que el español no tiene",
      color: "#8b5cf6",
      icon: "👂",
      lecciones: [
        { id: "u10l1", titulo: "Cortas y largas", skills: ["vocales"], tipos: ["minimos"], n: 10 },
        { id: "u10l2", titulo: "Diptongos", skills: ["vocales"], tipos: ["minimos"], n: 10 },
        { id: "u10l3", titulo: "Escucha y escribe", skills: ["vocales", "objetos", "comida"], tipos: ["dictado", "escucha-elige", "habla"], n: 12 },
      ],
    },
    {
      id: "u11",
      nivel: "basico",
      titulo: "Más mundo",
      resumen: "Animales, ropa y moverse por la ciudad",
      color: "#14b8a6",
      icon: "🌍",
      lecciones: [
        { id: "u11l1", titulo: "Animales", skills: ["animales"], tipos: RECONOCER, n: 12 },
        { id: "u11l2", titulo: "Ropa", skills: ["ropa"], tipos: RECONOCER, n: 12 },
        { id: "u11l3", titulo: "Transporte", skills: ["transporte"], tipos: RECONOCER, n: 12 },
        { id: "u11l4", titulo: "Todo junto", skills: ["animales", "ropa", "transporte"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u12",
      nivel: "basico",
      titulo: "Leer de corrido",
      resumen: "Textos cortos, para dejar de traducir palabra por palabra",
      color: "#0ea5e9",
      icon: "📖",
      lecciones: [
        { id: "u12l1", titulo: "Un lunes normal", texto: "lec-oficina" },
        { id: "u12l2", titulo: "Mi familia", texto: "lec-familia" },
        { id: "u12l3", titulo: "En el supermercado", texto: "lec-tienda" },
      ],
    },

    /* ================= INTERMEDIO ================= */
    {
      id: "u7",
      nivel: "intermedio",
      titulo: "Lo que pasó",
      resumen: "El pasado, el -ed y los irregulares",
      color: "#ff4b4b",
      icon: "⏮️",
      lecciones: [
        { id: "u7l5", titulo: "Was y were", clase: ["to-be"], reglas: ["was-were"], n: 12 },
        { id: "u7l1", titulo: "Pasado regular", reglas: ["pasado-ed"], skills: ["pasado"], tipos: ["verbo", "hueco"], n: 14 },
        { id: "u7l2", titulo: "Irregulares", reglas: ["pasado-irregular"], skills: ["pasado"], tipos: ["verbo", "hueco"], n: 14 },
        { id: "u7l6", titulo: "Preguntar en pasado", reglas: ["did"], n: 12 },
        { id: "u7l3", titulo: "Cuenta tu día", skills: ["pasado"], tipos: PRODUCIR, n: 12 },
        { id: "u7l4", titulo: "Pasado completo", skills: ["pasado"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u8",
      nivel: "intermedio",
      titulo: "Lo que viene",
      resumen: "Planes, futuro e invitaciones",
      color: "#ffc800",
      icon: "⏭️",
      lecciones: [
        { id: "u8l4", titulo: "Will o going to", clase: ["tiempos"], reglas: ["will-going"], n: 12 },
        { id: "u8l1", titulo: "Futuro con will", skills: ["futuro"], tipos: ["verbo", "hueco"], n: 12 },
        { id: "u8l2", titulo: "Planes", skills: ["actividades"], tipos: PRODUCIR, n: 12 },
        { id: "u8l3", titulo: "Invitar y aceptar", skills: ["actividades", "futuro"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u5",
      nivel: "intermedio",
      titulo: "El trabajo",
      resumen: "Reuniones, correos y colegas",
      color: "#2b70c9",
      icon: "💼",
      lecciones: [
        { id: "u5l1", titulo: "Profesiones", skills: ["profesiones"], tipos: RECONOCER, n: 12 },
        { id: "u5l2", titulo: "Frases de oficina", skills: ["trabajo"], tipos: PRODUCIR, n: 12 },
        { id: "u5l3", titulo: "Formal o informal", clase: ["modales"], skills: ["formal"], tipos: ["registro"], n: 8 },
        { id: "u5l4", titulo: "Hablar en la reunión", skills: ["trabajo", "profesiones"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u13",
      nivel: "intermedio",
      titulo: "Phrasal verbs",
      resumen: "Cuando la preposición cambia lo que significa el verbo",
      color: "#f97316",
      icon: "🧩",
      lecciones: [
        { id: "u13l1", titulo: "Los del día a día", skills: ["phrasal"], tipos: RECONOCER, n: 12 },
        { id: "u13l2", titulo: "Los de la oficina", skills: ["phrasal"], tipos: PRODUCIR, n: 12 },
        { id: "u13l3", titulo: "Úsalos", skills: ["phrasal"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u9",
      nivel: "intermedio",
      titulo: "Cómo me siento",
      resumen: "Emociones y la trampa de -ing / -ed",
      color: "#ec4899",
      icon: "❤️",
      lecciones: [
        { id: "u9l1", titulo: "Emociones", skills: ["emociones"], tipos: RECONOCER, n: 12 },
        { id: "u9l2", titulo: "-ing o -ed", clase: ["inged"], skills: ["inged"], tipos: ["hueco"], n: 10 },
        { id: "u9l3", titulo: "Decir cómo estás", skills: ["emociones", "inged"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u14",
      nivel: "intermedio",
      titulo: "Conectar ideas",
      resumen: "However, although, therefore: lo que separa a un principiante",
      color: "#8b5cf6",
      icon: "🔗",
      lecciones: [
        { id: "u14l1", titulo: "Los conectores", skills: ["conectores"], tipos: RECONOCER, n: 12 },
        { id: "u14l2", titulo: "Comparar", clase: ["comparativos"], reglas: ["comparativo"], n: 12 },
        { id: "u14l3", titulo: "Unir dos frases", skills: ["conectores"], tipos: PRODUCIR, n: 12 },
        { id: "u14l4", titulo: "Explicarte bien", skills: ["conectores"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u6",
      nivel: "intermedio",
      titulo: "Contabilidad y compras",
      resumen: "El inglés que necesitas en tu pega",
      color: "#00a86b",
      icon: "🧾",
      lecciones: [
        { id: "u6l1", titulo: "Facturas y pagos", skills: ["oficina"], tipos: PRODUCIR, n: 12 },
        { id: "u6l2", titulo: "Proveedores", skills: ["oficina"], tipos: ["arma-en", "escribe-en", "dictado"], n: 12 },
        { id: "u6l3", titulo: "Importaciones", skills: ["oficina", "transporte"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u15",
      nivel: "intermedio",
      titulo: "Leer del trabajo",
      resumen: "Un correo de un proveedor, un acta de reunión",
      color: "#0284c7",
      icon: "📧",
      lecciones: [
        { id: "u15l1", titulo: "Correo de un proveedor", texto: "lec-correo" },
        { id: "u15l2", titulo: "El vuelo que no salió", texto: "lec-viaje" },
        { id: "u15l3", titulo: "Acta de la reunión", texto: "lec-reunion" },
      ],
    },

    /* ================= AVANZADO ================= */
    {
      id: "u16",
      nivel: "avanzado",
      titulo: "Los tiempos perfectos",
      resumen: "“He trabajado” y “trabajé” no se reparten como en español",
      color: "#dc2626",
      icon: "🔗",
      lecciones: [
        { id: "u16l1", titulo: "Present perfect", clase: ["tiempos"], reglas: ["perfecto"], n: 14 },
        { id: "u16l2", titulo: "Los participios", skills: ["pasado"], tipos: ["verbo"], n: 14 },
        { id: "u16l3", titulo: "Cuál va acá", reglas: ["perfecto", "pasado-irregular"], n: 14 },
      ],
    },
    {
      id: "u17",
      nivel: "avanzado",
      titulo: "Expresiones que no se traducen",
      resumen: "Make a decision, keep in mind, take into account",
      color: "#7c3aed",
      icon: "💬",
      lecciones: [
        { id: "u17l1", titulo: "Las combinaciones fijas", skills: ["expresiones"], tipos: RECONOCER, n: 12 },
        { id: "u17l2", titulo: "Usarlas bien", skills: ["expresiones"], tipos: PRODUCIR, n: 12 },
        { id: "u17l3", titulo: "En conversación", skills: ["expresiones", "conectores"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u18",
      nivel: "avanzado",
      titulo: "Los matices",
      resumen: "Adverbios, comparaciones y dónde va cada cosa",
      color: "#0891b2",
      icon: "🎚️",
      lecciones: [
        { id: "u18l1", titulo: "Los adverbios", clase: ["adverbios"], skills: ["conectores"], tipos: ["elige-en", "hueco"], n: 12 },
        { id: "u18l2", titulo: "Modales", clase: ["modales"], skills: ["formal"], tipos: ["registro"], n: 10 },
        { id: "u18l3", titulo: "Decirlo con precisión", skills: ["expresiones", "conectores"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u19",
      nivel: "avanzado",
      titulo: "Inglés de negocios",
      resumen: "Contratos, cotizaciones y pedir las cosas bien",
      color: "#065f46",
      icon: "📑",
      lecciones: [
        { id: "u19l1", titulo: "Cotizar y negociar", skills: ["oficina"], tipos: PRODUCIR, n: 12 },
        { id: "u19l2", titulo: "Escribir un correo", skills: ["oficina", "trabajo"], tipos: ["arma-en", "escribe-en"], n: 14 },
        { id: "u19l3", titulo: "Decirlo en voz alta", skills: ["oficina", "trabajo", "expresiones"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u20",
      nivel: "avanzado",
      titulo: "Leer sin glosario",
      resumen: "Textos de verdad, con ideas y no sólo con datos",
      color: "#1e3a8a",
      icon: "📚",
      lecciones: [
        { id: "u20l1", titulo: "Lo que dice la cláusula", texto: "lec-contrato" },
        { id: "u20l2", titulo: "La semana de cuatro días", texto: "lec-trabajo" },
        { id: "u20l3", titulo: "La factura pagada dos veces", texto: "lec-error" },
      ],
    },
  ];

  /* Los tres niveles. 'puedes' no es adorno: dice en cristiano qué vas a poder
   * hacer al terminarlo, que es la única medida de nivel que le importa a
   * alguien que quiere usar el idioma y no aprobar un examen. */
  const NIVELES = [
    {
      id: "basico",
      titulo: "Básico",
      mcer: "A1 – A2",
      emo: "🌱",
      color: "#58cc02",
      resumen: "Desde cero hasta poder defenderte en lo cotidiano",
      puedes: [
        "Presentarte y contar de ti, tu familia y tu trabajo",
        "Pedir en un restaurante y comprar cosas",
        "Armar frases correctas en presente, preguntar y negar",
        "Leer un texto corto y entenderlo sin traducir palabra por palabra",
      ],
    },
    {
      id: "intermedio",
      titulo: "Intermedio",
      mcer: "B1",
      emo: "🌳",
      color: "#1cb0f6",
      resumen: "El nivel que piden en la mayoría de los trabajos",
      puedes: [
        "Contar lo que pasó y lo que vas a hacer",
        "Escribir y entender un correo de trabajo",
        "Usar phrasal verbs y conectar ideas con however, although, so",
        "Seguir una reunión y decir lo que piensas",
      ],
    },
    {
      id: "avanzado",
      titulo: "Avanzado",
      mcer: "B2",
      emo: "🏔️",
      color: "#8b5cf6",
      resumen: "Hablar con matices, no sólo hacerte entender",
      puedes: [
        "Distinguir el present perfect del pasado simple sin pensarlo",
        "Usar expresiones que no se pueden traducir literalmente",
        "Leer un contrato o un artículo sin glosario",
        "Negociar, matizar y pedir las cosas con el tono correcto",
      ],
    },
  ];

  /* Lista plana de lecciones, en el orden del curso: la usa el camino para
   * saber qué está desbloqueado y cuál viene después. */
  const LECCIONES = [];
  UNIDADES.forEach(function (u) {
    u.lecciones.forEach(function (l, i) {
      LECCIONES.push(
        Object.assign({}, l, {
          unidad: u.id,
          nivel: u.nivel,
          color: u.color,
          icon: u.icon,
          indice: i,
          destrezas: destrezasDe(l),
        })
      );
    });
  });

  function destrezasDe(l) {
    const out = [];
    function meter(d) { if (d && out.indexOf(d) < 0) out.push(d); }
    if (l.texto) meter("leer");
    if (l.reglas && l.reglas.length) meter("escribir");
    (l.tipos || []).forEach(function (t) { meter(DESTREZA[t]); });
    if (l.clase && l.clase.length && !out.length) meter("leer");
    return out;
  }

  function delNivel(nivelId) {
    return UNIDADES.filter(function (u) { return u.nivel === nivelId; });
  }

  function leccionesDelNivel(nivelId) {
    return LECCIONES.filter(function (l) { return l.nivel === nivelId; });
  }

  window.APP = window.APP || {};
  APP.curriculo = {
    NIVELES: NIVELES,
    UNIDADES: UNIDADES,
    LECCIONES: LECCIONES,
    DESTREZAS: ["leer", "escribir", "escuchar", "hablar"],
    leccion: function (id) {
      return LECCIONES.filter(function (l) { return l.id === id; })[0] || null;
    },
    unidad: function (id) {
      return UNIDADES.filter(function (u) { return u.id === id; })[0] || null;
    },
    nivel: function (id) {
      return NIVELES.filter(function (n) { return n.id === id; })[0] || null;
    },
    delNivel: delNivel,
    leccionesDelNivel: leccionesDelNivel,
  };
})();
