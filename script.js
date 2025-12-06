// ----------------------------
//  Configuración general
// ----------------------------
const PHASES = {
    QUIZ: "phase-quiz",
    OBSTACLES: "phase-obstacles",
    XMAS: "phase-xmas",
};

// Preguntas de ejemplo: concienciación energética
// Puedes añadir / modificar las preguntas fácilmente.
const QUESTION_BANK = [
    {
        question: "¿Qué electrodoméstico suele consumir más energía en una casa típica a lo largo del año?",
        options: [
            "La televisión",
            "El frigorífico/nevera",
            "La tostadora",
            "El cargador del móvil",
        ],
        correctIndex: 1,
        explanation:
            "El frigorífico está encendido las 24 horas del día, por eso suele ser de los que más consumen a lo largo del año.",
    },
    {
        question: "¿Qué acción ayuda más a reducir el consumo de calefacción en casa?",
        options: [
            "Abrir las ventanas cuando hace frío",
            "Poner la calefacción al máximo solo un rato",
            "Mejorar el aislamiento (ventanas, burletes…) y usar termostato",
            "Dejar puertas interiores abiertas todo el día",
        ],
        correctIndex: 2,
        explanation:
            "Un buen aislamiento y un termostato estable ayudan mucho más que subir y bajar la calefacción de forma brusca.",
    },
    {
        question: "¿Cuál es una buena práctica con la lavadora para ahorrar energía?",
        options: [
            "Ponerla siempre a máxima temperatura",
            "Usarla solo para pocas prendas",
            "Poner programas cortos a cualquier temperatura",
            "Usar programas de baja temperatura y carga completa cuando sea posible",
        ],
        correctIndex: 3,
        explanation:
            "Llenar bien la lavadora y usar programas de baja temperatura reduce el consumo energético total.",
    },
    {
        question: "Cuando sales de una habitación, ¿qué es lo más eficiente?",
        options: [
            "Dejar las luces encendidas si vas a volver en 5 minutos o más",
            "Apagar siempre las luces al salir",
            "Dejar una sola bombilla encendida",
            "Bajar la intensidad, pero no apagarlas",
        ],
        correctIndex: 1,
        explanation:
            "Apagar las luces al salir de la habitación es la mejor práctica general para ahorrar energía.",
    },
    {
        question: "¿Qué tipo de bombilla consume menos energía para la misma luz?",
        options: [
            "Incandescente",
            "Halógena",
            "De bajo consumo (fluorescente compacta)",
            "LED",
        ],
        correctIndex: 3,
        explanation:
            "Las bombillas LED consumen muy poca energía para la misma cantidad de luz y suelen durar más.",
    },
    {
        question: "¿Qué hábito ayuda a reducir el consumo del aire acondicionado en verano?",
        options: [
            "Mantener las ventanas abiertas mientras está encendido",
            "Cerrar persianas/cortinas durante las horas de más sol",
            "Ponerlo a la temperatura más baja posible",
            "Apagarlo y encenderlo constantemente",
        ],
        correctIndex: 1,
        explanation:
            "Cerrar persianas o cortinas en las horas de más sol reduce la entrada de calor y ayuda al aire acondicionado.",
    },
];

// Número de preguntas que se muestran por partida
const QUESTIONS_PER_GAME = 5;

// Estado del juego
const state = {
    currentPhase: PHASES.QUIZ,
    questions: [],
    currentIndex: 0,
    score: 0,
    answered: false,
};

// Referencias al DOM
const phaseElements = {
    [PHASES.QUIZ]: document.getElementById(PHASES.QUIZ),
    [PHASES.OBSTACLES]: document.getElementById(PHASES.OBSTACLES),
    [PHASES.XMAS]: document.getElementById(PHASES.XMAS),
};

const questionCounterEl = document.getElementById("question-counter");
const scoreCounterEl = document.getElementById("score-counter");
const questionTextEl = document.getElementById("question-text");
const answersContainerEl = document.getElementById("answers-container");
const feedbackEl = document.getElementById("feedback");
const nextBtnEl = document.getElementById("next-btn");

// ----------------------------
//  Utilidades
// ----------------------------

// Barajado tipo Fisher-Yates
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Mostrar una fase y ocultar el resto
function setPhase(phaseId) {
    Object.values(phaseElements).forEach((el) => {
        el.classList.remove("phase--active");
    });
    const target = phaseElements[phaseId];
    if (target) {
        target.classList.add("phase--active");
    }
    state.currentPhase = phaseId;
}

// Guardar puntuación en localStorage (para usar en fases 2/3)
function saveScoreToStorage(score) {
    try {
        localStorage.setItem("doc_xmas_score_phase1", String(score));
    } catch (e) {
        // Si falla (modo privado, etc.), simplemente seguimos
        console.warn("No se pudo guardar la puntuación en localStorage:", e);
    }
}

