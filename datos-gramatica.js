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
      idea: "En español el sujeto se puede callar. En inglés <b>nunca</b>: toda frase empieza por quién hace la acción.",
      pasos: [
        {
          titulo: "Paso 1. En español el verbo ya dice quién es",
          texto:
            "Si digo “trabajo aquí”, nadie pregunta quién. La terminación <b>-o</b> de “trabajo” ya dice que soy yo. Por eso el español puede saltarse el “yo”.",
          ejemplos: [
            { en: "I work here.", es: "Trabajo aquí. (yo)" },
          ],
        },
        {
          titulo: "Paso 2. En inglés el verbo casi no cambia",
          texto:
            "Mira “work”: es igual para yo, para tú, para nosotros y para ellos. Si quitas el pronombre, la frase se queda sin saber de quién habla.",
          ejemplos: [
            { en: "I work.", es: "Yo trabajo." },
            { en: "You work.", es: "Tú trabajas." },
            { en: "We work.", es: "Nosotros trabajamos." },
            { en: "They work.", es: "Ellos trabajan." },
          ],
        },
        {
          titulo: "Paso 3. Por eso el pronombre es obligatorio",
          texto:
            "Siempre va delante del verbo, aunque en español suene repetitivo. <b>Ninguna</b> frase en inglés empieza directamente por el verbo (salvo las órdenes: “Come here”).",
          ejemplos: [
            { en: "She is my sister.", es: "Es mi hermana." },
            { en: "It is cold today.", es: "Hace frío hoy." },
          ],
        },
        {
          titulo: "Paso 4. “I” va siempre con mayúscula",
          texto:
            "Esté donde esté en la frase, “I” se escribe con mayúscula. Es la única palabra del inglés con esa regla, y no hay que buscarle lógica: es una costumbre de imprenta de hace seiscientos años.",
          ejemplos: [
            { en: "Yesterday I sent the invoice.", es: "Ayer envié la factura." },
            { en: "Tomorrow I will call her.", es: "Mañana la llamaré." },
          ],
        },
      ],
      porque:
        "Esto no es un capricho: es la consecuencia de que el inglés perdió sus terminaciones.\n\nEl inglés antiguo sí las tenía, como el español: el verbo cambiaba para cada persona. Con los siglos se fueron gastando hasta que quedó una sola forma para casi todas (de la vieja familia sólo sobrevive la <b>-s</b> de he/she/it). Al quedarse el verbo mudo, la información de quién hace la acción tuvo que mudarse a otro sitio — y ese sitio es el pronombre.\n\nGuarda esta idea, porque explica mucho más que esta regla: el verbo inglés no marca la persona. De ahí sale también que haga falta <b>do</b> para preguntar y que el orden de las palabras sea tan rígido. Son tres reglas distintas con una sola causa.",
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
      idea: "Los mismos pronombres cambian de forma según estén <b>antes</b> del verbo (quien hace) o <b>después</b> (quien recibe).",
      pasos: [
        {
          titulo: "Paso 1. Quién hace y quién recibe",
          texto:
            "En “Ella me llamó”, <b>ella</b> hace la llamada y <b>me</b> la recibe. El inglés usa una forma distinta para cada papel: <b>she</b> para quien hace, <b>me</b> para quien recibe.",
          ejemplos: [
            { en: "She called me.", es: "Ella me llamó." },
            { en: "I called her.", es: "Yo la llamé." },
          ],
        },
        {
          titulo: "Paso 2. La posición te dice cuál usar",
          texto:
            "No hay que pensarlo mucho: <b>antes del verbo</b> va la forma de sujeto, <b>después del verbo</b> va la de objeto. Ese es todo el truco.",
          ejemplos: [
            { en: "I saw him.", es: "Lo vi." },
            { en: "He saw me.", es: "Él me vio." },
          ],
        },
        {
          titulo: "Paso 3. Después de una preposición, también",
          texto:
            "Con <b>to, for, with, about</b> y compañía va igualmente la forma de objeto.",
          ejemplos: [
            { en: "This is for you.", es: "Esto es para ti." },
            { en: "I went with them.", es: "Fui con ellos." },
            { en: "She talked about us.", es: "Ella habló de nosotros." },
          ],
        },
        {
          titulo: "Paso 4. El español los pone antes; el inglés, después",
          texto:
            "En español el pronombre se pega delante del verbo: “la vi”, “me llamó”, “te lo envié”. En inglés <b>siempre</b> va detrás. Traducir en el mismo orden es el error más común.",
          ejemplos: [
            { en: "I saw her.", es: "La vi." },
            { en: "I sent it to you.", es: "Te lo envié." },
          ],
        },
      ],
      porque:
        "El español puede permitirse poner el pronombre delante porque las palabras llevan su papel escrito encima: “me” sólo puede ser quien recibe, nunca quien hace. Da igual dónde lo pongas, se entiende.\n\nEl inglés casi perdió esas marcas, así que el papel de cada palabra lo decide <b>el lugar que ocupa</b>: lo primero es quien hace, lo que va tras el verbo es quien recibe. Y los pronombres son justo los supervivientes del sistema antiguo — son las únicas palabras inglesas que todavía cambian de forma según su papel. Por eso te obligan a las dos cosas a la vez: la forma correcta <b>y</b> el sitio correcto.",
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
      idea: "<b>my</b> necesita un sustantivo detrás; <b>mine</b> va solo. Y concuerdan con quien posee, no con lo poseído.",
      pasos: [
        {
          titulo: "Paso 1. La forma que va pegada a un sustantivo",
          texto:
            "<b>my, your, his, her, our, their</b> nunca van solas: siempre traen detrás la cosa poseída.",
          ejemplos: [
            { en: "This is my desk.", es: "Este es mi escritorio." },
            { en: "Our office is closed.", es: "Nuestra oficina está cerrada." },
          ],
        },
        {
          titulo: "Paso 2. La forma que va sola",
          texto:
            "<b>mine, yours, his, hers, ours, theirs</b> reemplazan al sustantivo entero, cuando ya se sabe de qué se habla. Fíjate que casi todas terminan en <b>-s</b>.",
          ejemplos: [
            { en: "That bag is hers.", es: "Ese bolso es de ella." },
            { en: "Is this yours?", es: "¿Esto es tuyo?" },
          ],
        },
        {
          titulo: "Paso 3. Concuerda con el dueño, no con la cosa",
          texto:
            "Aquí está la diferencia grande con el español. “Su auto” no dice de quién es. En inglés hay que elegir: <b>his</b> si el dueño es hombre, <b>her</b> si es mujer, <b>their</b> si son varios. Y no importa si lo poseído es singular o plural.",
          ejemplos: [
            { en: "Ana lost her keys.", es: "Ana perdió sus llaves." },
            { en: "Pedro lost his keys.", es: "Pedro perdió sus llaves." },
            { en: "They lost their keys.", es: "Ellos perdieron sus llaves." },
          ],
        },
        {
          titulo: "Paso 4. Cuidado con “its” y “it’s”",
          texto:
            "<b>its</b> (sin apóstrofo) es el posesivo: “su”. <b>it’s</b> (con apóstrofo) es “it is”. Se confunden hasta entre nativos.",
          ejemplos: [
            { en: "The company changed its name.", es: "La empresa cambió su nombre." },
            { en: "It’s late.", es: "Es tarde." },
          ],
        },
      ],
      porque:
        "Lo de concordar con el dueño viene de que el inglés heredó del germánico una distinción de género en la tercera persona — él, ella, ello — y la conservó justo ahí, en los posesivos y los pronombres, cuando la borró de todo lo demás. Por eso los sustantivos ingleses no tienen género (no hay “la mesa” ni “el libro”), pero <b>his</b> y <b>her</b> sí lo distinguen: son restos de un sistema más antiguo.\n\nEl español hizo lo contrario: puso el género en el sustantivo y dejó “su” sin marcar al dueño. Ninguno de los dos es más lógico; cada idioma decidió dónde gastar la información. Lo incómodo es que, viniendo del español, el inglés te pide un dato que tu idioma nunca te obligó a dar.",
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
      idea: "Sólo hay cuatro palabras, y se eligen cruzando dos preguntas: ¿cerca o lejos? ¿uno o varios?",
      pasos: [
        {
          titulo: "Paso 1. Cerca y en singular: this",
          texto:
            "Algo que tienes a mano, uno solo.",
          ejemplos: [
            { en: "This is my desk.", es: "Este es mi escritorio." },
            { en: "This coffee is cold.", es: "Este café está frío." },
          ],
        },
        {
          titulo: "Paso 2. Cerca y en plural: these",
          texto:
            "Varias cosas a mano. Se pronuncia largo, /díiz/, mientras que “this” es corto, /dis/. Es la única forma de distinguirlos al oído.",
          ejemplos: [
            { en: "These documents are ready.", es: "Estos documentos están listos." },
            { en: "These shoes are new.", es: "Estos zapatos son nuevos." },
          ],
        },
        {
          titulo: "Paso 3. Lejos: that y those",
          texto:
            "<b>that</b> para uno, <b>those</b> para varios. También sirven para lo que ya pasó o ya se mencionó.",
          ejemplos: [
            { en: "That was a long meeting.", es: "Esa fue una reunión larga." },
            { en: "Those boxes arrived today.", es: "Esas cajas llegaron hoy." },
          ],
        },
        {
          titulo: "Paso 4. El español tiene tres distancias; el inglés, dos",
          texto:
            "Nosotros decimos <b>este</b> (aquí), <b>ese</b> (ahí) y <b>aquel</b> (allá). El inglés junta “ese” y “aquel” en uno solo: <b>that</b>. Así que ante la duda entre “ese” y “aquel”, siempre es <b>that</b>.",
          ejemplos: [
            { en: "That building is old.", es: "Aquel edificio es viejo." },
            { en: "That one, please.", es: "Ese, por favor." },
          ],
        },
      ],
      porque:
        "Casi todos los idiomas marcan la distancia, pero no todos usan el mismo número de escalones. El español tiene tres porque los hereda del latín, y están organizados por persona más que por metros: <b>este</b> es lo mío, <b>ese</b> es lo tuyo, <b>aquel</b> es lo de ninguno de los dos.\n\nEl inglés simplificó a dos: lo cercano y lo demás. Que tenga menos escalones es una ventaja para ti — de tres opciones pasas a dos, y nunca vas a equivocarte por elegir “that” donde el español decía “aquel”.\n\nDonde sí hay que fijarse es en el plural, porque el español lo marca en todas (“estos”, “esos”) y es fácil arrastrar el singular inglés sin darse cuenta.",
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
      idea: "“To be” hace el trabajo de <b>ser</b> y de <b>estar</b> a la vez — y además el de <b>tener</b> en un puñado de casos.",
      pasos: [
        {
          titulo: "Paso 1. Dos verbos españoles, uno inglés",
          texto:
            "“Ella es ingeniera” y “ella está cansada” usan verbos distintos en español. En inglés los dos son <b>is</b>. Esto es más fácil, no más difícil: una decisión menos que tomar.",
          ejemplos: [
            { en: "She is an engineer.", es: "Ella es ingeniera." },
            { en: "She is tired.", es: "Ella está cansada." },
          ],
        },
        {
          titulo: "Paso 2. Las formas, que hay que saberse de memoria",
          texto:
            "Es el verbo más irregular del idioma y el que más se usa. En presente: <b>am</b> con I, <b>is</b> con he/she/it, <b>are</b> con el resto. En pasado sólo hay dos: <b>was</b> y <b>were</b>.",
          ejemplos: [
            { en: "I am ready.", es: "Estoy lista." },
            { en: "He is in a meeting.", es: "Él está en una reunión." },
            { en: "We were at the office.", es: "Estábamos en la oficina." },
          ],
        },
        {
          titulo: "Paso 3. Las formas cortas, que son las que se oyen",
          texto:
            "En la vida real casi nadie dice “I am”: dice <b>I’m</b>. Conviene reconocerlas de oído, aunque al escribir uses las largas.",
          ejemplos: [
            { en: "I’m late.", es: "Voy tarde." },
            { en: "She’s my boss.", es: "Ella es mi jefa." },
            { en: "They’re outside.", es: "Están afuera." },
          ],
        },
        {
          titulo: "Paso 4. Los estados que en español van con “tener”",
          texto:
            "Aquí está la trampa de verdad. La edad, el hambre, la sed, el frío, el calor, el miedo, la razón: en español se <b>tienen</b>, en inglés se <b>son</b>. Vale la pena aprenderse esta lista corta de memoria.",
          ejemplos: [
            { en: "I am 35 years old.", es: "Tengo 35 años." },
            { en: "I am hungry.", es: "Tengo hambre." },
            { en: "I am cold.", es: "Tengo frío." },
            { en: "You are right.", es: "Tienes razón." },
          ],
        },
      ],
      porque:
        "Lo de <b>ser</b> y <b>estar</b> es una rareza del español y el portugués, no la norma. El latín tenía un solo verbo, “esse”; fue el español el que después reclutó otro verbo, “stare” (“estar de pie”), para las situaciones pasajeras. El inglés simplemente nunca hizo ese reparto.\n\nY lo del hambre y la edad viene de que cada idioma decide si un estado es algo que <b>te pasa</b> o algo que <b>tienes</b>. Para el inglés, tener hambre es estar de cierta manera, igual que estar cansado — por eso “hungry” es un adjetivo, como “tired”, y los adjetivos piden “be”. Para el español es una posesión. Ninguno es más correcto; pero como tu idioma te empuja a “have”, esa lista de casos hay que grabársela aparte.",
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
      idea: "Para preguntar o negar, el inglés mete <b>do / does / did</b> delante — y entonces el verbo principal se queda desnudo, sin -s ni -ed.",
      pasos: [
        {
          titulo: "Paso 1. En español basta la entonación",
          texto:
            "“Trabajas aquí” y “¿trabajas aquí?” son exactamente las mismas palabras; sólo cambia cómo suben la voz. En inglés eso no alcanza: hay que cambiar la frase.",
          ejemplos: [
            { en: "You work here.", es: "Trabajas aquí." },
            { en: "Do you work here?", es: "¿Trabajas aquí?" },
          ],
        },
        {
          titulo: "Paso 2. Cuál de los tres va",
          texto:
            "<b>do</b> con I / you / we / they. <b>does</b> con he / she / it. <b>did</b> en pasado, con todos sin excepción.",
          ejemplos: [
            { en: "Do you work on Saturdays?", es: "¿Trabajas los sábados?" },
            { en: "Does she work here?", es: "¿Ella trabaja aquí?" },
            { en: "Did you send the report?", es: "¿Enviaste el informe?" },
          ],
        },
        {
          titulo: "Paso 3. La regla que más se olvida",
          texto:
            "Cuando aparece el auxiliar, el verbo principal <b>vuelve a su forma base</b>. Nada de -s, nada de -ed, nada de pasado irregular. La información de persona y de tiempo ya la lleva el auxiliar, y ponerla dos veces sobra.",
          ejemplos: [
            { en: "Does she work here?", es: "¿Ella trabaja aquí? (work, no works)" },
            { en: "Did you go?", es: "¿Fuiste? (go, no went)" },
          ],
        },
        {
          titulo: "Paso 4. Para negar, el mismo mecanismo",
          texto:
            "<b>don’t / doesn’t / didn’t</b> delante del verbo base. Igual que en las preguntas.",
          ejemplos: [
            { en: "She doesn’t like coffee.", es: "A ella no le gusta el café." },
            { en: "They didn’t come.", es: "No vinieron." },
          ],
        },
        {
          titulo: "Paso 5. Con “be” no se usa nunca",
          texto:
            "El verbo <b>be</b> se pregunta y se niega solo, dándose vuelta o añadiendo “not”. Nunca lleva “do”.",
          ejemplos: [
            { en: "Are you ready?", es: "¿Estás lista?" },
            { en: "She isn’t here.", es: "Ella no está aquí." },
          ],
        },
      ],
      porque:
        "Aquí vuelve la idea del pronombre: el verbo inglés casi no cambia. Si “work” es igual en afirmación y en pregunta, y el orden de las palabras es lo único que distingue quién hace qué, el inglés necesitaba <b>alguna</b> señal visible al principio de la frase que avisara “esto es una pregunta”.\n\nCon “be” y con los modales (can, will, should) esa señal ya existía: se puede dar vuelta la frase, “You are” → “Are you”. Pero con los verbos normales dar la vuelta sonaba antiguo (“Work you here?” es inglés de Shakespeare). Así que el idioma reclutó un verbo vacío, <b>do</b>, para ocupar ese puesto delantero y cargar con el tiempo y la persona.\n\nPor eso el verbo principal se queda desnudo: el trabajo gramatical ya lo hizo “do”. No es una regla suelta que memorizar, es que dos palabras no pueden hacer la misma tarea a la vez.",
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
      idea: "Elegir tiempo no es elegir una forma: es decidir <b>cómo miras</b> el momento del que hablas — terminado, en curso, o todavía vivo.",
      pasos: [
        {
          titulo: "Paso 1. Lo que hago siempre: presente simple",
          texto:
            "Rutinas, hechos, cosas que son verdad en general. No significa “ahora mismo”, significa “habitualmente”.",
          ejemplos: [
            { en: "I work in accounting.", es: "Trabajo en contabilidad." },
            { en: "The office opens at nine.", es: "La oficina abre a las nueve." },
          ],
        },
        {
          titulo: "Paso 2. Lo que hago en este instante: presente continuo",
          texto:
            "<b>am/is/are</b> + verbo con <b>-ing</b>. Para lo que está pasando mientras hablas. Donde el español dice “estoy trabajando”, el inglés dice lo mismo.",
          ejemplos: [
            { en: "I am working on the report now.", es: "Estoy trabajando en el informe ahora." },
            { en: "She is talking to a client.", es: "Está hablando con un cliente." },
          ],
        },
        {
          titulo: "Paso 3. Lo que ya pasó y se acabó: pasado simple",
          texto:
            "Terminado, cerrado. Casi siempre trae un <b>cuándo</b>: yesterday, last week, in 2020, two hours ago.",
          ejemplos: [
            { en: "I worked there in 2020.", es: "Trabajé ahí en 2020." },
            { en: "We sent the invoice yesterday.", es: "Enviamos la factura ayer." },
          ],
        },
        {
          titulo: "Paso 4. El pasado que todavía importa: presente perfecto",
          texto:
            "<b>have/has</b> + participio. Es pasado, pero sin cerrar la puerta: o sigue pasando, o sus efectos duran. Y <b>nunca</b> lleva un momento exacto.\n\nLa prueba fácil: si puedes decir “¿cuándo?” y contestarlo, va pasado simple. Si la pregunta “¿cuándo?” suena rara, va presente perfecto.",
          ejemplos: [
            { en: "I have worked here for five years.", es: "Llevo cinco años trabajando acá." },
            { en: "I have sent the invoice.", es: "Ya envié la factura. (y ahí está)" },
            { en: "Have you ever been to Peru?", es: "¿Has estado alguna vez en Perú?" },
          ],
        },
        {
          titulo: "Paso 5. Los dos futuros",
          texto:
            "<b>will</b> es la decisión que tomas mientras hablas, o una predicción. <b>going to</b> es el plan que ya estaba decidido antes de abrir la boca.",
          ejemplos: [
            { en: "I will call you back.", es: "Te llamo de vuelta. (lo decido ahora)" },
            { en: "I am going to travel in March.", es: "Voy a viajar en marzo. (ya estaba decidido)" },
          ],
        },
        {
          titulo: "Paso 6. Lo hipotético y lo cortés: would",
          texto:
            "Para lo que pasaría si acaso, y para pedir cosas con educación. “I would like” es la forma amable de “I want”.",
          ejemplos: [
            { en: "I would like a coffee, please.", es: "Quisiera un café, por favor." },
            { en: "I would go, but I am busy.", es: "Iría, pero estoy ocupada." },
          ],
        },
      ],
      porque:
        "El presente perfecto es lo que más cuesta, y por una razón muy concreta: en español existe la misma forma (“he trabajado”) pero <b>la usamos para otra cosa</b>. En gran parte de España e Hispanoamérica “he trabajado hoy” y “trabajé hoy” son casi intercambiables, y la elección depende más de la región que del significado.\n\nEn inglés no es opcional, y el criterio no es el tiempo que pasó sino si el período <b>sigue abierto</b>. “I have worked here for five years” dice que sigues ahí; “I worked here for five years” dice que ya no. Cambiar el tiempo verbal cambia el hecho, no el estilo.\n\nDe ahí sale la regla del momento exacto: decir “in 2020” es cerrar el período con llave. Y un período cerrado ya no puede seguir importando ahora — por eso “I have worked there in 2020” se contradice a sí mismo.",
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
      idea: "Los modales son verbos que acompañan a otro, y tienen tres privilegios: no llevan -s, no llevan “to” detrás, y no necesitan “do” para preguntar.",
      pasos: [
        {
          titulo: "Paso 1. Nunca llevan -s",
          texto:
            "Ni siquiera con he/she/it. “She can”, jamás “she cans”. Esto vale para todos: can, could, should, must, would, may, might, will.",
          ejemplos: [
            { en: "She can speak English.", es: "Ella sabe hablar inglés." },
            { en: "He should rest.", es: "Él debería descansar." },
          ],
        },
        {
          titulo: "Paso 2. El verbo que sigue va en forma base, sin “to”",
          texto:
            "Directo, pelado, sin nada en medio. Aquí el español engaña, porque nosotros sí metemos algo (“tengo <b>que</b> ir”, “puedo ir”).",
          ejemplos: [
            { en: "I can help you.", es: "Puedo ayudarte." },
            { en: "You must finish this today.", es: "Tienes que terminar esto hoy." },
          ],
        },
        {
          titulo: "Paso 3. Para preguntar, se dan vuelta",
          texto:
            "No usan <b>do</b>. Se pone el modal delante del sujeto y ya está.",
          ejemplos: [
            { en: "Can you help me?", es: "¿Me puedes ayudar?" },
            { en: "Should I call her?", es: "¿La llamo?" },
          ],
        },
        {
          titulo: "Paso 4. Cuál elegir, de más suave a más fuerte",
          texto:
            "<b>could</b> es lo más amable, <b>should</b> es un consejo, <b>have to</b> es una obligación que viene de fuera (la empresa, la ley), <b>must</b> es la más fuerte y suena a orden.",
          ejemplos: [
            { en: "Could you send me the file?", es: "¿Podrías enviarme el archivo?" },
            { en: "You should talk to the manager.", es: "Deberías hablar con el jefe." },
            { en: "I have to work tomorrow.", es: "Tengo que trabajar mañana." },
            { en: "I must finish this today.", es: "Debo terminar esto hoy." },
          ],
        },
        {
          titulo: "Paso 5. “Have to” no es un modal de verdad",
          texto:
            "Se usa como uno, pero se comporta como un verbo normal: lleva -s (“she has to”) y sí necesita <b>do</b> para preguntar. Es el único de la lista que se porta así.",
          ejemplos: [
            { en: "She has to sign it.", es: "Ella tiene que firmarlo." },
            { en: "Do you have to work today?", es: "¿Tienes que trabajar hoy?" },
          ],
        },
      ],
      porque:
        "Los modales no son verbos raros que rompan las reglas: son los <b>restos de un grupo antiguo</b> que en inglés medieval ya funcionaba distinto. Eran verbos cuyo pasado se formaba como el presente de otros, y por esa vía acabaron sin la -s de tercera persona. Nunca la tuvieron, no es que la perdieran.\n\nPor eso tampoco necesitan “do”: como vimos, “do” se inventó para los verbos que no podían darse vuelta solos. Los modales sí pueden — “Can you” funciona igual que “Are you”. Ya ocupan el puesto delantero de la frase, así que no hace falta traer a nadie más.\n\nY por eso “have to” se porta distinto: no viene de ese grupo antiguo, es el verbo normal “have” haciendo de modal prestado. Sigue las reglas de su familia, no las de la ajena.",
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
      idea: "“Hay” en español no cambia nunca. En inglés sí: mira <b>lo que viene después</b> y elige singular o plural.",
      pasos: [
        {
          titulo: "Paso 1. Una cosa: there is",
          texto:
            "En el habla casi siempre se oye acortado: <b>there’s</b>.",
          ejemplos: [
            { en: "There is a problem with the invoice.", es: "Hay un problema con la factura." },
            { en: "There’s a bank near here.", es: "Hay un banco cerca de acá." },
          ],
        },
        {
          titulo: "Paso 2. Varias cosas: there are",
          texto:
            "En cuanto lo que sigue es plural, cambia. Es lo que el español no te pide, y por eso se olvida.",
          ejemplos: [
            { en: "There are three people in the office.", es: "Hay tres personas en la oficina." },
            { en: "There are two invoices missing.", es: "Faltan dos facturas." },
          ],
        },
        {
          titulo: "Paso 3. Se mira hacia adelante, no hacia atrás",
          texto:
            "“There” no es quien manda: es sólo un relleno para ocupar el principio de la frase. Quien decide entre <b>is</b> y <b>are</b> es el sustantivo que viene <b>después</b>.",
          ejemplos: [
            { en: "There is one box.", es: "Hay una caja." },
            { en: "There are many boxes.", es: "Hay muchas cajas." },
          ],
        },
        {
          titulo: "Paso 4. En pasado: there was / there were",
          texto:
            "Mismo criterio, mismas dos opciones.",
          ejemplos: [
            { en: "There was a meeting yesterday.", es: "Hubo una reunión ayer." },
            { en: "There were ten people there.", es: "Había diez personas ahí." },
          ],
        },
        {
          titulo: "Paso 5. Preguntar y negar",
          texto:
            "Como lleva el verbo <b>be</b>, se da vuelta y se le añade “not”. Nunca lleva “do”.",
          ejemplos: [
            { en: "Is there a problem?", es: "¿Hay algún problema?" },
            { en: "There isn’t any coffee.", es: "No hay café." },
          ],
        },
      ],
      porque:
        "Esto viene de la regla de oro del inglés: toda frase necesita un sujeto delante del verbo, aunque no haya nadie de quien hablar. El español puede empezar por el verbo (“hay tres personas”, “llueve”); el inglés no se lo permite.\n\nEntonces, cuando no hay sujeto real, el idioma pone uno falso para tapar el hueco. Ese es el trabajo de <b>there</b>, y también el del <b>it</b> de “it rains” o “it’s late”: no significan nada, sólo ocupan el sitio.\n\nY como “there” está vacío, no puede decirle al verbo si es uno o varios. Esa información tiene que venir del sustantivo de más atrás, y por eso el verbo concuerda mirando hacia adelante. Es raro, pero es la única salida coherente.",
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
      idea: "En inglés el <b>sitio</b> de cada palabra es lo que dice su papel. Por eso el orden casi no se puede tocar.",
      pasos: [
        {
          titulo: "Paso 1. Siempre: quién + verbo + qué",
          texto:
            "El español mueve las piezas con libertad — “el informe lo envié ayer”, “ayer envié el informe” — y se entiende igual. El inglés no tiene esa libertad.",
          ejemplos: [
            { en: "I sent the report.", es: "Envié el informe." },
            { en: "The manager signed the contract.", es: "El jefe firmó el contrato." },
          ],
        },
        {
          titulo: "Paso 2. Cambiar el orden cambia el significado",
          texto:
            "Esto es lo importante: en inglés no suena raro, <b>dice otra cosa</b>. Mira lo que pasa al dar vuelta las dos palabras.",
          ejemplos: [
            { en: "The dog bit the man.", es: "El perro mordió al hombre." },
            { en: "The man bit the dog.", es: "El hombre mordió al perro." },
          ],
        },
        {
          titulo: "Paso 3. Nada se mete entre el verbo y su objeto",
          texto:
            "Esos dos van pegados. El “cuándo”, el “dónde” y el “cómo” esperan su turno al final, o se van al principio de la frase.",
          ejemplos: [
            { en: "I sent the report yesterday.", es: "Envié el informe ayer." },
            { en: "Yesterday I sent the report.", es: "Ayer envié el informe." },
          ],
        },
        {
          titulo: "Paso 4. Si hay varios complementos: cómo, dónde, cuándo",
          texto:
            "Ese es el orden habitual cuando se juntan. No es una ley, pero cualquier otro orden suena a extranjero.",
          ejemplos: [
            { en: "She worked quietly at the office all morning.", es: "Ella trabajó tranquila en la oficina toda la mañana." },
          ],
        },
        {
          titulo: "Paso 5. El adjetivo va antes del sustantivo",
          texto:
            "Es la otra cara de la misma rigidez, y tiene su propio tema aparte porque cuesta bastante.",
          ejemplos: [
            { en: "a red car", es: "un auto rojo" },
            { en: "a long meeting", es: "una reunión larga" },
          ],
        },
      ],
      porque:
        "Aquí se cierra la idea que viene arrastrándose desde los pronombres. El latín marcaba el papel de cada palabra con una terminación: “canis” era el perro-que-muerde y “canem” el perro-mordido, y por eso podías ordenarlas como quisieras. El español conserva algo de eso (“al hombre” lleva su “a” de complemento), y de ahí su libertad.\n\nEl inglés perdió esas terminaciones casi por completo. Al quedarse sin marcas, tuvo que encontrar otra forma de decir quién hace y quién recibe — y la única que le quedaba era <b>la posición</b>. Lo primero hace, lo de después recibe.\n\nEsa es la razón profunda de casi todo lo raro del inglés: el pronombre obligatorio, el “do” de las preguntas, el “there is”, el orden rígido. Un idioma que no marca las palabras tiene que apoyarse en el orden, y entonces el orden se vuelve sagrado.",
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
      idea: "Lo difícil no es elegir entre <b>a</b> y <b>the</b>: es que el inglés muchas veces <b>no pone ninguno</b> donde el español sí.",
      pasos: [
        {
          titulo: "Paso 1. a / an: uno cualquiera, la primera vez",
          texto:
            "Cuando la otra persona todavía no sabe de cuál hablas. Sólo va con singulares contables.",
          ejemplos: [
            { en: "She is an engineer.", es: "Ella es ingeniera." },
            { en: "I need a folder.", es: "Necesito una carpeta." },
          ],
        },
        {
          titulo: "Paso 2. the: ese que los dos ya sabemos cuál es",
          texto:
            "Porque ya se mencionó, porque sólo hay uno, o porque está a la vista. Vale igual para singular y plural.",
          ejemplos: [
            { en: "The report is on your desk.", es: "El informe está en tu escritorio." },
            { en: "I bought a car. The car is red.", es: "Compré un auto. El auto es rojo." },
          ],
        },
        {
          titulo: "Paso 3. an se elige por el sonido, no por la letra",
          texto:
            "Se usa <b>an</b> cuando la palabra siguiente <b>empieza sonando a vocal</b>. Por eso “an hour” (la h no se pronuncia) y “a university” (empieza sonando “iu”, que es consonante). Si dudas, dilo en voz alta.",
          ejemplos: [
            { en: "an hour", es: "una hora" },
            { en: "a university", es: "una universidad" },
            { en: "an honest answer", es: "una respuesta honesta" },
          ],
        },
        {
          titulo: "Paso 4. Sin artículo: lo general, en plural o incontable",
          texto:
            "Aquí está el error de verdad. Cuando hablas de algo <b>en general</b> — no de unos concretos — el inglés no pone nada. El español sí pone “los”, y de ahí viene el arrastre.",
          ejemplos: [
            { en: "Dogs are loyal.", es: "Los perros son leales." },
            { en: "Coffee is expensive.", es: "El café está caro." },
            { en: "Invoices take time.", es: "Las facturas toman tiempo." },
          ],
        },
        {
          titulo: "Paso 5. Sin artículo: idiomas, días, comidas y materias",
          texto:
            "Una lista corta que conviene saberse, porque el español los lleva todos con artículo.",
          ejemplos: [
            { en: "I speak English.", es: "Hablo inglés." },
            { en: "On Monday I have a meeting.", es: "El lunes tengo reunión." },
            { en: "Lunch is at one.", es: "El almuerzo es a la una." },
            { en: "She studies accounting.", es: "Ella estudia contabilidad." },
          ],
        },
        {
          titulo: "Paso 6. La prueba para saber si va “the”",
          texto:
            "Pregúntate: <b>¿cuál?</b> Si puedes señalar uno concreto, va <b>the</b>. Si hablas de la categoría entera, no va nada.",
          ejemplos: [
            { en: "The coffee is cold.", es: "El café está frío. (este de acá)" },
            { en: "Coffee is expensive.", es: "El café está caro. (el café en general)" },
          ],
        },
      ],
      porque:
        "La clave es que el inglés distingue dos cosas que el español mezcla: hablar de <b>ejemplares</b> y hablar de <b>la categoría</b>.\n\nCuando el español dice “los perros son leales”, no habla de unos perros en particular: habla de la especie. El inglés marca esa diferencia quitando el artículo, y reserva “the” para cuando de verdad señalas algo. Así que la ausencia de artículo no es un descuido — es información: significa “no busques cuál, hablo del concepto”.\n\nY por eso a los idiomas y a las comidas no les toca ninguno: “English” no es un inglés entre varios, es la cosa entera. En español el artículo perdió esa función y acabó puesto casi en todas partes, hasta donde no distingue nada. Por eso hay que desaprenderlo, no traducirlo.",
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
      idea: "Casi todo hace el plural con <b>-s</b>. Lo que cambia respecto al español es que el plural lo lleva <b>sólo el sustantivo</b>.",
      pasos: [
        {
          titulo: "Paso 1. Lo normal: + s",
          texto:
            "La inmensa mayoría de las palabras.",
          ejemplos: [
            { en: "one car, two cars", es: "un auto, dos autos" },
            { en: "one invoice, three invoices", es: "una factura, tres facturas" },
          ],
        },
        {
          titulo: "Paso 2. + es tras s, x, z, ch, sh",
          texto:
            "No es un capricho: sin esa <b>e</b> no se podría pronunciar. Prueba a decir “boxs” y verás que la boca no puede.",
          ejemplos: [
            { en: "box → boxes", es: "caja → cajas" },
            { en: "church → churches", es: "iglesia → iglesias" },
            { en: "watch → watches", es: "reloj → relojes" },
          ],
        },
        {
          titulo: "Paso 3. Consonante + y → ies",
          texto:
            "Ojo: sólo si antes de la <b>y</b> hay consonante. Si hay vocal, se porta normal: “day → days”.",
          ejemplos: [
            { en: "company → companies", es: "empresa → empresas" },
            { en: "city → cities", es: "ciudad → ciudades" },
            { en: "day → days", es: "día → días" },
          ],
        },
        {
          titulo: "Paso 4. Los irregulares, que son pocos",
          texto:
            "Son un puñado y casi todos son palabras muy comunes. Se aprenden de tanto verlas.",
          ejemplos: [
            { en: "child → children", es: "niño → niños" },
            { en: "man → men", es: "hombre → hombres" },
            { en: "woman → women", es: "mujer → mujeres" },
            { en: "person → people", es: "persona → personas" },
          ],
        },
        {
          titulo: "Paso 5. Los que no cambian y los que son siempre plurales",
          texto:
            "<b>sheep, fish, series</b> son iguales en singular y en plural. Y <b>trousers, scissors, glasses</b> son siempre plurales, como en español.",
          ejemplos: [
            { en: "There are ten sheep.", es: "Hay diez ovejas." },
            { en: "My trousers are new.", es: "Mis pantalones son nuevos." },
          ],
        },
        {
          titulo: "Paso 6. El plural no se contagia",
          texto:
            "Esto es lo que de verdad cambia respecto al español. En “dos autos rojos” nosotros marcamos el plural dos veces; el inglés lo marca <b>una sola vez</b>, en el sustantivo. El adjetivo se queda quieto.",
          ejemplos: [
            { en: "two red cars", es: "dos autos rojos" },
            { en: "three important meetings", es: "tres reuniones importantes" },
          ],
        },
      ],
      porque:
        "Lo de marcar el plural una sola vez tiene nombre: el español usa <b>concordancia</b> y el inglés no. Nosotros repetimos la misma información en el artículo, el sustantivo y el adjetivo (“las facturas pendientes” lleva tres marcas de plural femenino) porque con tanta libertad de orden hace falta esa redundancia para saber qué palabra va con cuál.\n\nEl inglés, con su orden fijo, no la necesita: si el adjetivo está pegado delante del sustantivo, no hay duda de a quién describe. Así que marcarlo otra vez sería gastar letras para nada, y el idioma lo eliminó.\n\nEs la misma historia otra vez: donde el español gasta terminaciones, el inglés gasta posiciones. Por eso “two reds cars” no suena sólo mal — suena a alguien pagando dos veces por lo mismo.",
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
      idea: "El adjetivo va <b>antes</b> del sustantivo y <b>nunca cambia</b>: ni por género ni por número.",
      pasos: [
        {
          titulo: "Paso 1. Va delante, al revés que en español",
          texto:
            "Éste es el cambio de chip más grande, porque nosotros hacemos exactamente lo contrario. Traducir en el orden del español es lo que más delata a un hispanohablante.",
          ejemplos: [
            { en: "a red car", es: "un auto rojo" },
            { en: "I need a new folder.", es: "Necesito una carpeta nueva." },
            { en: "She sent a long email.", es: "Ella envió un correo largo." },
          ],
        },
        {
          titulo: "Paso 2. Nunca cambia de forma",
          texto:
            "“Rojo, roja, rojos, rojas” son en inglés la misma palabra: <b>red</b>. Una preocupación menos, pero hay que resistir la tentación de ponerle -s.",
          ejemplos: [
            { en: "two red cars", es: "dos autos rojos" },
            { en: "the new suppliers", es: "los proveedores nuevos" },
          ],
        },
        {
          titulo: "Paso 3. Detrás de “to be” sí va al final",
          texto:
            "Ésta es la excepción, y no es caprichosa: cuando el adjetivo no acompaña a un sustantivo sino que <b>es</b> lo que dice la frase, se queda detrás del verbo.",
          ejemplos: [
            { en: "The car is red.", es: "El auto es rojo." },
            { en: "The meeting was long.", es: "La reunión fue larga." },
          ],
        },
        {
          titulo: "Paso 4. Si van varios, hay un orden",
          texto:
            "Opinión, tamaño, edad, color, origen, material. Los nativos lo siguen sin saber que existe. Nadie te va a corregir si lo cambias, pero suena tan raro como “un rojo grande auto” en español.",
          ejemplos: [
            { en: "a nice big old red Italian leather bag", es: "un bonito bolso italiano de cuero, grande, antiguo y rojo" },
          ],
        },
      ],
      porque:
        "Que el adjetivo vaya delante viene de la familia germánica del inglés; que vaya detrás, de la latina del español. Ninguno de los dos tiene más lógica, son dos costumbres heredadas.\n\nLo que sí tiene explicación es que no cambie, y es la misma historia de siempre: el inglés no usa concordancia. Con el orden fijo, un adjetivo pegado delante de un sustantivo no puede referirse a otra cosa, así que repetir el número en él no añadiría nada.\n\nY la excepción del “to be” encaja: ahí el adjetivo ya no está pegado a nadie, está haciendo de información principal de la frase. Cambió de trabajo, así que cambia de sitio.",
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
      idea: "El adjetivo describe una <b>cosa</b>; el adverbio describe una <b>acción</b>. Y cada tipo tiene su sitio fijo en la frase.",
      pasos: [
        {
          titulo: "Paso 1. Casi todos se forman con -ly",
          texto:
            "Es nuestro “-mente”: slow → slowly, careful → carefully. Si la palabra termina en <b>y</b>, pasa a <b>-ily</b>: easy → easily.",
          ejemplos: [
            { en: "She speaks slowly.", es: "Ella habla despacio." },
            { en: "Please read the contract carefully.", es: "Por favor lee el contrato con atención." },
          ],
        },
        {
          titulo: "Paso 2. Tres que no siguen la regla",
          texto:
            "<b>good</b> se convierte en <b>well</b> (no existe “goodly”). <b>fast</b> y <b>hard</b> no cambian. Y cuidado con <b>hardly</b>: no significa “duramente” sino <b>casi nunca</b>, que es casi lo contrario.",
          ejemplos: [
            { en: "I speak English well.", es: "Hablo inglés bien." },
            { en: "He works hard.", es: "Él trabaja duro." },
            { en: "He hardly works.", es: "Él casi no trabaja." },
          ],
        },
        {
          titulo: "Paso 3. Los de frecuencia van antes del verbo",
          texto:
            "<b>always, usually, often, sometimes, never</b>. En español los ponemos donde queramos; en inglés tienen sitio fijo, justo delante del verbo.",
          ejemplos: [
            { en: "I always work late.", es: "Siempre trabajo hasta tarde." },
            { en: "She usually answers quickly.", es: "Normalmente contesta rápido." },
          ],
        },
        {
          titulo: "Paso 4. …pero después de “to be”",
          texto:
            "La única excepción, y hay que fijarse porque es constante. Con “be” el adverbio de frecuencia se pasa al otro lado.",
          ejemplos: [
            { en: "I am always late.", es: "Siempre llego tarde." },
            { en: "He is never on time.", es: "Él nunca llega a la hora." },
          ],
        },
        {
          titulo: "Paso 5. Los de modo van al final, nunca en medio",
          texto:
            "Vuelve la regla de oro: <b>nada se mete entre el verbo y su objeto</b>. El adverbio espera a que la frase termine.",
          ejemplos: [
            { en: "I speak English well.", es: "Hablo inglés bien." },
            { en: "She finished the report quickly.", es: "Terminó el informe rápido." },
          ],
        },
      ],
      porque:
        "La posición fija de los adverbios de frecuencia parece arbitraria hasta que se mira junto a todo lo demás: en un idioma donde el sitio decide el papel, dejar palabras sueltas moviéndose por la frase sería peligroso. Cada tipo de palabra tiene su casilla, y el oyente las interpreta por dónde caen.\n\nLo del “to be” tiene una razón concreta: “be” es tan débil de significado que se pronuncia casi sin fuerza, y una palabra átona no puede llevar otra átona delante sin que se peguen y se pierdan. Poner “always” después reparte mejor el peso de la frase. Es una regla de ritmo, no de lógica — pero por eso mismo el oído la aprende antes que la cabeza.\n\nY lo de no separar verbo y objeto es, otra vez, que esos dos van pegados por definición: la posición <b>es</b> lo que dice que uno recibe la acción del otro. Meter algo en medio rompe la única señal disponible.",
      explicacion:
        "Un adjetivo describe una cosa (“a slow car”); un adverbio describe una acción " +
        "(“she drives slowly”). Casi todos se arman agregando <b>-ly</b>, que es el equivalente " +
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
      idea: "Toda pregunta sigue el mismo molde: <b>palabra de pregunta + auxiliar + sujeto + verbo</b>. Siempre en ese orden.",
      pasos: [
        {
          titulo: "Paso 1. Las de sí o no: se da vuelta",
          texto:
            "El auxiliar se pone delante del sujeto. Con <b>be</b> y con los modales, el propio verbo hace de auxiliar.",
          ejemplos: [
            { en: "Are you ready?", es: "¿Estás lista?" },
            { en: "Can you help me?", es: "¿Me puedes ayudar?" },
            { en: "Do you work here?", es: "¿Trabajas aquí?" },
          ],
        },
        {
          titulo: "Paso 2. Con palabra de pregunta, esa va primero",
          texto:
            "<b>what, where, when, who, why, how</b> abren la frase, y detrás sigue el mismo molde de siempre.",
          ejemplos: [
            { en: "Where do you work?", es: "¿Dónde trabajas?" },
            { en: "What time does the meeting start?", es: "¿A qué hora empieza la reunión?" },
            { en: "Why didn’t they call?", es: "¿Por qué no llamaron?" },
          ],
        },
        {
          titulo: "Paso 3. El auxiliar no se puede saltar",
          texto:
            "Éste es <b>el</b> error del hispanohablante. En español la entonación basta, así que sale natural decir “Where you live?”. En inglés falta una pieza y la frase queda coja.",
          ejemplos: [
            { en: "Where do you live?", es: "¿Dónde vives?" },
            { en: "What does she want?", es: "¿Qué quiere ella?" },
          ],
        },
        {
          titulo: "Paso 4. Cuando preguntas por el sujeto, no se da vuelta",
          texto:
            "Si <b>who</b> o <b>what</b> son quien hace la acción, ya están en el sitio del sujeto: la frase se queda como una afirmación y no lleva “do”.",
          ejemplos: [
            { en: "Who called you?", es: "¿Quién te llamó?" },
            { en: "What happened?", es: "¿Qué pasó?" },
            { en: "Who do you work with?", es: "¿Con quién trabajas? (aquí sí, porque who no es el sujeto)" },
          ],
        },
        {
          titulo: "Paso 5. how + otra palabra",
          texto:
            "<b>how much</b> para lo que no se cuenta, <b>how many</b> para lo que sí. Y <b>how long, how often, how far</b> para duración, frecuencia y distancia.",
          ejemplos: [
            { en: "How much does it cost?", es: "¿Cuánto cuesta?" },
            { en: "How many invoices are there?", es: "¿Cuántas facturas hay?" },
            { en: "How often do you travel?", es: "¿Cada cuánto viajas?" },
          ],
        },
      ],
      porque:
        "La pregunta inglesa se construye moviendo una pieza al frente, y ese frente es un sitio reservado. En un idioma de orden fijo, el único hueco libre para señalar “esto no es una afirmación” es el principio de la frase — y por eso tanto el auxiliar como la palabra de pregunta pelean por llegar ahí.\n\nEso explica el paso 4, que si no parece una excepción sin sentido. Dar vuelta la frase sirve para avisar que algo cambió; pero si preguntas por el sujeto, el hueco del principio <b>ya está ocupado</b> por “who”, que además está en su sitio natural. No hay nada que mover, y mover de todos modos sería una señal falsa.\n\nY por eso el español no necesita nada de esto: como puede marcar la pregunta sólo con la voz, nunca tuvo que reservar ese sitio. Tu idioma te dio una herramienta gratis que el inglés tiene que pagar con una palabra.",
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
      idea: "El <b>not</b> se pega al auxiliar — y en inglés sólo se niega <b>una vez</b> por frase.",
      pasos: [
        {
          titulo: "Paso 1. Con verbos normales: don’t / doesn’t / didn’t",
          texto:
            "Y recuerda que el verbo principal vuelve a su forma base, igual que en las preguntas.",
          ejemplos: [
            { en: "I don’t know.", es: "No sé." },
            { en: "She doesn’t like coffee.", es: "A ella no le gusta el café." },
            { en: "They didn’t come.", es: "No vinieron." },
          ],
        },
        {
          titulo: "Paso 2. Con be, modales y perfecto: not directo",
          texto:
            "Estos no necesitan “do”: el <b>not</b> se les pega encima.",
          ejemplos: [
            { en: "She isn’t here.", es: "Ella no está aquí." },
            { en: "I can’t come.", es: "No puedo ir." },
            { en: "It won’t work.", es: "No va a funcionar." },
            { en: "I haven’t seen it.", es: "No lo he visto." },
          ],
        },
        {
          titulo: "Paso 3. Una sola negación por frase",
          texto:
            "Aquí el español te traiciona. “No sé nada” lleva dos negaciones y es perfectamente correcto en español. En inglés las dos se anulan y la frase acaba diciendo lo contrario.",
          ejemplos: [
            { en: "I don’t know anything.", es: "No sé nada." },
            { en: "I know nothing.", es: "No sé nada. (la otra opción válida)" },
          ],
        },
        {
          titulo: "Paso 4. Las parejas que hay que cambiar",
          texto:
            "Si ya negaste con “don’t”, lo que sigue va en la forma de <b>any-</b>: nothing → <b>anything</b>, nobody → <b>anybody</b>, never → <b>ever</b>.",
          ejemplos: [
            { en: "I don’t know anybody here.", es: "No conozco a nadie acá." },
            { en: "She doesn’t want anything.", es: "Ella no quiere nada." },
          ],
        },
        {
          titulo: "Paso 5. Elige dónde poner la negación",
          texto:
            "Tienes dos caminos y los dos valen: negar el verbo y dejar lo demás en <b>any-</b>, o dejar el verbo en positivo y negar con <b>no / nothing / nobody</b>. Lo que no puedes es hacer las dos cosas.",
          ejemplos: [
            { en: "There isn’t any coffee.", es: "No hay café." },
            { en: "There is no coffee.", es: "No hay café." },
          ],
        },
      ],
      porque:
        "Lo curioso es que el inglés antiguo <b>sí</b> doblaba las negaciones, igual que el español, y hasta las triplicaba para dar énfasis. Chaucer lo hacía sin problema.\n\nLo que pasó después no fue un cambio natural del idioma, sino una decisión: en el siglo XVIII, unos gramáticos quisieron que el inglés se pareciera a las matemáticas y declararon que dos negaciones se anulan, como dos signos menos. Era un argumento bastante malo — ningún idioma funciona por álgebra — pero quedó grabado en las escuelas y en los libros, y hoy es la norma culta.\n\nQue sea una regla impuesta y no heredada tiene una consecuencia práctica: la doble negación sobrevive viva en muchos dialectos ingleses (“I don’t know nothing” se oye a diario). Se entiende perfectamente; lo que hace es sonar informal o poco escolarizado. En un correo de trabajo, eso importa.",
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
      idea: "No se traducen una por una. Funcionan por <b>tamaño</b>: <b>in</b> lo grande, <b>on</b> lo intermedio, <b>at</b> lo exacto.",
      pasos: [
        {
          titulo: "Paso 1. Olvida “in = en”",
          texto:
            "El español usa <b>en</b> para casi todo: en mayo, en lunes, en la mesa, en la oficina. El inglés reparte eso entre tres palabras, así que traducir palabra por palabra no puede funcionar. Hay que pensar en tamaño.",
        },
        {
          titulo: "Paso 2. in — lo más amplio",
          texto:
            "En tiempo: meses, años, estaciones, partes del día. En lugar: espacios cerrados, algo que te <b>rodea</b>.",
          ejemplos: [
            { en: "We travel in December.", es: "Viajamos en diciembre." },
            { en: "I work in the morning.", es: "Trabajo en la mañana." },
            { en: "She is in the office.", es: "Ella está en la oficina." },
          ],
        },
        {
          titulo: "Paso 3. on — lo intermedio",
          texto:
            "En tiempo: días y fechas concretas. En lugar: superficies, algo apoyado <b>encima</b> de otra cosa.",
          ejemplos: [
            { en: "The meeting is on Monday.", es: "La reunión es el lunes." },
            { en: "It’s on 3 May.", es: "Es el 3 de mayo." },
            { en: "The report is on your desk.", es: "El informe está en tu escritorio." },
          ],
        },
        {
          titulo: "Paso 4. at — el punto exacto",
          texto:
            "En tiempo: horas. En lugar: un punto preciso, no un espacio.",
          ejemplos: [
            { en: "The meeting is at ten.", es: "La reunión es a las diez." },
            { en: "She is at home.", es: "Ella está en la casa." },
            { en: "I’ll wait at the door.", es: "Espero en la puerta." },
          ],
        },
        {
          titulo: "Paso 5. Las tres juntas, de grande a chico",
          texto:
            "Fíjate cómo se encajan una dentro de otra: es el mismo lugar visto con más o menos zoom.",
          ejemplos: [
            { en: "The meeting is in May, on Monday, at ten.", es: "La reunión es en mayo, el lunes, a las diez." },
            { en: "He lives in Chile, on Main Street, at number 5.", es: "Vive en Chile, en la calle Main, en el número 5." },
          ],
        },
        {
          titulo: "Paso 6. Las que hay que saberse de memoria",
          texto:
            "Siempre quedan unas cuantas que no encajan en la imagen. Son pocas: <b>at night</b> (pero “in the morning”), <b>at home</b>, <b>at work</b>, <b>on time</b> (puntual) y <b>in time</b> (con margen).",
          ejemplos: [
            { en: "I don’t work at night.", es: "No trabajo de noche." },
            { en: "She arrived on time.", es: "Llegó puntual." },
            { en: "We arrived in time for lunch.", es: "Llegamos a tiempo para el almuerzo." },
          ],
        },
      ],
      porque:
        "Las preposiciones son lo último que se domina en cualquier idioma, y no porque sean difíciles sino porque son <b>arbitrarias</b>. No describen el mundo, describen cómo un idioma decidió recortarlo.\n\nLa imagen del tamaño funciona porque el origen es espacial: <b>at</b> viene de señalar un punto, <b>on</b> de tocar una superficie, <b>in</b> de estar dentro de algo. Después el idioma trasladó esa misma geometría al tiempo, que es lo que hacen casi todas las lenguas: hablamos del tiempo con palabras de espacio sin darnos cuenta (“de aquí a mañana”, “una semana larga”).\n\nPor eso la imagen te llevará lejos pero no hasta el final: “at night” no es más puntual que “in the morning”, simplemente se fijó así hace siglos y nadie lo revisó. Con esas no hay atajo, y tampoco vale la pena buscarlo: son unas quince en total.",
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
      idea: "Lo que decide la forma es el <b>largo de la palabra</b>: las cortas llevan <b>-er</b>, las largas llevan <b>more</b> delante.",
      pasos: [
        {
          titulo: "Paso 1. Palabras cortas: -er y -est",
          texto:
            "Una sílaba, o dos si terminan en <b>-y</b>. Se les pega la terminación.",
          ejemplos: [
            { en: "cheap → cheaper → the cheapest", es: "barato → más barato → el más barato" },
            { en: "This one is cheaper.", es: "Este es más barato." },
            { en: "It’s the fastest option.", es: "Es la opción más rápida." },
          ],
        },
        {
          titulo: "Paso 2. Palabras largas: more y the most",
          texto:
            "De tres sílabas en adelante. No se les pega nada: se les pone la palabra delante, como en español.",
          ejemplos: [
            { en: "expensive → more expensive → the most expensive", es: "caro → más caro → el más caro" },
            { en: "It’s the most expensive option.", es: "Es la opción más cara." },
          ],
        },
        {
          titulo: "Paso 3. Los cambios de escritura de las cortas",
          texto:
            "Si acaba en <b>-y</b>, pasa a <b>-i</b>: easy → easier. Si acaba en consonante sola tras vocal, se dobla: big → bigger.",
          ejemplos: [
            { en: "easy → easier → the easiest", es: "fácil → más fácil → el más fácil" },
            { en: "big → bigger → the biggest", es: "grande → más grande → el más grande" },
          ],
        },
        {
          titulo: "Paso 4. Para comparar se dice “than”, no “that”",
          texto:
            "Se parecen mucho al escribirlas y es un error constante. <b>than</b> es “que” de comparación; <b>that</b> es “que” de todo lo demás.",
          ejemplos: [
            { en: "This one is cheaper than the other.", es: "Este es más barato que el otro." },
            { en: "Your English is better than mine.", es: "Tu inglés es mejor que el mío." },
          ],
        },
        {
          titulo: "Paso 5. Dos irregulares que se usan todo el rato",
          texto:
            "<b>good → better → the best</b> y <b>bad → worse → the worst</b>. No hay más remedio que sabérselos, pero son sólo esos dos.",
          ejemplos: [
            { en: "That was the worst meeting of the year.", es: "Esa fue la peor reunión del año." },
            { en: "This is the best price.", es: "Este es el mejor precio." },
          ],
        },
        {
          titulo: "Paso 6. Para decir que son iguales: as … as",
          texto:
            "El adjetivo va en su forma normal, sin -er ni more, entre los dos “as”.",
          ejemplos: [
            { en: "This one is as expensive as the other.", es: "Este es tan caro como el otro." },
            { en: "It isn’t as easy as it looks.", es: "No es tan fácil como parece." },
          ],
        },
      ],
      porque:
        "Que el largo de la palabra decida la forma suena rarísimo, pero tiene una explicación sencilla: es una cuestión de ritmo, no de gramática.\n\nEl inglés viene de dos sitios. Su base germánica traía el sufijo <b>-er</b>, y con palabras cortas funciona bien: “cheaper” se dice de un tirón. Siglos después entró un aluvión de palabras largas desde el francés y el latín — “expensive”, “interesting”, “comfortable” — y pegarles “-er” al final producía trabalenguas: “interestinger” no hay boca que lo diga.\n\nAsí que el idioma usó para esas la fórmula romance, con la palabra suelta delante. No se eligió por regla, se eligió por lo que se podía pronunciar, y luego la costumbre lo fijó. Por eso la frontera es borrosa justo en las de dos sílabas, donde a veces valen las dos (“more simple” y “simpler” son ambas correctas).",
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
      idea: "<b>-ing</b> describe la <b>cosa</b> que provoca el efecto. <b>-ed</b> describe a la <b>persona</b> que lo siente.",
      pasos: [
        {
          titulo: "Paso 1. La cosa causa: -ing",
          texto:
            "La película aburre, el trabajo cansa, el viaje emociona. Hablas de <b>cómo es</b> algo, de lo que ese algo le hace a la gente.",
          ejemplos: [
            { en: "This film is boring.", es: "Esta película es aburrida." },
            { en: "The trip was exciting.", es: "El viaje fue emocionante." },
          ],
        },
        {
          titulo: "Paso 2. La persona siente: -ed",
          texto:
            "Tú recibes ese efecto. Hablas de <b>cómo te sientes</b>.",
          ejemplos: [
            { en: "I am bored at home.", es: "Estoy aburrida en la casa." },
            { en: "I am tired.", es: "Estoy cansada." },
            { en: "She was surprised.", es: "Ella se sorprendió." },
          ],
        },
        {
          titulo: "Paso 3. La prueba de un segundo",
          texto:
            "Pregúntate: ¿quién causa y quién recibe? Si el sujeto de tu frase es una <b>persona sintiendo algo</b>, va <b>-ed</b>. Casi siempre que empiezas con “I am…” quieres <b>-ed</b>.",
          ejemplos: [
            { en: "I am interested in this job.", es: "Me interesa este trabajo." },
            { en: "This job is interesting.", es: "Este trabajo es interesante." },
          ],
        },
        {
          titulo: "Paso 4. Por qué importa tanto",
          texto:
            "No es un matiz: cambia lo que dices. <b>I am boring</b> significa “soy una persona aburrida”, no “estoy aburrida”. Es de los errores que más vergüenza dan al descubrirlos.",
          ejemplos: [
            { en: "I am bored.", es: "Estoy aburrida." },
            { en: "I am boring.", es: "Soy aburrida. (una persona sosa)" },
          ],
        },
      ],
      porque:
        "Esto no es una pareja de adjetivos caprichosa: son las dos caras de un verbo, y por eso la diferencia es tan limpia.\n\n“Bore” es un verbo que significa aburrir a alguien. De ahí salen dos participios: el activo <b>boring</b> (“que aburre”) y el pasivo <b>bored</b> (“aburrido por algo”). Uno mira hacia quien causa y el otro hacia quien recibe — exactamente la misma división que ya viste entre los pronombres de sujeto y los de objeto.\n\nEl español tiene la misma maquinaria, pero se la ahorra en estos casos: “aburrido” nos sirve para las dos cosas, y dejamos que ser/estar haga la diferencia (“es aburrido” / “está aburrido”). Como el inglés sólo tiene un “to be”, no puede apoyarse en eso — y tiene que marcar la diferencia en el adjetivo. Es el precio de la ventaja que viste en el tema de “to be”: lo que ahorró allí, lo paga aquí.",
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
