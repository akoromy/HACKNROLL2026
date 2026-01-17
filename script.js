// ---------- TABS ----------
function switchTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ---------- THEME ----------
function setTheme(t) {
  document.body.dataset.theme = t;
}

// ---------- PERSONALIZATION ----------
function generatePlan() {
  const activity = q_activity.value;
  const sweat = q_sweat.value;

  const habits = [];
  if (activity === "high" || sweat === "yes") habits.push("Daily shower 🚿");
  else habits.push("Shower every other day");

  habits.push("Brush teeth twice 🦷");
  habits.push("Use deodorant 🧴");

  localStorage.setItem("habits", JSON.stringify(habits));
  renderHabits();
}

// ---------- HABITS ----------
function renderHabits() {
  const list = document.getElementById("habitList");
  list.innerHTML = "";
  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  habits.forEach(h => {
    list.innerHTML += `<label><input type="checkbox"> ${h}</label>`;
  });
}

// ---------- DAILY FEED ----------
const feedMessages = [
  "Progress is quiet but powerful.",
  "You don’t need motivation, just momentum.",
  "Clean habits, clear mind."
];
dailyFeed.innerText = feedMessages[Math.floor(Math.random()*feedMessages.length)];

// ---------- STREAK & CALENDAR ----------
const data = JSON.parse(localStorage.getItem("days")) || {};
function saveDay() {
  const today = new Date().toISOString().slice(0,10);
  data[today] = true;
  localStorage.setItem("days", JSON.stringify(data));
  renderCalendar();
}

function renderCalendar() {
  calendar.innerHTML = "";
  const todayNum = new Date().getDate();

  for (let i=1;i<=30;i++) {
    const d = document.createElement("div");
    d.className = "day";
    if (i === todayNum) d.classList.add("today");
    if (Object.keys(data).some(k => k.endsWith(`-${String(i).padStart(2,"0")}`)))
      d.classList.add("good");
    d.innerText = i;
    calendar.appendChild(d);
  }

  streak.innerText = Object.keys(data).length;
}

// ---------- COMMUNITY ----------
const posts = JSON.parse(localStorage.getItem("posts")) || [];
function addPost() {
  posts.unshift(postInput.value);
  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
}
function renderPosts() {
  feed.innerHTML = posts.map(p => `<p>🫶 ${p}</p>`).join("");
}
renderPosts();

// ---------- GAME ----------
const challenges = [
  "Shower before noon",
  "Brush teeth twice today",
  "Change clothes once"
];
challenge.innerText = challenges[Math.floor(Math.random()*challenges.length)];

let xp = Number(localStorage.getItem("xp")) || 0;
xpSpan = document.getElementById("xp");
xpSpan.innerText = xp;

function completeChallenge() {
  xp += 10;
  localStorage.setItem("xp", xp);
  xpSpan.innerText = xp;
}

// INIT
renderHabits();
renderCalendar();
