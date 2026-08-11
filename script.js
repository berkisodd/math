/* ---------- Grade config ---------- */
const GRADES = [
  { id: "K", label: "K",  name: "Kindergarten", desc: "Counting & simple addition", color: "#ff9f43", time: 8 },
  { id: "1", label: "1",  name: "Grade 1",      desc: "Addition & subtraction to 20", color: "#ff6b6b", time: 8 },
  { id: "2", label: "2",  name: "Grade 2",      desc: "Addition, subtraction & skip counting", color: "#feca57", time: 8 },
  { id: "3", label: "3",  name: "Grade 3",      desc: "Multiplication & division facts", color: "#1dd1a1", time: 7 },
  { id: "4", label: "4",  name: "Grade 4",      desc: "Multi-digit math & rounding", color: "#54a0ff", time: 7 },
  { id: "5", label: "5",  name: "Grade 5",      desc: "Fractions & decimals", color: "#5f27cd", time: 7 },
  { id: "6", label: "6",  name: "Grade 6",      desc: "Ratios, percents & negatives", color: "#00d2d3", time: 7 },
  { id: "7", label: "7",  name: "Grade 7",      desc: "Integers & one-step equations", color: "#ff9ff3", time: 6 },
  { id: "8", label: "8",  name: "Grade 8",      desc: "Equations, exponents & roots", color: "#576574", time: 6 },
];

const LIVES_START = 4;

const MODES = {
  speed: { label: "Speed Drill", timed: true },
  challenge: { label: "Challenge", timed: false },
};

/* ---------- State ---------- */
let state = {
  grade: null,
  mode: "speed",
  lives: LIVES_START,
  score: 0,
  correct: 0,
  attempted: 0,
  timer: null,
  timeLeft: 0,
  timeTotal: 10,
  currentAnswer: null,
  locked: false,
};

