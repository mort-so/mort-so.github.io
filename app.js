const API = "https://barry-proxy.kimethan572.workers.dev";

let answers = [];
let correct = [];

fetch(`${API}?action=getActiveTest`)
  .then(r => r.text())
  .then(text => {
    try {
      const meta = JSON.parse(text);
      loadTest(meta.test);
    } catch(e) {
      console.error("Invalid JSON:", text);
    }
  });


function loadTest(name) {
  fetch(`${API}?action=getTestData&name=${name}`)
    .then(r => r.json())
    .then(data => render(data));
}

function render(data) {
  const headers = data.headers;
  const rows = data.rows;
  const app = document.getElementById("app");

  app.innerHTML = "";
  answers = [];
  correct = [];

  rows.forEach((row, i) => {
    const block = document.createElement("div");

    const title = document.createElement("h3");
    title.innerText = row[0];
    block.appendChild(title);

    const img = document.createElement("img");
    img.src = row[4];
    img.width = 200;
    block.appendChild(img);

    headers.slice(1, 4).forEach((h, j) => {
      const btn = document.createElement("button");
      btn.innerText = row[j + 1];
      btn.onclick = () => {
        answers[i] = j;
        btn.style.background = "#4CAF50";
      };
      block.appendChild(btn);
    });

    correct.push(parseInt(row[5]));
    app.appendChild(block);
  });
}

function submit() {
  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "submit",
      answers: answers,
      correct: correct
    })
  })
  .then(r => r.json())
  .then(res => alert("Score: " + res.score));
}
