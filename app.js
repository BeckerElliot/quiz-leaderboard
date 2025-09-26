import { questions } from "./questions.js";

/* ---------- State ---------- */
let currentIndex = 0;
let score = 0;
let playerName = "";
const LB_KEY = "quiz_leaderboard_v1";

/* ---------- DOM ---------- */
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startForm = document.getElementById("start-form");
const playerNameInput = document.getElementById("player-name");

const questionText = document.getElementById("question-text");
const choicesEl = document.getElementById("choices");
const nextBtn = document.getElementById("next-btn");
const progressEl = document.getElementById("progress");
const scoreEl = document.getElementById("score");
const finalScoreEl = document.getElementById("final-score");

const openLbBtn = document.getElementById("open-leaderboard");
const lbDialog = document.getElementById("leaderboard-dialog");
const lbList = document.getElementById("leaderboard-list");
const closeLbBtn = document.getElementById("close-leaderboard");
const clearLbBtn = document.getElementById("clear-lb");

const saveScoreBtn = document.getElementById("save-score");
const playAgainBtn = document.getElementById("play-again");

/* ---------- Helpers: Leaderboard ---------- */
function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(LB_KEY)) || [];
  } catch {
    return [];
  }
}
function setLeaderboard(list) {
  localStorage.setItem(LB_KEY, JSON.stringify(list));
}
function addToLeaderboard(name, score) {
  const list = getLeaderboard();
  list.push({ name, score, ts: Date.now() });
  list.sort((a, b) => b.score - a.score || a.ts - b.ts);
  setLeaderboard(list.slice(0, 10));
}
function renderLeaderboard() {
  const list = getLeaderboard();
  lbList.innerHTML = "";
  if (list.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No scores yet — be the first!";
    lbList.appendChild(li);
    return;
  }
  list.forEach((entry, idx) => {
    const li = document.createElement("li");
    li.textContent = `#${idx + 1} — ${entry.name}: ${entry.score}`;
    lbList.appendChild(li);
  });
}

/* ---------- Quiz Flow ---------- */
function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

function startQuiz(name) {
  playerName = name.trim();
  if (!playerName) return;

  currentIndex = 0;
  score = 0;

  hide(startScreen);
  hide(resultScreen);
  show(quizScreen);

  scoreEl.textContent = `Score: ${score}`;
  nextBtn.disabled = true;
  renderQuestion();
}

function renderQuestion() {
  const q = questions[currentIndex];
  progressEl.textContent = `Question ${currentIndex + 1} / ${questions.length}`;
  questionText.textContent = q.text;

  choicesEl.innerHTML = "";
  q.choices.forEach((choiceText, i) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.type = "button";
    btn.textContent = choiceText;
    btn.addEventListener("click", () => handleAnswer(i));
    choicesEl.appendChild(btn);
  });
  nextBtn.disabled = true;
}

function handleAnswer(index) {
  const q = questions[currentIndex];
  const isCorrect = index === q.correctIndex;

  // Lock choices; show feedback
  [...choicesEl.children].forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correctIndex) btn.classList.add("correct");
    if (i === index && !isCorrect) btn.classList.add("incorrect");
  });

  if (isCorrect) {
    score += 1;
    scoreEl.textContent = `Score: ${score}`;
  }

  nextBtn.disabled = false;
}

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex >= questions.length) {
    endQuiz();
  } else {
    renderQuestion();
  }
}

function endQuiz() {
  hide(quizScreen);
  show(resultScreen);
  finalScoreEl.textContent = `You scored ${score}/${questions.length}`;
}

/* ---------- Events ---------- */
startForm.addEventListener("submit", (e) => {
  e.preventDefault();
  startQuiz(playerNameInput.value);
});

nextBtn.addEventListener("click", nextQuestion);

saveScoreBtn.addEventListener("click", () => {
  addToLeaderboard(playerName, score);
  renderLeaderboard();
  if (!lbDialog.open) lbDialog.showModal();
});

playAgainBtn.addEventListener("click", () => {
  playerNameInput.value = playerName;
  hide(resultScreen);
  show(startScreen);
});

openLbBtn.addEventListener("click", () => {
  renderLeaderboard();
  lbDialog.showModal();
});
closeLbBtn.addEventListener("click", () => lbDialog.close());
clearLbBtn.addEventListener("click", () => {
  localStorage.removeItem(LB_KEY);
  renderLeaderboard();
});

/* ---------- Init ---------- */
renderLeaderboard();