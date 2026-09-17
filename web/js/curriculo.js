/* El camino del curso: unidades y lecciones.
 *
 * Cada lección dice de qué temas saca el contenido y qué tipos de ejercicio
 * acepta; el motor se encarga de armarlos. Separarlo así permite reordenar el
 * curso o meter una unidad nueva sin tocar el motor ni las pantallas.
 *
 * Orden pensado para alguien que parte de cero y necesita el inglés para
 * trabajar: primero sobrevivir en una conversación, después la oficina, y los
 * tiempos verbales repartidos a lo largo del camino en vez de todos juntos.
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

  const UNIDADES = [
    {
      id: "u1",
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
      titulo: "Mi mundo",
      resumen: "Las cosas, la casa y la familia",
      color: "#1cb0f6",
      icon: "🏠",
      lecciones: [
        { id: "u2l1", titulo: "Cosas del día", skills: ["objetos"], tipos: RECONOCER, n: 12 },
        { id: "u2l2", titulo: "La casa", skills: ["casa"], tipos: RECONOCER, n: 12 },
        { id: "u2l3", titulo: "La familia", skills: ["familia"], tipos: RECONOCER, n: 12 },
        { id: "u2l4", titulo: "¿Dónde está?", skills: ["objetos", "casa"], tipos: PRODUCIR, n: 12 },
        { id: "u2l5", titulo: "Habla de los tuyos", skills: ["familia", "casa", "objetos"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u3",
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
      titulo: "Mi rutina",
      resumen: "El presente: lo que haces todos los días",
      color: "#ce82ff",
      icon: "⏰",
      lecciones: [
        { id: "u4l1", titulo: "Verbos del día", skills: ["presente"], tipos: ["verbo", "elige-es", "hueco"], n: 12 },
        { id: "u4l2", titulo: "Días y meses", skills: ["calendario"], tipos: RECONOCER, n: 12 },
        { id: "u4l3", titulo: "El clima", skills: ["clima"], tipos: RECONOCER, n: 12 },
        { id: "u4l4", titulo: "Cuenta tu rutina", skills: ["presente", "calendario"], tipos: PRODUCIR, n: 12 },
        { id: "u4l5", titulo: "Presente completo", skills: ["presente", "clima", "calendario"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u5",
      titulo: "El trabajo",
      resumen: "Reuniones, correos y colegas",
      color: "#2b70c9",
      icon: "💼",
      lecciones: [
        { id: "u5l1", titulo: "Profesiones", skills: ["profesiones"], tipos: RECONOCER, n: 12 },
        { id: "u5l2", titulo: "Frases de oficina", skills: ["trabajo"], tipos: PRODUCIR, n: 12 },
        { id: "u5l3", titulo: "Formal o informal", skills: ["formal"], tipos: ["registro"], n: 8 },
        { id: "u5l4", titulo: "Hablar en la reunión", skills: ["trabajo", "profesiones"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u6",
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
      id: "u7",
      titulo: "Lo que pasó",
      resumen: "El pasado y los verbos irregulares",
      color: "#ff4b4b",
      icon: "⏮️",
      lecciones: [
        { id: "u7l1", titulo: "Pasado regular", skills: ["pasado"], tipos: ["verbo", "hueco", "elige-es"], n: 12 },
        { id: "u7l2", titulo: "Irregulares", skills: ["pasado"], tipos: ["verbo", "hueco"], n: 12 },
        { id: "u7l3", titulo: "Cuenta tu día", skills: ["pasado"], tipos: PRODUCIR, n: 12 },
        { id: "u7l4", titulo: "Pasado completo", skills: ["pasado"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u8",
      titulo: "Lo que viene",
      resumen: "Planes, futuro e invitaciones",
      color: "#ffc800",
      icon: "⏭️",
      lecciones: [
        { id: "u8l1", titulo: "Futuro con will", skills: ["futuro"], tipos: ["verbo", "hueco"], n: 12 },
        { id: "u8l2", titulo: "Planes", skills: ["actividades"], tipos: PRODUCIR, n: 12 },
        { id: "u8l3", titulo: "Invitar y aceptar", skills: ["actividades", "futuro"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u9",
      titulo: "Cómo me siento",
      resumen: "Emociones y la trampa de -ing / -ed",
      color: "#ec4899",
      icon: "❤️",
      lecciones: [
        { id: "u9l1", titulo: "Emociones", skills: ["emociones"], tipos: RECONOCER, n: 12 },
        { id: "u9l2", titulo: "-ing o -ed", skills: ["inged"], tipos: ["hueco"], n: 10 },
        { id: "u9l3", titulo: "Decir cómo estás", skills: ["emociones", "inged"], tipos: COMPLETO, n: 14 },
      ],
    },
    {
      id: "u10",
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
  ];

  // Lista plana de lecciones en orden: la usa el camino para saber qué está
  // desbloqueado y cuál es la siguiente.
  const LECCIONES = [];
  UNIDADES.forEach(function (u) {
    u.lecciones.forEach(function (l, i) {
      LECCIONES.push(
        Object.assign({}, l, { unidad: u.id, color: u.color, icon: u.icon, indice: i })
      );
    });
  });

  window.APP = window.APP || {};
  APP.curriculo = {
    UNIDADES: UNIDADES,
    LECCIONES: LECCIONES,
    leccion: function (id) {
      return LECCIONES.filter(function (l) { return l.id === id; })[0] || null;
    },
    unidad: function (id) {
      return UNIDADES.filter(function (u) { return u.id === id; })[0] || null;
    },
  };
})();
