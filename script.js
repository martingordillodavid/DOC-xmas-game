// ----------------------------
//  Constantes de fases
// ----------------------------
const PHASES = {
    QUIZ: "phase-quiz",
    OBSTACLES: "phase-obstacles",
    XMAS: "phase-xmas",
};

// ----------------------------
//  Banco de preguntas Fase 1
// ----------------------------
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
            "Mejorar el aislamiento y usar termostato",
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

const QUESTIONS_PER_GAME = 5;

// ----------------------------
//  Estado general
// ----------------------------
const state = {
    currentPhase: PHASES.QUIZ,
    quiz: {
        questions: [],
        currentIndex: 0,
        score: 0,
        answered: false,
        completed: false,
    },
};

// ----------------------------
//  Estado y config Fase 2
// ----------------------------
const gameConfig = {
    width: 320,
    height: 480,
    playerWidth: 50,
    playerHeight: 20,
    moveDistance: 40,
    obstacleWidth: 40,
    obstacleHeight: 30,
    obstacleSpeedMin: 90,   // px/s
    obstacleSpeedMax: 160,  // px/s
    spawnIntervalMs: 800,
    maxGameTimeMs: 30000,   // 30 segundos
};

const gameState = {
    running: false,
    lastFrameTime: 0,
    elapsedTimeMs: 0,
    lastSpawnTime: 0,
    playerX: 0,
    playerY: 0,
    obstacles: [],
    score: 0,
    rafId: null,
};

// ----------------------------
//  Referencias DOM
// ----------------------------
const phaseElements = {
    [PHASES.QUIZ]: document.getElementById(PHASES.QUIZ),
    [PHASES.OBSTACLES]: document.getElementById(PHASES.OBSTACLES),
    [PHASES.XMAS]: document.getElementById(PHASES.XMAS),
};

// Fase 1
const questionCounterEl = document.getElementById("question-counter");
const scoreCounterEl = document.getElementById("score-counter");
const questionTextEl = document.getElementById("question-text");
const answersContainerEl = document.getElementById("answers-container");
const feedbackEl = document.getElementById("feedback");
const nextBtnEl = document.getElementById("next-btn");

// Fase 2
const gameCanvas = document.getElementById("game-canvas");
const gameCtx = gameCanvas.getContext("2d");
const gameScoreLabelEl = document.getElementById("game-score-label");
const gameMessageEl = document.getElementById("game-message");
const btnLeftEl = document.getElementById("btn-left");
const btnRightEl = document.getElementById("btn-right");
const btnStartGameEl = document.getElementById("btn-start-game");

// ----------------------------
//  Utilidades
// ----------------------------
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

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

function saveScorePhase1(score) {
    try {
        localStorage.setItem("doc_xmas_score_phase1", String(score));
    } catch (e) {
        console.warn("No se pudo guardar la puntuación de Fase 1:", e);
    }
}

function saveScorePhase2(score) {
    try {
        localStorage.setItem("doc_xmas_score_phase2", String(score));
    } catch (e) {
        console.warn("No se pudo guardar la puntuación de Fase 2:", e);
    }
}

// ----------------------------
//  Fase 1 - Quiz energético
// ----------------------------
function startQuizPhase1() {
    const shuffled = shuffle(QUESTION_BANK);
    state.quiz.questions = shuffled.slice(0, QUESTIONS_PER_GAME);
    state.quiz.currentIndex = 0;
    state.quiz.score = 0;
    state.quiz.answered = false;
    state.quiz.completed = false;

    scoreCounterEl.textContent = `Puntuación: ${state.quiz.score}`;
    feedbackEl.textContent = "";
    nextBtnEl.disabled = true;
    nextBtnEl.textContent = "Siguiente";

    setPhase(PHASES.QUIZ);
    renderCurrentQuestion();
}

function renderCurrentQuestion() {
    const q = state.quiz.questions[state.quiz.currentIndex];

    if (!q) {
        showFinalQuizScreen();
        return;
    }

    questionCounterEl.textContent = `Pregunta ${state.quiz.currentIndex + 1}/${state.quiz.questions.length}`;
    scoreCounterEl.textContent = `Puntuación: ${state.quiz.score}`;
    questionTextEl.textContent = q.question;

    answersContainerEl.innerHTML = "";
    feedbackEl.textContent = "";
    state.quiz.answered = false;
    nextBtnEl.disabled = true;

    q.options.forEach((optionText, index) => {
        const btn = document.createElement("button");
        btn.className = "btn btn-answer btn-full";
        btn.type = "button";
        btn.textContent = optionText;
        btn.addEventListener("click", () => handleAnswerClick(index));
        answersContainerEl.appendChild(btn);
    });
}

