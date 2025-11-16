const lofiMusic = document.getElementById("lofiMusic");
let lofiPlaying = false;

function toggleLofi() {
    if (!lofiPlaying) {
        lofiMusic.play().catch(err => {
            console.warn("Autoplay prevented:", err);
            alert("Click the button again to start music due to browser autoplay policy.");
        });
        lofiPlaying = true;
    } else {
        lofiMusic.pause();
        lofiPlaying = false;
    }
}

const readingText = document.getElementById('readingText');
function wrapWords(element) {
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === 3) {
      const words = node.textContent.split(/(\s+)/);
      const fragment = document.createDocumentFragment();
      words.forEach((word) => {
        if (word.trim().length > 0) {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = word;
          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(word));
        }
      });
      node.replaceWith(fragment);
    } else if (node.nodeType === 1 && node.tagName !== "INPUT" && !node.classList.contains('controls')) {
      wrapWords(node);
    }
  }
}
wrapWords(readingText);

const wordElements = document.querySelectorAll('.word');
const savedMarks = JSON.parse(localStorage.getItem("reading_markedWords") || "[]");
savedMarks.forEach(i => {
  const word = wordElements[i];
  if (word) word.classList.add("marked");
});

const alreadySubmitted = localStorage.getItem("reading_submitted");
if (!alreadySubmitted) {
  wordElements.forEach((word, i) => {
    word.addEventListener('click', () => {
      word.classList.toggle('marked');
      const markedIndexes = [];
      document.querySelectorAll('.word').forEach((w, idx) => {
        if (w.classList.contains('marked')) markedIndexes.push(idx);
      });
      localStorage.setItem("reading_markedWords", JSON.stringify(markedIndexes));
    });
  });
}

const correctAnswersTFNG = {
  q1: "True",
  q2: "Not Given",
  q3: "False",
  q4: "True",
  q5: "True",
  q6: "Not Given",
  q7: "False"
};

const correctAnswersShort = {
  q8: "Strips",
  q9: "Sheep",
  q10: "Stretched",
  q11: "Bark",
  q12: "Samarkand",
  q13: "stone"
};

function createFeedback(el, correct) {
  const old = el.parentElement.querySelector('.feedback');
  if (old) old.remove();
  const fb = document.createElement('span');
  fb.className = 'feedback';
  if (correct) {
    fb.textContent = "✅ Correct";
    fb.style.color = "green";
  } else {
    fb.textContent = "❌ Wrong";
    fb.style.color = "red";
  }
  el.parentElement.appendChild(fb);
}

function checkAnswers() {
  if (localStorage.getItem("reading_submitted")) {
    let attempts = +localStorage.getItem("reading_cheat") || 0;
    localStorage.setItem("reading_cheat", ++attempts);
    let warn = document.getElementById("cheat-warning");
    if (!warn) {
      warn = document.createElement("div");
      warn.id = "cheat-warning";
      warn.style.color = "red";
      warn.style.fontWeight = "bold";
      warn.style.textAlign = "center";
      warn.style.marginTop = "12px";
      document.getElementById("resultBox").after(warn);
    }
    warn.innerHTML = `🛑 Stop cheating! You've already submitted ${attempts} time(s)! 😡`;
    return;
  }

  const markedIndexes = [];
  document.querySelectorAll('.word').forEach((w, idx) => {
    if (w.classList.contains('marked')) markedIndexes.push(idx);
  });
  localStorage.setItem("reading_markedWords", JSON.stringify(markedIndexes));
  wordElements.forEach(word => word.style.pointerEvents = "none");

  let correctCount = 0;
  const total = Object.keys(correctAnswersTFNG).length + Object.keys(correctAnswersShort).length;

  for (let i = 1; i <= 7; i++) {
    const qid = 'q' + i;
    const radios = document.getElementsByName(qid);
    let selected = "";
    for (const r of radios) if (r.checked) selected = r.value;
    localStorage.setItem("reading_" + qid, selected);

    const containerCell = radios[0]?.closest('td') || radios[0]?.parentElement;
    const attachEl = radios[radios.length - 1] || (containerCell && containerCell.querySelector('label')) || containerCell;

    const isCorrect = (selected === correctAnswersTFNG[qid]);
    if (selected) createFeedback(attachEl, isCorrect);
    else {
      createFeedback(containerCell, false);
      const oldfb = containerCell.querySelector('.feedback');
      if (oldfb) {
        oldfb.textContent = "❌ No answer";
        oldfb.style.color = "red";
      }
    }
    if (isCorrect) correctCount++;
  }

  for (let i = 8; i <= 13; i++) {
    const qid = 'q' + i;
    const inputEl = document.getElementById(qid);
    const userInput = (inputEl.value || "").trim();
    localStorage.setItem("reading_" + qid, userInput);
    const correct = correctAnswersShort[qid];
    const isCorrect = userInput.toLowerCase() === String(correct).toLowerCase();
    createFeedback(inputEl, isCorrect);
    if (isCorrect) correctCount++;
  }

  const incorrect = total - correctCount;
  const resultText = `✅ Correct: ${correctCount} / ${total} — ❌ Wrong: ${incorrect}`;
  document.getElementById("resultBox").innerHTML = resultText;

  localStorage.setItem("reading_result", resultText);
  localStorage.setItem("reading_submitted", "true");

  document.getElementById("downloadPdfBtn").style.display = "inline-block";
}

