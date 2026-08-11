/* ---------- Grade config ---------- */
const GRADES = [
  { id: "K", label: "K",  name: "Kindergarten", desc: "Counting & simple addition", color: "#ff9f43", time: 16 },
  { id: "1", label: "1",  name: "Grade 1",      desc: "Addition & subtraction to 20", color: "#ff6b6b", time: 15 },
  { id: "2", label: "2",  name: "Grade 2",      desc: "Addition, subtraction & skip counting", color: "#feca57", time: 14 },
  { id: "3", label: "3",  name: "Grade 3",      desc: "Multiplication & division facts", color: "#1dd1a1", time: 13 },
  { id: "4", label: "4",  name: "Grade 4",      desc: "Multi-digit math & rounding", color: "#54a0ff", time: 12 },
  { id: "5", label: "5",  name: "Grade 5",      desc: "Fractions & decimals", color: "#5f27cd", time: 12 },
  { id: "6", label: "6",  name: "Grade 6",      desc: "Ratios, percents & negatives", color: "#00d2d3", time: 11 },
  { id: "7", label: "7",  name: "Grade 7",      desc: "Integers & one-step equations", color: "#ff9ff3", time: 10 },
  { id: "8", label: "8",  name: "Grade 8",      desc: "Equations, exponents & roots", color: "#576574", time: 10 },
];

const LIVES_START = 4;

/* ---------- State ---------- */
let state = {
  grade: null,
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

/* ---------- Question generators per grade ---------- */
const GENERATORS = {
  K: () => {
    const type = randInt(0, 2);
    if (type === 0) {
      const n = randInt(1, 10);
      const emoji = "🍎".repeat(n);
      return q(`How many apples? ${emoji}`, n, makeChoices(n, 3));
    }
    if (type === 1) {
      const a = randInt(0, 5), b = randInt(0, 5);
      return q(`${a} + ${b} = ?`, a + b, makeChoices(a + b, 3));
    }
    const a = randInt(1, 10), b = randInt(1, 10);
    if (a === b) return GENERATORS.K();
    const bigger = Math.max(a, b);
    return q(`Which is bigger: ${a} or ${b}?`, bigger, shuffle([a, b, bigger + 1, Math.max(1, bigger - 2)]));
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
    const type = randInt(0, 2);
    if (type === 0) {
      const a = randInt(10, 99), b = randInt(1, 99 - a > 0 ? 99 - a : 10);
      return q(`${a} + ${b} = ?`, a + b, makeChoices(a + b, 6));
    }
    if (type === 1) {
      const a = randInt(10, 99), b = randInt(0, a);
      return q(`${a} - ${b} = ?`, a - b, makeChoices(a - b, 6));
    }
    const step = [2, 5, 10][randInt(0, 2)];
    const start = step * randInt(1, 8);
    const answer = start + step;
    return q(`What comes next? ${start - step}, ${start}, ___`, answer, makeChoices(answer, step));
  },

  3: () => {
    const type = randInt(0, 2);
    if (type === 0) {
      const a = randInt(2, 10), b = randInt(2, 10);
      return q(`${a} × ${b} = ?`, a * b, makeChoices(a * b, 8));
    }
    if (type === 1) {
      const b = randInt(2, 10), ans = randInt(2, 10);
      const product = b * ans;
      return q(`${product} ÷ ${b} = ?`, ans, makeChoices(ans, 4));
    }
    const a = randInt(100, 999), b = randInt(100, 999);
    return q(`${a} + ${b} = ?`, a + b, makeChoices(a + b, 10));
  },

  4: () => {
    const type = randInt(0, 2);
    if (type === 0) {
      const a = randInt(11, 99), b = randInt(2, 9);
      return q(`${a} × ${b} = ?`, a * b, makeChoices(a * b, 15));
    }
    if (type === 1) {
      const n = randInt(11, 999);
      const rounded = Math.round(n / 10) * 10;
      return q(`Round ${n} to the nearest 10`, rounded, makeChoices(rounded, 10));
    }
    const a = randInt(100, 9999);
    const rounded = Math.round(a / 100) * 100;
    return q(`Round ${a} to the nearest 100`, rounded, makeChoices(rounded, 100));
  },

  5: () => {
    const type = randInt(0, 2);
    if (type === 0) {
      const d = randInt(2, 10);
      const a = randInt(1, d - 1), b = randInt(1, d - 1);
      const sum = a + b;
      return q(`${a}/${d} + ${b}/${d} = ?`, `${sum}/${d}`, shuffle([
        `${sum}/${d}`, `${sum + 1}/${d}`, `${sum}/${d + 1}`, `${Math.max(1, sum - 1)}/${d}`
      ]));
    }
    if (type === 1) {
      const a = (randInt(10, 999) / 10).toFixed(1);
      const b = (randInt(10, 999) / 10).toFixed(1);
      const sum = (parseFloat(a) + parseFloat(b)).toFixed(1);
      return q(`${a} + ${b} = ?`, sum, shuffle([
        sum, (parseFloat(sum) + 0.1).toFixed(1), (parseFloat(sum) - 0.1).toFixed(1), (parseFloat(sum) + 1).toFixed(1)
      ]));
    }
    const a = randInt(2, 20), b = randInt(2, 10), c = randInt(2, 10);
    const answer = a + b * c;
    return q(`${a} + ${b} × ${c} = ?`, answer, makeChoices(answer, 10));
  },

  6: () => {
    const type = randInt(0, 2);
    if (type === 0) {
      const pct = [10, 20, 25, 50, 75][randInt(0, 4)];
      const base = randInt(1, 40) * 4;
      const answer = (pct / 100) * base;
      return q(`${pct}% of ${base} = ?`, answer, makeChoices(answer, Math.max(4, Math.round(answer * 0.3))));
    }
    if (type === 1) {
      const a = randInt(-20, 20), b = randInt(-20, 20);
      return q(`${a} + (${b}) = ?`, a + b, makeChoices(a + b, 8, true));
    }
    const base = randInt(2, 6), exp = randInt(2, 3);
    const answer = Math.pow(base, exp);
    return q(`${base}^${exp} = ?`, answer, makeChoices(answer, Math.max(5, Math.round(answer * 0.3))));
  },

  7: () => {
    const type = randInt(0, 2);
    if (type === 0) {
      const a = randInt(-25, 25), b = randInt(-25, 25);
      return q(`${a} - (${b}) = ?`, a - b, makeChoices(a - b, 10, true));
    }
    if (type === 1) {
      const a = randInt(-12, 12) || 3, b = randInt(-12, 12) || 4;
      return q(`${a} × ${b} = ?`, a * b, makeChoices(a * b, 12, true));
    }
    const x = randInt(1, 20);
    const b = randInt(1, 20);
    const result = x + b;
    return q(`x + ${b} = ${result}. What is x?`, x, makeChoices(x, 6, true));
  },

  8: () => {
    const type = randInt(0, 2);
    if (type === 0) {
      const x = randInt(1, 15);
      const m = randInt(2, 6);
      const b = randInt(1, 20);
      const result = m * x + b;
      return q(`${m}x + ${b} = ${result}. What is x?`, x, makeChoices(x, 6, true));
    }
    if (type === 1) {
      const n = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144][randInt(0, 10)];
      const answer = Math.sqrt(n);
      return q(`√${n} = ?`, answer, makeChoices(answer, 4));
    }
    const base = randInt(2, 5), exp = randInt(2, 4);
    const answer = Math.pow(base, exp);
    return q(`${base}^${exp} = ?`, answer, makeChoices(answer, Math.max(6, Math.round(answer * 0.3))));
  },
};