function handleAnswerClick(selectedIndex) {
    if (state.quiz.answered) return;

    const q = state.quiz.questions[state.quiz.currentIndex];
    const isCorrect = selectedIndex === q.correctIndex;
    const buttons = answersContainerEl.querySelectorAll("button");

    state.quiz.answered = true;
    nextBtnEl.disabled = false;

    buttons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === q.correctIndex) {
            btn.classList.add("correct");
        }
        if (index === selectedIndex && !isCorrect) {
            btn.classList.add("incorrect");
        }
    });

    if (isCorrect) {
        state.quiz.score += 10;
        scoreCounterEl.textContent = `Puntuación: ${state.quiz.score}`;
        feedbackEl.textContent = "✅ ¡Correcto! " + (q.explanation || "");
    } else {
        feedbackEl.textContent = "❌ No es la mejor opción. " + (q.explanation || "");
    }

    saveScorePhase1(state.quiz.score);

    if (state.quiz.currentIndex === state.quiz.questions.length - 1) {
        nextBtnEl.textContent = "Ver resultado";
    } else {
        nextBtnEl.textContent = "Siguiente";
    }
}

function showFinalQuizScreen() {
    state.quiz.completed = true;
    state.quiz.answered = true;

    questionCounterEl.textContent = "Fase 1 completada";
    questionTextEl.textContent = "¡Buen trabajo!";

    answersContainerEl.innerHTML = "";

    const finalScoreEl = document.createElement("p");
    finalScoreEl.className = "final-score";
    finalScoreEl.textContent = `Puntuación total Fase 1: ${state.quiz.score} puntos`;

    const messageEl = document.createElement("p");
    messageEl.className = "final-message";
    messageEl.textContent =
        "Has completado la fase de concienciación energética en casa. Pulsa el botón para pasar al minijuego de obstáculos.";

    answersContainerEl.appendChild(finalScoreEl);
    answersContainerEl.appendChild(messageEl);

    feedbackEl.textContent = "";

    nextBtnEl.disabled = false;
    nextBtnEl.textContent = "Ir a Fase 2";
}

function handleNextClick() {
    if (state.currentPhase === PHASES.QUIZ) {
        if (!state.quiz.completed) {
            // Aún estamos en preguntas
            if (!state.quiz.answered) return;

            if (state.quiz.currentIndex < state.quiz.questions.length - 1) {
                state.quiz.currentIndex += 1;
                renderCurrentQuestion();
            } else {
                showFinalQuizScreen();
            }
        } else {
            // Fase 1 completada -> Pasar a Fase 2
            goToObstaclesPhase();
        }
    }
}

// ----------------------------
//  Fase 2 - Juego de obstáculos
// ----------------------------
function resetGameState() {
    gameState.running = false;
    gameState.elapsedTimeMs = 0;
    gameState.lastFrameTime = 0;
    gameState.lastSpawnTime = 0;
    gameState.obstacles = [];
    gameState.score = 0;

    gameState.playerY = gameConfig.height - gameConfig.playerHeight - 12;
    gameState.playerX = (gameConfig.width - gameConfig.playerWidth) / 2;

    gameScoreLabelEl.textContent = `Puntuación: ${gameState.score}`;
    gameMessageEl.textContent =
        "Esquiva los bloques que caen. Usa las flechas para moverte y pulsa “Start”.";
    drawGame();
}

function goToObstaclesPhase() {
    setPhase(PHASES.OBSTACLES);
    resetGameState();
}

function startGame() {
    resetGameState();
    gameState.running = true;
    gameMessageEl.textContent = "¡Esquiva los bloques todo lo que puedas!";
    const now = performance.now();
    gameState.lastFrameTime = now;
    gameState.lastSpawnTime = now;
    if (gameState.rafId) {
        cancelAnimationFrame(gameState.rafId);
    }
    gameState.rafId = requestAnimationFrame(gameLoop);
}

function stopGame(crashed) {
    gameState.running = false;
    if (gameState.rafId) {
        cancelAnimationFrame(gameState.rafId);
        gameState.rafId = null;
    }

    saveScorePhase2(gameState.score);

    if (crashed) {
        gameMessageEl.textContent = `💥 Te han dado. Puntuación: ${gameState.score} puntos. Pulsa “Start” para reintentar.`;
    } else {
        gameMessageEl.textContent = `🎄 ¡Tiempo completado! Puntuación: ${gameState.score} puntos. Pulsa “Start” para volver a jugar.`;
    }
}