/* ---------- Helpers ---------- */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeChoices(correct, spread, allowNegative = false) {
  const set = new Set([correct]);
  while (set.size < 4) {
    let delta = randInt(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    let val = correct + delta;
    if (!allowNegative && val < 0) val = correct + Math.abs(delta);
    set.add(val);
  }
  return shuffle([...set]);
}

function q(text, answer, choices) {
  return { text, answer, choices };
}

/* ---------- SPEED DRILL generators ----------
   Kumon-style: one skill, one operation, plain and fast. */
const SPEED_GENERATORS = {
  K: () => {
    const type = randInt(0, 1);
    if (type === 0) {
      const a = randInt(0, 5), b = randInt(0, 5);
      return q(`${a} + ${b} = ?`, a + b, makeChoices(a + b, 3));
    }
    const a = randInt(1, 9), b = randInt(0, a);
    return q(`${a} - ${b} = ?`, a - b, makeChoices(a - b, 3));
  },

  1: () => {
    const type = randInt(0, 1);
    if (type === 0) {
      const a = randInt(0, 20), b = randInt(0, 20 - a);
      return q(`${a} + ${b} = ?`, a + b, makeChoices(a + b, 4));
    }
    const a = randInt(0, 20), b = randInt(0, a);
    return q(`${a} - ${b} = ?`, a - b, makeChoices(a - b, 4));
  },

  2: () => {
    const type = randInt(0, 1);
    if (type === 0) {
      const a = randInt(10, 99), b = randInt(1, 20);
      return q(`${a} + ${b} = ?`, a + b, makeChoices(a + b, 5));
    }
    const a = randInt(10, 99), b = randInt(0, 20);
    const safeB = Math.min(a, b);
    return q(`${a} - ${safeB} = ?`, a - safeB, makeChoices(a - safeB, 5));
  },

  3: () => {
    const type = randInt(0, 1);
    if (type === 0) {
      const a = randInt(2, 10), b = randInt(2, 10);
      return q(`${a} × ${b} = ?`, a * b, makeChoices(a * b, 6));
    }
    const b = randInt(2, 10), ans = randInt(2, 10);
    const product = b * ans;
    return q(`${product} ÷ ${b} = ?`, ans, makeChoices(ans, 3));
  },

  4: () => {
    const type = randInt(0, 1);
    if (type === 0) {
      const a = randInt(11, 99), b = randInt(2, 9);
      return q(`${a} × ${b} = ?`, a * b, makeChoices(a * b, 12));
    }
    const b = randInt(2, 9), ans = randInt(10, 30);
    const product = b * ans;
    return q(`${product} ÷ ${b} = ?`, ans, makeChoices(ans, 6));
  },

  5: () => {
    const type = randInt(0, 1);
    if (type === 0) {
      const d = randInt(2, 10);
      const a = randInt(1, d - 1), b = randInt(1, d - 1 - a >= 1 ? d - 1 - a : 1);
      const sum = Math.min(a + b, d - 1) || 1;
      return q(`${a}/${d} + ${b}/${d} = ?`, `${a + b}/${d}`, shuffle([
        `${a + b}/${d}`, `${a + b + 1}/${d}`, `${a + b}/${d + 1}`, `${Math.max(1, a + b - 1)}/${d}`
      ]));
    }
    const a = (randInt(10, 99) / 10).toFixed(1);
    const b = (randInt(10, 99) / 10).toFixed(1);
    const sum = (parseFloat(a) + parseFloat(b)).toFixed(1);
    return q(`${a} + ${b} = ?`, sum, shuffle([
      sum, (parseFloat(sum) + 0.1).toFixed(1), (parseFloat(sum) - 0.1).toFixed(1), (parseFloat(sum) + 1).toFixed(1)
    ]));
  },

  6: () => {
    const type = randInt(0, 1);
    if (type === 0) {
      const pct = [10, 20, 25, 50, 75][randInt(0, 4)];
      const base = randInt(1, 40) * 4;
      const answer = (pct / 100) * base;
      return q(`${pct}% of ${base} = ?`, answer, makeChoices(answer, Math.max(4, Math.round(answer * 0.3))));
    }
    const a = randInt(-20, 20), b = randInt(-20, 20);
    return q(`${a} + (${b}) = ?`, a + b, makeChoices(a + b, 8, true));
  },

  7: () => {
    const type = randInt(0, 1);
    if (type === 0) {
      const a = randInt(-25, 25), b = randInt(-25, 25);
      return q(`${a} - (${b}) = ?`, a - b, makeChoices(a - b, 10, true));
    }
    const a = randInt(-12, 12) || 3, b = randInt(-12, 12) || 4;
    return q(`${a} × ${b} = ?`, a * b, makeChoices(a * b, 12, true));
  },

  8: () => {
    const type = randInt(0, 1);
    if (type === 0) {
      const x = randInt(1, 20);
      const b = randInt(1, 20);
      const result = x + b;
      return q(`x + ${b} = ${result}. What is x?`, x, makeChoices(x, 6, true));
    }
    const base = randInt(2, 6), exp = randInt(2, 3);
    const answer = Math.pow(base, exp);
    return q(`${base}^${exp} = ?`, answer, makeChoices(answer, Math.max(5, Math.round(answer * 0.3))));
  },
};

/* ---------- CHALLENGE generators (untimed) ----------
   Harder, multi-step problems at the same grade level. */
const CHALLENGE_GENERATORS = {
  K: () => {
    const a = randInt(1, 5), b = randInt(1, 5), c = randInt(1, 5);
    return q(`${a} + ${b} + ${c} = ?`, a + b + c, makeChoices(a + b + c, 3));
  },

  1: () => {
    const a = randInt(1, 10), b = randInt(1, 10), c = randInt(1, 10);
    return q(`${a} + ${b} - ${c} = ?`, a + b - c, makeChoices(a + b - c, 4, true));
  },

  2: () => {
    const a = randInt(20, 99), b = randInt(10, 50), c = randInt(1, 20);
    return q(`${a} - ${b} + ${c} = ?`, a - b + c, makeChoices(a - b + c, 6, true));
  },

  3: () => {
    const a = randInt(2, 9), b = randInt(2, 9), c = randInt(1, 10);
    return q(`${a} × ${b} + ${c} = ?`, a * b + c, makeChoices(a * b + c, 8));
  },

  4: () => {
    const a = randInt(2, 9), b = randInt(10, 30), c = randInt(1, 20);
    return q(`${a} × ${b} - ${c} = ?`, a * b - c, makeChoices(a * b - c, 15));
  },

  5: () => {
    const type = randInt(0, 1);
    if (type === 0) {
      const d1 = [2, 4, 5][randInt(0, 2)];
      const d2 = d1 * randInt(2, 3);
      const a = randInt(1, d1 - 1), b = randInt(1, d2 - 1);
      const commonNum = a * (d2 / d1) + b;
      return q(`${a}/${d1} + ${b}/${d2} = ?`, `${commonNum}/${d2}`, shuffle([
        `${commonNum}/${d2}`, `${commonNum + 1}/${d2}`, `${commonNum}/${d1}`, `${Math.max(1, commonNum - 2)}/${d2}`
      ]));
    }
    const a = randInt(2, 20), b = randInt(2, 12), c = randInt(2, 12), d = randInt(1, 20);
    const answer = (a + b) * c - d;
    return q(`(${a} + ${b}) × ${c} - ${d} = ?`, answer, makeChoices(answer, 12));
  },

  6: () => {
    const type = randInt(0, 1);
    if (type === 0) {
      const pct = [15, 30, 40, 60, 12][randInt(0, 4)];
      const base = randInt(5, 60) * 5;
      const answer = Math.round((pct / 100) * base);
      return q(`What is ${pct}% of ${base}?`, answer, makeChoices(answer, Math.max(5, Math.round(answer * 0.25))));
    }
    const a = randInt(-15, 15), b = randInt(-15, 15), c = randInt(-15, 15);
    return q(`${a} + ${b} - (${c}) = ?`, a + b - c, makeChoices(a + b - c, 10, true));
  },

  7: () => {
    const type = randInt(0, 1);
    if (type === 0) {
      const m = randInt(2, 9), b = randInt(-15, 15), x = randInt(-10, 10);
      const result = m * x + b;
      const sign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      return q(`${m}x ${sign} = ${result}. What is x?`, x, makeChoices(x, 6, true));
    }
    const b1 = randInt(2, 9), mult = randInt(2, 5), a1 = randInt(2, 9);
    const b2 = b1 * mult, x = a1 * mult;
    return q(`${a1}/${b1} is proportional to x/${b2}. What is x?`, x, makeChoices(x, 5));
  },

  8: () => {
    const type = randInt(0, 2);
    if (type === 0) {
      const x = randInt(1, 15), m = randInt(2, 8), b = randInt(1, 30), n = randInt(2, 6);
      const result = m * x + b + n * x;
      return q(`${m}x + ${b} + ${n}x = ${result}. What is x?`, x, makeChoices(x, 6, true));
    }
    if (type === 1) {
      const legs = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]][randInt(0, 4)];
      return q(`A right triangle has legs ${legs[0]} and ${legs[1]}. What is the hypotenuse?`, legs[2], makeChoices(legs[2], 4));
    }
    const base = randInt(2, 5), exp1 = randInt(2, 3), exp2 = randInt(2, 3);
    const answer = Math.pow(base, exp1 + exp2);
    return q(`${base}^${exp1} × ${base}^${exp2} = ${base}^?`, exp1 + exp2, makeChoices(exp1 + exp2, 3));
  },
};

