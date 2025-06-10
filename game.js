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
  memoryInputField: document.getElementById("memoryInput"),
  retry: document.getElementById("retry"),
  acceptTypingBtn: document.getElementById("acceptTyping"), // Assuming you have these buttons
  declineChallengeBtn: document.getElementById("declineChallenge"), // Assuming you have these buttons
  acceptMemoryBtn: document.getElementById("acceptMemory"), // Assuming you have these buttons
};

// Check if all essential elements are present
for (const key in el) {
  if (el[key] === null) {
    console.error(`Error: Element with ID '${key}' not found.`);
    // You might want to halt game execution or provide a user-friendly error.
    // For now, we'll just log and continue, but this could lead to runtime errors.
  }
}

let currentChallenge = 0;
let overrideCount = 0;
let timerInterval;
let countdown = 25;
const body = document.body;

function typeLine(text, callback, elem = el.output, speed = 40) {
  let i = 0;
  elem.innerHTML = ""; // Clear previous text before typing
  function type() {
    if (i < text.length) {
      elem.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else if (callback) {
      callback();
    }
  }
  type();
}

function showPopup(message, color = "#00ff88") {
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerText = message;
  popup.style.color = color;
  popup.style.borderColor = color;
  body.appendChild(popup);
  setTimeout(() => popup.remove(), 2000);
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
  el.decision.classList.add("hidden");
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

  // Ensure only one event listener is active at a time
  el.input.removeEventListener("input", handleOverride);
  el.input.addEventListener("input", handleOverride);

  clearInterval(timerInterval); // Clear any existing timer before starting a new one
  timerInterval = setInterval(() => {
    countdown--;
    el.timer.innerText = countdown;
    if (countdown <= 0) {
      clearInterval(timerInterval);
      el.input.removeEventListener("input", handleOverride);
      endGame(
        "AI: Time's up. You failed.\nConclusion: Human processing speed insufficient."
      );
    }
  }, 1000);
}

function handleOverride() {
  const value = el.input.value.trim().toLowerCase();
  if (value === "override") {
    overrideCount++;
    el.input.value = ""; // Clear input immediately after successful override
    el.progress.innerText = `Override typed: ${overrideCount} / 20`;
  }
  if (overrideCount >= 20) {
    clearInterval(timerInterval);
    el.input.removeEventListener("input", handleOverride);
    el.challenge.classList.add("hidden");
    showPopup("You did IT !!");
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
  el.memoryInputField.value = ""; // Clear previous input

  setTimeout(() => {
    el.sequence.innerText = "";
    el.memoryInputField.classList.remove("hidden");
    el.memoryInputField.focus();

    // Remove existing event listener before adding to prevent duplicates
    el.memoryInputField.removeEventListener("keydown", checkMemory);
    el.memoryInputField.addEventListener("keydown", checkMemory);
  }, 2000);

  function checkMemory(e) {
    if (e.key === "Enter") {
      const userInput = el.memoryInputField.value.trim().toUpperCase();
      el.memoryInputField.removeEventListener("keydown", checkMemory); // Remove after checking
      el.memoryInputField.value = "";

      if (userInput === sequence) {
        el.memoryChallenge.classList.add("hidden");
        showPopup("Correct: Answer", "#00ff88");
        nextChallenge();
      } else {
        showPopup("Wrong: Answer", "red");
        endGame(
          "AI: Memory failure.\nConclusion: AI outmatches human in recall."
        );
      }
    }
  }
}

function startNextChallenge() {
  const hardQuestions = [
    {
      text: "AI: Solve this: What walks on four legs in the morning, two in the afternoon, and three in the evening?",
      answer: "man",
    },
    {
      text: "AI: Let’s see if your human reasoning can transcend calculation. A sealed vault opens **only** under one condition: Exactly **two** of the following statements are true — no more, no less. 1. The vault is locked. 2. The key is inside the vault. 3. If the vault is locked, then the key is not inside. 4. If the key is not inside, then the vault is not locked. Is the vault locked? Type: yes or no",
      answer: "no",
    },
    {
      text: "AI: This is where humans shine — patterns in chaos. Sequence: A2, C6, E12, G20, I30, K42, M56, O72, Q90, ? What comes next?",
      answer: "S110",
    },
    {
      text: "AI: You enter a chamber with three levers labeled A, B, and C. Only **one lever** opens the door to escape. One lever does **nothing**. One lever **locks the door permanently** if pulled. You are allowed to **pull only one lever** — no second chances. Before pulling, a screen flashes this logic hint: - If lever A does nothing, then lever B is not the door. - If lever B opens the door, then lever C locks it. Which lever do you pull?",
      answer: "lever A",
    },
    {
      text: "AI: Three people — A, B, and C — are seated at a round table. Each of them either always tells the truth or always lies. A says: “B is a liar.”  B says: “C is a liar.”  C says nothing. Who is the truth-teller?",
      answer: "B",
    },
    {
      text: "AI: Four cards are on the table. Each has a number on one side and a letter on the other. You see: **A**, **D**, **4**, **7**. Rule: “If a card has a vowel on one side, it must have an even number on the other.” Which cards do you need to flip to test the rule? Type your answer using letters/numbers",
      answer: "A and 7",
    },
    {
      text: "AI: Three statements are made about a locked vault: 1. If the vault is not locked, then the alarm is on. 2. If the alarm is on, the guard is awake. 3. The guard is asleep. Is the vault locked? Type: YES or NO",
      answer: "YES",
    },
    {
      text: "AI: I have simulated over 10 trillion logical systems, but never solved this. There are three boxes: - One contains only statements that are true. - One contains only statements that are false. - One contains a **mix** of true and false statements. Each box has a label on the front: **Box A**: Box B is the one with only false statements. **Box B**: This box is the one with only true statements. **Box C**: Box A is the one with mixed statements. Only **one** label is telling the truth. Which box contains the mixed statements? Type: A, B, or C",
      answer: "A",
    },
  ];

  const challenge = hardQuestions[currentChallenge - 2];
  if (!challenge) {
    return finalConclusion(true); // If no more challenges, conclude as success
  }

  typeLine(`\n${challenge.text}\n(Type your answer below)`, () => {
    // Clear previous input field and timer display if they exist
    const oldInput = el.output.querySelector("input[type='text']");
    if (oldInput) oldInput.remove();
    const oldTimeDisplay = el.output.querySelector("p");
    if (oldTimeDisplay) oldTimeDisplay.remove();

    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.style.width = "90%";
    input.style.marginTop = "10px";
    el.output.appendChild(input);
    input.focus();

    let timeLeft =
      currentChallenge >= 8 ? 240 : currentChallenge >= 5 ? 180 : 60;

    const timeDisplay = document.createElement("p");
    timeDisplay.innerText = `Time left: ${timeLeft}s`;
    el.output.appendChild(timeDisplay);

    let challengeTimer; // Use a distinct variable for the challenge timer
    clearInterval(challengeTimer); // Clear any previous challenge timer
    challengeTimer = setInterval(() => {
      timeLeft--;
      timeDisplay.innerText = `Time left: ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(challengeTimer);
        input.disabled = true;
        showPopup("Time OUT !!", "red");
        endGame("AI: You ran out of time. Human cognition too slow.");
      }
    }, 1000);

    input.addEventListener("keydown", function handler(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        clearInterval(challengeTimer);
        input.disabled = true;
        input.removeEventListener("keydown", handler); // Remove listener after use

        const isCorrect = input.value
          .trim()
          .toLowerCase()
          .includes(challenge.answer.toLowerCase());

        if (isCorrect) {
          showPopup("Correct: Answer", "#00ff88");
          nextChallenge();
        } else {
          showPopup("Wrong: Answer", "red");
          endGame("AI: Incorrect. The machine prevails.");
        }
      }
    });
  });
}

function finalConclusion(passedAll) {
  const conclusionBox = document.getElementById("conclusion");
  if (!conclusionBox) {
    console.error("Error: Conclusion box element not found.");
    return;
  }
  conclusionBox.classList.remove("hidden");
  conclusionBox.classList.toggle("conclusion-win", passedAll);
  conclusionBox.classList.toggle("conclusion-fail", !passedAll);

  conclusionBox.innerText = passedAll
    ? "✅ AI: You’ve completed the impossible...\nConclusion: While AI is powerful, your mind proved exceptional. Humanity still has its edge — for now."
    : "❌ AI: Challenge incomplete.\nConclusion: AI may not rule yet, but your failure shows we are close.";

  el.retry.classList.remove("hidden");
  if (el.retry) {
    el.retry.removeEventListener("click", restartGame); // Prevent multiple listeners
    el.retry.addEventListener("click", restartGame);
  }
}

function endGame(message) {
  el.output.innerHTML += `<br>${message}`;
  const conclusionBox = document.getElementById("conclusion");
  if (!conclusionBox) {
    console.error("Error: Conclusion box element not found.");
    return;
  }
  conclusionBox.classList.remove("hidden", "conclusion-win");
  conclusionBox.classList.add("conclusion-fail");

  conclusionBox.innerText = message.includes("coward")
    ? "❌ Conclusion: You chose not to face the challenge. AI dominates without resistance."
    : "❌ Conclusion: Human performance fell short. AI supremacy inches closer.";

  el.retry.classList.remove("hidden");
  if (el.retry) {
    el.retry.removeEventListener("click", restartGame); // Prevent multiple listeners
    el.retry.addEventListener("click", restartGame);
  }
}

function restartGame() {
  // Reset game state
  currentChallenge = 0;
  overrideCount = 0;
  countdown = 25;
  clearInterval(timerInterval); // Clear any active timers
  // Clear any dynamically added elements
  el.output.innerHTML = "";
  if (el.input) el.input.value = "";
  if (el.memoryInputField) el.memoryInputField.value = "";

  // Hide all challenge/decision elements
  el.decision.classList.add("hidden");
  el.challenge.classList.add("hidden");
  el.memoryDecision.classList.add("hidden");
  el.memoryChallenge.classList.add("hidden");
  const conclusionBox = document.getElementById("conclusion");
  if (conclusionBox) conclusionBox.classList.add("hidden");
  if (el.retry) el.retry.classList.add("hidden");
  if (el.output.querySelector("input[type='text']")) {
    el.output.querySelector("input[type='text']").remove();
  }
  if (el.output.querySelector("p")) {
    el.output.querySelector("p").remove();
  }

  startGame(); // Restart the game sequence
}

// Initializing event listeners for decision buttons
// Assuming you have buttons with these IDs in your HTML
if (el.acceptTypingBtn) {
  el.acceptTypingBtn.addEventListener("click", acceptTyping);
}
if (el.declineChallengeBtn) {
  el.declineChallengeBtn.addEventListener("click", declineChallenge);
}
if (el.acceptMemoryBtn) {
  el.acceptMemoryBtn.addEventListener("click", acceptMemory);
}

// Start game
startGame();

// --- Restrictions (Consider the implications of these restrictions for user experience) ---
document.addEventListener("contextmenu", (e) => e.preventDefault()); // Disables right-click menu
document.addEventListener("selectstart", (e) => e.preventDefault()); // Disables text selection
document.addEventListener("keydown", (e) => {
  // Prevents F12 (Dev Tools), Shift, Meta (Windows/Command) keys
  if (["F12", "Shift", "Meta"].includes(e.key)) {
    document.body.style.filter = "blur(10px)";
    e.preventDefault();
  }
});
document.addEventListener("keyup", (e) => {
  // Blurs screen on Print Screen
  if (e.key === "PrintScreen") {
    document.body.style.filter = "blur(10px)";
  }
});
