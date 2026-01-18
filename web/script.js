/* ---------- DATE ---------- */
function getToday() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

/* ---------- STORAGE ---------- */
let dayTasks = JSON.parse(localStorage.getItem("dayTasks") || "{}");
let completedDays = JSON.parse(localStorage.getItem("completedDays") || "[]");
let rewardedDays = JSON.parse(localStorage.getItem("rewardedDays") || "[]");
let earnedBadges = JSON.parse(localStorage.getItem("earnedBadges") || "[]");
let xp = parseInt(localStorage.getItem("xp") || "0");
let persistentTasks = JSON.parse(localStorage.getItem("persistentTasks") || "[]");

/* ---------- DOM ---------- */
const checklist = document.getElementById("checklist");
const modal = document.getElementById("planModal");

/* ---------- XP ---------- */
function updateXPUI() {
  const level = Math.floor(xp / 50) + 1;
  const current = xp % 50;
  document.getElementById("level").textContent = level;
  document.getElementById("xp").textContent = current;
  document.getElementById("xp-fill").style.width = (current / 50) * 100 + "%";
}

/* ---------- TASK HELPERS ---------- */
function getExistingTaskNames() {
  return [...checklist.querySelectorAll("input")].map(cb => cb.dataset.task);
}

function addTask(task, removable = false, persistent = true) {
  if (getExistingTaskNames().includes(task)) return;

  // Only save in persistentTasks if it's persistent
  if (persistent && !persistentTasks.includes(task)) {
    persistentTasks.push(task);
    localStorage.setItem("persistentTasks", JSON.stringify(persistentTasks));
  }

  const li = document.createElement("li");
  li.innerHTML = `
    <label>
      <input type="checkbox" data-task="${task}">
      ${task}
    </label>
    ${removable ? `<span class="todo-remove">✖</span>` : ""}
  `;

  const checkbox = li.querySelector("input");
  checkbox.onchange = saveTodayTasks;

  if (removable) {
    li.querySelector(".todo-remove").onclick = () => {
      li.remove();
      if (persistent) {
        persistentTasks = persistentTasks.filter(t => t !== task);
        localStorage.setItem("persistentTasks", JSON.stringify(persistentTasks));
      }
      saveTodayTasks();
    };
  }

  checklist.appendChild(li);
}


/* ---------- CORE TASKS (IMMORTAL) ---------- */
function ensureCoreTasks() {
  ["Brush teeth", "Wash face"].forEach(task => {
    if (!persistentTasks.includes(task)) {
      persistentTasks.push(task);
    }
  });
  localStorage.setItem("persistentTasks", JSON.stringify(persistentTasks));
}

/* ---------- SAVE ---------- */
function saveTodayTasks() {
  const today = getToday();
  const tasks = [...checklist.querySelectorAll("input")].map(cb => ({
    name: cb.dataset.task,
    done: cb.checked
  }));

  dayTasks[today] = tasks;
  localStorage.setItem("dayTasks", JSON.stringify(dayTasks));

  if (tasks.length && tasks.every(t => t.done)) {
    if (!completedDays.includes(today)) {
      completedDays.push(today);
      localStorage.setItem("completedDays", JSON.stringify(completedDays));
    }

    if (!rewardedDays.includes(today)) {
      xp += 10;
      rewardedDays.push(today);
      localStorage.setItem("xp", xp);
      localStorage.setItem("rewardedDays", JSON.stringify(rewardedDays));
      updateXPUI();
    }
  }

  renderCalendar();
  renderBadges();
}

/* ---------- CALENDAR ---------- */
const calendar = document.getElementById("calendar");
const dayDetails = document.getElementById("dayDetails");

function renderCalendar() {
  calendar.innerHTML = "";
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) calendar.appendChild(document.createElement("div"));

  for (let d = 1; d <= days; d++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const div = document.createElement("div");
    div.className = "calendar-day";
    div.textContent = d;

    if (dayTasks[date]) {
      const done = dayTasks[date].every(t => t.done);
      const some = dayTasks[date].some(t => !t.done);
      if (done) div.classList.add("completed");
      else if (some) div.classList.add("incomplete");
    }

    div.onclick = () => {
      dayDetails.innerHTML = dayTasks[date]
        ? dayTasks[date].map(t => `${t.done ? "✅" : "❌"} ${t.name}`).join("<br>")
        : "No data";
    };

    calendar.appendChild(div);
  }
}