function getGenerator(gradeId, mode) {
  return mode === "challenge" ? CHALLENGE_GENERATORS[gradeId] : SPEED_GENERATORS[gradeId];
}

/* ---------- LocalStorage ---------- */
function getBest(gradeId, mode) {
  return parseInt(localStorage.getItem(`mathdash_best_${gradeId}_${mode}`) || "0", 10);
}
function setBest(gradeId, mode, score) {
  const cur = getBest(gradeId, mode);
  if (score > cur) localStorage.setItem(`mathdash_best_${gradeId}_${mode}`, String(score));
  return score > cur;
}
function starsFor(score) {
  if (score >= 150) return 3;
  if (score >= 80) return 2;
  if (score >= 30) return 1;
  return 0;
}

/* ---------- Views ---------- */
const views = {
  dashboard: document.getElementById("dashboardView"),
  game: document.getElementById("gameView"),
  results: document.getElementById("resultsView"),
};

function showView(name) {
  Object.values(views).forEach(v => v.classList.add("hidden"));
  views[name].classList.remove("hidden");
}

/* ---------- Dashboard rendering ---------- */
function renderDashboard() {
  const grid = document.getElementById("gradeGrid");
  grid.innerHTML = "";
  GRADES.forEach(g => {
    const speedBest = getBest(g.id, "speed");
    const challengeBest = getBest(g.id, "challenge");
    const stars = starsFor(Math.max(speedBest, challengeBest));
    const card = document.createElement("div");
    card.className = "grade-card";
    card.innerHTML = `
      <div class="grade-card-top">
        <div class="grade-badge" style="background:${g.color}">${g.label}</div>
        <div class="grade-stars">${"⭐".repeat(stars)}${"☆".repeat(3 - stars)}</div>
      </div>
      <h3>${g.name}</h3>
      <p>${g.desc}</p>
      <div class="grade-best">⚡ Speed best: ${speedBest} &nbsp;•&nbsp; 🧠 Challenge best: ${challengeBest}</div>
      <div class="mode-btn-row">
        <button class="mode-btn speed-btn" data-mode="speed">⚡ Speed Drill</button>
        <button class="mode-btn challenge-btn" data-mode="challenge">🧠 Challenge</button>
      </div>
    `;
    card.querySelector(".speed-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      startGame(g.id, "speed");
    });
    card.querySelector(".challenge-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      startGame(g.id, "challenge");
    });
    grid.appendChild(card);
  });
}

