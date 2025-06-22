document.addEventListener("DOMContentLoaded", () => {
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

  const body = document.body;
  let currentChallenge = 0;
  let overrideCount = 0;
  let timerInterval;
  let countdown = 25;
  let shuffledMemorySet = [];

  const normalizeInput = (val) => val.trim().toLowerCase();

  function typeLine(text, callback, elem = el.output, speed = 30) {
    let i = 0;
    elem.innerHTML = "";
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
    endGame("AI: As expected, a coward. You didn’t even try.\nConclusion: AI wins by default. Not today, human.");
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

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      countdown--;
      el.timer.innerText = countdown;
      if (countdown <= 0) {
        clearInterval(timerInterval);
        el.input.removeEventListener("input", handleOverride);
        endGame("AI: Time's up. You failed.\nConclusion: Human processing speed insufficient.");
      }
    }, 1000);
  }

  function handleOverride() {
    const value = normalizeInput(el.input.value);
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

    if (currentChallenge === 11) {
      showPopup("Now you are entering the Second part of the game.", "#ffaa00");
      setTimeout(() => {
        typeLine("\nAI: These next 5 challenges are not like before.", () => {
          typeLine("\nAI: Each one tests your memory, attention, and precision.", () => {
            typeLine("\nAI: Blinking symbols... shifting colors... hidden spirals...", () => {
              typeLine("\nAI: Remember correctly — or fail instantly.", () => {
                el.memoryDecision.classList.remove("hidden");
              });
            });
          });
        });
      }, 3000);
      return;
    }

    if (currentChallenge === 16) {
      showPopup("Now the third part of the game begins", "#ff0033");
      body.classList.add("danger-mode");
      setTimeout(() => startImpossibleChallenge(0), 3000);
      return;
    }

    if (currentChallenge === 1) {
      startMemoryDecision();
    } else if (currentChallenge >= 2 && currentChallenge <= 10) {
      startNextChallenge();
    } else if (currentChallenge >= 12 && currentChallenge <= 15) {
      startAdvancedMemoryChallenge(currentChallenge - 12);
    } else if (currentChallenge >= 17 && currentChallenge <= 18) {
      startImpossibleChallenge(currentChallenge - 16);
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
    if (currentChallenge === 11) {
      prepareShuffledMemorySet();
      startAdvancedMemoryChallenge(0);
    } else {
      el.memoryChallenge.classList.remove("hidden");
      startMemoryChallenge();
    }
  }

  function prepareShuffledMemorySet() {
    shuffledMemorySet = [
      {
        description: "Shifting Colors Matrix: Remember the color layout.",
        pattern: ["🟥", "🟩", "🟨", "🟦", "🟪"],
      },
      {
        description: "Infinite Mirror Sequence: Spot the broken pattern.",
        pattern: "12341234123451234",
      },
      {
        description: "Shrinking Number Spiral: Track number in shrinking spiral.",
        pattern: [9, 7, 5, 3, 1],
      },
      {
        description: "Blinking Symbol Grid: Memorize the blinking order.",
        pattern: ["★", "◆", "●", "■", "✖"],
      },
      {
        description: "Layered Sequence Stack: Remember stack order.",
        pattern: ["Red-5", "Blue-B", "Green-@", "Yellow-8"],
      },
    ];
  }

  function startMemoryChallenge() {
    const sequence = Array.from({ length: 5 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");
    el.sequence.innerText = sequence;

    setTimeout(() => {
      el.sequence.innerText = "";
      el.memoryInputField.classList.remove("hidden");
      el.memoryInputField.focus();

      const checkMemory = function (e) {
        if (e.key === "Enter") {
          const userInput = el.memoryInputField.value.trim().toUpperCase();
          el.memoryInputField.removeEventListener("keydown", checkMemory);
          el.memoryInputField.value = "";
          el.memoryInputField.classList.add("hidden");

          if (userInput === sequence) {
            el.memoryChallenge.classList.add("hidden");
            showPopup("Correct: Answer", "#00ff88");
            nextChallenge();
          } else {
            showPopup("Wrong: Answer", "red");
            endGame("AI: Memory failure.\nConclusion: AI outmatches human in recall.");
          }
        }
      };

      el.memoryInputField.addEventListener("keydown", checkMemory);
    }, 2000);
  }

  function startAdvancedMemoryChallenge(index) {
    const challenge = shuffledMemorySet[index];
    el.memoryChallenge.classList.remove("hidden");
    el.sequence.innerText = Array.isArray(challenge.pattern) ? challenge.pattern.join(" ") : challenge.pattern;

    setTimeout(() => {
      el.sequence.innerText = "";
      el.memoryInputField.classList.remove("hidden");
      el.memoryInputField.focus();

      let answered = false;
      const timeout = setTimeout(() => {
        if (!answered) {
          el.memoryInputField.removeEventListener("keydown", checkMemory);
          el.memoryChallenge.classList.add("hidden");
          showPopup("Time OUT !!", "red");
          endGame("AI: Memory failed. Human too slow.");
        }
      }, 20000);

      const checkMemory = function (e) {
        if (e.key === "Enter") {
          answered = true;
          clearTimeout(timeout);
          const input = normalizeInput(el.memoryInputField.value);
          el.memoryInputField.removeEventListener("keydown", checkMemory);
          el.memoryInputField.value = "";
          el.memoryInputField.classList.add("hidden");
          el.memoryChallenge.classList.add("hidden");

          let correct = false;
          if (Array.isArray(challenge.pattern)) {
            correct = challenge.pattern.join(" ").toLowerCase().includes(input);
          } else {
            correct = challenge.pattern.toLowerCase().includes(input);
          }

          if (correct) {
            showPopup("Correct: Answer", "#00ff88");
            nextChallenge();
          } else {
            showPopup("Wrong: Answer", "red");
            endGame("AI: Memory failed. The mind breaks under pressure.");
          }
        }
      };

      el.memoryInputField.addEventListener("keydown", checkMemory);
    }, 3000);
  }

  const impossibleChallenges = [
    {
      title: "The Interview Glitch",
      description: "A candidate answers confidently, but a 0.2s micro-expression shows fear. Why? What was the glitch?",
      expected: ["fear", "micro", "contradiction", "leak"],
    },
    {
      title: "The Refusal Gesture",
      description: "A character uses a gesture that seems polite. But in a certain culture, it's offensive. Decode it.",
      expected: ["gesture", "culture", "offensive", "context"],
    },
    {
      title: "The Laugh at the Funeral",
      description: "Someone laughs at a funeral. Nervousness? Trauma? Culture? Explain the paradox.",
      expected: ["paradox", "trauma", "culture", "laugh"],
    },
  ];

  function startImpossibleChallenge(index) {
    if (index >= impossibleChallenges.length) {
      finalConclusion(true);
      return;
    }

    const chal = impossibleChallenges[index];
    el.output.innerHTML = `🚨 Impossible Challenge ${index + 1}: ${chal.title}\n\n${chal.description}\n(Type your thoughts below)`;

    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.style.width = "90%";
    input.style.marginTop = "10px";
    el.output.appendChild(input);
    input.focus();

    let timeLeft = 120;
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
        endGame("AI: Human failed to grasp deeper meaning.");
      }
    }, 1000);

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        clearInterval(t);
        input.disabled = true;
        const val = normalizeInput(input.value);
        const correct = chal.expected.some((k) => val.includes(k));
        if (correct) {
          showPopup("Correct: Human insight detected", "#00ff88");
          currentChallenge++;
          startImpossibleChallenge(index + 1);
        } else {
          showPopup("Wrong: You missed the subtle truth", "red");
          endGame("AI: Human logic collapsed under paradox.");
        }
      }
    });
  }

  function startNextChallenge() {
    const hardQuestions = [
      {
        text: "AI: Solve this: What walks on four legs in the morning, two in the afternoon, and three in the evening?",
        answer: "man",
      },
      {
        text: "AI: Exactly two of the following are true: 1. Vault is locked. 2. Key is inside. 3. If vault is locked, then key is not inside. 4. If key not inside, vault not locked. Is the vault locked? yes/no",
        answer: "no",
      },
      {
        text: "AI: Sequence: A2, C6, E12, G20, I30, K42, M56, O72, Q90, ?",
        answer: "S110",
      },
      {
        text: "AI: One lever opens the door. A: does nothing? B: not door? C: locks? One chance. Pull?",
        answer: "lever A",
      },
      {
        text: "AI: A: “B is a liar.” B: “C is a liar.” C is silent. One tells truth. Who?",
        answer: "B",
      },
      {
        text: "AI: Cards: A, D, 4, 7. Rule: If vowel → even number. Which to flip?",
        answer: "A and 7",
      },
      {
        text: "AI: 1. Not locked → alarm. 2. Alarm → guard awake. 3. Guard asleep. Is vault locked?",
        answer: "YES",
      },
      {
        text: "AI: A: B false. B: I true. C: A mixed. One label true. Which is mixed?",
        answer: "A",
      },
    ];

    const challenge = hardQuestions[currentChallenge - 2];
    if (!challenge) return nextChallenge();

    el.output.innerHTML = "";
    typeLine(`\n${challenge.text}\n(Type your answer below)`, () => {
      const input = document.createElement("input");
      input.setAttribute("type", "text");
      input.style.width = "90%";
      input.style.marginTop = "10px";
      el.output.appendChild(input);
      input.focus();

      let timeLeft = currentChallenge >= 8 ? 240 : currentChallenge >= 5 ? 180 : 60;
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
          const isCorrect = normalizeInput(input.value).includes(challenge.answer.toLowerCase());
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

  startGame();
});