window.onload = () => {
  for (let i = 1; i <= 7; i++) {
    const qid = 'q' + i;
    const saved = localStorage.getItem("reading_" + qid);
    if (saved) {
      const radios = document.getElementsByName(qid);
      for (const r of radios) {
        if (r.value === saved) r.checked = true;
      }
      const attachEl = radios[radios.length - 1] || radios[0];
      const isCorrect = (saved === correctAnswersTFNG[qid]);
      createFeedback(attachEl, isCorrect);
    }
  }

  for (let i = 8; i <= 13; i++) {
    const qid = 'q' + i;
    const saved = localStorage.getItem("reading_" + qid);
    if (saved) {
      const inputEl = document.getElementById(qid);
      inputEl.value = saved;
      const correct = correctAnswersShort[qid];
      const isCorrect = saved.trim().toLowerCase() === String(correct).toLowerCase();
      createFeedback(inputEl, isCorrect);
    }
  }

  const savedResult = localStorage.getItem("reading_result");
  if (savedResult) document.getElementById("resultBox").innerHTML = savedResult;

  if (localStorage.getItem("reading_submitted") === "true") {
    document.getElementById("downloadPdfBtn").style.display = "inline-block";
    wordElements.forEach(word => word.style.pointerEvents = "none");
  }
};

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFontSize(12);

  let y = 40;
  doc.text("Reading Practice – Passage 1 (Answers & Key)", 40, y);
  y += 24;

  doc.setFontSize(11);
  doc.text("Questions 1–7 (True / False / Not Given):", 40, y);
  y += 18;
  for (let i = 1; i <= 7; i++) {
    const qid = 'q' + i;
    const user = localStorage.getItem("reading_" + qid) || "(no answer)";
    const key = correctAnswersTFNG[qid];
    doc.text(`${i}. Your: ${user} | Key: ${key}`, 40, y);
    y += 14;
    if (y > 740) { doc.addPage(); y = 40; }
  }

  y += 12;
  doc.text("Questions 8–13 (Short answers):", 40, y);
  y += 18;
  for (let i = 8; i <= 13; i++) {
    const qid = 'q' + i;
    const user = localStorage.getItem("reading_" + qid) || "(no answer)";
    const key = correctAnswersShort[qid];
    doc.text(`${i}. Your: ${user} | Key: ${key}`, 40, y);
    y += 14;
    if (y > 740) { doc.addPage(); y = 40; }
  }

  const result = localStorage.getItem("reading_result") || "";
  y += 18;
  doc.text("Result:", 40, y);
  y += 14;
  doc.text(result.replace(/<br>/g, " "), 40, y);

  doc.save("Reading_Passage1_Answers.pdf");
}

function resetStats() {
  const password = prompt("Enter reset password:");
  if (password !== "read123") {
    alert("❌ Incorrect password. Stats not cleared.");
    return;
  }

  Object.keys(localStorage)
    .filter(k => k.startsWith("reading_"))
    .forEach(k => localStorage.removeItem(k));

  alert("✅ Reading stats cleared!");
  location.reload();
}

document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key.toLowerCase() === "i") {
    e.preventDefault();
    const btn = document.getElementById("resetStatsBtn");
    btn.style.display = "inline-block";
    btn.scrollIntoView({ behavior: "smooth" });
  }
});
function makeWindowDraggable(winId) {
  const win = document.getElementById(winId);
  const header = win.querySelector(".window-header");
  const body = win.querySelector(".window-body");
  const minimizeBtn = win.querySelector(".minimize-btn");
  const closeBtn = win.querySelector(".close-btn");

  let isDragging = false;
  let offsetX = 0, offsetY = 0;

  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    win.style.zIndex = 100;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      win.style.left = e.clientX - offsetX + "px";
      win.style.top = e.clientY - offsetY + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  minimizeBtn.addEventListener("click", () => {
    body.style.display = body.style.display === "none" ? "block" : "none";
  });

  closeBtn.addEventListener("click", () => {
    win.style.display = "none";
  });
}

makeWindowDraggable("readingWindow");
makeWindowDraggable("controlsWindow");