function q(text, answer, choices) {
  return { text, answer, choices };
}

/* ---------- LocalStorage ---------- */
function getBest(gradeId) {
  return parseInt(localStorage.getItem(`mathdash_best_${gradeId}`) || "0", 10);
}
function setBest(gradeId, score) {
  const cur = getBest(gradeId);
  if (score > cur) localStorage.setItem(`mathdash_best_${gradeId}`, String(score));
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
    const best = getBest(g.id);
    const stars = starsFor(best);
    const card = document.createElement("div");
    card.className = "grade-card";
    card.innerHTML = `
      <div class="grade-card-top">
        <div class="grade-badge" style="background:${g.color}">${g.label}</div>
        <div class="grade-stars">${"⭐".repeat(stars)}${"☆".repeat(3 - stars)}</div>
      </div>
      <h3>${g.name}</h3>
      <p>${g.desc}</p>
      <div class="grade-best">Best score: ${best}</div>
      <button class="start-btn">Start</button>
    `;
    card.addEventListener("click", () => startGame(g.id));
    grid.appendChild(card);
  });
}

/* ---------- Game logic ---------- */
function startGame(gradeId) {
  const grade = GRADES.find(g => g.id === gradeId);
  state = {
    grade,
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
  document.getElementById("gradePill").textContent = grade.name;
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

  const gen = GENERATORS[state.grade.id];
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

  startTimer();
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
    const speedBonus = Math.round((state.timeLeft / state.timeTotal) * 10);
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
  const isNewBest = setBest(state.grade.id, state.score);
  const best = getBest(state.grade.id);

  document.getElementById("finalScore").textContent = state.score;
  document.getElementById("finalCorrect").textContent = `${state.correct}/${state.attempted}`;
  document.getElementById("finalBest").textContent = best;
  document.getElementById("resultsIcon").textContent = isNewBest ? "🏆" : "🏁";
  document.getElementById("resultsTitle").textContent = isNewBest ? "New Best Score!" : "Game Over!";
  document.getElementById("resultsSub").textContent = `${state.grade.name} • Out of lives`;

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
  startGame(state.grade.id);
});
document.getElementById("backToDashBtn").addEventListener("click", () => {
  showView("dashboard");
  renderDashboard();
});

/* ---------- Init ---------- */
renderDashboard();
updateStreak();
showView("dashboard");
