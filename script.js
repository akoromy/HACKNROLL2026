// ---------- FIREBASE ----------

  // 🔥 PASTE YOUR CONFIG HERE
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ---------- GLOBAL STATE ----------
let user = null;
let state = {
  xp: 0,
  level: 1,
  habits: [
    { name: "Shower 🚿", done: false },
    { name: "Brush Teeth 🦷", done: false },
    { name: "Deodorant 🧴", done: false }
  ],
  history: {},
  badges: []
};

let currentMonth = new Date();

// ---------- AUTH ----------
function login() {
  auth.signInWithEmailAndPassword(email.value, password.value)
    .catch(() =>
      auth.createUserWithEmailAndPassword(email.value, password.value)
    );
}

auth.onAuthStateChanged(u => {
  if (!u) return;
  user = u;
  showTab("today");
  loadState();
  listenToFeed();
});

// ---------- UI ----------
function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ---------- LOAD / SAVE ----------
async function loadState() {
  const doc = await db.collection("users").doc(user.uid).get();
  if (doc.exists) state = doc.data();
  renderAll();
}

function saveState() {
  db.collection("users").doc(user.uid).set(state);
}

// ---------- HABITS ----------
function renderHabits() {
  habitList.innerHTML = "";
  state.habits.forEach((h, i) => {
    const div = document.createElement("div");
    div.className = "habit " + (h.done ? "done" : "");
    div.innerHTML = `
      <span>${h.name}</span>
      <button onclick="toggleHabit(${i})">✔</button>
    `;
    habitList.appendChild(div);
  });
}

function toggleHabit(i) {
  state.habits[i].done = !state.habits[i].done;
  renderHabits();
}

// ---------- COMPLETE DAY ----------
function completeDay() {
  const completed = state.habits.filter(h => h.done).length;
  const pct = completed / state.habits.length;

  const key = new Date().toISOString().slice(0,10);
  state.history[key] = pct;

  if (completed > 0) {
    state.xp += Math.floor(50 * pct);
  }

  if (pct === 1) checkBadges();

  resetHabits();
  saveState();
  renderAll();
}

function resetHabits() {
  state.habits.forEach(h => h.done = false);
}

// ---------- XP / LEVEL ----------
function renderXP() {
  const needed = state.level * 200;
  xpFill.style.width = `${Math.min(100, state.xp / needed * 100)}%`;
  xpText.innerText = `XP ${state.xp} / ${needed}`;
  if (state.xp >= needed) state.level++;
  levelText.innerText = `Level ${state.level}`;
}

// ---------- CALENDAR ----------
function renderCalendar() {
  calendarGrid.innerHTML = "";
  monthLabel.innerText = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  for (let i = 1; i <= 31; i++) {
    const date = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,"0")}-${String(i).padStart(2,"0")}`;
    const div = document.createElement("div");
    div.className = "day";

    if (state.history[date] === 1) div.classList.add("good");
    else if (state.history[date] > 0) div.classList.add("partial");
    else if (state.history[date] === 0) div.classList.add("bad");

    div.innerText = i + (state.history[date] === 1 ? "🔥" : "");
    calendarGrid.appendChild(div);
  }
}

function changeMonth(delta) {
  currentMonth.setMonth(currentMonth.getMonth() + delta);
  renderCalendar();
}

// ---------- BADGES ----------
function checkBadges() {
  if (!state.badges.includes("7-day")) state.badges.push("7-day");
}

function renderBadges() {
  badges.innerHTML = state.badges.map(b => `<div>🏅 ${b}</div>`).join("");
}

// ---------- COMMUNITY ----------
function post() {
  db.collection("posts").add({
    text: postInput.value,
    user: user.email,
    time: Date.now()
  });
  postInput.value = "";
}

function listenToFeed() {
  db.collection("posts").orderBy("time", "desc").onSnapshot(snap => {
    feed.innerHTML = "";
    snap.forEach(doc => {
      const p = doc.data();
      feed.innerHTML += `<p><strong>${p.user}</strong>: ${p.text}</p>`;
    });
  });
}

// ---------- PROFILE ----------
function saveProfile() {
  state.profile = {
    activity: q_activity.value,
    sweat: q_sweat.value,
    motivation: q_motivation.value
  };
  saveState();
}

// ---------- RENDER ----------
function renderAll() {
  renderHabits();
  renderXP();
  renderCalendar();
  renderBadges();
}
