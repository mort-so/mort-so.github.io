console.log("DEPLOY TEST", new Date());
let remainingTime = 300; // 5 minutes
let oobTime = 0;
let lastHiddenTime = null;
let timer;
let currentStation = 0;
let score = 0;
let finished = false;
let userAnswers = {};
const savedOOB = localStorage.getItem("oobTime");
if (savedOOB !== null) oobTime = parseInt(savedOOB);


const savedTime = localStorage.getItem("remainingTime");
if (savedTime !== null) {
  remainingTime = parseInt(savedTime);
}

const stations = [
  { question: "Identify this bird: Bald Eagle", answer: "bald eagle" },
  { question: "Identify this insect: Monarch Butterfly", answer: "monarch butterfly" },
  { question: "Identify this reptile: Green Anole", answer: "green anole" }
];

function startTest() {
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("app").style.display = "block";

  localStorage.setItem("remainingTime", remainingTime);
  loadStation();
  startTimer();
}

function loadStation() {
  document.getElementById("station").innerText =
    `Station ${currentStation + 1}: ` + stations[currentStation].question;
}

async function submitAnswer() {
  let user = document.getElementById("answer").value.toLowerCase().trim();
  let correct = stations[currentStation].answer;
  userAnswers[currentStation] = user;

  if (user === correct) score++;

  document.getElementById("answer").value = "";
  currentStation++;

  if (currentStation < stations.length) {
    loadStation();
  } else {
    await finishTest();   // ← important
  }
}


function startTimer() {
  let lastTick = Date.now();

 timer = setInterval(async () => {
    let now = Date.now();
    let delta = Math.floor((now - lastTick) / 1000);
    lastTick = now;

    remainingTime -= delta;
    localStorage.setItem("remainingTime", remainingTime);

    updateTimerDisplay();

  if (remainingTime <= 0) await finishTest();
}, 1000);
}


async function finishTest() {
  if (finished) return;
  finished = true;

  clearInterval(timer);

  const payload = {
    answers: userAnswers,
    oob: oobTime,
    duration: 300 - remainingTime,
    userAgent: navigator.userAgent
  };

  const res = await fetch("https://script.google.com/macros/s/AKfycbwwzJ97KbgXokqunT2Iu-4Dm9nPMV1SU09WKfrnJOx-9jYgoqTmjHlufwP4k-0iUbeR8w/exec", {
    method: "POST",
    body: JSON.stringify(payload)
  });  

  const text = await res.text();
console.log("Server response:", text);

let result;
try {
  result = JSON.parse(text);
} catch {
  alert("Server error. See console.");
  return;
}
  document.getElementById("app").innerHTML = `
    <h2>Finished!</h2>
    <p>Score: ${result.score}</p>
    <p>OOB Time: ${oobTime}s</p>
  `;
}


document.getElementById("startBtn").onclick = startTest;

function updateTimerDisplay() {
  let min = Math.floor(remainingTime / 60);
  let sec = remainingTime % 60;

  document.getElementById("timer").innerText =
    `Time: ${min}:${sec.toString().padStart(2, "0")}`;

  let oobMin = Math.floor(oobTime / 60);
  let oobSec = oobTime % 60;

  document.getElementById("oobTime").innerText =
    `Out of Browser: ${oobMin}:${oobSec.toString().padStart(2, "0")}`;
}


document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    lastHiddenTime = Date.now();
  } else if (lastHiddenTime !== null) {
    const away = Math.floor((Date.now() - lastHiddenTime) / 1000);
    oobTime += away;
    localStorage.setItem("oobTime", oobTime);
    lastHiddenTime = null;
  }
});

