const topics = [
  {
    id: "cells",
    icon: "🔬",
    title: "Cells",
    description: "The tiny building blocks of living things.",
    cards: [
      ["What is a cell?", "A cell is the smallest unit of a living organism."],
      ["What is the nucleus?", "The nucleus controls the activities of the cell and contains genetic material."],
      ["What is the job of the cell membrane?", "It controls what enters and leaves the cell."],
      ["What do plant cells have that animal cells do not?", "Plant cells have a cell wall, chloroplasts and a large permanent vacuole."],
    ],
    quiz: [
      { question: "Which part controls the activities of a cell?", options: ["Cell wall", "Nucleus", "Vacuole"], answer: 1 },
      { question: "Which structure is found in plant cells for photosynthesis?", options: ["Chloroplast", "Cell membrane", "Cytoplasm"], answer: 0 },
      { question: "What controls what enters and leaves the cell?", options: ["Nucleus", "Cell membrane", "Cell wall"], answer: 1 },
    ],
  },
  { id: "energy", icon: "⚡", title: "Energy", description: "How energy moves and changes.", cards: [], quiz: [] },
  { id: "materials", icon: "🧪", title: "Materials", description: "Properties, mixtures and changes.", cards: [], quiz: [] },
  { id: "ecosystems", icon: "🌿", title: "Ecosystems", description: "Living things and their environment.", cards: [], quiz: [] },
];

const saved = JSON.parse(localStorage.getItem("studyhausen-progress") || "{}") || {};
const topicGrid = document.querySelector("#topicGrid");
const modal = document.querySelector("#studyModal");
const modalContent = document.querySelector("#modalContent");
let currentTopic;

function saveProgress() {
  localStorage.setItem("studyhausen-progress", JSON.stringify(saved));
  updateProgress();
}

function updateProgress() {
  const completed = topics.filter((topic) => saved[topic.id]).length;
  const percent = Math.round((completed / topics.length) * 100);
  document.querySelector("#progressFill").style.width = `${percent}%`;
  document.querySelector("#progressLabel").textContent = `${percent}% complete`;
}

function renderTopics() {
  topicGrid.innerHTML = topics.map((topic) => `
    <button class="topic-card ${saved[topic.id] ? "complete" : ""}" data-topic="${topic.id}">
      <span class="topic-icon">${topic.icon}</span>
      <h3>${topic.title}</h3>
      <p>${topic.description}</p>
    </button>
  `).join("");
  topicGrid.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => openTopic(button.dataset.topic));
  });
}

function openTopic(id) {
  currentTopic = topics.find((topic) => topic.id === id);
  if (!currentTopic.cards.length) {
    modalContent.innerHTML = `<p class="eyebrow">Coming soon</p><h2>${currentTopic.icon} ${currentTopic.title}</h2><p class="muted">This topic is ready to be filled with her own school notes and textbook material.</p><button class="primary-button" id="markComplete">Mark as explored <span>✓</span></button>`;
    document.querySelector("#markComplete").addEventListener("click", () => completeTopic());
  } else {
    showFlashcard(0);
  }
  modal.classList.remove("hidden");
}

function showFlashcard(index) {
  const card = currentTopic.cards[index];
  modalContent.innerHTML = `
    <p class="eyebrow">${currentTopic.icon} ${currentTopic.title} · Flashcards</p>
    <h2>One small question at a time</h2>
    <div class="flashcard"><div><small>Card ${index + 1} of ${currentTopic.cards.length}</small><span id="cardText">${card[0]}</span></div></div>
    <div class="modal-actions">
      <button class="secondary-button" id="revealCard">Show answer</button>
      <button class="primary-button" id="nextCard">I’m ready <span>→</span></button>
    </div>
  `;
  document.querySelector("#revealCard").addEventListener("click", () => {
    document.querySelector("#cardText").innerHTML = `<small>Answer</small>${card[1]}`;
  });
  document.querySelector("#nextCard").addEventListener("click", () => {
    if (index + 1 < currentTopic.cards.length) showFlashcard(index + 1);
    else showQuiz(0, 0);
  });
}

function showQuiz(index, score) {
  if (index >= currentTopic.quiz.length) {
    completeTopic();
    return;
  }
  const item = currentTopic.quiz[index];
  modalContent.innerHTML = `<p class="eyebrow">${currentTopic.icon} ${currentTopic.title} · Quiz</p><h2>${item.question}</h2><p class="muted small">Question ${index + 1} of ${currentTopic.quiz.length}</p>${item.options.map((option, optionIndex) => `<button class="quiz-option" data-option="${optionIndex}">${option}</button>`).join("")}<div id="quizFeedback"></div>`;
  modalContent.querySelectorAll("[data-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const correct = Number(button.dataset.option) === item.answer;
      document.querySelectorAll(".quiz-option").forEach((optionButton) => optionButton.disabled = true);
      document.querySelector("#quizFeedback").innerHTML = `<div class="result">${correct ? "That’s right! ✨" : `Good try. The answer is <strong>${item.options[item.answer]}</strong>.`}</div><br><button class="primary-button" id="continueQuiz">Continue <span>→</span></button>`;
      document.querySelector("#continueQuiz").addEventListener("click", () => showQuiz(index + 1, score + (correct ? 1 : 0)));
    });
  });
}

function completeTopic() {
  saved[currentTopic.id] = true;
  saveProgress();
  renderTopics();
  modalContent.innerHTML = `<p class="eyebrow">Well done</p><h2>${currentTopic.icon} You completed ${currentTopic.title}!</h2><p class="muted">That was a real study session. You can take a break now, or choose another small step later.</p><button class="primary-button" id="doneButton">Finish <span>✓</span></button>`;
  document.querySelector("#doneButton").addEventListener("click", closeModal);
}

function closeModal() { modal.classList.add("hidden"); }

document.querySelector("[data-action='start-topic']").addEventListener("click", () => openTopic("cells"));
document.querySelector("#closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
document.querySelector("#resetProgress").addEventListener("click", () => {
  if (confirm("Reset the Science progress?")) { Object.keys(saved).forEach((key) => delete saved[key]); saveProgress(); renderTopics(); }
});

renderTopics();
updateProgress();