function spawnObstacle() {
    const x = Math.random() * (gameConfig.width - gameConfig.obstacleWidth);
    const speed =
        gameConfig.obstacleSpeedMin +
        Math.random() * (gameConfig.obstacleSpeedMax - gameConfig.obstacleSpeedMin);

    gameState.obstacles.push({
        x,
        y: -gameConfig.obstacleHeight,
        width: gameConfig.obstacleWidth,
        height: gameConfig.obstacleHeight,
        speed,
    });
}

function updateObstacles(deltaSec) {
    const remaining = [];
    for (const obs of gameState.obstacles) {
        obs.y += obs.speed * deltaSec;

        // Colisión con jugador
        if (checkCollision(obs)) {
            stopGame(true);
            return;
        }

        if (obs.y > gameConfig.height) {
            // Superado -> sumar puntos
            gameState.score += 5;
            gameScoreLabelEl.textContent = `Puntuación: ${gameState.score}`;
        } else {
            remaining.push(obs);
        }
    }
    gameState.obstacles = remaining;
}

function checkCollision(obs) {
    const px = gameState.playerX;
    const py = gameState.playerY;
    const pw = gameConfig.playerWidth;
    const ph = gameConfig.playerHeight;

    const overlapX = obs.x < px + pw && obs.x + obs.width > px;
    const overlapY = obs.y < py + ph && obs.y + obs.height > py;
    return overlapX && overlapY;
}

function drawGame() {
    const ctx = gameCtx;
    ctx.clearRect(0, 0, gameConfig.width, gameConfig.height);

    // Fondo ligero (ya hay fondo CSS, esto es por si acaso)
    ctx.fillStyle = "rgba(15,23,42,0.8)";
    ctx.fillRect(0, 0, gameConfig.width, gameConfig.height);

    // Jugador
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(
        gameState.playerX,
        gameState.playerY,
        gameConfig.playerWidth,
        gameConfig.playerHeight
    );

    // Obstáculos
    ctx.fillStyle = "#f97316";
    for (const obs of gameState.obstacles) {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }
}

function gameLoop(timestamp) {
    if (!gameState.running) return;

    const deltaMs = timestamp - gameState.lastFrameTime;
    const deltaSec = deltaMs / 1000;
    gameState.lastFrameTime = timestamp;
    gameState.elapsedTimeMs += deltaMs;

    // Generar obstáculos
    if (timestamp - gameState.lastSpawnTime >= gameConfig.spawnIntervalMs) {
        spawnObstacle();
        gameState.lastSpawnTime = timestamp;
    }

    // Actualizar posiciones y comprobar colisiones
    updateObstacles(deltaSec);
    if (!gameState.running) return; // Puede haberse parado por colisión

    // Dibujar
    drawGame();

    // Tiempo máximo cumplido
    if (gameState.elapsedTimeMs >= gameConfig.maxGameTimeMs) {
        stopGame(false);
        return;
    }

    gameState.rafId = requestAnimationFrame(gameLoop);
}

function movePlayer(direction) {
    // direction -1 izquierda, +1 derecha
    const delta = direction * gameConfig.moveDistance;
    gameState.playerX += delta;

    if (gameState.playerX < 0) {
        gameState.playerX = 0;
    }
    if (gameState.playerX > gameConfig.width - gameConfig.playerWidth) {
        gameState.playerX = gameConfig.width - gameConfig.playerWidth;
    }

    // Redibuja aunque el juego no esté corriendo, para que se vea el movimiento
    drawGame();
}

// ----------------------------
//  Inicialización
// ----------------------------
function init() {
    // Preparar canvas con tamaño lógico fijo (CSS se encarga del escalado visual)
    gameCanvas.width = gameConfig.width;
    gameCanvas.height = gameConfig.height;

    // Botón "Siguiente" (Fase 1)
    nextBtnEl.addEventListener("click", handleNextClick);

    // Controles Fase 2
    btnStartGameEl.addEventListener("click", () => {
        startGame();
    });

    btnLeftEl.addEventListener("click", () => {
        movePlayer(-1);
    });

    btnRightEl.addEventListener("click", () => {
        movePlayer(1);
    });

    // Soporte teclado (por si alguien lo abre en PC)
    window.addEventListener("keydown", (e) => {
        if (state.currentPhase !== PHASES.OBSTACLES) return;
        if (e.key === "ArrowLeft") {
            movePlayer(-1);
        } else if (e.key === "ArrowRight") {
            movePlayer(1);
        } else if (e.key === " " || e.key === "Enter") {
            if (!gameState.running) startGame();
        }
    });

    // Empezar en Fase 1
    startQuizPhase1();
}

document.addEventListener("DOMContentLoaded", init);


document.addEventListener("DOMContentLoaded", init);

