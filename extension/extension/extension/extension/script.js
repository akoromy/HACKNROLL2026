/* ================== STATE & STORAGE ================== */
const STORAGE_KEY = "cstinky_state_v1";

let state = {
  xp: 0,
  level: 1,
  habits: [
    { name: "Brush teeth", done: false },
    { name: "Shower", done: false },
    { name: "Wash face", done: false }
  ],
  history: {},            // "YYYY-MM-DD": { percent, done, total }
  badges: [],             // unlocked badge names
  stats: {                // counters for achievements
    showerDays: 0,
    brushDays: 0,
    perfectDays: 0
  },
  motivation: "Funny"
};

function save() {
  try {
    chrome.storage.local.set({ [STORAGE_KEY]: state });
  } catch (e) {
    // fallback (e.g., website)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function load() {
  try {
    chrome.storage.local.get(STORAGE_KEY, res => {
      if (res && res[STORAGE_KEY]) {
        state = res[STORAGE_KEY];
      }
      initAfterLoad();
    });
  } catch (e) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
    initAfterLoad();
  }
}

/* ================== UTIL ================== */
function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function confettiSafe() {
  if (typeof confetti === "function") {
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
  }
}

/* ================== TABS ================== */
document.querySelectorAll("nav button").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    const id = b.dataset.tab;
    document.getElementById(id).classList.add("active");
    // render calendar on tab open to refresh monthLabel
    if (id === "calendar") renderCalendar();
  });
});

/* ================== RENDER HABITS ================== */
function renderHabits() {
  const list = document.getElementById("habitList");
  list.innerHTML = "";
  state.habits.forEach((h, idx) => {
    const row = document.createElement("div");
    row.className = "habit";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!h.done;
    cb.addEventListener("change", () => {
      h.done = cb.checked;
      save();
      // small immediate effect: if checked and name contains "shower", unlock first-shower badge immediately
      checkImmediateBadges(h, cb.checked);
    });

    const span = document.createElement("span");
    span.innerText = h.name;

    const del = document.createElement("button");
    del.innerText = "✖";
    del.addEventListener("click", () => {
      state.habits.splice(idx, 1);
      save();
      renderHabits();
    });

    row.append(cb, span, del);
    list.appendChild(row);
  });
}

/* if user checks a habit that includes 'shower' immediately unlock First Shower badge */
function checkImmediateBadges(habit, checked) {
  if (!checked) return;
  const name = (habit.name || "").toLowerCase();
  if (name.includes("shower")) addBadge("First Shower");
  if (name.includes("brush") || name.includes("teeth")) {
    // small friendly reward
    addBadge("First Brush");
  }
  save();
  renderBadges();
}

/* ================== COMPLETE DAY ================== */
document.getElementById("completeDayBtn").addEventListener("click", () => {
  const key = todayKey();
  if (state.history[key]) {
    alert("You already saved today!");
    return;
  }

  const done = state.habits.filter(h => h.done).length;
  const total = state.habits.length || 1;
  const percent = Math.round((done / total) * 100);

  state.history[key] = { percent, done, total };

  // update stats: if any checked habit name contains 'shower' or 'brush'
  const doneNames = state.habits.filter(h => h.done).map(h => h.name.toLowerCase());
  if (doneNames.some(n => n.includes("shower"))) state.stats.showerDays++;
  if (doneNames.some(n => n.includes("brush") || n.includes("teeth"))) state.stats.brushDays++;
  if (percent === 100) state.stats.perfectDays++;

  // XP: award for each completed habit, but limit one completion per day
  if (done > 0) {
    state.xp += done * 20;
    confettiSafe();
  }

  // badges via rules
  evaluateBadges();

  // reset daily checkboxes
  state.habits.forEach(h => h.done = false);

  save();
  renderAll();

  // friendly motivational message
  const msg = getMotivationMessage(percent);
  alert(msg);
});

/* ================== BADGES ================== */
function addBadge(name) {
  if (!state.badges.includes(name)) {
    state.badges.push(name);
    confettiSafe();
    save();
  }
}

function evaluateBadges() {
  // rules:
  if (state.stats.showerDays >= 1) addBadge("First Shower");
  if (state.stats.brushDays >= 5) addBadge("Dental Overlord");
  if (state.stats.perfectDays >= 1) addBadge("Perfect Day");
  if (state.stats.perfectDays >= 3) addBadge("3-Day Streak");
  if (state.stats.perfectDays >= 10) addBadge("Hygiene Hero");
}

function renderBadges() {
  const list = document.getElementById("badgeList");
  list.innerHTML = "";
  const all = ["First Shower", "First Brush", "Dental Overlord", "Perfect Day", "3-Day Streak", "Hygiene Hero"];
  all.forEach(name => {
    const div = document.createElement("div");
    const unlocked = state.badges.includes(name);
    div.className = "badge " + (unlocked ? "unlocked" : "locked");
    div.innerText = name;
    list.appendChild(div);
  });
}

/* ================== MOTIVATION ================== */
function getMotivationMessage(percent) {
  const style = state.motivation || "Funny";
  const map = {
    Gentle: {
      success: "Nice job 💛 Every bit counts.",
      fail: "That’s okay. Tomorrow is a new day 🌱"
    },
    Funny: {
      success: "LET’S GOOO 🧼✨ You did it!",
      fail: "Bestie… soap misses you 😭"
    },
    Threatening: {
      success: "You survive today. Good.",
      fail: "We are disappointed. Fix it."
    }
  };
  return percent > 0 ? map[style].success : map[style].fail;
}

