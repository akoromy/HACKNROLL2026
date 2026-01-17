// ---------- DATA ----------
const todayKey = new Date().toISOString().slice(0,10);
const data = JSON.parse(localStorage.getItem("hygieneData")) || {};
const badges = [
  { id: "3", label: "3-Day Starter", days: 3 },
  { id: "7", label: "1-Week Solid", days: 7 },
  { id: "14", label: "2-Week Consistent", days: 14 },
  { id: "25", label: "25-Day Champion", days: 25 }
];

// ---------- DAILY FEED ----------
const feed = [
  "Consistency beats intensity.",
  "Done imperfectly > not done.",
  "Future you benefits from small wins.",
  "Momentum starts with one action."
];
document.getElementById("dailyFeed").innerText =
  feed[Math.floor(Math.random() * feed.length)];

// ---------- SAVE DAY ----------
function saveDay() {
  const habits = [...document.querySelectorAll("[data-habit]")]
    .reduce((acc, el) => {
      acc[el.dataset.habit] = el.checked;
      return acc;
    }, {});

  data[todayKey] = {
    habits,
    reflection: document.getElementById("reflection").value
  };

  localStorage.setItem("hygieneData", JSON.stringify(data));
  renderAll();
}

// ---------- STREAK ----------
function calculateStreak() {
  let streak = 0;
  let d = new Date();
  while (true) {
    const key = d.toISOString().slice(0,10);
    if (data[key] && Object.values(data[key].habits).every(Boolean)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

// ---------- CALENDAR ----------
function renderCalendar() {
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";

  for (let i = 1; i <= 30; i++) {
    const key = `${todayKey.slice(0,8)}${String(i).padStart(2,"0")}`;
    const div = document.createElement("div");
    div.className = "day";

    if (data[key]) {
      const ok = Object.values(data[key].habits).every(Boolean);
      div.classList.add(ok ? "good" : "bad");
    }

    div.innerText = i;
    cal.appendChild(div);
  }
}

// ---------- BADGES ----------
function toggleBadges() {
  const board = document.getElementById("badgeBoard");
  board.classList.toggle("hidden");
}

function renderBadges(streak) {
  const board = document.getElementById("badgeBoard");
  board.innerHTML = "";

  badges.forEach(b => {
    const div = document.createElement("div");
    div.className = "badge " + (streak >= b.days ? "unlocked" : "");
    div.innerText = b.label;
    board.appendChild(div);
  });
}

// ---------- PROGRESS ----------
function renderProgress() {
  const today = data[todayKey];
  if (!today) return;

  const total = Object.keys(today.habits).length;
  const done = Object.values(today.habits).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);

  document.getElementById("progressRing").innerText = `${pct}%`;
  document.getElementById("completionText").innerText =
    `${done}/${total} habits completed`;
}

// ---------- THEME ----------
function setTheme(theme) {
  document.body.dataset.theme = theme;
}

// ---------- RENDER ----------
function renderAll() {
  const streak = calculateStreak();
  document.getElementById("streak").innerText = streak;
  renderCalendar();
  renderBadges(streak);
  renderProgress();
}

renderAll();