function loadTodayTasks() {
  const today = getToday();
  checklist.innerHTML = "";

  // 1️⃣ Load persistent tasks (core + user-added)
  persistentTasks.forEach(task => {
    const removable = task !== "Brush teeth" && task !== "Wash face";
    addTask(task, removable, true);
  });

  // 2️⃣ Load today's generated tasks
  if (dayTasks[today]) {
    dayTasks[today].forEach(t => {
      const exists = getExistingTaskNames().includes(t.name);
      if (!exists) {
        // DAILY only tasks
        addTask(t.name, false, false);
      }
      // Set checkbox
      const cb = checklist.querySelector(`input[data-task="${t.name}"]`);
      if (cb) cb.checked = t.done;
    });
  }
}



/* ---------- BADGES ---------- */
const badgeList = [
  { id: 0, name: "Beginner 🐣" },  // added beginner badge
  { id: 1, name: "First Day!" },
  { id: 7, name: "7-Day Streak!" },
  { id: 14, name: "14-Day Legend!" }
];

// Initialize earned badges once
let earnedBadges = JSON.parse(localStorage.getItem("earnedBadges") || "[]");

// Award beginner badge if not already earned
if (!earnedBadges.includes(0)) {
  earnedBadges.push(0);
  localStorage.setItem("earnedBadges", JSON.stringify(earnedBadges));
}

function checkBadges() {
  const days = completedDays.length;

  badgeList.forEach(b => {
    if (b.id !== 0 && days >= b.id && !earnedBadges.includes(b.id)) {
      earnedBadges.push(b.id);
    }
  });

  // Save all earned badges
  localStorage.setItem("earnedBadges", JSON.stringify(earnedBadges));
}

function renderBadges() {
  const box = document.getElementById("badges");
  box.innerHTML = "";
  earnedBadges.forEach(id => {
    const b = badgeList.find(x => x.id === id);
    if (b) {
      const div = document.createElement("div");
      div.className = "badge";
      div.textContent = b.name;
      box.appendChild(div);
    }
  });
}


/* ---------- QUOTES ---------- */
const soups = [
  "Small steps still move you forward.",
  "Consistency beats motivation.",
  "Taking care of yourself is productive."
];
const soupText = document.getElementById("chickenSoup");
document.getElementById("newQuoteBtn").onclick = () =>
  soupText.textContent = soups[Math.floor(Math.random() * soups.length)];
soupText.textContent = soups[0];

/* ---------- THEME ---------- */
const themes = ["light", "dark", "green"];
let themeIndex = themes.indexOf(localStorage.getItem("theme")) || 0;
document.body.className = themes[themeIndex];
document.getElementById("themeBtn").onclick = () => {
  themeIndex = (themeIndex + 1) % themes.length;
  document.body.className = themes[themeIndex];
  localStorage.setItem("theme", themes[themeIndex]);
};

/* ---------- MODAL ---------- */
document.getElementById("openModalBtn").onclick = () => modal.classList.remove("hidden");
document.getElementById("closeModalBtn").onclick = () => modal.classList.add("hidden");

document.getElementById("generatePlanConfirm").onclick = () => {
  ensureCoreTasks();

 // Generated tasks are DAILY only (persistent = false)
if (document.getElementById("qExercise").value === "yes") addTask("Shower after exercise", false, false);
if (document.getElementById("qSweat").value === "yes") addTask("Extra shower", false, false);
if (document.getElementById("qOutdoor").value === "yes") addTask("Clean face after outdoor", false, false);
if (document.getElementById("qMakeup").value === "yes") addTask("Remove makeup", false, false);
addTask("Skincare", false, false);

  modal.classList.add("hidden");
};

/* ---------- CUSTOM TASK ---------- */
document.getElementById("addTodoBtn").onclick = () => {
  const input = document.getElementById("customTodoInput");
  if (!input.value.trim()) return;
  addTask(input.value.trim(), true);
  input.value = "";
  saveTodayTasks();
};

/* ---------- INIT ---------- */
ensureCoreTasks();
loadTodayTasks();
updateXPUI();
renderCalendar();
checkBadges();    // award beginner badge and others
renderBadges();   // now badges appear in the card

if (!dayTasks[getToday()]) {
  modal.classList.remove("hidden");
}

/* ---------- RESET BUTTON ---------- */
document.getElementById("resetBtn").onclick = () => {
  const confirmReset = confirm(
    "This will remove ALL checklist records, calendar history, XP, and badges.\nAre you sure?"
  );

  if (!confirmReset) return;

  // Clear storage
  localStorage.removeItem("dayTasks");
  localStorage.removeItem("completedDays");
  localStorage.removeItem("rewardedDays");
  localStorage.removeItem("earnedBadges");
  localStorage.removeItem("xp");

  // Reset in-memory state
  dayTasks = {};
  completedDays = [];
  rewardedDays = [];
  earnedBadges = [];
  xp = 0;

  // Reset UI
  checklist.innerHTML = "";
  ensureCoreTasks();
  updateXPUI();
  renderCalendar();
  renderBadges();

  alert("All records have been reset 🌱");
};

