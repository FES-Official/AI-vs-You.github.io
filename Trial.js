const el = {
  output: document.getElementById("output"),
  decision: document.getElementById("decision"),
  challenge: document.getElementById("challenge"),
  input: document.getElementById("input"),
  timer: document.getElementById("timer"),
  progress: document.getElementById("progress"),
  memoryDecision: document.getElementById("memory-decision"),
  memoryChallenge: document.getElementById("memory-challenge"),
  sequence: document.getElementById("sequence"),
  memoryInput: document.getElementById("memoryInput"),
  retry: document.getElementById("retry"),
};

let currentChallenge = 0;
let overrideCount = 0;
let timerInterval;
let countdown = 25;

function typeLine(text, callback) {
  let i = 0;
  function type() {
    if (i < text.length) {
      const char = text[i++];
      if (char === "\n") {
        el.output.innerHTML += "<br>";
      } else if (char === " ") {
        el.output.innerHTML += "&nbsp;";
      } else {
        el.output.innerHTML += char;
      }
      setTimeout(type, 25);
    } else if (callback) callback();
  }
  type();
}

function startGame() {
  typeLine("AI: You dare challenge me?\n", () => {
    typeLine(
      "AI: If you want control, type 'override' 20 times in 25s before I shut you down.\n",
      () => {
        el.decision.classList.remove("hidden");
      }
    );
  });
}

function declineChallenge() {
  endGame(
    "AI: As expected, a coward. You didn’t even try.\nConclusion: AI wins by default. Not today, human."
  );
}

function acceptTyping() {
  el.decision.classList.add("hidden");
  el.challenge.classList.remove("hidden");
  startTypingChallenge();
}

function startTypingChallenge() {
  overrideCount = 0;
  countdown = 25;
  el.progress.innerText = `Override typed: 0 / 20`;
  el.timer.innerText = countdown;

  el.input.value = "";
  el.input.focus();

  timerInterval = setInterval(() => {
    countdown--;
    el.timer.innerText = countdown;
    if (countdown <= 0) {
      clearInterval(timerInterval);
      endGame(
        "AI: Time's up. You failed.\nConclusion: Human processing speed insufficient."
      );
    }
  }, 1000);

  el.input.addEventListener("input", handleOverride);
}

function handleOverride() {
  const value = el.input.value.trim();
  if (value === "override") {
    overrideCount++;
    el.input.value = "";
    el.progress.innerText = `Override typed: ${overrideCount} / 20`;
  }

  if (overrideCount >= 20) {
    clearInterval(timerInterval);
    el.input.removeEventListener("input", handleOverride);
    el.challenge.classList.add("hidden");
    nextChallenge();
  }
}

function nextChallenge() {
  currentChallenge++;
  if (currentChallenge === 1) {
    startMemoryDecision();
  } else if (currentChallenge === 10) {
    finalConclusion(true);
  } else {
    startNextChallenge();
  }
}

function startMemoryDecision() {
  typeLine("\nAI: Impressive. Let's test your memory.\n", () => {
    el.memoryDecision.classList.remove("hidden");
  });
}

function acceptMemory() {
  el.memoryDecision.classList.add("hidden");
  el.memoryChallenge.classList.remove("hidden");
  startMemoryChallenge();
}

function startMemoryChallenge() {
  const sequence = Array.from({ length: 5 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");

  el.sequence.innerText = sequence;

  setTimeout(() => {
    el.sequence.innerText = "";
    el.memoryInput.classList.remove("hidden");
    el.memoryInput.focus();

    el.memoryInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (el.memoryInput.value.trim().toUpperCase() === sequence) {
          el.memoryChallenge.classList.add("hidden");
          el.memoryInput.value = "";
          nextChallenge();
        } else {
          endGame(
            "AI: Memory failure.\nConclusion: AI outmatches human in recall."
          );
        }
      }
    });
  }, 3000);
}

function startNextChallenge() {
  let challengeText = "";
  let question = "";
  let answer = "";

  const hardQuestions = [
    {
      text: "AI: Solve this: What walks on four legs in the morning, two in the afternoon, and three in the evening?",
      answer: "man",
    },
    {
      text: "AI: What has keys but can't open locks?",
      answer: "piano",
    },
    {
      text: "AI: Imagine something that doesn't exist but can change the world. What is it?",
      answer: "imagination",
    },
    {
      text: "AI: Deduce this: I speak without a mouth and hear without ears. What am I?",
      answer: "echo",
    },
    {
      text: "AI: You enter a room with 2 doors. One leads to freedom, the other to doom. One guard always lies, the other always tells the truth. You can ask one question. What do you ask?",
      answer: "which door would the other guard say leads to doom",
    },
    {
      text: "AI: A paradox. Can you solve? This sentence is false.",
      answer: "paradox",
    },
    {
      text: "AI: You are the last hope of humanity. Tell me one thing AI will never understand.",
      answer: "emotion",
    },
    {
      text: "AI: Final challenge: What question has no answer, not even in the multiverse?",
      answer: "what is the purpose of existence",
    },
  ];

  const challenge = hardQuestions[currentChallenge - 2];
  if (!challenge) return finalConclusion(true);

  challengeText = challenge.text;
  answer = challenge.answer;

  typeLine(`\n${challengeText}\n(Type your answer below)`, () => {
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.style.width = "100%";
    input.style.marginTop = "10px";
    el.output.appendChild(input);
    input.focus();

    let timeLeft =
      currentChallenge >= 8 ? 240 : currentChallenge >= 5 ? 180 : 60;
    const timeDisplay = document.createElement("p");
    timeDisplay.innerText = `Time left: ${timeLeft}s`;
    el.output.appendChild(timeDisplay);

    const t = setInterval(() => {
      timeLeft--;
      timeDisplay.innerText = `Time left: ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(t);
        endGame("AI: You ran out of time. Human cognition too slow.");
      }
    }, 1000);

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        clearInterval(t);
        if (input.value.trim().toLowerCase().includes(answer)) {
          input.disabled = true;
          nextChallenge();
        } else {
          endGame("AI: Incorrect. The machine prevails.");
        }
      }
    });
  });
}

function finalConclusion(passedAll) {
  const conclusionBox = document.getElementById("conclusion");
  conclusionBox.classList.remove("hidden");

  if (passedAll) {
    conclusionBox.classList.add("conclusion-win");
    conclusionBox.innerText =
      "✅ AI: You’ve completed the impossible...\nConclusion: While AI is powerful, your mind proved exceptional. Humanity still has its edge — for now.";
  } else {
    conclusionBox.classList.add("conclusion-fail");
    conclusionBox.innerText =
      "❌ AI: Challenge incomplete.\nConclusion: AI may not rule yet, but your failure shows we are close.";
  }

  el.retry.classList.remove("hidden");
}

function endGame(message) {
  el.output.innerText += `\n${message}`;

  const conclusionBox = document.getElementById("conclusion");
  conclusionBox.classList.remove("hidden", "conclusion-win");
  conclusionBox.classList.add("conclusion-fail");

  if (message.includes("coward")) {
    conclusionBox.innerText =
      "❌ Conclusion: You chose not to face the challenge. AI dominates without resistance.";
  } else {
    conclusionBox.innerText =
      "❌ Conclusion: Human performance fell short. AI supremacy inches closer.";
  }

  el.retry.classList.remove("hidden");
}

// Start
startGame();
