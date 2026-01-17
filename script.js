// ---------- STATE ----------
let state = JSON.parse(localStorage.getItem("state")) || {
  xp: 0,
  level: 1,
  habits: [],
  days: {},
  props: 0,
  streak: 0,
  customGoals: []
};

const BASE_HABITS = [
  { name: "Shower 🚿", xp: 20 },
  { name: "Brush Teeth 🦷", xp: 15 },
  { name: "Deodorant 🧴", xp: 10 }
];

// ---------- INIT ----------
function init() {
  if (state.habits.length === 0) {
    state.habits = [...BASE_HABITS];
  }
  render();
}
init();

// ---------- RENDER ----------
function render() {
  renderHabits();
  renderXP();
  renderCalendar();
  renderPlan();
  renderProps();
  save();
}

function renderHabits() {
  habitList.innerHTML = "";
  state.habits.forEach((h, i) => {
    const div = document.createElement("div");
    div.className = "habit";
    div.innerHTML = `
      <span>${h.name}</span>
      <button onclick="completeHabit(${i})">+${h.xp} XP</button>
    `;
    habitList.appendChild(div);
  });
}

function renderXP() {
  const levelXP = state.level * 100;
  const pct = Math.min(100, (state.xp / levelXP) * 100);
  xpFill.style.width = pct + "%";
  xpText.innerText = `XP: ${state.xp} / ${levelXP}`;
  levelText.innerText = `Level ${state.level}`;
}

function renderCalendar() {
  calendar.innerHTML = "";
  const today = new Date();
  const todayKey = today.toISOString().slice(0,10);

  for (let i = 1; i <= 30; i++) {
    const key = todayKey.slice(0,8) + String(i).padStart(2,"0");
    const div = document.createElement("div");
    div.className = "day";

    if (state.days[key]) div.classList.add("good");
    if (i === today.getDate()) div.classList.add("today");

    div.innerText = i + (state.days[key] ? "🔥" : "");
    calendar.appendChild(div);
  }
}

function renderProps() {
  propsText.innerText = `Make-up props: ${state.props}`;
}

function renderPlan() {
  planList.innerHTML = "";
  [...state.habits, ...state.customGoals].forEach(h => {
    const li = document.createElement("div");
    li.innerText = h.name || h;
    planList.appendChild(li);
  });
}

// ---------- ACTIONS ----------
function completeHabit(i) {
  state.xp += state.habits[i].xp;
  checkLevelUp();
  render();
}

function completeDay(useProp = false) {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  // If using a prop, mark yesterday instead of today
  let dayKey = todayKey;
  if (useProp) {
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    dayKey = yesterday.toISOString().slice(0, 10);

    if (state.props > 0) {
      state.props--;
      alert("You used a make-up prop for yesterday! 🎉");
    } else {
      alert("No props left!");
      return;
    }
  }

  // Mark the day as completed
  state.days[dayKey] = true;

  // ----------- STREAK CALCULATION -----------
  // Streak = consecutive completed days ending today
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (state.days[key]) {
      streak++;
    } else {
      break; // stop at first missed day
    }
  }
  state.streak = streak;

  // Reward prop every 21-day streak
  if (streak > 0 && streak % 7 === 0) {
    state.props++;
    alert("Congrats! You earned a make-up prop for a 21-day streak! 🌟");
  }

  render();
}

function addCustomGoal() {
  if (customGoal.value.trim()) {
    state.customGoals.push(customGoal.value);
    customGoal.value = "";
    render();
  }
}

function checkLevelUp() {
  if (state.xp >= state.level * 100) {
    state.level++;
  }
}

function save() {
  localStorage.setItem("state", JSON.stringify(state));
}

// ---------- QUEST ----------
const quests = [
  "Complete 3 habits",
  "Shower before noon",
  "Reflect today"
];
dailyQuest.innerText = quests[Math.floor(Math.random()*quests.length)];

function useProp() {
  const confirmUse = confirm("Use a make-up prop for yesterday?");
  if (confirmUse) {
    completeDay(true); // mark yesterday as completed
  }
}

function completeQuest() {
  state.xp += 30;
  checkLevelUp();
  render();
}