/* ---------- Game logic ---------- */
function startGame(gradeId, mode) {
  const grade = GRADES.find(g => g.id === gradeId);
  state = {
    grade,
    mode,
    lives: LIVES_START,
    score: 0,
    correct: 0,
    attempted: 0,
    timer: null,
    timeLeft: grade.time,
    timeTotal: grade.time,
    currentAnswer: null,
    locked: false,
  };
  document.getElementById("gradePill").textContent = `${grade.name} • ${MODES[mode].label}`;
  document.getElementById("timerTrack").classList.toggle("hidden", !MODES[mode].timed);
  document.getElementById("untimedNote").classList.toggle("hidden", MODES[mode].timed);
  renderLives();
  updateScore();
  showView("game");
  nextQuestion();
}

function renderLives() {
  const box = document.getElementById("livesBox");
  box.innerHTML = "";
  for (let i = 0; i < LIVES_START; i++) {
    const span = document.createElement("span");
    span.className = "life" + (i < state.lives ? "" : " lost");
    span.textContent = "❤️";
    box.appendChild(span);
  }
}

function updateScore() {
  document.getElementById("scoreNum").textContent = state.score;
}

function nextQuestion() {
  state.locked = false;
  document.getElementById("feedback").textContent = "";
  document.getElementById("feedback").className = "feedback";

  const gen = getGenerator(state.grade.id, state.mode);
  const question = gen();
  state.currentAnswer = question.answer;

  document.getElementById("questionText").textContent = question.text;

  const choicesGrid = document.getElementById("choicesGrid");
  choicesGrid.innerHTML = "";
  question.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice;
    btn.addEventListener("click", () => handleAnswer(choice, btn));
    choicesGrid.appendChild(btn);
  });

  if (MODES[state.mode].timed) {
    startTimer();
  }
}

