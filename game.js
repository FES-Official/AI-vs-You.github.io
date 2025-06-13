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
};

let currentChallenge = 0;
let overrideCount = 0;
let timerInterval;
let countdown = 25;
const body = document.body;

function typeLine(text, callback, elem = el.output, speed = 30) {
  let i = 0;
  function type() {
    if (i < text.length) {
      elem.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else if (callback) callback();
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
  finalConclusion(false);
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

  el.input.removeEventListener("input", handleOverride);
  el.input.addEventListener("input", handleOverride);

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
    el.input.value = "";
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

  // Show message after 10th challenge
  if (currentChallenge === 11) {
    showPopup("Now you are entering the Second part of the game.", "#ffaa00");

    setTimeout(() => {
      typeLine("\nAI: These next 5 challenges are not like before.", () => {
        typeLine(
          "\nAI: Each one tests your memory, attention, and precision.",
          () => {
            typeLine(
              "\nAI: Blinking symbols... shifting colors... hidden spirals...",
              () => {
                typeLine(
                  "\nAI: Remember correctly — or fail instantly.",
                  () => {
                    startAdvancedMemoryChallenge(currentChallenge - 11); // start 11th challenge
                  }
                );
              }
            );
          }
        );
      });
    }, 5000); // Delay for dramatic effect
    return;
  }

  if (currentChallenge === 1) {
    startMemoryDecision();
  } else if (currentChallenge >= 2 && currentChallenge <= 10) {
    startNextChallenge();
  } else if (currentChallenge >= 11 && currentChallenge <= 15) {
    startAdvancedMemoryChallenge(currentChallenge - 11);
  } else {
    finalConclusion(true);
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
    el.memoryInputField.classList.remove("hidden");
    el.memoryInputField.focus();

    function checkMemory(e) {
      if (e.key === "Enter") {
        const userInput = el.memoryInputField.value.trim().toUpperCase();
        el.memoryInputField.removeEventListener("keydown", checkMemory);
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

    el.memoryInputField.removeEventListener("keydown", checkMemory);
    el.memoryInputField.addEventListener("keydown", checkMemory);
  }, 2000);
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
      text: "AI: Sequence: A2, C6, E12, G20, I30, K42, M56, O72, Q90, ? What comes next?",
      answer: "S110",
    },
    {
      text: "AI: You enter a chamber with three levers labeled A, B, and C. Only **one lever** opens the door to escape. One lever does **nothing**. One lever **locks the door permanently** if pulled. You are allowed to **pull only one lever** — no second chances. Before pulling, a screen flashes this logic hint: - If lever A does nothing, then lever B is not the door. - If lever B opens the door, then lever C locks it. Which lever do you pull?",
      answer: "lever A",
    },
    {
      text: "AI: Let’s test raw logic. Three people — A, B, and C — are seated at a round table. Each of them either always tells the truth or always lies. A says: “B is a liar.”  B says: “C is a liar.”  C says nothing. Who is the truth-teller",
      answer: "B",
    },
    {
      text: "AI: Let’s test your ability to reason without emotion. Four cards are on the table. Each has a number on one side and a letter on the other. You see: **A**, **D**, **4**, **7**. Rule: “If a card has a vowel on one side, it must have an even number on the other.” Which cards do you need to flip to test the rule? Type your answer using letters/numbers",
      answer: "A and 7",
    },
    {
      text: "AI: Let’s see if your mind can survive pure logic. Three statements are made about a locked vault: 1. If the vault is not locked, then the alarm is on. 2. If the alarm is on, the guard is awake. 3. The guard is asleep. Is the vault locked? Type: YES or NO",
      answer: "YES",
    },
    {
      text: "AI: I have simulated over 10 trillion logical systems, but never solved this. There are three boxes: - One contains only statements that are true. - One contains only statements that are false. - One contains a **mix** of true and false statements. Each box has a label on the front: **Box A**: Box B is the one with only false statements. **Box B**: This box is the one with only true statements. **Box C**: Box A is the one with mixed statements. Only **one** label is telling the truth. Which box contains the mixed statements? Type: A, B, or C",
      answer: "A",
    },
  ];

  const challenge = hardQuestions[currentChallenge - 2];
  if (!challenge) return nextChallenge(true);

  typeLine(`\n${challenge.text}\n(Type your answer below)`, () => {
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

    const t = setInterval(() => {
      timeLeft--;
      timeDisplay.innerText = `Time left: ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(t);
        input.disabled = true;
        showPopup("Time OUT !!", "red");
        endGame("AI: You ran out of time. Human cognition too slow.");
      }
    }, 1000);

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        clearInterval(t);
        input.disabled = true;
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

function startAdvancedMemoryChallenge(index) {
  const memorySet = [
    {
      description: "Shifting Colors Matrix: Remember the color layout.",
      pattern: ["🟥", "🟩", "🟨", "🟦", "🟪"],
    },
    {
      description:
        "Infinite Mirror Sequence: Spot the difference in repeating pattern.",
      pattern: "12341234123451234", // Break at position 13
    },
    {
      description: "Shrinking Number Spiral: Track number in shrinking spiral.",
      pattern: [9, 7, 5, 3, 1],
    },
    {
      description: "Blinking Symbol Grid: Memorize order of blinking symbols.",
      pattern: ["★", "◆", "●", "■", "✖"],
    },
    {
      description:
        "Layered Sequence Stack: Remember stacked layers in right order.",
      pattern: ["Red-5", "Blue-B", "Green-@", "Yellow-8"],
    },
  ];

  const challenge = memorySet[index];
  typeLine(`\nAI: Memory Challenge – ${challenge.description}`, () => {
    setTimeout(() => {
      let display = Array.isArray(challenge.pattern)
        ? challenge.pattern.join(" ")
        : challenge.pattern;

      alert(display); // Quick simulation – replace with grid/animation later
      const answer = prompt("Enter the pattern (or key difference you saw):");

      if (answer && display.includes(answer.trim())) {
        showPopup("Correct: Answer", "#00ff88");
        nextChallenge();
      } else {
        showPopup("Wrong: Answer", "red");
        endGame("AI: Memory failed. The mind breaks under pressure.");
        finalConclusion(true);
      }
    }, 1000);
  });
}

function finalConclusion(passedAll) {
  const conclusionBox = document.getElementById("conclusion");
  conclusionBox.classList.remove("hidden");
  conclusionBox.classList.toggle("conclusion-win", passedAll);
  conclusionBox.classList.toggle("conclusion-fail", !passedAll);

  conclusionBox.innerText = passedAll
    ? "✅ AI: You’ve completed the impossible...\nConclusion: While AI is powerful, your mind proved exceptional. Humanity still has its edge — for now."
    : "❌ AI: Challenge incomplete.\nConclusion: AI may not rule yet, but your failure shows we are close.";

  el.retry.classList.remove("hidden");
}

function endGame(message) {
  el.output.innerHTML += `<br>${message}`;
  const conclusionBox = document.getElementById("conclusion");
  conclusionBox.classList.remove("hidden", "conclusion-win");
  conclusionBox.classList.add("conclusion-fail");

  conclusionBox.innerText = message.includes("coward")
    ? "❌ Conclusion: You chose not to face the challenge. AI dominates without resistance."
    : "❌ Conclusion: Human performance fell short. AI supremacy inches closer.";

  el.retry.classList.remove("hidden");
}

// Start game
startGame();