/* ================== XP / LEVEL ================== */
function updateXPUI() {
  // level system: each level requires level*300 XP
  let needed = state.level * 300;
  // level up loop: allow stacking
  while (state.xp >= needed) {
    state.xp -= needed;
    state.level++;
    confettiSafe();
    needed = state.level * 300;
  }
  const pct = Math.min(100, Math.round((state.xp / (state.level * 300)) * 100));
  document.getElementById("xpBar").style.width = pct + "%";
  document.getElementById("levelText").innerText = `Level ${state.level}`;
}

/* ================== CALENDAR (month navigation) ================== */
let calMonth = new Date().getMonth();
let calYear = new Date().getFullYear();

document.getElementById("prevMonthBtn").addEventListener("click", () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});
document.getElementById("nextMonthBtn").addEventListener("click", () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";
  const monthLabel = document.getElementById("monthLabel");
  const mText = new Date(calYear, calMonth, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
  monthLabel.innerText = mText;

  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const days = new Date(calYear, calMonth + 1, 0).getDate();

  // fill leading empty cells
  for (let i=0;i<firstDow;i++) grid.appendChild(document.createElement("div"));

  for (let d=1; d<=days; d++) {
    const date = new Date(calYear, calMonth, d);
    const key = date.toISOString().split("T")[0];
    const cell = document.createElement("div");
    cell.className = "day";
    cell.innerText = d;
    if (state.history[key]) {
      const p = state.history[key].percent;
      if (p === 100) cell.classList.add("full");
      else if (p > 0) cell.classList.add("partial");
      else cell.classList.add("empty");
    }
    // highlight today
    if (key === todayKey()) cell.style.outline = "3px solid gold";
    grid.appendChild(cell);
  }
}

/* ================== GAME (playable, restartable) ================== */
let gameLoopId = null;
let gameRunning = false;

function startGame() {
  if (gameRunning) return;
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  let player = { x: 60, y: 140, vy: 0, w: 28, h: 36 };
  let soap = { x: canvas.width + 40, y: 150, w: 36, h: 28 };
  let speed = 3.5;
  gameRunning = true;
  document.getElementById("startGameBtn").disabled = true;
  document.getElementById("stopGameBtn").disabled = false;

  function reset() {
    player.y = 140; player.vy = 0;
    soap.x = canvas.width + 40;
    speed = 3.5;
    gameRunning = true;
  }
  reset();

  function step() {
    if (!gameRunning) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // physics
    player.vy += 0.9;
    player.y = Math.min(140, player.y + player.vy);

    soap.x -= speed;
    if (soap.x < -50) {
      soap.x = canvas.width + 60;
      speed += 0.25;
    }

    // draw player and soap bigger
    ctx.font = "36px serif";
    ctx.fillText("🧍", player.x, player.y);
    ctx.fillText("🧼", soap.x, soap.y - 10);

    // collision detection (forgiving)
    const px = player.x, py = player.y - 30; // approximate top-left
    const pw = player.w, ph = player.h;
    const sx = soap.x, sy = soap.y - 20;
    const sw = soap.w, sh = soap.h;

    // simple AABB:
    if (soap.x < player.x + pw && soap.x + sw > player.x && player.y > sy - 5) {
      // collision only if player low
      if (player.y > sy - 10) {
        // hit
        gameRunning = false;
        cancelAnimationFrame(gameLoopId);
        document.getElementById("startGameBtn").disabled = false;
        document.getElementById("stopGameBtn").disabled = true;
        alert("You got soaped! Nice try — press Start to try again.");
        return;
      }
    }

    gameLoopId = requestAnimationFrame(step);
  }

  // keyboard
  function onKey(e) {
    if (e.code === "Space" && player.y >= 140) {
      player.vy = -14;
    }
  }
  document.addEventListener("keydown", onKey);

  // cleanup when stopping
  document.getElementById("stopGameBtn").onclick = () => {
    gameRunning = false;
    cancelAnimationFrame(gameLoopId);
    document.removeEventListener("keydown", onKey);
    document.getElementById("startGameBtn").disabled = false;
    document.getElementById("stopGameBtn").disabled = true;
  };

  step();
}

/* connect start button, stop button */
document.getElementById("startGameBtn").addEventListener("click", startGame);
document.getElementById("stopGameBtn").addEventListener("click", () => {
  // simulate stop
  document.getElementById("stopGameBtn").disabled = true;
  // cancel loop and re-enable start
  gameRunning = false;
  cancelAnimationFrame(gameLoopId);
  document.getElementById("startGameBtn").disabled = false;
});

/* ================== PROFILE / ADD HABIT ================== */
document.getElementById("addHabitBtn").addEventListener("click", () => {
  const val = document.getElementById("newHabit").value.trim();
  if (!val) return;
  state.habits.push({ name: val, done: false });
  document.getElementById("newHabit").value = "";
  save();
  renderHabits();
});

/* motivation select */
document.getElementById("motivation").addEventListener("change", (e) => {
  state.motivation = e.target.value;
  save();
});

/* ================== RENDER ALL ================== */
function renderAll() {
  renderHabits();
  renderBadges();
  renderCalendar();
  updateXPUI();
}

/* ================== INIT AFTER LOAD ================== */
function initAfterLoad() {
  // ensure fields exist
  if (!state.habits) state.habits = [];
  if (!state.history) state.history = {};
  if (!state.badges) state.badges = [];
  if (!state.stats) state.stats = { showerDays:0, brushDays:0, perfectDays:0 };

  // set UI values
  document.getElementById("motivation").value = state.motivation || "Funny";
  renderAll();
}

/* ================== STARTUP ================== */
document.addEventListener("DOMContentLoaded", load);
