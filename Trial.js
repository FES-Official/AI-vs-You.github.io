// Shortened DOM references
const $ = (id) => document.getElementById(id);
const refs = [
  "output",
  "decision",
  "memory-decision",
  "challenge",
  "input",
  "timer",
  "progress",
  "memory-challenge",
  "memoryInput",
  "sequence",
  "boss-decision",
  "boss-challenge",
  "boss-pattern",
  "bossInput",
  "boss-timer",
  "retry",
];
const el = Object.fromEntries(refs.map((id) => [id.replace(/-/g, ""), $(id)]));

// Game state
let overrideCount = 0,
  overrideGoal = 10,
  timeLeft = 20,
  countdown;
let gameStarted = false,
  memorySequence = "",
  bossPattern = "",
  bossTimer = 5,
  bossCountdown;

// Helpers
const typeLine = (text, cb, d = 30) => {
  let i = 0,
    iv = setInterval(() => {
      el.output.textContent += text[i++];
      if (i >= text.length) clearInterval(iv), cb?.();
    }, d);
};
const randSeq = (len) =>
  Array.from(
    { length: len },
    () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]
  ).join("");
const hideAll = () =>
  [
    "decision",
    "memoryDecision",
    "bossDecision",
    "challenge",
    "memoryChallenge",
    "bossChallenge",
  ].forEach((k) => el[k].classList.add("hidden"));
const showConclusion = (win) => {
  const p = document.createElement("p");
  p.style =
    "margin-top:1em;font-weight:bold;color:" + (win ? "limegreen" : "crimson");
  p.textContent = win
    ? "CONCLUSION: Humanity resists still. AI is not ready to take over... yet."
    : "CONCLUSION: Humans fail where precision matters. AI will rise.";
  el.output.appendChild(p);
};

// Game logic
function startGame() {
  typeLine("AI: You dare challenge me?\n", () => {
    typeLine(
      "AI: If you want control, type 'override' 10 times before I shut you down.\n",
      () => {
        el.decision.classList.remove("hidden");
      }
    );
  });
}

function acceptTyping() {
  el.decision.classList.add("hidden");
  el.challenge.classList.remove("hidden");
  el.input.focus();
  gameStarted = true;
  countdown = setInterval(() => {
    timeLeft--;
    el.timer.textContent = timeLeft;
    if (timeLeft <= 0) clearInterval(countdown), endGame(false);
  }, 1000);
}

function declineChallenge() {
  hideAll();
  typeLine("\nAI: Coward. You failed by fear alone.\n💀 GAME OVER 💀", () => {
    showConclusion(false);
    el.retry.classList.remove("hidden");
  });
}

el.input.addEventListener("input", () => {
  if (!gameStarted) return;
  if (el.input.value.trim().toLowerCase() === "override") {
    overrideCount++;
    el.input.value = "";
    el.progress.textContent = `Override typed: ${overrideCount} / ${overrideGoal}`;
    if (overrideCount >= overrideGoal) {
      clearInterval(countdown);
      el.input.disabled = true;
      gameStarted = false;
      typeLine(
        "\nAI: Impressive... but can your mind handle what comes next?\n",
        () => {
          el.memoryDecision.classList.remove("hidden");
        }
      );
    }
  }
});

function endGame(success) {
  el.challenge.classList.add("hidden");
  if (!success) {
    typeLine("\nAI: Time's up. You are too slow.\n💀 GAME OVER 💀", () => {
      showConclusion(false);
      el.retry.classList.remove("hidden");
    });
  }
}

function acceptMemory() {
  el.memoryDecision.classList.add("hidden");
  el.memoryChallenge.classList.remove("hidden");
  memorySequence = randSeq(6);
  el.sequence.textContent = memorySequence;
  setTimeout(() => {
    el.sequence.textContent = "[ Sequence Hidden ]";
    el.memoryInput.classList.remove("hidden");
    el.memoryInput.focus();
  }, 3000);
}

el.memoryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    el.memoryInput.disabled = true;
    const correct =
      el.memoryInput.value.trim().toUpperCase() === memorySequence;
    typeLine(
      correct
        ? "\nAI: No... this cannot be... but there is one final test.\n"
        : "\nAI: Incorrect. You're not as sharp as you thought.\n💀 GAME OVER 💀",
      () => {
        if (correct) el.bossDecision.classList.remove("hidden");
        else showConclusion(false), el.retry.classList.remove("hidden");
      }
    );
  }
});

function acceptBoss() {
  el.bossDecision.classList.add("hidden");
  el.bossChallenge.classList.remove("hidden");
  el.bossInput.focus();
  bossPattern = randSeq(4);
  el.bosspattern.textContent = bossPattern;
  el.bosstimer.textContent = bossTimer = 5;

  bossCountdown = setInterval(() => {
    el.bosstimer.textContent = --bossTimer;
    if (bossTimer <= 0) clearInterval(bossCountdown), endBoss(false);
  }, 1000);
}

el.bossInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    clearInterval(bossCountdown);
    el.bossInput.disabled = true;
    endBoss(el.bossInput.value.trim().toUpperCase() === bossPattern);
  }
});

function endBoss(success) {
  el.bossChallenge.classList.add("hidden");
  typeLine(
    success
      ? "\nAI: Impossible... You have defeated me.\n🏆 YOU WIN EVERYTHING 🏆"
      : "\nAI: Wrong... This was your last mistake.\n💀 GAME OVER 💀",
    () => {
      showConclusion(success);
      el.retry.classList.remove("hidden");
    }
  );
}

startGame();
