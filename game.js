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
let shuffledMemorySet = [];

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