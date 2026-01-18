document.addEventListener("DOMContentLoaded", () => {

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

/* ---------- XP ---------- */
const xpText = document.getElementById("xp");
const levelText = document.getElementById("level");
const xpFill = document.getElementById("xp-fill");

function updateXPUI() {
  const level = Math.floor(xp / 50) + 1;
  xpText.textContent = xp % 50;
  levelText.textContent = level;
  xpFill.style.width = ((xp % 50) / 50) * 100 + "%";
}

/* ---------- CHECKLIST ---------- */
const checklist = document.getElementById("checklist");

function saveTodayTasks() {
  const today = getToday();
  const tasks = [...checklist.querySelectorAll("input")].map(cb => ({
    name: cb.dataset.task,
    done: cb.checked
  }));

  dayTasks[today] = tasks;
  localStorage.setItem("dayTasks", JSON.stringify(dayTasks));

  if (tasks.length && tasks.every(t => t.done)) {
    if (!rewardedDays.includes(today)) {
      xp += 10;
      rewardedDays.push(today);
      localStorage.setItem("xp", xp);
      localStorage.setItem("rewardedDays", JSON.stringify(rewardedDays));
    }
    if (!completedDays.includes(today)) {
      completedDays.push(today);
      localStorage.setItem("completedDays", JSON.stringify(completedDays));
    }
  }

  updateXPUI();
  renderCalendar();
  renderBadges();
}

checklist.addEventListener("change", saveTodayTasks);

/* ---------- CUSTOM TODO ---------- */
document.getElementById("addTodoBtn").onclick = () => {
  const input = document.getElementById("customTodoInput");
  if (!input.value.trim()) return;

  const li = document.createElement("li");
  li.innerHTML = `
    <label><input type="checkbox" data-task="${input.value}"> ${input.value}</label>
    <span class="todo-remove">✖</span>
  `;

  li.querySelector(".todo-remove").onclick = () => {
    li.remove();
    saveTodayTasks();
  };

  checklist.appendChild(li);
  input.value = "";
  saveTodayTasks();
};

/* ---------- CALENDAR ---------- */
const calendar = document.getElementById("calendar");
const dayDetails = document.getElementById("dayDetails");

function renderCalendar() {
  calendar.innerHTML = "";
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();

  for (let i = 0; i < first; i++) calendar.appendChild(document.createElement("div"));

  for (let d = 1; d <= days; d++) {
    const date = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const div = document.createElement("div");
    div.className = "calendar-day";
    div.textContent = d;

    if (dayTasks[date]) {
      const t = dayTasks[date].map(x => x.done);
      if (t.every(Boolean)) div.classList.add("completed");
      else div.classList.add("incomplete");
    }

    div.onclick = () => {
      dayDetails.innerHTML = dayTasks[date]
        ? dayTasks[date].map(t => `${t.done?"✅":"❌"} ${t.name}`).join("<br>")
        : "No data";
    };

    calendar.appendChild(div);
  }
}

/* ---------- BADGES ---------- */
const badgeList = [{id:1,name:"First Day!"},{id:7,name:"7-Day Streak!"},{id:14,name:"14-Day Legend!"}];
function renderBadges() {
  const box = document.getElementById("badges");
  box.innerHTML = "";
  earnedBadges.forEach(id => {
    const b = badgeList.find(x => x.id === id);
    if (b) box.innerHTML += `<div class="badge">${b.name}</div>`;
  });
}

/* ---------- SOUP ---------- */
const soups = [
  "Small steps still move you forward.",
  "Consistency beats motivation.",
  "Your future self thanks you."
];
const soup = document.getElementById("chickenSoup");
document.getElementById("newQuoteBtn").onclick = () =>
  soup.textContent = soups[Math.floor(Math.random()*soups.length)];
soup.textContent = soups[0];

/* ---------- THEME ---------- */
const themes = ["light","dark","green"];
let idx = themes.indexOf(localStorage.getItem("theme")) || 0;
document.body.className = themes[idx];
document.getElementById("themeBtn").onclick = () => {
  idx = (idx+1)%themes.length;
  document.body.className = themes[idx];
  localStorage.setItem("theme", themes[idx]);
};

/* ---------- MODAL ---------- */
const modal = document.getElementById("planModal");
document.getElementById("openModalBtn").onclick = () => modal.classList.remove("hidden");
document.getElementById("closeModalBtn").onclick = () => modal.classList.add("hidden");

document.getElementById("generatePlanConfirm").onclick = () => {
  checklist.innerHTML = "";
  ["Brush teeth","Wash hands","Skincare"].forEach(t=>{
    checklist.innerHTML += `<li><input type="checkbox" data-task="${t}"> ${t}</li>`;
  });
  modal.classList.add("hidden");
};

/* ---------- AUTO OPEN ---------- */
if (!dayTasks[getToday()]) modal.classList.remove("hidden");

/* ---------- INIT ---------- */
updateXPUI();
renderCalendar();
renderBadges();

});

