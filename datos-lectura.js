/* Textos para leer, con preguntas de comprensión.
 *
 * Es la parte que faltaba. Practicar palabras sueltas y frases armadas enseña
 * a reconocer; leer un texto seguido enseña otra cosa: a seguir una idea sin
 * ir traduciendo palabra por palabra. Es además lo que más rápido hace avanzar
 * a un adulto, porque en un texto de cien palabras se ven cincuenta veces las
 * estructuras que en un ejercicio se ven una.
 *
 * Los textos están escritos para que se entiendan sin diccionario salvo por
 * tres o cuatro palabras, que van en el glosario. Esa proporción no es al azar:
 * un texto donde no se entiende nada no enseña, y uno donde se entiende todo
 * tampoco.
 *
 * Las preguntas del nivel 1 están en español, para que la dificultad esté en
 * entender el texto y no en entender la pregunta. Desde el nivel 2 van en
 * inglés, que es el paso siguiente.
 */
(function () {
  "use strict";

  const TEXTOS = [
    /* ---------------- Nivel 1: básico ---------------- */
    {
      id: "lec-oficina",
      nivel: 1,
      titulo: "A normal Monday",
      emo: "☕",
      minutos: 1,
      texto:
        "My name is Ana. I work in an office in Santiago. I start at nine in the morning " +
        "and I finish at six.\n\n" +
        "First, I read my emails. Then I check the invoices from our suppliers. I use the " +
        "computer all day.\n\n" +
        "At one o'clock I eat lunch with my colleagues. We usually go to a small restaurant " +
        "near the office. The food is good and it is not expensive.\n\n" +
        "I like my job, but Monday is always a long day.",
      glosario: [
        { en: "invoices", es: "facturas" },
        { en: "suppliers", es: "proveedores" },
        { en: "colleagues", es: "colegas, compañeros de trabajo" },
        { en: "expensive", es: "caro" },
      ],
      preguntas: [
        {
          p: "¿A qué hora empieza a trabajar Ana?",
          op: ["A las nueve", "A la una", "A las seis", "No lo dice"],
          ok: 0,
        },
        {
          p: "¿Qué hace primero al llegar?",
          op: ["Almuerza", "Lee sus correos", "Revisa las facturas", "Llama a un proveedor"],
          ok: 1,
        },
        {
          p: "¿Con quién almuerza?",
          op: ["Sola", "Con su familia", "Con sus colegas", "Con un proveedor"],
          ok: 2,
        },
        {
          p: "¿Qué dice del restaurante?",
          op: ["Que es caro", "Que está lejos", "Que la comida es buena", "Que está cerrado"],
          ok: 2,
        },
      ],
    },

    {
      id: "lec-familia",
      nivel: 1,
      titulo: "My family",
      emo: "👨‍👩‍👧",
      minutos: 1,
      texto:
        "I live in a small house with my husband and my daughter. My daughter is seven " +
        "years old and she goes to school near our house.\n\n" +
        "My husband works in a hospital. He is a nurse. He works at night, so he sleeps " +
        "in the morning.\n\n" +
        "We have a dog. His name is Tomás and he is very big, but he is not dangerous. " +
        "My daughter plays with him every afternoon.\n\n" +
        "On Sundays we visit my parents. They live in the south, two hours from the city.",
      glosario: [
        { en: "husband", es: "esposo" },
        { en: "nurse", es: "enfermero" },
        { en: "dangerous", es: "peligroso" },
      ],
      preguntas: [
        {
          p: "¿En qué trabaja el esposo?",
          op: ["En una escuela", "En un hospital", "En una oficina", "En un restaurante"],
          ok: 1,
        },
        {
          p: "¿Por qué duerme en la mañana?",
          op: ["Porque está enfermo", "Porque no trabaja", "Porque trabaja de noche", "Porque es domingo"],
          ok: 2,
        },
        {
          p: "¿Cómo es el perro?",
          op: ["Chico y peligroso", "Grande pero no peligroso", "Viejo", "Nuevo en la casa"],
          ok: 1,
        },
        {
          p: "¿Cuándo visitan a los padres?",
          op: ["Los domingos", "Todos los días", "Los sábados", "Una vez al año"],
          ok: 0,
        },
      ],
    },

    {
      id: "lec-tienda",
      nivel: 1,
      titulo: "At the supermarket",
      emo: "🛒",
      minutos: 1,
      texto:
        "On Saturday morning I go to the supermarket. I take a list because I always " +
        "forget something.\n\n" +
        "Today I need bread, milk, eggs and coffee. I also want fruit: apples and bananas.\n\n" +
        "The supermarket is full on Saturdays. There are a lot of people and the queue is " +
        "long. I wait fifteen minutes.\n\n" +
        "I pay with my card. It is thirty-two thousand pesos. Then I walk home, because " +
        "the supermarket is only five minutes from my house.",
      glosario: [
        { en: "forget", es: "olvidar" },
        { en: "full", es: "lleno" },
        { en: "queue", es: "fila (en EE.UU.: line)" },
      ],
      preguntas: [
        {
          p: "¿Por qué lleva una lista?",
          op: ["Porque siempre olvida algo", "Porque compra mucho", "Porque es rápido", "Porque su esposo se lo pide"],
          ok: 0,
        },
        {
          p: "¿Cuánto espera en la fila?",
          op: ["Cinco minutos", "Quince minutos", "Media hora", "No espera"],
          ok: 1,
        },
        {
          p: "¿Cómo paga?",
          op: ["En efectivo", "Con cheque", "Con tarjeta", "No lo dice"],
          ok: 2,
        },
        {
          p: "¿Cómo vuelve a la casa?",
          op: ["En auto", "En micro", "Caminando", "En taxi"],
          ok: 2,
        },
      ],
    },

    /* ---------------- Nivel 2: intermedio ---------------- */
    {
      id: "lec-correo",
      nivel: 2,
      titulo: "An email from a supplier",
      emo: "📧",
      minutos: 2,
      texto:
        "Dear Ms. Fuentealba,\n\n" +
        "Thank you for your order of 15 March. Unfortunately, we are writing to inform you " +
        "that two of the items are currently out of stock.\n\n" +
        "We expect to receive them from our factory next week. If you prefer, we can send " +
        "the rest of the order now and the remaining items later, at no extra cost.\n\n" +
        "Please note that the invoice we sent yesterday includes the full amount. Once you " +
        "confirm how you would like to proceed, we will issue a corrected invoice.\n\n" +
        "We apologise for the inconvenience and look forward to hearing from you.\n\n" +
        "Kind regards,\nJames Whitfield\nSales Department",
      glosario: [
        { en: "out of stock", es: "sin stock, agotado" },
        { en: "remaining", es: "restantes, los que quedan" },
        { en: "issue an invoice", es: "emitir una factura" },
        { en: "we apologise", es: "pedimos disculpas" },
      ],
      preguntas: [
        {
          p: "What is the main problem?",
          op: [
            "The order never arrived",
            "Two items are not available right now",
            "The client did not pay",
            "The factory closed",
          ],
          ok: 1,
        },
        {
          p: "What does the supplier offer?",
          op: [
            "A discount on the next order",
            "To cancel the whole order",
            "To send part of the order now and the rest later",
            "To change the supplier",
          ],
          ok: 2,
        },
        {
          p: "What is wrong with the invoice?",
          op: [
            "It has not been sent yet",
            "It charges for everything, including what is missing",
            "It has the wrong address",
            "It is in the wrong currency",
          ],
          ok: 1,
        },
        {
          p: "What does the supplier need from the client?",
          op: [
            "A new order",
            "Payment before shipping",
            "A decision about how to proceed",
            "A phone call to the factory",
          ],
          ok: 2,
        },
      ],
    },

    {
      id: "lec-viaje",
      nivel: 2,
      titulo: "The flight that never left",
      emo: "✈️",
      minutos: 2,
      texto:
        "Last December I travelled to Lima for a conference. I arrived at the airport two " +
        "hours early, as you are supposed to, and everything was fine until the screen " +
        "changed from \"Boarding\" to \"Delayed\".\n\n" +
        "At first they said thirty minutes. Then an hour. By eleven at night, the airline " +
        "finally admitted that the flight was cancelled because of a technical problem.\n\n" +
        "They gave us a hotel room and a ticket for the following morning. I was annoyed, " +
        "but I have to say the staff handled it well: they explained what was happening " +
        "instead of hiding from us, which is what usually happens.\n\n" +
        "I got to Lima the next day and missed the first session of the conference. " +
        "Since then I always travel the day before.",
      glosario: [
        { en: "delayed", es: "retrasado" },
        { en: "cancelled", es: "cancelado" },
        { en: "annoyed", es: "molesta" },
        { en: "staff", es: "el personal" },
      ],
      preguntas: [
        {
          p: "Why was the flight cancelled?",
          op: ["Bad weather", "A technical problem", "Not enough passengers", "A strike"],
          ok: 1,
        },
        {
          p: "What did the airline give the passengers?",
          op: [
            "Money back",
            "Nothing at all",
            "A hotel room and a ticket for the next day",
            "A flight to another city",
          ],
          ok: 2,
        },
        {
          p: "What did the writer think of the staff?",
          op: [
            "They were rude",
            "They disappeared",
            "They handled it well because they explained the situation",
            "They were slow but friendly",
          ],
          ok: 2,
        },
        {
          p: "What does she do differently now?",
          op: [
            "She takes a different airline",
            "She travels one day earlier",
            "She does not go to conferences",
            "She arrives three hours early",
          ],
          ok: 1,
        },
      ],
    },

    {
      id: "lec-reunion",
      nivel: 2,
      titulo: "Notes from the meeting",
      emo: "📝",
      minutos: 2,
      texto:
        "The purchasing team met on Tuesday to review the budget for the next quarter.\n\n" +
        "Carla explained that costs have risen by about eight per cent since January, " +
        "mainly because of transport. She suggested looking for a local supplier for the " +
        "packaging, which would reduce the shipping cost considerably.\n\n" +
        "Not everyone agreed. Diego pointed out that the current supplier has never been " +
        "late in three years, and that changing now, in the busiest season, could be risky.\n\n" +
        "In the end the team decided to ask two local companies for a quote, but not to " +
        "change anything before March. Carla will collect the quotes and present them at " +
        "the next meeting.",
      glosario: [
        { en: "budget", es: "presupuesto" },
        { en: "risen", es: "subido (de 'rise')" },
        { en: "quote", es: "cotización" },
        { en: "risky", es: "arriesgado" },
      ],
      preguntas: [
        {
          p: "Why have costs gone up?",
          op: ["Salaries", "Transport", "Taxes", "Packaging materials"],
          ok: 1,
        },
        {
          p: "What was Carla's suggestion?",
          op: [
            "To raise prices",
            "To buy less",
            "To find a local supplier for the packaging",
            "To wait until March",
          ],
          ok: 2,
        },
        {
          p: "Why did Diego disagree?",
          op: [
            "The local suppliers are more expensive",
            "The current supplier is reliable and it is the busiest season",
            "He does not like Carla's ideas",
            "The budget is already approved",
          ],
          ok: 1,
        },
        {
          p: "What did the team decide?",
          op: [
            "To change supplier immediately",
            "To do nothing",
            "To ask for quotes but not change before March",
            "To meet again next week",
          ],
          ok: 2,
        },
      ],
    },

    /* ---------------- Nivel 3: avanzado ---------------- */
    {
      id: "lec-contrato",
      nivel: 3,
      titulo: "What the clause actually says",
      emo: "📜",
      minutos: 3,
      texto:
        "Most people sign supplier contracts without reading clause 7, which is a shame, " +
        "because clause 7 is usually where the money is.\n\n" +
        "It typically states that prices are fixed for the duration of the agreement " +
        "\"unless there is a significant change in the cost of raw materials\". That sounds " +
        "reasonable until you notice that the contract never defines what counts as " +
        "significant, nor who decides. In practice, the supplier decides.\n\n" +
        "Had the clause included a percentage — say, a rise of more than five per cent, " +
        "documented and notified thirty days in advance — the buyer would have some " +
        "protection. Without it, a price increase can be announced by email on a Friday " +
        "and applied on the Monday.\n\n" +
        "This is not a legal trick; it is simply what happens when a clause is written by " +
        "one side and skimmed by the other. If you only have time to read one page of a " +
        "contract, read that one.",
      glosario: [
        { en: "clause", es: "cláusula" },
        { en: "raw materials", es: "materias primas" },
        { en: "skimmed", es: "leído por encima" },
        { en: "in advance", es: "con anticipación" },
      ],
      preguntas: [
        {
          p: "According to the text, what is the problem with clause 7?",
          op: [
            "It is illegal",
            "It allows price rises but does not define the conditions clearly",
            "It is too long to read",
            "It only protects the buyer",
          ],
          ok: 1,
        },
        {
          p: "\"In practice, the supplier decides\" means that…",
          op: [
            "the supplier is legally the one in charge",
            "the buyer has agreed to this in writing",
            "because nothing is defined, whoever wrote the clause ends up deciding",
            "the decision goes to a judge",
          ],
          ok: 2,
        },
        {
          p: "What would give the buyer more protection?",
          op: [
            "Signing with two suppliers",
            "A defined percentage, documentation and notice in advance",
            "Paying in advance",
            "A shorter contract",
          ],
          ok: 1,
        },
        {
          p: "What is the author's tone?",
          op: [
            "Angry at suppliers",
            "Practical: this is avoidable if you read it",
            "Pessimistic: nothing can be done",
            "Neutral and purely legal",
          ],
          ok: 1,
        },
      ],
    },

    {
      id: "lec-trabajo",
      nivel: 3,
      titulo: "The four-day week",
      emo: "📅",
      minutos: 3,
      texto:
        "When a company announces that it is moving to a four-day week, the first reaction " +
        "is usually suspicion: surely the same work has to fit into fewer hours, and " +
        "someone will end up taking it home.\n\n" +
        "The trials carried out in the United Kingdom suggest otherwise, although the " +
        "results are less dramatic than the headlines implied. Productivity stayed roughly " +
        "the same in most participating companies, and sick leave fell. What actually " +
        "changed, according to the managers interviewed, was not how fast people worked " +
        "but how many meetings they held.\n\n" +
        "That detail is easy to miss and probably the most useful part of the study. The " +
        "time was not found by working harder; it was found by removing things that were " +
        "never producing much in the first place.\n\n" +
        "Whether this would work in smaller firms, where one person often covers several " +
        "roles, remains an open question. The trials were run mostly in offices, and an " +
        "office is not a warehouse.",
      glosario: [
        { en: "suspicion", es: "sospecha, desconfianza" },
        { en: "trials", es: "pruebas, ensayos" },
        { en: "sick leave", es: "licencias médicas" },
        { en: "warehouse", es: "bodega" },
      ],
      preguntas: [
        {
          p: "What is the common first reaction to a four-day week?",
          op: [
            "Enthusiasm",
            "Suspicion that the same work will be squeezed into less time",
            "Indifference",
            "Fear of losing the job",
          ],
          ok: 1,
        },
        {
          p: "According to the trials, what mainly changed?",
          op: [
            "People worked much faster",
            "Companies hired more staff",
            "The number of meetings went down",
            "Salaries were reduced",
          ],
          ok: 2,
        },
        {
          p: "\"An office is not a warehouse\" suggests that…",
          op: [
            "warehouses are better places to work",
            "the results may not apply to every kind of work",
            "offices should become warehouses",
            "the study was badly designed",
          ],
          ok: 1,
        },
        {
          p: "How would you describe the author's position?",
          op: [
            "Convinced the four-day week always works",
            "Against the idea",
            "Interested but careful about how far the results go",
            "Not interested in the evidence",
          ],
          ok: 2,
        },
      ],
    },

    {
      id: "lec-error",
      nivel: 3,
      titulo: "The invoice that was paid twice",
      emo: "💸",
      minutos: 3,
      texto:
        "The error was discovered three months after it happened, which is fairly typical. " +
        "An invoice for just over four million pesos had been paid twice: once from the " +
        "accounts payable system and once, manually, by someone who had been told the " +
        "supplier was chasing payment.\n\n" +
        "Nobody had done anything wrong, exactly. The supplier had sent a reminder because " +
        "their own system had not registered the first payment. The colleague who paid it " +
        "again had checked with the supplier, not with the system, and the supplier " +
        "confirmed — honestly — that nothing had arrived.\n\n" +
        "What made the error possible was that two people could pay the same invoice " +
        "without either of them seeing what the other had done. The money was recovered, " +
        "but it took six weeks and a certain amount of embarrassment.\n\n" +
        "The fix was not a new rule about being careful. Being careful is not a control. " +
        "The fix was a field in the system that marks an invoice as paid and refuses the " +
        "second attempt.",
      glosario: [
        { en: "accounts payable", es: "cuentas por pagar" },
        { en: "chasing payment", es: "insistiendo por el pago" },
        { en: "reminder", es: "recordatorio" },
        { en: "embarrassment", es: "vergüenza, incomodidad" },
      ],
      preguntas: [
        {
          p: "How did the double payment happen?",
          op: [
            "The supplier sent the invoice twice on purpose",
            "Two people paid separately without seeing each other's actions",
            "The system failed completely",
            "Someone stole the money",
          ],
          ok: 1,
        },
        {
          p: "Why did the supplier ask for payment again?",
          op: [
            "They were dishonest",
            "They wanted to be paid twice",
            "Their own system had not registered the first payment",
            "They had changed bank",
          ],
          ok: 2,
        },
        {
          p: "\"Being careful is not a control\" means that…",
          op: [
            "people should be more careful",
            "relying on people paying attention does not prevent the error from recurring",
            "controls are unnecessary",
            "the colleague was careless",
          ],
          ok: 1,
        },
        {
          p: "What was the actual solution?",
          op: [
            "Training for the team",
            "A new rule in the manual",
            "A system field that blocks a second payment",
            "Changing supplier",
          ],
          ok: 2,
        },
      ],
    },
  ];

  const porNivel = { 1: [], 2: [], 3: [] };
  TEXTOS.forEach(function (t) {
    (porNivel[t.nivel] = porNivel[t.nivel] || []).push(t);
  });

  const porId = {};
  TEXTOS.forEach(function (t) { porId[t.id] = t; });

  window.APP = window.APP || {};
  APP.datosLectura = {
    TEXTOS: TEXTOS,
    texto: function (id) { return porId[id] || null; },
    delNivel: function (n) { return porNivel[n] || []; },
  };
})();
