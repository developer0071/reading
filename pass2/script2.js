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

const correctAnswersHeadings = { q14: "iv", q15: "ix", q16: "i", q17: "x", q18: "iii", q19: "v", q20: "vii" };
const correctAnswersDropdown = { q21: "D", q22: "A", q23: "C" };
const correctAnswersLast = { q24: "density", q25: "architects", q26: "budget" };

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
    const total = Object.keys(correctAnswersHeadings).length + Object.keys(correctAnswersDropdown).length + Object.keys(correctAnswersLast).length;

    for (let i = 14; i <= 20; i++) {
        const qid = 'q' + i;
        const inputEl = document.getElementById(qid);
        const userInput = (inputEl.value || "").trim().toLowerCase();
        localStorage.setItem("reading_" + qid, userInput);
        const correct = correctAnswersHeadings[qid].toLowerCase();
        const isCorrect = userInput === correct;
        createFeedback(inputEl, isCorrect);
        if (isCorrect) correctCount++;
    }

    for (let i = 21; i <= 23; i++) {
        const qid = 'q' + i;
        const selectEl = document.getElementById(qid);
        const userInput = (selectEl.value || "").trim().toUpperCase();
        localStorage.setItem("reading_" + qid, userInput);
        const correct = correctAnswersDropdown[qid].toUpperCase();
        const isCorrect = userInput === correct;
        createFeedback(selectEl, isCorrect);
        if (isCorrect) correctCount++;
    }

    for (let i = 24; i <= 26; i++) {
        const qid = 'q' + i;
        const inputEl = document.getElementById(qid);
        if (!inputEl) continue;
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
    for (let i = 14; i <= 20; i++) {
        const qid = 'q' + i;
        const saved = localStorage.getItem("reading_" + qid);
        if (saved) {
            const inputEl = document.getElementById(qid);
            inputEl.value = saved;
            const correct = correctAnswersHeadings[qid].toLowerCase();
            createFeedback(inputEl, saved.toLowerCase() === correct);
        }
    }

    for (let i = 21; i <= 23; i++) {
        const qid = 'q' + i;
        const saved = localStorage.getItem("reading_" + qid);
        if (saved) {
            const selectEl = document.getElementById(qid);
            selectEl.value = saved.toUpperCase();
            const correct = correctAnswersDropdown[qid].toUpperCase();
            createFeedback(selectEl, saved.toUpperCase() === correct);
        }
    }

    for (let i = 24; i <= 26; i++) {
        const qid = 'q' + i;
        const inputEl = document.getElementById(qid);
        const saved = localStorage.getItem("reading_" + qid);
        if (inputEl && saved) {
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
    doc.text("Reading Practice – Passage 2 (Answers & Key)", 40, y);
    y += 24;

    doc.setFontSize(11);
    doc.text("Questions 14–20 (Headings):", 40, y);
    y += 18;
    for (let i = 14; i <= 20; i++) {
        const qid = 'q' + i;
        const user = localStorage.getItem("reading_" + qid) || "(no answer)";
        const key = correctAnswersHeadings[qid];
        doc.text(`${i}. Your: ${user} | Key: ${key}`, 40, y);
        y += 14;
        if (y > 740) { doc.addPage(); y = 40; }
    }

    y += 12;
    doc.text("Questions 21–23 (Dropdown):", 40, y);
    y += 18;
    for (let i = 21; i <= 23; i++) {
        const qid = 'q' + i;
        const user = localStorage.getItem("reading_" + qid) || "(no answer)";
        const key = correctAnswersDropdown[qid];
        doc.text(`${i}. Your: ${user} | Key: ${key}`, 40, y);
        y += 14;
        if (y > 740) { doc.addPage(); y = 40; }
    }

    y += 12;
    doc.text("Questions 24–26 (Summary):", 40, y);
    y += 18;
    for (let i = 24; i <= 26; i++) {
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
    doc.save("Reading_Passage2_Answers.pdf");
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
