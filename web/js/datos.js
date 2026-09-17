/* Contenido del curso: vocabulario, frases, gramática y sonidos.
 *
 * Todo el contenido vive acá y sólo acá. Las pantallas y el motor de ejercicios
 * no saben de qué tema viene cada cosa: piden ítems y arman preguntas. Así,
 * agregar una unidad nueva es agregar datos, no código.
 *
 * El inglés es británico (la nota "BrE" marca las palabras que en EE.UU. se
 * dicen distinto) y las traducciones están en español de Chile.
 */
(function () {
  "use strict";

  const NUMBERS = [
  { en: "zero", es: "cero", n: 0 },
  { en: "one", es: "uno", n: 1 },
  { en: "two", es: "dos", n: 2 },
  { en: "three", es: "tres", n: 3 },
  { en: "four", es: "cuatro", n: 4 },
  { en: "five", es: "cinco", n: 5 },
  { en: "six", es: "seis", n: 6 },
  { en: "seven", es: "siete", n: 7 },
  { en: "eight", es: "ocho", n: 8 },
  { en: "nine", es: "nueve", n: 9 },
  { en: "ten", es: "diez", n: 10 },
  { en: "eleven", es: "once", n: 11 },
  { en: "twelve", es: "doce", n: 12 },
  { en: "thirteen", es: "trece", n: 13 },
  { en: "fifteen", es: "quince", n: 15 },
  { en: "twenty", es: "veinte", n: 20 },
  { en: "thirty", es: "treinta", n: 30 },
  { en: "forty", es: "cuarenta", n: 40 },
  { en: "fifty", es: "cincuenta", n: 50 },
  { en: "one hundred", es: "cien", n: 100 },
];

  const COLORS = [
  { en: "red", es: "rojo", hex: "#d64545" },
  { en: "blue", es: "azul", hex: "#3b6fd6" },
  { en: "green", es: "verde", hex: "#3f9c5e" },
  { en: "yellow", es: "amarillo", hex: "#e0c22d" },
  { en: "orange", es: "naranja", hex: "#e0812d" },
  { en: "purple", es: "morado", hex: "#8a4fd6" },
  { en: "pink", es: "rosado", hex: "#e07bb0" },
  { en: "black", es: "negro", hex: "#222222" },
  { en: "white", es: "blanco", hex: "#f2f2f2" },
  { en: "grey", es: "gris", hex: "#8a8a8a", note: "ortografía británica (en EE.UU. se escribe 'gray')" },
  { en: "brown", es: "café", hex: "#7a5230" },
];

  const OBJECTS = [
  { en: "chair", es: "silla", icon: "🪑" },
  { en: "book", es: "libro", icon: "📖" },
  { en: "phone", es: "teléfono", icon: "📱" },
  { en: "computer", es: "computador", icon: "💻" },
  { en: "window", es: "ventana", icon: "🪟" },
  { en: "door", es: "puerta", icon: "🚪" },
  { en: "car", es: "auto", icon: "🚗" },
  { en: "dog", es: "perro", icon: "🐶" },
  { en: "cat", es: "gato", icon: "🐱" },
  { en: "house", es: "casa", icon: "🏠" },
  { en: "tree", es: "árbol", icon: "🌳" },
  { en: "apple", es: "manzana", icon: "🍎" },
  { en: "water", es: "agua", icon: "💧" },
  { en: "bread", es: "pan", icon: "🍞" },
  { en: "shoe", es: "zapato", icon: "👟" },
  { en: "shirt", es: "camisa", icon: "👕" },
  { en: "clock", es: "reloj", icon: "🕐" },
  { en: "key", es: "llave", icon: "🔑" },
  { en: "bag", es: "bolso", icon: "👜" },
  { en: "pen", es: "lápiz", icon: "🖊️" },
  { en: "money", es: "dinero", icon: "💵" },
  { en: "sun", es: "sol", icon: "☀️" },
  { en: "moon", es: "luna", icon: "🌙" },
  { en: "rain", es: "lluvia", icon: "🌧️" },
];

  const FOOD = [
  { en: "egg", es: "huevo", icon: "🥚" },
  { en: "milk", es: "leche", icon: "🥛" },
  { en: "cheese", es: "queso", icon: "🧀" },
  { en: "meat", es: "carne", icon: "🥩" },
  { en: "chicken", es: "pollo", icon: "🍗" },
  { en: "fish", es: "pescado", icon: "🐟" },
  { en: "rice", es: "arroz", icon: "🍚" },
  { en: "soup", es: "sopa", icon: "🍲" },
  { en: "salad", es: "ensalada", icon: "🥗" },
  { en: "biscuit", es: "galleta", icon: "🍪", note: "BrE de 'cookie'" },
  { en: "chips", es: "papas fritas", icon: "🍟", note: "BrE de 'fries'" },
  { en: "crisps", es: "papas fritas de bolsa", icon: "🥔", note: "BrE de 'potato chips'" },
  { en: "cake", es: "torta", icon: "🍰" },
  { en: "chocolate", es: "chocolate", icon: "🍫" },
  { en: "coffee", es: "café", icon: "☕" },
  { en: "tea", es: "té", icon: "🍵" },
  { en: "juice", es: "jugo", icon: "🧃" },
  { en: "ice cream", es: "helado", icon: "🍦" },
  { en: "sandwich", es: "sándwich", icon: "🥪" },
  { en: "vegetables", es: "verduras", icon: "🥦" },
  { en: "fruit", es: "fruta", icon: "🍇" },
  { en: "breakfast", es: "desayuno", icon: "🍳" },
];

  const FAMILY = [
  { en: "mother", es: "madre", icon: "👩" },
  { en: "father", es: "padre", icon: "👨" },
  { en: "sister", es: "hermana", icon: "👧" },
  { en: "brother", es: "hermano", icon: "👦" },
  { en: "grandmother", es: "abuela", icon: "👵" },
  { en: "grandfather", es: "abuelo", icon: "👴" },
  { en: "aunt", es: "tía", icon: "👩‍🦰" },
  { en: "uncle", es: "tío", icon: "👨‍🦰" },
  { en: "cousin", es: "primo/a", icon: "🧑" },
  { en: "son", es: "hijo", icon: "👦" },
  { en: "daughter", es: "hija", icon: "👧" },
  { en: "husband", es: "esposo", icon: "🤵" },
  { en: "wife", es: "esposa", icon: "👰" },
  { en: "baby", es: "bebé", icon: "👶" },
];

  const CLOTHING = [
  { en: "trousers", es: "pantalones", icon: "👖", note: "BrE — no digas 'pants' (en Reino Unido significa ropa interior)" },
  { en: "jumper", es: "chaleco de lana", icon: "🧶", note: "BrE de 'sweater'" },
  { en: "trainers", es: "zapatillas deportivas", icon: "👟", note: "BrE de 'sneakers'" },
  { en: "coat", es: "abrigo", icon: "🧥" },
  { en: "hat", es: "sombrero", icon: "🎩" },
  { en: "scarf", es: "bufanda", icon: "🧣" },
  { en: "gloves", es: "guantes", icon: "🧤" },
  { en: "socks", es: "calcetines", icon: "🧦" },
  { en: "dress", es: "vestido", icon: "👗" },
];

  const BODY = [
  { en: "head", es: "cabeza", icon: "🙂" },
  { en: "hand", es: "mano", icon: "✋" },
  { en: "arm", es: "brazo", icon: "💪" },
  { en: "leg", es: "pierna", icon: "🦵" },
  { en: "foot", es: "pie", icon: "🦶" },
  { en: "eye", es: "ojo", icon: "👁️" },
  { en: "ear", es: "oreja", icon: "👂" },
  { en: "nose", es: "nariz", icon: "👃" },
  { en: "mouth", es: "boca", icon: "👄" },
  { en: "hair", es: "pelo", icon: "💇" },
  { en: "teeth", es: "dientes", icon: "🦷" },
  { en: "heart", es: "corazón", icon: "❤️" },
  { en: "stomach", es: "estómago", icon: "🫃" },
];

  const WEATHER = [
  { en: "sunny", es: "soleado", icon: "☀️" },
  { en: "rainy", es: "lluvioso", icon: "🌧️" },
  { en: "cloudy", es: "nublado", icon: "☁️" },
  { en: "windy", es: "con viento", icon: "💨" },
  { en: "snowy", es: "nevado", icon: "❄️" },
  { en: "cold", es: "frío", icon: "🥶" },
  { en: "hot", es: "caluroso", icon: "🥵" },
  { en: "foggy", es: "con neblina", icon: "🌫️" },
  { en: "stormy", es: "tormentoso", icon: "⛈️" },
];

  const CALENDAR = [
  { en: "Monday", es: "lunes", icon: "📅" },
  { en: "Tuesday", es: "martes", icon: "📅" },
  { en: "Wednesday", es: "miércoles", icon: "📅" },
  { en: "Thursday", es: "jueves", icon: "📅" },
  { en: "Friday", es: "viernes", icon: "📅" },
  { en: "Saturday", es: "sábado", icon: "📅" },
  { en: "Sunday", es: "domingo", icon: "📅" },
  { en: "January", es: "enero", icon: "🗓️" },
  { en: "February", es: "febrero", icon: "🗓️" },
  { en: "March", es: "marzo", icon: "🗓️" },
  { en: "April", es: "abril", icon: "🗓️" },
  { en: "May", es: "mayo", icon: "🗓️" },
  { en: "June", es: "junio", icon: "🗓️" },
  { en: "July", es: "julio", icon: "🗓️" },
  { en: "August", es: "agosto", icon: "🗓️" },
  { en: "September", es: "septiembre", icon: "🗓️" },
  { en: "October", es: "octubre", icon: "🗓️" },
  { en: "November", es: "noviembre", icon: "🗓️" },
  { en: "December", es: "diciembre", icon: "🗓️" },
];

  const PROFESSIONS = [
  { en: "doctor", es: "doctor/a", icon: "🩺" },
  { en: "teacher", es: "profesor/a", icon: "🍎" },
  { en: "nurse", es: "enfermero/a", icon: "⚕️" },
  { en: "engineer", es: "ingeniero/a", icon: "⚙️" },
  { en: "lawyer", es: "abogado/a", icon: "⚖️" },
  { en: "chef", es: "cocinero/a", icon: "👨‍🍳" },
  { en: "police officer", es: "policía", icon: "👮" },
  { en: "firefighter", es: "bombero/a", icon: "🚒" },
  { en: "accountant", es: "contador/a", icon: "🧮" },
  { en: "farmer", es: "agricultor/a", icon: "🌾" },
  { en: "builder", es: "constructor/a", icon: "🏗️", note: "BrE de 'construction worker'" },
  { en: "shop assistant", es: "vendedor/a", icon: "🛍️", note: "BrE de 'sales clerk'" },
  { en: "student", es: "estudiante", icon: "🎓" },
];

  const ANIMALS = [
  { en: "bird", es: "pájaro", icon: "🐦" },
  { en: "horse", es: "caballo", icon: "🐴" },
  { en: "cow", es: "vaca", icon: "🐄" },
  { en: "sheep", es: "oveja", icon: "🐑" },
  { en: "pig", es: "cerdo", icon: "🐷" },
  { en: "rabbit", es: "conejo", icon: "🐰" },
  { en: "mouse", es: "ratón", icon: "🐭" },
  { en: "lion", es: "león", icon: "🦁" },
  { en: "elephant", es: "elefante", icon: "🐘" },
  { en: "monkey", es: "mono", icon: "🐵" },
  { en: "bear", es: "oso", icon: "🐻" },
  { en: "spider", es: "araña", icon: "🕷️" },
  { en: "snake", es: "serpiente", icon: "🐍" },
  { en: "duck", es: "pato", icon: "🦆" },
  { en: "butterfly", es: "mariposa", icon: "🦋" },
];

  const TRANSPORT = [
  { en: "bus", es: "bus/autobús", icon: "🚌" },
  { en: "train", es: "tren", icon: "🚆" },
  { en: "lorry", es: "camión", icon: "🚚", note: "BrE de 'truck'" },
  { en: "bicycle", es: "bicicleta", icon: "🚲" },
  { en: "motorbike", es: "moto", icon: "🏍️", note: "BrE de 'motorcycle'" },
  { en: "underground", es: "metro", icon: "🚇", note: "BrE de 'subway' (también 'the Tube')" },
  { en: "aeroplane", es: "avión", icon: "✈️", note: "ortografía BrE (AmE: 'airplane')" },
  { en: "boat", es: "bote", icon: "⛵" },
  { en: "taxi", es: "taxi", icon: "🚕" },
];

  const HOUSE = [
  { en: "kitchen", es: "cocina", icon: "🍳" },
  { en: "bedroom", es: "dormitorio", icon: "🛏️" },
  { en: "bathroom", es: "baño", icon: "🛁" },
  { en: "living room", es: "sala de estar", icon: "🛋️" },
  { en: "garden", es: "jardín", icon: "🌷", note: "BrE de 'yard'" },
  { en: "flat", es: "departamento", icon: "🏢", note: "BrE de 'apartment'" },
  { en: "cupboard", es: "armario", icon: "🚪", note: "BrE, incluye lo que en EE.UU. es 'closet'" },
  { en: "rubbish bin", es: "basurero", icon: "🗑️", note: "BrE de 'trash can'" },
  { en: "lift", es: "ascensor", icon: "🛗", note: "BrE de 'elevator'" },
  { en: "toilet", es: "baño/wc", icon: "🚽" },
];

  const EMOTIONS = [
  { en: "happy", es: "feliz", icon: "😊" },
  { en: "sad", es: "triste", icon: "😢" },
  { en: "angry", es: "enojado/a", icon: "😠" },
  { en: "tired", es: "cansado/a", icon: "😴" },
  { en: "scared", es: "asustado/a", icon: "😨" },
  { en: "surprised", es: "sorprendido/a", icon: "😲" },
  { en: "nervous", es: "nervioso/a", icon: "😬" },
  { en: "proud", es: "orgulloso/a", icon: "😌" },
  { en: "confused", es: "confundido/a", icon: "😕" },
  { en: "excited", es: "emocionado/a", icon: "🤩" },
];

  const VERBS = [
  { base: "be", past: "was", es: "ser/estar" },
  { base: "have", past: "had", es: "tener" },
  { base: "do", past: "did", es: "hacer" },
  { base: "go", past: "went", es: "ir" },
  { base: "say", past: "said", es: "decir" },
  { base: "get", past: "got", es: "obtener/conseguir" },
  { base: "make", past: "made", es: "hacer/fabricar" },
  { base: "know", past: "knew", es: "saber/conocer" },
  { base: "think", past: "thought", es: "pensar" },
  { base: "take", past: "took", es: "tomar" },
  { base: "see", past: "saw", es: "ver" },
  { base: "come", past: "came", es: "venir" },
  { base: "want", past: "wanted", es: "querer" },
  { base: "look", past: "looked", es: "mirar" },
  { base: "give", past: "gave", es: "dar" },
  { base: "use", past: "used", es: "usar" },
  { base: "find", past: "found", es: "encontrar" },
  { base: "work", past: "worked", es: "trabajar" },
  { base: "call", past: "called", es: "llamar" },
  { base: "eat", past: "ate", es: "comer" },
  { base: "speak", past: "spoke", es: "hablar" },
  { base: "write", past: "wrote", es: "escribir" },
  { base: "read", past: "read", es: "leer" },
  { base: "buy", past: "bought", es: "comprar" },
  { base: "sell", past: "sold", es: "vender" },
  { base: "pay", past: "paid", es: "pagar" },
  { base: "send", past: "sent", es: "enviar" },
  { base: "study", past: "studied", es: "estudiar" },
  { base: "play", past: "played", es: "jugar" },
  { base: "help", past: "helped", es: "ayudar" },
  { base: "live", past: "lived", es: "vivir" },
  { base: "need", past: "needed", es: "necesitar" },
  { base: "feel", past: "felt", es: "sentir" },
  { base: "leave", past: "left", es: "salir/dejar" },
  { base: "put", past: "put", es: "poner" },
  { base: "begin", past: "began", es: "empezar" },
  { base: "run", past: "ran", es: "correr" },
];

  const INGED_ITEMS = [
  { sentence: 'I am ___ because I have a lot of homework.', options: ["stressed", "stressing"], correct: "stressed", es: "Cómo te sientes tú = adjetivo terminado en -ed" },
  { sentence: "This movie is really ___!", options: ["boring", "bored"], correct: "boring", es: "Cómo es la cosa (causa el efecto) = adjetivo terminado en -ing" },
  { sentence: "Right now, she ___ (cook) dinner.", options: ["is cooking", "cooked", "cooks"], correct: "is cooking", es: "Presente continuo: be + verbo-ing, para acciones ahora mismo" },
  { sentence: "Yesterday, we ___ (watch) a movie.", options: ["watched", "watching", "watch"], correct: "watched", es: "Pasado simple regular: verbo + -ed" },
  { sentence: "I am very ___ about the trip!", options: ["excited", "exciting"], correct: "excited", es: "Cómo te sientes tú = -ed" },
  { sentence: "That was an ___ trip!", options: ["exciting", "excited"], correct: "exciting", es: "Cómo es la cosa = -ing" },
  { sentence: "She ___ (study) English every day.", options: ["studies", "studying", "studied"], correct: "studies", es: "Presente simple con rutinas: verbo + s/es" },
  { sentence: "Next year, I ___ (travel) to the USA.", options: ["will travel", "traveled", "am traveling"], correct: "will travel", es: "Futuro simple: will + verbo base" },
  { sentence: "I'm ___ in learning English.", options: ["interested", "interesting"], correct: "interested", es: "Sentimiento propio = -ed" },
  { sentence: "He ___ (play) soccer when it started to rain.", options: ["was playing", "played", "plays"], correct: "was playing", es: "Pasado continuo: was/were + verbo-ing" },
];

  const PHRASE_CATEGORIES = [
  { id: "intro", label: "Presentarse", icon: "👋" },
  { id: "farewell", label: "Despedirse", icon: "🤝" },
  { id: "work", label: "Trabajo", icon: "💼" },
  { id: "friends", label: "Amistad", icon: "😊" },
  { id: "food", label: "Pedir comida", icon: "🍽️" },
  { id: "activities", label: "Planes y actividades", icon: "🎯" },
  { id: "feelings", label: "Cómo me siento", icon: "❤️" },
  { id: "things", label: "Objetos y películas", icon: "🎬" },
];

  const PHRASES = {
  intro: [
    { en: "Hi, I'm Caroline. Nice to meet you.", es: "Hola, soy Caroline. Un gusto conocerte." },
    { en: "What's your name?", es: "¿Cómo te llamas?" },
    { en: "Where are you from?", es: "¿De dónde eres?" },
    { en: "I'm from Chile.", es: "Soy de Chile." },
    { en: "What do you do for a living?", es: "¿A qué te dedicas?" },
    { en: "I work in accounting and procurement.", es: "Trabajo en contabilidad y adquisiciones." },
    { en: "How long have you been working here?", es: "¿Cuánto tiempo llevas trabajando aquí?" },
    { en: "It's a pleasure to meet you.", es: "Es un placer conocerte." },
  ],
  farewell: [
    { en: "It was great meeting you.", es: "Fue un gusto conocerte." },
    { en: "I have to go now, but let's talk again soon.", es: "Tengo que irme, pero hablemos pronto de nuevo." },
    { en: "Take care of yourself!", es: "¡Cuídate!" },
    { en: "See you next time.", es: "Nos vemos la próxima vez." },
    { en: "Let's keep in touch.", es: "Mantengámonos en contacto." },
    { en: "Have a lovely evening.", es: "Que tengas una linda tarde." },
    { en: "Thanks for everything, goodbye.", es: "Gracias por todo, adiós." },
    { en: "I'll see you around.", es: "Nos vemos por ahí." },
  ],
  work: [
    { en: "Could you send me that report by tomorrow?", es: "¿Podrías enviarme ese informe para mañana?" },
    { en: "I have a meeting at ten o'clock.", es: "Tengo una reunión a las diez." },
    { en: "Let's schedule a call for next week.", es: "Agendemos una llamada para la próxima semana." },
    { en: "I'm currently working on a new project.", es: "Actualmente estoy trabajando en un proyecto nuevo." },
    { en: "Could we reschedule the meeting to Friday?", es: "¿Podríamos reagendar la reunión para el viernes?" },
    { en: "I'll get back to you as soon as possible.", es: "Te responderé lo antes posible." },
    { en: "Sorry, I'm running a few minutes late.", es: "Perdón, voy a llegar unos minutos tarde." },
    { en: "Thank you for your help with this.", es: "Gracias por tu ayuda con esto." },
  ],
  friends: [
    { en: "Do you want to hang out this weekend?", es: "¿Quieres juntarte este fin de semana?" },
    { en: "I really enjoy spending time with you.", es: "Realmente disfruto pasar tiempo contigo." },
    { en: "Let's grab a coffee sometime.", es: "Tomemos un café en algún momento." },
    { en: "I haven't seen you in ages!", es: "¡No te veía hace siglos!" },
    { en: "How have you been?", es: "¿Cómo has estado?" },
    { en: "We should catch up soon.", es: "Deberíamos ponernos al día pronto." },
    { en: "Thanks for always being there for me.", es: "Gracias por siempre estar ahí para mí." },
    { en: "I had a really good time today.", es: "La pasé muy bien hoy." },
  ],
  food: [
    { en: "Could I see the menu, please?", es: "¿Podría ver el menú, por favor?" },
    { en: "I'd like to order the chicken salad.", es: "Quisiera pedir la ensalada de pollo." },
    { en: "Could I have a glass of water, please?", es: "¿Podría traerme un vaso de agua, por favor?" },
    { en: "Is this dish spicy?", es: "¿Este plato es picante?" },
    { en: "Could we get the bill, please?", es: "¿Podría traernos la cuenta, por favor?" },
    { en: "I'm allergic to nuts.", es: "Soy alérgica a los frutos secos." },
    { en: "Could I get this to take away?", es: "¿Podría llevarme esto para llevar?" },
    { en: "Do you have any vegetarian options?", es: "¿Tienen opciones vegetarianas?" },
  ],
  activities: [
    { en: "What do you want to do this weekend?", es: "¿Qué quieres hacer este fin de semana?" },
    { en: "Shall we go for a walk?", es: "¿Vamos a caminar?" },
    { en: "Do you fancy watching a film tonight?", es: "¿Te provoca ver una película esta noche?" },
    { en: "Let's go to the cinema.", es: "Vayamos al cine." },
    { en: "I'd love to go hiking this Saturday.", es: "Me encantaría ir de excursión este sábado." },
    { en: "How about we try that new restaurant?", es: "¿Qué tal si probamos ese restaurante nuevo?" },
    { en: "Are you free on Saturday afternoon?", es: "¿Estás libre el sábado en la tarde?" },
    { en: "That sounds like a great plan.", es: "Suena como un gran plan." },
  ],
  feelings: [
    { en: "I'm feeling a bit tired today.", es: "Me siento un poco cansada hoy." },
    { en: "I'm really excited about this.", es: "Estoy muy emocionada por esto." },
    { en: "I'm a bit nervous about the interview.", es: "Estoy un poco nerviosa por la entrevista." },
    { en: "I feel much better now, thank you.", es: "Me siento mucho mejor ahora, gracias." },
    { en: "I'm so proud of you.", es: "Estoy muy orgullosa de ti." },
    { en: "That made me really happy.", es: "Eso me hizo muy feliz." },
    { en: "I'm sorry, I'm not feeling well today.", es: "Lo siento, no me siento bien hoy." },
    { en: "I feel a bit overwhelmed right now.", es: "Me siento un poco abrumada ahora mismo." },
  ],
  things: [
    { en: "Have you seen any good films lately?", es: "¿Has visto alguna buena película últimamente?" },
    { en: "What's your favourite film?", es: "¿Cuál es tu película favorita?" },
    { en: "I really enjoyed that book.", es: "Disfruté mucho ese libro." },
    { en: "What's this called in English?", es: "¿Cómo se llama esto en inglés?" },
    { en: "Could you pass me that, please?", es: "¿Me pasas eso, por favor?" },
    { en: "I bought a new phone last week.", es: "Compré un teléfono nuevo la semana pasada." },
    { en: "This is really useful.", es: "Esto es muy útil." },
    { en: "What do you think of this?", es: "¿Qué opinas de esto?" },
  ],
};

  const FORMAL_PAIRS = [
  { situation: "Saludar a tu jefe en la oficina", formal: "Good morning, how are you?", informal: "Hey, what's up?" },
  { situation: "Pedir algo en un restaurante elegante", formal: "Could I please have the menu?", informal: "Can I get the menu?" },
  { situation: "Escribir un correo a un cliente nuevo", formal: "I am writing to inform you that...", informal: "Just wanted to let you know that..." },
  { situation: "Despedirte de un amigo", formal: "It was a pleasure to see you.", informal: "See ya later!" },
  { situation: "Pedir disculpas en una reunión de trabajo", formal: "I apologize for the delay.", informal: "Sorry, my bad!" },
  { situation: "Preguntar la hora a un desconocido en la calle", formal: "Excuse me, could you tell me the time?", informal: "Hey, got the time?" },
  { situation: "Aceptar una invitación formal", formal: "I would be delighted to attend.", informal: "Sure, I'm in!" },
  { situation: "Rechazar una oferta educadamente", formal: "I'm afraid I have to decline.", informal: "Nah, I'm good." },
];

  const VOWEL_PAIRS = [
  { a: "ship", b: "sheep", symbolA: "ɪ", symbolB: "iː", tip: "ɪ es corta y relajada; iː es larga y tensa (como una 'i' alargada)" },
  { a: "bit", b: "beat", symbolA: "ɪ", symbolB: "iː", tip: "Misma diferencia que ship/sheep: corta vs. larga" },
  { a: "full", b: "fool", symbolA: "ʊ", symbolB: "uː", tip: "ʊ es corta; uː es larga, con los labios más redondeados" },
  { a: "pull", b: "pool", symbolA: "ʊ", symbolB: "uː", tip: "Misma diferencia: corta vs. larga" },
  { a: "cat", b: "cut", symbolA: "æ", symbolB: "ʌ", tip: "æ abre mucho la boca (como una 'a' de gato); ʌ es más central y corta" },
  { a: "bad", b: "bud", symbolA: "æ", symbolB: "ʌ", tip: "Misma diferencia: æ (abierta) vs. ʌ (central)" },
  { a: "bed", b: "bad", symbolA: "e", symbolB: "æ", tip: "e es como la 'e' española; æ abre más la boca hacia una 'a'" },
  { a: "pen", b: "pan", symbolA: "e", symbolB: "æ", tip: "Misma diferencia: e vs. æ" },
  { a: "luck", b: "lock", symbolA: "ʌ", symbolB: "ɒ", tip: "ʌ es central y corta; ɒ redondea los labios, como una 'o' corta" },
  { a: "cot", b: "caught", symbolA: "ɒ", symbolB: "ɔː", tip: "ɒ es corta; ɔː es larga y con más redondeo de labios" },
  { a: "bird", b: "bad", symbolA: "ɜː", symbolB: "æ", tip: "ɜː es un sonido largo y central que no existe en español, como una 'e' gutural" },
  { a: "heart", b: "hut", symbolA: "ɑː", symbolB: "ʌ", tip: "ɑː es larga y abierta, atrás en la boca; ʌ es corta y central" },
  { a: "work", b: "walk", symbolA: "ɜː", symbolB: "ɔː", tip: "ɜː es central y larga; ɔː es redondeada y larga" },
  { a: "day", b: "die", symbolA: "eɪ", symbolB: "aɪ", tip: "eɪ empieza como 'e' y desliza a 'i'; aɪ empieza como 'a' y desliza a 'i'" },
  { a: "boy", b: "buy", symbolA: "ɔɪ", symbolB: "aɪ", tip: "ɔɪ empieza redondeado ('o'); aɪ empieza abierto ('a')" },
  { a: "now", b: "no", symbolA: "aʊ", symbolB: "əʊ", tip: "aʊ desliza de 'a' a 'u'; əʊ (inglés británico) desliza de una vocal neutra a 'u', más cerrado" },
  { a: "hear", b: "hair", symbolA: "ɪə", symbolB: "eə", tip: "ɪə desliza de 'i' a una vocal neutra; eə desliza de 'e' a una vocal neutra" },
  { a: "poor", b: "paw", symbolA: "ʊə", symbolB: "ɔː", tip: "ʊə desliza de 'u' a una vocal neutra; ɔː es una sola vocal larga y redondeada" },
];
  // (fin de los bancos importados)

  /* Frases completas para armar y traducir.
   *
   * Son la materia prima de los ejercicios de "arma la frase": el motor las
   * corta en palabras y desordena las fichas. Por eso importa que estén bien
   * escritas y que la traducción sea natural, no literal.
   *
   * "skill" dice a qué destreza pertenece cada una; el currículo las pide por
   * ese nombre. "nivel" (1 a 3) permite que una unidad avanzada no empiece por
   * la frase más corta.
   */
  const ORACIONES = [
    // --- Saludos y presentarse ---
    { en: "Good morning, how are you?", es: "Buenos días, ¿cómo estás?", skill: "saludos", nivel: 1 },
    { en: "My name is Caroline.", es: "Me llamo Caroline.", skill: "saludos", nivel: 1 },
    { en: "I am from Chile.", es: "Soy de Chile.", skill: "saludos", nivel: 1 },
    { en: "Nice to meet you.", es: "Un gusto conocerte.", skill: "saludos", nivel: 1 },
    { en: "Where are you from?", es: "¿De dónde eres?", skill: "saludos", nivel: 1 },
    { en: "How old are you?", es: "¿Cuántos años tienes?", skill: "saludos", nivel: 1 },
    { en: "This is my friend Ana.", es: "Ella es mi amiga Ana.", skill: "saludos", nivel: 2 },
    { en: "I do not speak much English yet.", es: "Todavía no hablo mucho inglés.", skill: "saludos", nivel: 2 },
    { en: "Could you say that again, please?", es: "¿Podrías repetir eso, por favor?", skill: "saludos", nivel: 2 },
    { en: "See you tomorrow.", es: "Nos vemos mañana.", skill: "saludos", nivel: 1 },

    // --- Números y colores ---
    { en: "I have two brothers.", es: "Tengo dos hermanos.", skill: "numeros", nivel: 1 },
    { en: "There are twelve people in the office.", es: "Hay doce personas en la oficina.", skill: "numeros", nivel: 2 },
    { en: "The meeting starts at ten.", es: "La reunión empieza a las diez.", skill: "numeros", nivel: 2 },
    { en: "It costs fifty pounds.", es: "Cuesta cincuenta libras.", skill: "numeros", nivel: 2 },
    { en: "My car is blue.", es: "Mi auto es azul.", skill: "colores", nivel: 1 },
    { en: "She has a red bag.", es: "Ella tiene un bolso rojo.", skill: "colores", nivel: 1 },
    { en: "The walls are white and grey.", es: "Las paredes son blancas y grises.", skill: "colores", nivel: 2 },
    { en: "I like the green one.", es: "Me gusta el verde.", skill: "colores", nivel: 2 },

    // --- Objetos, casa y familia ---
    { en: "The book is on the table.", es: "El libro está sobre la mesa.", skill: "objetos", nivel: 1 },
    { en: "Where are my keys?", es: "¿Dónde están mis llaves?", skill: "objetos", nivel: 1 },
    { en: "I need my phone and my computer.", es: "Necesito mi teléfono y mi computador.", skill: "objetos", nivel: 2 },
    { en: "Please close the door.", es: "Por favor cierra la puerta.", skill: "objetos", nivel: 1 },
    { en: "We live in a small flat.", es: "Vivimos en un departamento pequeño.", skill: "casa", nivel: 2 },
    { en: "The kitchen is next to the living room.", es: "La cocina está al lado de la sala de estar.", skill: "casa", nivel: 2 },
    { en: "There is a lift in the building.", es: "Hay un ascensor en el edificio.", skill: "casa", nivel: 3 },
    { en: "My sister works in a hospital.", es: "Mi hermana trabaja en un hospital.", skill: "familia", nivel: 2 },
    { en: "My mother lives with us.", es: "Mi madre vive con nosotros.", skill: "familia", nivel: 2 },
    { en: "Do you have any children?", es: "¿Tienes hijos?", skill: "familia", nivel: 2 },

    // --- Comida y restaurante ---
    { en: "I would like a coffee, please.", es: "Quisiera un café, por favor.", skill: "comida", nivel: 1 },
    { en: "I do not eat meat.", es: "No como carne.", skill: "comida", nivel: 1 },
    { en: "The soup is very hot.", es: "La sopa está muy caliente.", skill: "comida", nivel: 2 },
    { en: "Could we have the bill, please?", es: "¿Nos trae la cuenta, por favor?", skill: "restaurante", nivel: 2 },
    { en: "Do you have any vegetarian options?", es: "¿Tienen opciones vegetarianas?", skill: "restaurante", nivel: 3 },
    { en: "I am allergic to nuts.", es: "Soy alérgica a los frutos secos.", skill: "restaurante", nivel: 2 },
    { en: "For breakfast I have eggs and tea.", es: "Para el desayuno como huevos y té.", skill: "comida", nivel: 2 },
    { en: "My head hurts.", es: "Me duele la cabeza.", skill: "cuerpo", nivel: 1 },
    { en: "I need to see a doctor.", es: "Necesito ver a un doctor.", skill: "cuerpo", nivel: 2 },

    // --- Rutina, presente, calendario y clima ---
    { en: "I get up at six every day.", es: "Me levanto a las seis todos los días.", skill: "presente", nivel: 2 },
    { en: "She works from home on Fridays.", es: "Ella trabaja desde la casa los viernes.", skill: "presente", nivel: 3 },
    { en: "He never drinks coffee at night.", es: "Él nunca toma café en la noche.", skill: "presente", nivel: 3 },
    { en: "We usually have lunch at one.", es: "Normalmente almorzamos a la una.", skill: "presente", nivel: 3 },
    { en: "Do you work on Saturdays?", es: "¿Trabajas los sábados?", skill: "presente", nivel: 2 },
    { en: "I am reading a book right now.", es: "Estoy leyendo un libro ahora mismo.", skill: "presente", nivel: 3 },
    { en: "My birthday is in September.", es: "Mi cumpleaños es en septiembre.", skill: "calendario", nivel: 2 },
    { en: "The office is closed on Sunday.", es: "La oficina está cerrada el domingo.", skill: "calendario", nivel: 2 },
    { en: "It is raining again.", es: "Está lloviendo de nuevo.", skill: "clima", nivel: 1 },
    { en: "It is very cold today.", es: "Hace mucho frío hoy.", skill: "clima", nivel: 1 },
    { en: "The weather is better in summer.", es: "El clima es mejor en verano.", skill: "clima", nivel: 3 },

    // --- Trabajo y oficina ---
    { en: "I work in accounting.", es: "Trabajo en contabilidad.", skill: "trabajo", nivel: 1 },
    { en: "I have a meeting at nine.", es: "Tengo una reunión a las nueve.", skill: "trabajo", nivel: 1 },
    { en: "Could you send me the report?", es: "¿Me podrías enviar el informe?", skill: "trabajo", nivel: 2 },
    { en: "I will get back to you tomorrow.", es: "Te respondo mañana.", skill: "trabajo", nivel: 2 },
    { en: "Sorry, I am running late.", es: "Perdón, voy atrasada.", skill: "trabajo", nivel: 2 },
    { en: "Let us schedule a call for next week.", es: "Agendemos una llamada para la próxima semana.", skill: "trabajo", nivel: 3 },
    { en: "She is an engineer.", es: "Ella es ingeniera.", skill: "profesiones", nivel: 1 },
    { en: "What do you do for a living?", es: "¿A qué te dedicas?", skill: "profesiones", nivel: 2 },

    // --- Oficina real: contabilidad, compras e importaciones ---
    { en: "The invoice has not been paid yet.", es: "La factura todavía no ha sido pagada.", skill: "oficina", nivel: 3 },
    { en: "Could you confirm the payment date?", es: "¿Podrías confirmar la fecha de pago?", skill: "oficina", nivel: 3 },
    { en: "We need a quote from the supplier.", es: "Necesitamos una cotización del proveedor.", skill: "oficina", nivel: 3 },
    { en: "The shipment arrives next month.", es: "El embarque llega el próximo mes.", skill: "oficina", nivel: 2 },
    { en: "Please attach the purchase order.", es: "Por favor adjunta la orden de compra.", skill: "oficina", nivel: 3 },
    { en: "The customs documents are ready.", es: "Los documentos de aduana están listos.", skill: "oficina", nivel: 3 },
    { en: "I am checking the numbers again.", es: "Estoy revisando los números de nuevo.", skill: "oficina", nivel: 2 },
    { en: "The balance does not match.", es: "El saldo no cuadra.", skill: "oficina", nivel: 3 },
    { en: "We paid the supplier last Friday.", es: "Le pagamos al proveedor el viernes pasado.", skill: "oficina", nivel: 3 },
    { en: "Thank you for your quick reply.", es: "Gracias por tu respuesta rápida.", skill: "oficina", nivel: 2 },

    // --- Pasado ---
    { en: "I went to the office yesterday.", es: "Fui a la oficina ayer.", skill: "pasado", nivel: 2 },
    { en: "We had a long meeting.", es: "Tuvimos una reunión larga.", skill: "pasado", nivel: 2 },
    { en: "She bought a new phone last week.", es: "Ella compró un teléfono nuevo la semana pasada.", skill: "pasado", nivel: 3 },
    { en: "They did not come to the party.", es: "Ellos no vinieron a la fiesta.", skill: "pasado", nivel: 3 },
    { en: "Did you speak with the client?", es: "¿Hablaste con el cliente?", skill: "pasado", nivel: 3 },
    { en: "I was very tired last night.", es: "Estaba muy cansada anoche.", skill: "pasado", nivel: 2 },
    { en: "He worked here for five years.", es: "Él trabajó acá por cinco años.", skill: "pasado", nivel: 3 },
    { en: "We were watching a film.", es: "Estábamos viendo una película.", skill: "pasado", nivel: 3 },

    // --- Futuro y planes ---
    { en: "I will call you later.", es: "Te llamo más tarde.", skill: "futuro", nivel: 1 },
    { en: "We are going to travel in December.", es: "Vamos a viajar en diciembre.", skill: "futuro", nivel: 3 },
    { en: "She will send the file today.", es: "Ella enviará el archivo hoy.", skill: "futuro", nivel: 2 },
    { en: "What are you going to do tomorrow?", es: "¿Qué vas a hacer mañana?", skill: "futuro", nivel: 3 },
    { en: "I am not going to be there.", es: "No voy a estar ahí.", skill: "futuro", nivel: 3 },
    { en: "Shall we go for a walk?", es: "¿Vamos a caminar?", skill: "actividades", nivel: 2 },
    { en: "Do you want to have a coffee?", es: "¿Quieres tomar un café?", skill: "actividades", nivel: 2 },
    { en: "That sounds like a great plan.", es: "Suena como un gran plan.", skill: "actividades", nivel: 2 },
    { en: "Are you free on Saturday afternoon?", es: "¿Estás libre el sábado en la tarde?", skill: "actividades", nivel: 3 },

    // --- Emociones y matices ---
    { en: "I am very happy today.", es: "Estoy muy feliz hoy.", skill: "emociones", nivel: 1 },
    { en: "She is a bit nervous.", es: "Ella está un poco nerviosa.", skill: "emociones", nivel: 2 },
    { en: "I am so proud of you.", es: "Estoy muy orgullosa de ti.", skill: "emociones", nivel: 2 },
    { en: "This film is boring.", es: "Esta película es aburrida.", skill: "inged", nivel: 2 },
    { en: "I am bored at home.", es: "Estoy aburrida en la casa.", skill: "inged", nivel: 2 },
    { en: "The trip was exciting.", es: "El viaje fue emocionante.", skill: "inged", nivel: 3 },
    { en: "I am interested in this job.", es: "Estoy interesada en este trabajo.", skill: "inged", nivel: 3 },

    // --- Phrasal verbs ---
    { en: "I am looking for the invoice.", es: "Estoy buscando la factura.", skill: "phrasal", nivel: 2 },
    { en: "I will find out and let you know.", es: "Voy a averiguar y te aviso.", skill: "phrasal", nivel: 2 },
    { en: "We ran out of time.", es: "Se nos acabó el tiempo.", skill: "phrasal", nivel: 2 },
    { en: "Let's go through the numbers.", es: "Revisemos los números.", skill: "phrasal", nivel: 2 },
    { en: "I will follow up on Monday.", es: "Le hago seguimiento el lunes.", skill: "phrasal", nivel: 2 },
    { en: "She took over the project last year.", es: "Ella se hizo cargo del proyecto el año pasado.", skill: "phrasal", nivel: 3 },
    { en: "They turned down our offer.", es: "Rechazaron nuestra oferta.", skill: "phrasal", nivel: 3 },
    { en: "We had to put off the meeting.", es: "Tuvimos que postergar la reunión.", skill: "phrasal", nivel: 3 },
    { en: "He pointed out a mistake in the report.", es: "Él señaló un error en el informe.", skill: "phrasal", nivel: 3 },
    { en: "I deal with suppliers every day.", es: "Trato con proveedores todos los días.", skill: "phrasal", nivel: 2 },
    { en: "Who is going to take care of this?", es: "¿Quién se va a encargar de esto?", skill: "phrasal", nivel: 2 },
    { en: "She came up with a better idea.", es: "A ella se le ocurrió una idea mejor.", skill: "phrasal", nivel: 3 },
    { en: "We need to sort this out today.", es: "Necesitamos arreglar esto hoy.", skill: "phrasal", nivel: 3 },
    { en: "I am catching up on my emails.", es: "Me estoy poniendo al día con los correos.", skill: "phrasal", nivel: 3 },

    // --- Conectores ---
    { en: "The price is good. However, the delivery is slow.", es: "El precio es bueno. Sin embargo, la entrega es lenta.", skill: "conectores", nivel: 2 },
    { en: "Although it was expensive, we bought it.", es: "Aunque era caro, lo compramos.", skill: "conectores", nivel: 3 },
    { en: "The invoice was wrong, so we did not pay it.", es: "La factura estaba mala, así que no la pagamos.", skill: "conectores", nivel: 2 },
    { en: "We were late because of the traffic.", es: "Llegamos tarde debido al tráfico.", skill: "conectores", nivel: 2 },
    { en: "In addition, we need two more copies.", es: "Además, necesitamos dos copias más.", skill: "conectores", nivel: 2 },
    { en: "Let's call instead of writing.", es: "Llamemos en vez de escribir.", skill: "conectores", nivel: 2 },
    { en: "I will send it as soon as I know.", es: "Lo envío apenas sepa.", skill: "conectores", nivel: 3 },
    { en: "We cannot start unless they confirm.", es: "No podemos empezar a menos que confirmen.", skill: "conectores", nivel: 3 },
    { en: "Actually, the meeting is on Thursday.", es: "En realidad, la reunión es el jueves.", skill: "conectores", nivel: 2 },
    { en: "She is currently working on the budget.", es: "Ella está trabajando actualmente en el presupuesto.", skill: "conectores", nivel: 3 },
    { en: "The costs went up. Therefore, we changed supplier.", es: "Los costos subieron. Por lo tanto, cambiamos de proveedor.", skill: "conectores", nivel: 3 },
    { en: "On the other hand, the quality is better.", es: "Por otro lado, la calidad es mejor.", skill: "conectores", nivel: 3 },

    // --- Expresiones ---
    { en: "We have to make a decision today.", es: "Tenemos que tomar una decisión hoy.", skill: "expresiones", nivel: 2 },
    { en: "I made a mistake in the invoice.", es: "Cometí un error en la factura.", skill: "expresiones", nivel: 2 },
    { en: "Please keep in mind that we close at five.", es: "Por favor ten en cuenta que cerramos a las cinco.", skill: "expresiones", nivel: 3 },
    { en: "We should take the delivery time into account.", es: "Deberíamos tomar en cuenta el tiempo de entrega.", skill: "expresiones", nivel: 3 },
    { en: "Let me know if you need anything.", es: "Avísame si necesitas algo.", skill: "expresiones", nivel: 2 },
    { en: "It depends on the supplier.", es: "Depende del proveedor.", skill: "expresiones", nivel: 2 },
    { en: "I am looking forward to meeting you.", es: "Tengo ganas de conocerte.", skill: "expresiones", nivel: 3 },
    { en: "I would rather wait until Monday.", es: "Preferiría esperar hasta el lunes.", skill: "expresiones", nivel: 3 },
    { en: "I used to work in a bank.", es: "Yo trabajaba en un banco antes.", skill: "expresiones", nivel: 3 },
    { en: "By the way, did you send the report?", es: "Por cierto, ¿enviaste el informe?", skill: "expresiones", nivel: 2 },
    { en: "As far as I know, it has been paid.", es: "Hasta donde yo sé, ya fue pagada.", skill: "expresiones", nivel: 3 },
    { en: "She did it on purpose.", es: "Ella lo hizo a propósito.", skill: "expresiones", nivel: 2 },

    // --- Oficina, nivel avanzado ---
    { en: "The invoice was paid twice by mistake.", es: "La factura se pagó dos veces por error.", skill: "oficina", nivel: 3 },
    { en: "Could you send me a quote before Friday?", es: "¿Me podrías enviar una cotización antes del viernes?", skill: "oficina", nivel: 3 },
    { en: "The payment has already been approved.", es: "El pago ya fue aprobado.", skill: "oficina", nivel: 3 },
    { en: "We are still waiting for their confirmation.", es: "Todavía estamos esperando su confirmación.", skill: "oficina", nivel: 3 },
    { en: "If the price rises, we will look for another supplier.", es: "Si el precio sube, buscaremos otro proveedor.", skill: "oficina", nivel: 3 },
    { en: "I would have called you, but the line was busy.", es: "Te habría llamado, pero la línea estaba ocupada.", skill: "oficina", nivel: 3 },
    { en: "The report needs to be reviewed before Monday.", es: "El informe necesita ser revisado antes del lunes.", skill: "oficina", nivel: 3 },
    { en: "Let me check and get back to you.", es: "Déjame revisar y te respondo.", skill: "trabajo", nivel: 2 },
  ];

  /* Complemento natural de cada verbo, para los ejercicios de conjugar.
   *
   * Sin esto las frases salían con un molde único y quedaban raras ("The
   * manager feels every day"), que es justo lo que confunde a quien está
   * aprendiendo: hay que poder leer la frase y entenderla antes de decidir la
   * forma del verbo.
   */
  const COMPLEMENTOS = {
    be: "tired", have: "a meeting", do: "the paperwork", go: "to the office",
    say: "hello", get: "an email", make: "coffee", know: "the answer",
    think: "about work", take: "the bus", see: "her family", come: "early",
    want: "more time", look: "tired", give: "advice", use: "the computer",
    find: "the invoice", work: "from home", call: "the supplier", eat: "at home",
    speak: "English", write: "reports", read: "the news", buy: "the tickets",
    sell: "the old car", pay: "the invoice", send: "the report", study: "English",
    play: "tennis", help: "the team", live: "in Santiago", need: "more time",
    feel: "better", leave: "at six", put: "the files away", begin: "at nine",
    run: "in the park",
  };
  VERBS.forEach(function (v) {
    v.obj = COMPLEMENTOS[v.base] || "";
  });


  /* ---------------- Contenido de intermedio y avanzado ----------------
   *
   * Lo que frena a un hispanohablante en B1 no es que le falten sustantivos:
   * es que traduce estructuras. Estas tres listas son justamente las que no se
   * pueden deducir del español —hay que aprenderlas— y las que más cambian
   * cómo suena alguien cuando habla.
   */

  // Phrasal verbs: el verbo cambia de significado según la preposición, y no
  // hay ninguna lógica que ayude. "Look for" es buscar y "look after" es
  // cuidar, y nada en "look" lo anticipa.
  const PHRASAL = [
    { en: "look for", es: "buscar", icon: "🔎", note: "I'm looking for the invoice." },
    { en: "look after", es: "cuidar", icon: "🧡", note: "She looks after her mother." },
    { en: "find out", es: "averiguar", icon: "🕵️", note: "I'll find out and call you." },
    { en: "carry out", es: "llevar a cabo, realizar", icon: "⚙️", note: "We carried out the audit." },
    { en: "point out", es: "señalar, hacer notar", icon: "☝️", note: "He pointed out the error." },
    { en: "follow up", es: "hacer seguimiento", icon: "📌", note: "I'll follow up on Monday." },
    { en: "set up", es: "montar, establecer", icon: "🛠️", note: "We set up a new account." },
    { en: "give up", es: "rendirse, dejar de", icon: "🏳️", note: "Don't give up." },
    { en: "take over", es: "hacerse cargo", icon: "🔁", note: "She took over the project." },
    { en: "turn down", es: "rechazar", icon: "👎", note: "They turned down our offer." },
    { en: "put off", es: "postergar", icon: "🗓️", note: "We put off the meeting." },
    { en: "bring up", es: "mencionar, sacar un tema", icon: "💬", note: "He brought up the budget." },
    { en: "work out", es: "resultar, resolverse", icon: "✅", note: "It worked out well." },
    { en: "deal with", es: "lidiar con, ocuparse de", icon: "🤝", note: "I deal with suppliers." },
    { en: "come up with", es: "ocurrírsele, idear", icon: "💡", note: "She came up with a plan." },
    { en: "run out of", es: "quedarse sin", icon: "🪫", note: "We ran out of time." },
    { en: "catch up", es: "ponerse al día", icon: "🏃", note: "I need to catch up on emails." },
    { en: "sort out", es: "arreglar, ordenar", icon: "🧹", note: "Let's sort this out today." },
    { en: "go through", es: "revisar en detalle", icon: "📄", note: "Let's go through the numbers." },
    { en: "deal out", es: "repartir", icon: "🃏", note: "menos común que 'deal with'" },
  ];

  // Conectores: son la diferencia entre sonar a principiante y sonar a alguien
  // que sabe. Una idea bien conectada vale más que diez palabras raras.
  const CONECTORES = [
    { en: "however", es: "sin embargo", icon: "↔️", note: "va al principio, con coma" },
    { en: "although", es: "aunque", icon: "🔀", note: "Although it rained, we went." },
    { en: "therefore", es: "por lo tanto", icon: "➡️", note: "formal" },
    { en: "so", es: "así que", icon: "👉", note: "la versión de todos los días" },
    { en: "because of", es: "debido a", icon: "📌", note: "seguido de sustantivo: because of the rain" },
    { en: "because", es: "porque", icon: "❓", note: "seguido de frase: because it rained" },
    { en: "in addition", es: "además", icon: "➕", note: "" },
    { en: "besides", es: "además, aparte", icon: "🧩", note: "más informal que 'in addition'" },
    { en: "instead of", es: "en vez de", icon: "🔄", note: "instead of going" },
    { en: "as well as", es: "así como, además de", icon: "🤝", note: "" },
    { en: "on the other hand", es: "por otro lado", icon: "🖐️", note: "" },
    { en: "in fact", es: "de hecho", icon: "💬", note: "" },
    { en: "actually", es: "en realidad", icon: "⚠️", note: "falso amigo: NO significa 'actualmente'" },
    { en: "currently", es: "actualmente", icon: "🕐", note: "ésta sí es 'actualmente'" },
    { en: "meanwhile", es: "mientras tanto", icon: "⏳", note: "" },
    { en: "unless", es: "a menos que", icon: "🚧", note: "unless you pay" },
    { en: "whereas", es: "mientras que (contraste)", icon: "⚖️", note: "formal" },
    { en: "as soon as", es: "apenas, en cuanto", icon: "⚡", note: "as soon as I know" },
  ];

  // Combinaciones fijas: el verbo correcto no se puede adivinar traduciendo.
  // En español "tomamos una decisión"; en inglés se hace, no se toma.
  const EXPRESIONES = [
    { en: "make a decision", es: "tomar una decisión", icon: "🧠", note: "hacer, no tomar" },
    { en: "take a decision", es: "tomar una decisión (BrE, menos común)", icon: "🧠", note: "se oye en inglés británico" },
    { en: "make a mistake", es: "cometer un error", icon: "❌", note: "nunca 'do a mistake'" },
    { en: "do business", es: "hacer negocios", icon: "🤝", note: "" },
    { en: "do me a favour", es: "hacerme un favor", icon: "🙏", note: "ortografía británica" },
    { en: "take care of", es: "encargarse de", icon: "🧡", note: "" },
    { en: "pay attention", es: "prestar atención", icon: "👀", note: "se paga, no se presta" },
    { en: "keep in mind", es: "tener en cuenta", icon: "🧷", note: "" },
    { en: "take into account", es: "tomar en cuenta", icon: "📊", note: "" },
    { en: "on purpose", es: "a propósito, adrede", icon: "🎯", note: "" },
    { en: "by the way", es: "por cierto", icon: "💭", note: "" },
    { en: "as far as I know", es: "hasta donde yo sé", icon: "🔭", note: "" },
    { en: "it depends on", es: "depende de", icon: "⚖️", note: "siempre con 'on'" },
    { en: "I am looking forward to", es: "tengo ganas de, espero con gusto", icon: "🌟", note: "después va -ing: looking forward to seeing you" },
    { en: "let me know", es: "avísame", icon: "📣", note: "" },
    { en: "I would rather", es: "preferiría", icon: "🔀", note: "después va el verbo sin 'to'" },
    { en: "used to", es: "solía", icon: "⏮️", note: "I used to work there" },
    { en: "be about to", es: "estar a punto de", icon: "⏱️", note: "" },
  ];

  /* Un "tema" agrupa palabras que se enseñan y se repasan juntas.
   * El id es la llave que usan el currículo y el repaso espaciado, así que no
   * hay que cambiarlo una vez publicado: es lo que amarra el progreso guardado
   * en el teléfono con el contenido.
   */
  const TEMAS = [
    { id: "numeros", label: "Números", icon: "🔢", items: NUMBERS },
    { id: "colores", label: "Colores", icon: "🎨", items: COLORS },
    { id: "objetos", label: "Cosas", icon: "📦", items: OBJECTS },
    { id: "comida", label: "Comida", icon: "🍽️", items: FOOD },
    { id: "familia", label: "Familia", icon: "👨‍👩‍👧‍👦", items: FAMILY },
    { id: "ropa", label: "Ropa", icon: "👕", items: CLOTHING },
    { id: "cuerpo", label: "Cuerpo", icon: "🧍", items: BODY },
    { id: "clima", label: "Clima", icon: "🌦️", items: WEATHER },
    { id: "calendario", label: "Días y meses", icon: "📅", items: CALENDAR },
    { id: "profesiones", label: "Profesiones", icon: "👩‍⚕️", items: PROFESSIONS },
    { id: "animales", label: "Animales", icon: "🐾", items: ANIMALS },
    { id: "transporte", label: "Transporte", icon: "🚌", items: TRANSPORT },
    { id: "casa", label: "Casa", icon: "🏠", items: HOUSE },
    { id: "emociones", label: "Emociones", icon: "😊", items: EMOTIONS },
    { id: "phrasal", label: "Phrasal verbs", icon: "🧩", items: PHRASAL },
    { id: "conectores", label: "Conectores", icon: "🔗", items: CONECTORES },
    { id: "expresiones", label: "Expresiones", icon: "💬", items: EXPRESIONES },
  ];

  // Las frases del cuaderno original se suman al banco de oraciones: ya venían
  // traducidas y son las que ella de verdad necesita decir.
  const FRASES_A_SKILL = {
    intro: "saludos",
    farewell: "saludos",
    work: "trabajo",
    friends: "actividades",
    food: "restaurante",
    activities: "actividades",
    feelings: "emociones",
    things: "objetos",
  };
  Object.keys(PHRASES).forEach(function (cat) {
    PHRASES[cat].forEach(function (f) {
      ORACIONES.push({ en: f.en, es: f.es, skill: FRASES_A_SKILL[cat] || "trabajo", nivel: 2 });
    });
  });

  /* Cada cosa que se puede aprender es una "tarjeta" con id estable.
   *
   * El repaso espaciado guarda el avance por ese id, así que se arma una vez al
   * cargar y todo el resto de la aplicación habla de tarjetas, no de arreglos
   * sueltos. El id se deriva del contenido (tema + inglés) y no de la posición:
   * si mañana se agrega una palabra en medio de la lista, el progreso de las
   * demás no se corre.
   */
  function llave(prefijo, texto) {
    return prefijo + ":" + texto.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  const TARJETAS = [];
  const yaEsta = {};

  function agregar(t) {
    // Las frases del cuaderno original y las escritas para el curso se pisan en
    // algunos casos ("Where are you from?"). Se queda la primera: dos tarjetas
    // con el mismo id compartirían el avance del repaso y se preguntarían dos
    // veces en la misma lección.
    if (yaEsta[t.id]) return;
    yaEsta[t.id] = true;
    TARJETAS.push(t);
  }

  TEMAS.forEach(function (tema) {
    tema.items.forEach(function (item) {
      agregar({
        id: llave(tema.id, item.en),
        tipo: "palabra",
        skill: tema.id,
        en: item.en,
        es: item.es,
        icon: item.icon || null,
        hex: item.hex || null,
        nota: item.note || null,
      });
    });
  });
  ORACIONES.forEach(function (o) {
    agregar({
      id: llave("frase", o.en),
      tipo: "frase",
      skill: o.skill,
      en: o.en,
      es: o.es,
      nivel: o.nivel || 2,
    });
  });

  const PorId = {};
  TARJETAS.forEach(function (t) {
    PorId[t.id] = t;
  });

  const PorSkill = {};
  TARJETAS.forEach(function (t) {
    (PorSkill[t.skill] = PorSkill[t.skill] || []).push(t);
  });

  window.APP = window.APP || {};
  APP.datos = {
    TEMAS: TEMAS,
    ORACIONES: ORACIONES,
    VERBOS: VERBS,
    INGED: INGED_ITEMS,
    FORMAL: FORMAL_PAIRS,
    VOCALES: VOWEL_PAIRS,
    TARJETAS: TARJETAS,
    porId: function (id) {
      return PorId[id] || null;
    },
    porSkill: function (skill) {
      return PorSkill[skill] || [];
    },
    temaPorId: function (id) {
      return TEMAS.filter(function (t) { return t.id === id; })[0] || null;
    },
  };
})();
