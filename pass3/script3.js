const lofiMusic = document.getElementById("lofiMusic");
let lofiPlaying = false;

function toggleLofi() {
    if (!lofiPlaying) {
        lofiMusic.play().catch(err => {
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

const correctAnswersMCQ = {
    q27: "B",
    q28: "C",
    q29: "D",
    q30: "A"
};
const correctAnswersDrop = {
    q31: "C",
    q32: "B",
    q33: "C",
    q34: "A",
    q35: "A"
};
const correctAnswersLast = {
    q36: "age",
    q37: "two weeks old",
    q38: "human beings",
    q39: "good motor control",
    q40: "mature monkeys"
};

function createFeedback(el, correct) {
    const old = el.parentElement.querySelector('.feedback');
    if (old) old.remove();
    const fb = document.createElement('span');
    fb.className = 'feedback';
    fb.textContent = correct ? "✅ Correct" : "❌ Wrong";
    fb.style.color = correct ? "green" : "red";
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
    wordElements.forEach((w, idx) => { if (w.classList.contains('marked')) markedIndexes.push(idx); });
    localStorage.setItem("reading_markedWords", JSON.stringify(markedIndexes));
    wordElements.forEach(word => word.style.pointerEvents = "none");

    let correctCount = 0;

    const total =
        Object.keys(correctAnswersMCQ).length +
        Object.keys(correctAnswersDrop).length +
        Object.keys(correctAnswersLast).length;


    for (let i = 27; i <= 30; i++) {
        const qid = 'q' + i;
        const selectEl = document.getElementById(qid);
        const userInput = (selectEl.value || "").trim().toUpperCase();
        localStorage.setItem("reading_" + qid, userInput);
        const correct = correctAnswersMCQ[qid];
        const isCorrect = userInput === correct;
        createFeedback(selectEl, isCorrect);
        if (isCorrect) correctCount++;
    }
    for (let i = 31; i <= 35; i++) {
        const qid = 'q' + i;
        const selectEl = document.getElementById(qid);
        const userInput = (selectEl.value || "").trim().toUpperCase();
        localStorage.setItem("reading_" + qid, userInput);
        const correct = correctAnswersDrop[qid];
        const isCorrect = userInput === correct;
        createFeedback(selectEl, isCorrect);
        if (isCorrect) correctCount++;
    }
    for (let i = 36; i <= 40; i++) {
    const qid = "q" + i;
    const inputEl = document.getElementById(qid);
    const userInput = (inputEl.value || "").trim().toLowerCase();
    
    localStorage.setItem("reading_" + qid, userInput);

    const correct = correctAnswersLast[qid].toLowerCase();
    const isCorrect = userInput === correct;

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
    for (let i = 27; i <= 30; i++) {
        const qid = 'q' + i;
        const saved = localStorage.getItem("reading_" + qid);
        if (saved) {
            const selectEl = document.getElementById(qid);
            selectEl.value = saved;
            const correct = correctAnswersMCQ[qid];
            createFeedback(selectEl, saved === correct);
        }
    }
    for (let i = 31; i <= 35; i++) {
        const qid = 'q' + i;
        const saved = localStorage.getItem("reading_" + qid);
        if (saved) {
            const selectEl = document.getElementById(qid);
            selectEl.value = saved;
            const correct = correctAnswersDrop[qid];
            createFeedback(selectEl, saved === correct);
        }
    }
    for (let i = 36; i <= 40; i++) {
        const qid = "q" + i;
        const saved = localStorage.getItem("reading_" + qid);

        if (saved) {
            const inputEl = document.getElementById(qid);
            inputEl.value = saved;
            const correct = correctAnswersLast[qid].toLowerCase();
            createFeedback(inputEl, saved.toLowerCase() === correct);
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
    doc.text("Reading Practice – Passage 3 (Answers & Key)", 40, y);
    y += 24;

    doc.setFontSize(11);
    doc.text("Questions 27–30 (Multiple Choice):", 40, y);
    y += 18;
    for (let i = 27; i <= 30; i++) {
        const qid = 'q' + i;
        const user = localStorage.getItem("reading_" + qid) || "(no answer)";
        const key = correctAnswersMCQ[qid];
        doc.text(`${i}. Your: ${user} | Key: ${key}`, 40, y);
        y += 14;
        if (y > 740) { doc.addPage(); y = 40; }
    }
    doc.text("Questions 31–35 (Matching / Letter Choice):", 40, y);
    y += 18;
    for (let i = 31; i <= 35; i++) {
        const qid = 'q' + i;
        const user = localStorage.getItem("reading_" + qid) || "(no answer)";
        const key = correctAnswersDrop[qid];
        doc.text(`${i}. Your: ${user} | Key: ${key}`, 40, y);
        y += 14;
        if (y > 740) { doc.addPage(); y = 40; }
    }
    doc.text("Questions 36–40:", 40, y);
    y += 18;
    for (let i = 36; i <= 40; i++) {
        const qid = 'q' + i;
        const user = localStorage.getItem("reading_" + qid) || "(no answer)";
        const key = correctAnswersLast[qid];
        doc.text(`${i}. Your: ${user} | Key: ${key}`, 40, y);
        y += 14;
        if (y > 740) { doc.addPage(); y = 40; }
    }


    const result = localStorage.getItem("reading_result") || "";
    y += 18;
    doc.text("Result:", 40, y);
    y += 14;
    doc.text(result.replace(/<br>/g, " "), 40, y);
    doc.save("Reading_Passage3_Answers.pdf");
}

function resetStats() {
    const password = prompt("Enter reset password:");
    if (password !== "read123") return;
    Object.keys(localStorage).filter(k => k.startsWith("reading_")).forEach(k => localStorage.removeItem(k));
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


makeWindowDraggable("readingWindow");
makeWindowDraggable("controlsWindow");