// ----------------------------
//  Lógica Fase 1 - Quiz
// ----------------------------

function startQuizPhase1() {
    const shuffled = shuffle(QUESTION_BANK);
    state.questions = shuffled.slice(0, QUESTIONS_PER_GAME);
    state.currentIndex = 0;
    state.score = 0;
    state.answered = false;

    scoreCounterEl.textContent = `Puntuación: ${state.score}`;
    feedbackEl.textContent = "";
    nextBtnEl.disabled = true;
    nextBtnEl.textContent = "Siguiente";

    setPhase(PHASES.QUIZ);
    renderCurrentQuestion();
}

function renderCurrentQuestion() {
    const questionObj = state.questions[state.currentIndex];

    if (!questionObj) {
        showFinalQuizScreen();
        return;
    }

    // Actualizar contadores
    questionCounterEl.textContent = `Pregunta ${state.currentIndex + 1}/${state.questions.length}`;
    scoreCounterEl.textContent = `Puntuación: ${state.score}`;

    // Mostrar texto de la pregunta
    questionTextEl.textContent = questionObj.question;

    // Limpiar respuestas anteriores
    answersContainerEl.innerHTML = "";
    feedbackEl.textContent = "";
    state.answered = false;
    nextBtnEl.disabled = true;

    // Crear botones de respuesta
    questionObj.options.forEach((optionText, index) => {
        const btn = document.createElement("button");
        btn.className = "btn btn-answer btn-full";
        btn.textContent = optionText;
        btn.setAttribute("type", "button");
        btn.addEventListener("click", () => handleAnswerClick(index));
        answersContainerEl.appendChild(btn);
    });
}

function handleAnswerClick(selectedIndex) {
    if (state.answered) return; // Evitar doble respuesta

    const questionObj = state.questions[state.currentIndex];
    const isCorrect = selectedIndex === questionObj.correctIndex;
    const buttons = answersContainerEl.querySelectorAll("button");

    state.answered = true;
    nextBtnEl.disabled = false;

    // Marcar botones
    buttons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === questionObj.correctIndex) {
            btn.classList.add("correct");
        }
        if (index === selectedIndex && !isCorrect) {
            btn.classList.add("incorrect");
        }
    });

    // Actualizar puntuación y feedback
    if (isCorrect) {
        state.score += 10; // 10 puntos por acierto (ajustable)
        scoreCounterEl.textContent = `Puntuación: ${state.score}`;
        feedbackEl.textContent = "✅ ¡Correcto! " + (questionObj.explanation || "");
    } else {
        feedbackEl.textContent = "❌ No es la mejor opción. " + (questionObj.explanation || "");
    }

    // Guardar puntuación parcial (por si se usa luego)
    saveScoreToStorage(state.score);

    // Última pregunta → cambiar texto del botón
    if (state.currentIndex === state.questions.length - 1) {
        nextBtnEl.textContent = "Ver resultado";
    } else {
        nextBtnEl.textContent = "Siguiente";
    }
}

function handleNextClick() {
    if (!state.answered) return;

    // Avanzar o mostrar pantalla final
    if (state.currentIndex < state.questions.length - 1) {
        state.currentIndex += 1;
        renderCurrentQuestion();
    } else {
        showFinalQuizScreen();
    }
}

function showFinalQuizScreen() {
    // Reutilizamos la misma card para mostrar el resultado de la Fase 1
    questionCounterEl.textContent = "Fase 1 completada";
    questionTextEl.textContent = "¡Buen trabajo!";

    answersContainerEl.innerHTML = "";

    const finalScoreEl = document.createElement("p");
    finalScoreEl.className = "final-score";
    finalScoreEl.textContent = `Puntuación total Fase 1: ${state.score} puntos`;

    const messageEl = document.createElement("p");
    messageEl.className = "final-message";
    messageEl.textContent =
        "Has completado la fase de concienciación energética en casa. Próximamente podrás continuar con la Fase 2 (evitar obstáculos) y la Fase 3 (XMAS resumen).";

    answersContainerEl.appendChild(finalScoreEl);
    answersContainerEl.appendChild(messageEl);

    feedbackEl.textContent = "";

    nextBtnEl.disabled = false;
    nextBtnEl.textContent = "Continuar a Fase 2 (próximamente)";

    // Aquí engancharemos la transición real a la Fase 2 cuando el minijuego esté desarrollado.
    nextBtnEl.onclick = () => {
        // Por ahora solo mostramos el placeholder de la Fase 2.
        setPhase(PHASES.OBSTACLES);
    };
}

// ----------------------------
//  Inicialización
// ----------------------------

function init() {
    // Listener del botón siguiente
    nextBtnEl.addEventListener("click", handleNextClick);

    // Iniciar directamente en Fase 1
    startQuizPhase1();
}

document.addEventListener("DOMContentLoaded", init);