function startTimer() {
  clearInterval(state.timer);
  state.timeLeft = state.timeTotal;
  const fill = document.getElementById("timerFill");
  fill.style.width = "100%";
  fill.className = "timer-fill";

  const tickMs = 100;
  state.timer = setInterval(() => {
    state.timeLeft -= tickMs / 1000;
    const pct = Math.max(0, (state.timeLeft / state.timeTotal) * 100);
    fill.style.width = pct + "%";
    if (pct < 50) fill.className = "timer-fill warn";
    if (pct < 20) fill.className = "timer-fill danger";
    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      handleAnswer(null, null);
    }
  }, tickMs);
}

function handleAnswer(choice, btn) {
  if (state.locked) return;
  state.locked = true;
  clearInterval(state.timer);
  state.attempted++;

  const buttons = [...document.querySelectorAll(".choice-btn")];
  buttons.forEach(b => b.disabled = true);

  const isCorrect = choice !== null && String(choice) === String(state.currentAnswer);
  const feedback = document.getElementById("feedback");

  if (isCorrect) {
    state.correct++;
    const speedBonus = MODES[state.mode].timed ? Math.round((state.timeLeft / state.timeTotal) * 10) : 5;
    state.score += 10 + speedBonus;
    updateScore();
    if (btn) btn.classList.add("correct");
    feedback.textContent = "Correct! 🎉";
    feedback.className = "feedback good";
  } else {
    state.lives--;
    renderLives();
    if (btn) btn.classList.add("wrong");
    buttons.forEach(b => {
      if (b.textContent === String(state.currentAnswer)) b.classList.add("correct");
    });
    feedback.textContent = choice === null ? `Time's up! Answer: ${state.currentAnswer}` : `Not quite. Answer: ${state.currentAnswer}`;
    feedback.className = "feedback bad";
  }

  setTimeout(() => {
    if (state.lives <= 0) {
      endGame();
    } else {
      nextQuestion();
    }
  }, 900);
}

function endGame() {
  const isNewBest = setBest(state.grade.id, state.mode, state.score);
  const best = getBest(state.grade.id, state.mode);

  document.getElementById("finalScore").textContent = state.score;
  document.getElementById("finalCorrect").textContent = `${state.correct}/${state.attempted}`;
  document.getElementById("finalBest").textContent = best;
  document.getElementById("resultsIcon").textContent = isNewBest ? "🏆" : "🏁";
  document.getElementById("resultsTitle").textContent = isNewBest ? "New Best Score!" : "Game Over!";
  document.getElementById("resultsSub").textContent = `${state.grade.name} • ${MODES[state.mode].label} • Out of lives`;

  showView("results");
}

/* ---------- Streak (simple daily play tracker) ---------- */
function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const last = localStorage.getItem("mathdash_last_play");
  let streak = parseInt(localStorage.getItem("mathdash_streak") || "0", 10);

  if (last === today) {
    // already counted today
  } else {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = last === yesterday ? streak + 1 : 1;
    localStorage.setItem("mathdash_streak", String(streak));
    localStorage.setItem("mathdash_last_play", today);
  }
  document.getElementById("streakNum").textContent = streak || 1;
}

/* ---------- Event wiring ---------- */
document.getElementById("quitBtn").addEventListener("click", () => {
  clearInterval(state.timer);
  showView("dashboard");
  renderDashboard();
});
document.getElementById("playAgainBtn").addEventListener("click", () => {
  startGame(state.grade.id, state.mode);
});
document.getElementById("backToDashBtn").addEventListener("click", () => {
  showView("dashboard");
  renderDashboard();
});

/* ---------- Init ---------- */
renderDashboard();
updateStreak();
showView("dashboard");
