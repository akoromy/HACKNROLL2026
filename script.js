/* ---------- DATE FIX (LOCAL TIME) ---------- */
function getToday() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/* ---------- STORAGE ---------- */
let completedDays = JSON.parse(localStorage.getItem("completedDays") || "[]");
let dayTasks = JSON.parse(localStorage.getItem("dayTasks") || "{}");
let earnedBadges = JSON.parse(localStorage.getItem("earnedBadges") || "[]");

let xp = parseInt(localStorage.getItem("xp") || "0");
let rewardedDays = JSON.parse(localStorage.getItem("rewardedDays") || "[]");

/* ---------- XP UI ---------- */
const xpText = document.getElementById("xp");
const levelText = document.getElementById("level");
const xpFill = document.getElementById("xp-fill");

function updateXPUI() {
  const level = Math.floor(xp / 50) + 1;
  const currentXP = xp % 50;

  levelText.textContent = level;
  xpText.textContent = currentXP;
  xpFill.style.width = (currentXP / 50) * 100 + "%";
}

/* ---------- CHECKLIST ---------- */
const checklist = document.getElementById("checklist");

checklist.addEventListener("change", () => {
  const today = getToday();

  const tasks = [...checklist.querySelectorAll("input")].map(cb => ({
    name: cb.dataset.task,
    done: cb.checked
  }));

  dayTasks[today] = tasks;
  localStorage.setItem("dayTasks", JSON.stringify(dayTasks));

  if (tasks.every(t => t.done)) {

    if (!completedDays.includes(today)) {
      completedDays.push(today);
      localStorage.setItem("completedDays", JSON.stringify(completedDays));
      checkBadges();
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
});

/* ---------- CALENDAR ---------- */
const calendar = document.getElementById("calendar");
const dayDetails = document.getElementById("dayDetails");

function renderCalendar() {
  calendar.innerHTML = "";

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const div = document.createElement("div");
    div.textContent = d;
    div.className = "calendar-day";

    if (completedDays.includes(dateStr)) {
      div.classList.add("completed");
    }

    div.onclick = () => {
      const tasks = dayTasks[dateStr];
      if (!tasks) {
        dayDetails.textContent = "No data for this day.";
      } else {
        dayDetails.innerHTML = tasks
          .map(t => `${t.done ? "✅" : "❌"} ${t.name}`)
          .join("<br>");
      }
    };

    calendar.appendChild(div);
  }
}

/* ---------- BADGES ---------- */
const badgeList = [
  { id: 1, name: "First Day!" },
  { id: 7, name: "7-Day Streak!" },
  { id: 14, name: "14-Day Legend!" }
];

function checkBadges() {
  badgeList.forEach(b => {
    if (completedDays.length >= b.id && !earnedBadges.includes(b.id)) {
      earnedBadges.push(b.id);
      localStorage.setItem("earnedBadges", JSON.stringify(earnedBadges));
    }
  });
}

function renderBadges() {
  const box = document.getElementById("badges");
  box.innerHTML = "";
  earnedBadges.forEach(id => {
    const badge = badgeList.find(b => b.id === id);
    const div = document.createElement("div");
    div.className = "badge";
    div.textContent = badge.name;
    box.appendChild(div);
  });
}

/* ---------- CHICKEN SOUP ---------- */
const soups = [
  "Small steps still move you forward.",
  "Taking care of yourself is productive.",
  "Consistency beats motivation.",
  "You showed up today. That matters.",
  "Your future self thanks you."
];

const soupText = document.getElementById("chickenSoup");
document.getElementById("newQuoteBtn").onclick = () => {
  soupText.textContent = soups[Math.floor(Math.random() * soups.length)];
};
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

/* ---------- AUTO OPEN PLAN MODAL ON NEW DAY ---------- */
function checkNewDayAndPromptPlan() {
  const today = getToday();

  // If no tasks exist for today, open generate plan modal
  if (!dayTasks[today]) {
    modal.classList.remove("hidden");
  }
}

/* ---------- INIT ---------- */
updateXPUI();
renderCalendar();
renderBadges();
checkNewDayAndPromptPlan();


/* ---------- GENERATE PLAN MODAL (RESTORED) ---------- */
const modal = document.getElementById("planModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const confirmBtn = document.getElementById("generatePlanConfirm");

// Open modal
openModalBtn.onclick = () => {
  modal.classList.remove("hidden");
};

// Close modal
closeModalBtn.onclick = () => {
  modal.classList.add("hidden");
};

// Generate plan
confirmBtn.onclick = () => {
  const active = document.getElementById("qActive").value;
  const exercise = document.getElementById("qExercise").value;
  const sweat = document.getElementById("qSweat").value;
  const outdoor = document.getElementById("qOutdoor").value;
  const makeup = document.getElementById("qMakeup").value;

  const tasks = ["Brush teeth", "Wash hands"];

  if (active === "yes") tasks.push("Change clothes");
  if (exercise === "yes") tasks.push("Shower after exercise");
  if (sweat === "yes") tasks.push("Extra shower");
  if (outdoor === "yes") tasks.push("Clean face after outdoor");
  if (makeup === "yes") tasks.push("Remove makeup");

  tasks.push("Skincare");

  checklist.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.innerHTML = `<input type="checkbox" data-task="${task}"> ${task}`;
    checklist.appendChild(li);
  });

  modal.classList.add("hidden");
};

/* ---------- SAFE MODAL BINDING (FIX) ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("planModal");
  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const confirmBtn = document.getElementById("generatePlanConfirm");

  if (!modal || !openModalBtn || !closeModalBtn || !confirmBtn) {
    console.warn("Modal elements not found, check HTML IDs");
    return;
  }

  // Open modal (button)
  openModalBtn.onclick = () => {
    modal.classList.remove("hidden");
  };

  // Close modal
  closeModalBtn.onclick = () => {
    modal.classList.add("hidden");
  };

  // Generate plan
  confirmBtn.onclick = () => {
    const active = document.getElementById("qActive").value;
    const exercise = document.getElementById("qExercise").value;
    const sweat = document.getElementById("qSweat").value;
    const outdoor = document.getElementById("qOutdoor").value;
    const makeup = document.getElementById("qMakeup").value;

    const tasks = ["Brush teeth", "Wash hands"];

    if (active === "yes") tasks.push("Change clothes");
    if (exercise === "yes") tasks.push("Shower after exercise");
    if (sweat === "yes") tasks.push("Extra shower");
    if (outdoor === "yes") tasks.push("Clean face after outdoor");
    if (makeup === "yes") tasks.push("Remove makeup");

    tasks.push("Skincare");

    checklist.innerHTML = "";
    tasks.forEach(task => {
      const li = document.createElement("li");
      li.innerHTML = `<input type="checkbox" data-task="${task}"> ${task}`;
      checklist.appendChild(li);
    });

    modal.classList.add("hidden");
  };

  /* ---------- AUTO POPUP ON NEW DAY (FIXED) ---------- */
  const today = getToday();
  if (!dayTasks[today]) {
    modal.classList.remove("hidden");
  }
});
