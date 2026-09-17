/* Gramática de consulta: por qué el inglés se arma así.
 *
 * El resto de la aplicación hace practicar. Esto es lo otro que hace falta:
 * poder mirar cómo funciona algo cuando no se entiende por qué una respuesta
 * estaba mal. Sin esto, equivocarse enseña sólo cuál era la respuesta.
 *
 * Cada tema está escrito contrastando con el español, porque los errores de un
 * hispanohablante no son al azar: casi todos salen de traducir literalmente una
 * estructura que en inglés no existe. Por eso cada tema tiene una "trampa" con
 * la frase mal y la frase bien, que es lo que de verdad se recuerda.
 */
(function () {
  "use strict";

  const TEMAS = [
    /* ---------------- Pronombres ---------------- */
    {
      id: "pronombres-sujeto",
      grupo: "Pronombres",
      emo: "👤",
      titulo: "Pronombres de sujeto",
      resumen: "I, you, he, she, it, we, they — y por qué nunca se pueden omitir",
      explicacion:
        "En español el sujeto se puede callar: “trabajo aquí” se entiende sin decir “yo”, porque la " +
        "terminación del verbo ya lo dice. En inglés el verbo casi no cambia, así que el pronombre es " +
        "obligatorio: sin él, la frase no se entiende.\n\n" +
        "“I” va siempre con mayúscula, esté donde esté en la frase. Es la única palabra del inglés con esa regla.",
      tabla: {
        cabecera: ["Inglés", "Español", "Ejemplo"],
        filas: [
          ["I", "yo", "I work here"],
          ["you", "tú / usted", "You work here"],
          ["he", "él", "He works here"],
          ["she", "ella", "She works here"],
          ["it", "eso (cosas y animales)", "It works well"],
          ["we", "nosotros", "We work here"],
          ["you", "ustedes", "You work here"],
          ["they", "ellos / ellas", "They work here"],
        ],
      },
      trampa: {
        mal: "Is my sister.",
        bien: "She is my sister.",
        porque: "Callar el sujeto es el error número uno. En español se puede; en inglés deja la frase coja.",
      },
      ejemplos: [
        { en: "I work in accounting.", es: "Trabajo en contabilidad." },
        { en: "She is my sister.", es: "Ella es mi hermana." },
        { en: "They live in Santiago.", es: "Ellos viven en Santiago." },
        { en: "We are ready.", es: "Estamos listos." },
      ],
    },

    {
      id: "pronombres-objeto",
      grupo: "Pronombres",
      emo: "🎯",
      titulo: "Pronombres de objeto",
      resumen: "me, you, him, her, it, us, them — los que van después del verbo",
      explicacion:
        "Son los que reciben la acción. En español van pegados o antes del verbo (“me llamó”, “la vi”); " +
        "en inglés van siempre después del verbo o de una preposición.\n\n" +
        "La regla práctica: antes del verbo van los de sujeto, después van estos.",
      tabla: {
        cabecera: ["Sujeto", "Objeto", "Ejemplo"],
        filas: [
          ["I", "me", "She called me"],
          ["you", "you", "I called you"],
          ["he", "him", "I saw him"],
          ["she", "her", "I saw her"],
          ["it", "it", "I like it"],
          ["we", "us", "She helped us"],
          ["they", "them", "I know them"],
        ],
      },
      trampa: {
        mal: "She called I.",
        bien: "She called me.",
        porque: "Después del verbo nunca va “I”. El orden en inglés es sujeto + verbo + objeto, siempre.",
      },
      ejemplos: [
        { en: "She called me yesterday.", es: "Ella me llamó ayer." },
        { en: "I saw them at the office.", es: "Los vi en la oficina." },
        { en: "Can you help us?", es: "¿Puedes ayudarnos?" },
        { en: "I sent him the report.", es: "Le envié el informe." },
      ],
    },

    {
      id: "posesivos",
      grupo: "Pronombres",
      emo: "🔑",
      titulo: "Posesivos",
      resumen: "my / mine, your / yours — de quién es algo",
      explicacion:
        "Hay dos formas y se confunden. La primera (my, your, his…) va siempre <b>antes de un sustantivo</b>: " +
        "“my car”. La segunda (mine, yours, his…) va sola, sin sustantivo detrás: “it's mine”.\n\n" +
        "Y una diferencia grande con el español: en inglés el posesivo concuerda con <b>quien posee</b>, no con " +
        "lo poseído. “Su auto” puede ser “his car” o “her car” según de quién sea.",
      tabla: {
        cabecera: ["Antes del sustantivo", "Solo", "Ejemplo"],
        filas: [
          ["my", "mine", "my car / it's mine"],
          ["your", "yours", "your idea / it's yours"],
          ["his", "his", "his desk / it's his"],
          ["her", "hers", "her bag / it's hers"],
          ["our", "ours", "our team / it's ours"],
          ["their", "theirs", "their office / it's theirs"],
        ],
      },
      trampa: {
        mal: "It's my.",
        bien: "It's mine.",
        porque: "“My” siempre necesita un sustantivo detrás. Si va solo, es “mine”.",
      },
      ejemplos: [
        { en: "This is my desk.", es: "Este es mi escritorio." },
        { en: "That bag is hers.", es: "Ese bolso es de ella." },
        { en: "Our office is on the second floor.", es: "Nuestra oficina está en el segundo piso." },
        { en: "Is this yours?", es: "¿Esto es tuyo?" },
      ],
    },

    {
      id: "demostrativos",
      grupo: "Pronombres",
      emo: "👉",
      titulo: "This, that, these, those",
      resumen: "Esto y aquello, cerca y lejos",
      explicacion:
        "Sólo hay cuatro y se eligen por dos cosas: si está cerca o lejos, y si es uno o varios.\n\n" +
        "El español tiene tres distancias (este / ese / aquel); el inglés sólo tiene dos.",
      tabla: {
        cabecera: ["", "Uno", "Varios"],
        filas: [
          ["Cerca", "this (este)", "these (estos)"],
          ["Lejos", "that (ese, aquel)", "those (esos, aquellos)"],
        ],
      },
      trampa: {
        mal: "This shoes are new.",
        bien: "These shoes are new.",
        porque: "“Shoes” es plural, así que pide “these”. Es de los errores que más se oyen.",
      },
      ejemplos: [
        { en: "This is my desk.", es: "Este es mi escritorio." },
        { en: "These documents are ready.", es: "Estos documentos están listos." },
        { en: "That was a long meeting.", es: "Esa fue una reunión larga." },
        { en: "Those boxes arrived today.", es: "Esas cajas llegaron hoy." },
      ],
    },

    /* ---------------- Verbos ---------------- */
    {
      id: "to-be",
      grupo: "Verbos",
      emo: "⭐",
      titulo: "El verbo to be",
      resumen: "Ser y estar, los dos en uno",
      explicacion:
        "El español tiene “ser” y “estar”; el inglés tiene sólo “to be” para los dos. Eso es una buena noticia: " +
        "una preocupación menos.\n\n" +
        "Es el verbo más irregular del idioma y también el más usado, así que conviene sabérselo de memoria. " +
        "Ojo con una cosa: hay estados que en español van con “tener” y en inglés van con “be” — la edad, el " +
        "hambre, el frío, el miedo.",
      tabla: {
        cabecera: ["Persona", "Presente", "Pasado"],
        filas: [
          ["I", "am", "was"],
          ["you", "are", "were"],
          ["he / she / it", "is", "was"],
          ["we", "are", "were"],
          ["they", "are", "were"],
        ],
      },
      trampa: {
        mal: "I have 35 years.",
        bien: "I am 35 years old.",
        porque: "La edad, el hambre, el frío y el miedo van con “be”, no con “have”: I am hungry, I am cold, I am scared.",
      },
      ejemplos: [
        { en: "I am tired today.", es: "Estoy cansada hoy." },
        { en: "She is an engineer.", es: "Ella es ingeniera." },
        { en: "We were in a meeting.", es: "Estábamos en una reunión." },
        { en: "I am cold.", es: "Tengo frío." },
      ],
    },

    {
      id: "auxiliar-do",
      grupo: "Verbos",
      emo: "❓",
      titulo: "Do, does y did",
      resumen: "El comodín para preguntar y para negar",
      explicacion:
        "En español una pregunta se hace con la entonación: “trabajas aquí” y “¿trabajas aquí?” son la misma frase. " +
        "En inglés no alcanza: hay que meter un auxiliar adelante.\n\n" +
        "Ese auxiliar es <b>do</b> (o <b>does</b> con he/she/it, o <b>did</b> en pasado). Y hay una regla que se " +
        "olvida mucho: cuando aparece el auxiliar, <b>el verbo principal vuelve a su forma base</b>. Ya no lleva -s " +
        "ni -ed, porque esa información la carga el auxiliar.",
      tabla: {
        cabecera: ["", "Afirmación", "Pregunta", "Negación"],
        filas: [
          ["I / you / we / they", "You work", "Do you work?", "You don't work"],
          ["he / she / it", "She works", "Does she work?", "She doesn't work"],
          ["Pasado (todos)", "You worked", "Did you work?", "You didn't work"],
        ],
      },
      trampa: {
        mal: "Does she works here?",
        bien: "Does she work here?",
        porque: "La -s ya está en “does”. Ponerla dos veces es el error clásico. Igual en pasado: “Did you went?” → “Did you go?”.",
      },
      ejemplos: [
        { en: "Do you work on Saturdays?", es: "¿Trabajas los sábados?" },
        { en: "She doesn't like coffee.", es: "A ella no le gusta el café." },
        { en: "Did you send the report?", es: "¿Enviaste el informe?" },
        { en: "They didn't come to the meeting.", es: "No vinieron a la reunión." },
      ],
    },

    {
      id: "tiempos",
      grupo: "Verbos",
      emo: "🕰️",
      titulo: "Cuándo se usa cada tiempo",
      resumen: "Ocho tiempos y en qué se diferencian",
      explicacion:
        "No es cuestión de memorizar formas, sino de saber cuándo va cada una. La diferencia que más cuesta a " +
        "los hispanohablantes es entre el <b>pasado simple</b> y el <b>presente perfecto</b>.\n\n" +
        "El pasado simple es para algo terminado, casi siempre con un “cuándo”: I worked there in 2020. El " +
        "presente perfecto es para el pasado que todavía importa ahora, sin decir cuándo: I have worked there " +
        "(y sigo, o me marcó). Si dices el momento exacto, va pasado simple sí o sí.",
      tabla: {
        cabecera: ["Tiempo", "Cuándo se usa", "Ejemplo"],
        filas: [
          ["Presente simple", "Rutinas y hechos", "I work here"],
          ["Presente continuo", "Ahora mismo", "I am working"],
          ["Pasado simple", "Terminado, con un cuándo", "I worked yesterday"],
          ["Pasado continuo", "En curso en el pasado", "I was working"],
          ["Presente perfecto", "Pasado que importa ahora", "I have worked here for years"],
          ["Futuro con will", "Decisión del momento", "I will call you"],
          ["Futuro con going to", "Plan ya decidido", "I am going to travel"],
          ["Condicional", "Hipótesis y cortesía", "I would like a coffee"],
        ],
      },
      trampa: {
        mal: "I have worked there in 2020.",
        bien: "I worked there in 2020.",
        porque: "Si dices cuándo pasó, va pasado simple. El presente perfecto no admite un momento exacto.",
      },
      ejemplos: [
        { en: "I work in accounting.", es: "Trabajo en contabilidad." },
        { en: "I am working on the report now.", es: "Estoy trabajando en el informe ahora." },
        { en: "I worked there in 2020.", es: "Trabajé ahí en 2020." },
        { en: "I have worked here for five years.", es: "Llevo cinco años trabajando acá." },
      ],
    },

    {
      id: "modales",
      grupo: "Verbos",
      emo: "🔧",
      titulo: "Can, should, must, would",
      resumen: "Poder, deber, tener que — y por qué nunca cambian",
      explicacion:
        "Los modales son verbos especiales que acompañan a otro. Tienen tres reglas propias y las tres son " +
        "buenas noticias: nunca llevan -s, nunca llevan “to” detrás, y para preguntar no necesitan “do”.\n\n" +
        "Se preguntan invirtiendo: “Can you help me?”, no “Do you can help me?”.",
      tabla: {
        cabecera: ["Modal", "Qué expresa", "Ejemplo"],
        filas: [
          ["can", "poder, saber hacer", "I can speak English"],
          ["could", "poder (pasado o cortesía)", "Could you help me?"],
          ["should", "consejo, lo que conviene", "You should rest"],
          ["must", "obligación fuerte", "I must finish this today"],
          ["have to", "obligación externa", "I have to work tomorrow"],
          ["would", "hipótesis, cortesía", "I would like a coffee"],
          ["may / might", "posibilidad", "It might rain"],
        ],
      },
      trampa: {
        mal: "She cans speak English.",
        bien: "She can speak English.",
        porque: "Los modales no llevan -s nunca, ni siquiera con he/she/it. Y el verbo que va detrás siempre va en base.",
      },
      ejemplos: [
        { en: "Can you help me with this?", es: "¿Me puedes ayudar con esto?" },
        { en: "You should talk to the manager.", es: "Deberías hablar con el jefe." },
        { en: "I have to finish this today.", es: "Tengo que terminar esto hoy." },
        { en: "I would like a coffee, please.", es: "Quisiera un café, por favor." },
      ],
    },

    {
      id: "there-is",
      grupo: "Verbos",
      emo: "📍",
      titulo: "There is / there are",
      resumen: "El “hay” del inglés",
      explicacion:
        "“Hay” en español no cambia: hay un problema, hay tres problemas. En inglés sí cambia según lo que venga " +
        "después: <b>there is</b> para uno, <b>there are</b> para varios.\n\n" +
        "En pasado: there was / there were.",
      tabla: {
        cabecera: ["", "Presente", "Pasado"],
        filas: [
          ["Uno", "there is (there's)", "there was"],
          ["Varios", "there are", "there were"],
        ],
      },
      trampa: {
        mal: "There is three people in the office.",
        bien: "There are three people in the office.",
        porque: "“Three people” es plural, así que pide “there are”. Se mira lo que viene después, no lo de antes.",
      },
      ejemplos: [
        { en: "There is a problem with the invoice.", es: "Hay un problema con la factura." },
        { en: "There are three people in the office.", es: "Hay tres personas en la oficina." },
        { en: "There was a meeting yesterday.", es: "Hubo una reunión ayer." },
        { en: "Is there a bank near here?", es: "¿Hay un banco cerca de acá?" },
      ],
    },

    /* ---------------- La frase ---------------- */
    {
      id: "orden",
      grupo: "Cómo se arma la frase",
      emo: "🧱",
      titulo: "El orden de las palabras",
      resumen: "Sujeto + verbo + objeto, casi sin excepciones",
      explicacion:
        "El español mueve las palabras con bastante libertad: “el informe lo envié ayer”, “ayer envié el informe”. " +
        "El inglés es mucho más rígido y el orden <b>sujeto + verbo + objeto</b> casi no se toca.\n\n" +
        "Dos consecuencias prácticas: los adjetivos van <b>antes</b> del sustantivo (a red car, no a car red), y " +
        "las expresiones de tiempo van al principio o al final, nunca entre el verbo y su objeto.",
      tabla: {
        cabecera: ["Español", "Inglés", ""],
        filas: [
          ["un auto rojo", "a red car", "el adjetivo va antes"],
          ["una reunión larga", "a long meeting", "el adjetivo va antes"],
          ["envié el informe ayer", "I sent the report yesterday", "el tiempo, al final"],
          ["ayer envié el informe", "Yesterday I sent the report", "o al principio"],
        ],
      },
      trampa: {
        mal: "I sent yesterday the report.",
        bien: "I sent the report yesterday.",
        porque: "Nada se mete entre el verbo y su objeto. El “cuándo” va antes de todo o después de todo.",
      },
      ejemplos: [
        { en: "I sent the report yesterday.", es: "Envié el informe ayer." },
        { en: "She bought a red car.", es: "Ella compró un auto rojo." },
        { en: "We had a long meeting.", es: "Tuvimos una reunión larga." },
        { en: "They always arrive early.", es: "Siempre llegan temprano." },
      ],
    },

    {
      id: "articulos",
      grupo: "Cómo se arma la frase",
      emo: "🔤",
      titulo: "A, an y the",
      resumen: "Cuándo va artículo y cuándo no va ninguno",
      explicacion:
        "<b>a / an</b> es para algo indeterminado, uno cualquiera. <b>the</b> es para algo que las dos personas " +
        "ya saben cuál es. Se usa “an” cuando la palabra siguiente <b>empieza con sonido de vocal</b> — es por el " +
        "sonido, no por la letra: an hour (la h no suena), a university (suena “iu”).\n\n" +
        "Lo que más cuesta es lo contrario: en inglés hay muchos casos <b>sin artículo</b> donde el español sí lo " +
        "pone. Las cosas en general, los idiomas, los días y las comidas van pelados.",
      tabla: {
        cabecera: ["Español", "Inglés", "Por qué"],
        filas: [
          ["Los perros son leales", "Dogs are loyal", "en general, sin artículo"],
          ["Hablo inglés", "I speak English", "los idiomas, sin artículo"],
          ["El lunes tengo reunión", "On Monday I have a meeting", "los días, sin artículo"],
          ["El almuerzo es a la una", "Lunch is at one", "las comidas, sin artículo"],
          ["una hora", "an hour", "la h no suena: empieza en vocal"],
        ],
      },
      trampa: {
        mal: "I speak the English.",
        bien: "I speak English.",
        porque: "Los idiomas nunca llevan artículo. Lo mismo con las cosas en general: “Coffee is expensive”, no “The coffee is expensive” (salvo que hables de un café concreto).",
      },
      ejemplos: [
        { en: "I speak English.", es: "Hablo inglés." },
        { en: "She is an engineer.", es: "Ella es ingeniera." },
        { en: "The report is on your desk.", es: "El informe está en tu escritorio." },
        { en: "Dogs are loyal.", es: "Los perros son leales." },
      ],
    },

    {
      id: "plurales",
      grupo: "Cómo se arma la frase",
      emo: "➕",
      titulo: "Los plurales",
      resumen: "-s, -es, y los que se salen de la regla",
      explicacion:
        "Casi todo hace el plural con -s. Se agrega -es cuando la palabra termina en s, x, z, ch o sh, porque " +
        "sin la e no se podría pronunciar.\n\n" +
        "Y algo que en español no pasa: los <b>adjetivos no tienen plural</b>. Se dice “two red cars”, nunca " +
        "“two reds cars”.",
      tabla: {
        cabecera: ["Regla", "Ejemplo", ""],
        filas: [
          ["+ s", "car → cars", "lo normal"],
          ["+ es", "box → boxes", "tras s, x, z, ch, sh"],
          ["consonante + y → ies", "company → companies", ""],
          ["irregulares", "child → children", "man → men, woman → women"],
          ["iguales", "sheep → sheep", "fish, series"],
          ["sólo plural", "trousers, scissors", "pantalones, tijeras"],
        ],
      },
      trampa: {
        mal: "two reds cars",
        bien: "two red cars",
        porque: "Los adjetivos en inglés nunca cambian: ni por número ni por género.",
      },
      ejemplos: [
        { en: "We have two red cars.", es: "Tenemos dos autos rojos." },
        { en: "The companies sent their invoices.", es: "Las empresas enviaron sus facturas." },
        { en: "There are three children here.", es: "Hay tres niños acá." },
        { en: "My trousers are new.", es: "Mis pantalones son nuevos." },
      ],
    },

    {
      id: "adjetivos",
      grupo: "Cómo se arma la frase",
      emo: "🎨",
      titulo: "Los adjetivos",
      resumen: "Van antes del sustantivo, y nunca cambian",
      explicacion:
        "Éste es el cambio de chip más grande, porque en español hacemos exactamente lo contrario. " +
        "En español el adjetivo va <b>después</b>: “un auto rojo”. En inglés va <b>antes</b>: " +
        "“a red car”. Siempre, sin excepción, cuando acompaña a un sustantivo.\n\n" +
        "Y además no cambia nunca: ni por género ni por número. “Rojo, roja, rojos, rojas” son las " +
        "cuatro la misma palabra, <b>red</b>.\n\n" +
        "Cuando van dos o tres juntos hay un orden que los ingleses siguen sin darse cuenta: " +
        "opinión, tamaño, edad, color, origen, material. “A nice big old red Italian leather bag”. " +
        "Nadie te va a corregir si lo cambias, pero suena raro, igual que “un rojo grande auto” en español.",
      tabla: {
        cabecera: ["Español", "Inglés", "Ojo con"],
        filas: [
          ["un auto rojo", "a red car", "el adjetivo va primero"],
          ["dos autos rojos", "two red cars", "red no lleva -s"],
          ["una casa grande", "a big house", ""],
          ["las facturas pendientes", "the pending invoices", ""],
          ["un proveedor nuevo", "a new supplier", ""],
          ["El auto es rojo.", "The car is red.", "después de 'to be' sí va al final"],
        ],
      },
      trampa: {
        mal: "I need a folder new.",
        bien: "I need a new folder.",
        porque:
          "Traducir el orden del español es el error más frecuente y el que más delata. El adjetivo " +
          "va pegado antes del sustantivo; sólo va al final cuando el verbo es to be: “the folder is new”.",
      },
      ejemplos: [
        { en: "I need a new folder.", es: "Necesito una carpeta nueva." },
        { en: "We have two important meetings.", es: "Tenemos dos reuniones importantes." },
        { en: "She sent a long email.", es: "Ella envió un correo largo." },
        { en: "The old supplier was cheaper.", es: "El proveedor antiguo era más barato." },
        { en: "That is a difficult question.", es: "Esa es una pregunta difícil." },
      ],
    },

    {
      id: "adverbios",
      grupo: "Cómo se arma la frase",
      emo: "🏃",
      titulo: "Los adverbios",
      resumen: "Cómo y cada cuánto pasa algo, y dónde se ponen",
      explicacion:
        "Un adjetivo describe una cosa (<i>a slow car</i>); un adverbio describe una acción " +
        "(<i>she drives slowly</i>). Casi todos se arman agregando <b>-ly</b>, que es el equivalente " +
        "de nuestro “-mente”.\n\n" +
        "Los de frecuencia —always, usually, often, sometimes, never— tienen una posición fija que no " +
        "se parece a la nuestra: van <b>antes del verbo</b> normal, pero <b>después de to be</b>. " +
        "“I always work late”, pero “I am always late”.\n\n" +
        "Y una regla que casi nadie te dice: nunca se mete nada entre el verbo y su objeto. " +
        "“I speak English well”, jamás “I speak well English”.",
      tabla: {
        cabecera: ["Adjetivo", "Adverbio", "Ejemplo"],
        filas: [
          ["slow", "slowly", "She speaks slowly"],
          ["quick", "quickly", "Answer quickly, please"],
          ["careful", "carefully", "Read the contract carefully"],
          ["easy", "easily", "y → ily"],
          ["good", "well", "irregular: no existe “goodly”"],
          ["fast", "fast", "igual: no existe “fastly”"],
          ["hard", "hard", "“hardly” significa otra cosa: casi nunca"],
        ],
      },
      trampa: {
        mal: "I speak well English.",
        bien: "I speak English well.",
        porque:
          "En inglés no se separa el verbo de su objeto. El adverbio se va al final de la frase, " +
          "o antes del verbo si es de frecuencia.",
      },
      ejemplos: [
        { en: "I speak English well.", es: "Hablo inglés bien." },
        { en: "She always answers quickly.", es: "Ella siempre contesta rápido." },
        { en: "He is never late.", es: "Él nunca llega tarde." },
        { en: "Please read the contract carefully.", es: "Por favor lee el contrato con atención." },
        { en: "We usually meet on Mondays.", es: "Normalmente nos reunimos los lunes." },
      ],
    },

    {
      id: "preguntas",
      grupo: "Cómo se arma la frase",
      emo: "🙋",
      titulo: "Cómo se pregunta",
      resumen: "Las palabras de pregunta y el orden que exigen",
      explicacion:
        "Una pregunta en inglés casi siempre invierte: primero el auxiliar, después el sujeto. Con palabra de " +
        "pregunta, esa palabra va delante de todo.\n\n" +
        "La estructura completa es: <b>palabra de pregunta + auxiliar + sujeto + verbo</b>. " +
        "Where do you live? · What did she say? · How much does it cost?",
      tabla: {
        cabecera: ["Palabra", "Pregunta por", "Ejemplo"],
        filas: [
          ["what", "qué", "What do you do?"],
          ["where", "dónde", "Where do you live?"],
          ["when", "cuándo", "When does it start?"],
          ["who", "quién", "Who called you?"],
          ["why", "por qué", "Why is it late?"],
          ["how", "cómo", "How do you say this?"],
          ["how much / many", "cuánto / cuántos", "How much does it cost?"],
          ["which", "cuál (de varios)", "Which one do you prefer?"],
        ],
      },
      trampa: {
        mal: "Where you live?",
        bien: "Where do you live?",
        porque: "Falta el auxiliar. En español la entonación basta; en inglés hay que poner “do”, “does” o “did”.",
      },
      ejemplos: [
        { en: "Where do you work?", es: "¿Dónde trabajas?" },
        { en: "What time does the meeting start?", es: "¿A qué hora empieza la reunión?" },
        { en: "How much does it cost?", es: "¿Cuánto cuesta?" },
        { en: "Why didn't they call?", es: "¿Por qué no llamaron?" },
      ],
    },

    {
      id: "negacion",
      grupo: "Cómo se arma la frase",
      emo: "🚫",
      titulo: "Cómo se niega",
      resumen: "Un solo “no” por frase",
      explicacion:
        "La negación se arma con <b>not</b> pegado al auxiliar: don't, doesn't, didn't, isn't, can't, won't.\n\n" +
        "Y hay una regla que choca de frente con el español: en inglés <b>no se puede negar dos veces</b>. " +
        "“No sé nada” tiene dos negaciones en español y es correcto; en inglés hay que elegir una.",
      tabla: {
        cabecera: ["Con", "Negación", "Ejemplo"],
        filas: [
          ["do / does / did", "don't, doesn't, didn't", "I don't know"],
          ["be", "am not, isn't, aren't, wasn't", "She isn't here"],
          ["can", "can't", "I can't come"],
          ["will", "won't", "It won't work"],
          ["have (perfecto)", "haven't, hasn't", "I haven't seen it"],
        ],
      },
      trampa: {
        mal: "I don't know nothing.",
        bien: "I don't know anything.",
        porque: "Dos negaciones en inglés se anulan. Con “don't” ya negaste; después va “anything”, “anybody”, “ever”.",
      },
      ejemplos: [
        { en: "I don't know anything about it.", es: "No sé nada de eso." },
        { en: "She isn't in the office today.", es: "Ella no está en la oficina hoy." },
        { en: "We can't finish it today.", es: "No podemos terminarlo hoy." },
        { en: "I haven't seen the report.", es: "No he visto el informe." },
      ],
    },

    {
      id: "preposiciones",
      grupo: "Cómo se arma la frase",
      emo: "📌",
      titulo: "In, on y at",
      resumen: "Las tres preposiciones que más se equivocan",
      explicacion:
        "No se traducen una por una desde el español, así que memorizar “in = en” no sirve. Funcionan por " +
        "tamaño: de lo más grande y general (in) a lo más preciso (at).\n\n" +
        "Sirve la misma imagen para el tiempo y para el lugar.",
      tabla: {
        cabecera: ["", "Tiempo", "Lugar"],
        filas: [
          ["in", "meses, años, estaciones: in May, in 2026", "espacios cerrados: in the office"],
          ["on", "días y fechas: on Monday, on 3 May", "superficies: on the table"],
          ["at", "horas: at nine, at noon", "puntos exactos: at the door, at home"],
        ],
      },
      trampa: {
        mal: "I arrive in Monday at the morning.",
        bien: "I arrive on Monday in the morning.",
        porque: "Los días van con “on”; las partes del día van con “in” (in the morning, in the afternoon). La excepción que hay que saberse: “at night”.",
      },
      ejemplos: [
        { en: "The meeting is on Monday at ten.", es: "La reunión es el lunes a las diez." },
        { en: "I work in the morning.", es: "Trabajo en la mañana." },
        { en: "She is at home.", es: "Ella está en la casa." },
        { en: "We travel in December.", es: "Viajamos en diciembre." },
      ],
    },

    {
      id: "comparativos",
      grupo: "Cómo se arma la frase",
      emo: "📊",
      titulo: "Comparar",
      resumen: "-er, more, the most — y cuándo va cada uno",
      explicacion:
        "La regla depende del largo de la palabra. Las cortas (una sílaba) llevan <b>-er</b> y <b>-est</b>: " +
        "cheap → cheaper → the cheapest. Las largas usan <b>more</b> y <b>the most</b>: expensive → more " +
        "expensive → the most expensive.\n\n" +
        "Para comparar se usa “than”, no “that”: cheaper <b>than</b> this one.",
      tabla: {
        cabecera: ["Adjetivo", "Comparativo", "Superlativo"],
        filas: [
          ["cheap (corto)", "cheaper", "the cheapest"],
          ["big (corto)", "bigger", "the biggest"],
          ["easy (acaba en y)", "easier", "the easiest"],
          ["expensive (largo)", "more expensive", "the most expensive"],
          ["good", "better", "the best"],
          ["bad", "worse", "the worst"],
        ],
      },
      trampa: {
        mal: "This is more cheap that the other one.",
        bien: "This is cheaper than the other one.",
        porque: "Dos errores en una frase: “cheap” es corto y lleva -er, y para comparar se dice “than”, no “that”.",
      },
      ejemplos: [
        { en: "This one is cheaper than the other.", es: "Este es más barato que el otro." },
        { en: "It's the most expensive option.", es: "Es la opción más cara." },
        { en: "Your English is better than mine.", es: "Tu inglés es mejor que el mío." },
        { en: "That was the worst meeting of the year.", es: "Esa fue la peor reunión del año." },
      ],
    },

    {
      id: "inged",
      grupo: "Cómo se arma la frase",
      emo: "🔀",
      titulo: "Adjetivos en -ing y en -ed",
      resumen: "Boring o bored: la cosa o tú",
      explicacion:
        "Es una diferencia chica que cambia el sentido por completo, y por eso es de las que más vergüenza dan " +
        "cuando salen mal.\n\n" +
        "<b>-ing</b> describe <b>la cosa</b>, lo que causa el efecto: the film is boring (la película aburre). " +
        "<b>-ed</b> describe <b>a la persona</b>, lo que siente: I am bored (yo estoy aburrida).\n\n" +
        "La regla para acordarse: si hablas de cómo te sientes tú, va -ed. Si hablas de cómo es la cosa, va -ing.",
      tabla: {
        cabecera: ["La cosa (-ing)", "La persona (-ed)", ""],
        filas: [
          ["boring", "bored", "aburrido"],
          ["interesting", "interested", "interesante / interesado"],
          ["tiring", "tired", "cansador / cansado"],
          ["exciting", "excited", "emocionante / emocionada"],
          ["surprising", "surprised", "sorprendente / sorprendida"],
          ["confusing", "confused", "confuso / confundida"],
        ],
      },
      trampa: {
        mal: "I am boring.",
        bien: "I am bored.",
        porque: "“I am boring” significa “soy una persona aburrida”. Si quieres decir que estás aburrida, es “I am bored”.",
      },
      ejemplos: [
        { en: "I am bored at home.", es: "Estoy aburrida en la casa." },
        { en: "This film is boring.", es: "Esta película es aburrida." },
        { en: "I am interested in this job.", es: "Estoy interesada en este trabajo." },
        { en: "The trip was exciting.", es: "El viaje fue emocionante." },
      ],
    },
  ];

  const GRUPOS = [];
  TEMAS.forEach(function (t) {
    if (GRUPOS.indexOf(t.grupo) < 0) GRUPOS.push(t.grupo);
  });

  const porId = {};
  TEMAS.forEach(function (t) { porId[t.id] = t; });

  window.APP = window.APP || {};
  APP.datosGramatica = {
    TEMAS: TEMAS,
    GRUPOS: GRUPOS,
    tema: function (id) { return porId[id] || null; },
    delGrupo: function (g) {
      return TEMAS.filter(function (t) { return t.grupo === g; });
    },
  };
})();
