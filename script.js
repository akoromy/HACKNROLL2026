// LOAD DATA
let streak = Number(localStorage.getItem("streak")) || 0;
let lastDate = localStorage.getItem("lastDate") || "";
let achievements = JSON.parse(localStorage.getItem("achievements")) || [];

document.getElementById("streak").innerText = streak;
renderAchievements();

// GENERATE PLAN
function generatePlan() {
  const activity = activityValue();
  const sweat = sweatValue();
  const busy = busyValue();
  const savage = savageMode();

  let showerPlan;
  if (activity === "high" || sweat === "yes") {
    showerPlan = "Shower every day 🚿";
  } else if (activity === "medium") {
    showerPlan = "Shower every other day";
  } else {
    showerPlan = "Shower at least 3x a week";
  }

  const reminder = getReminder(busy, savage);

  document.getElementById("plan").innerHTML = `
    <h2>Your Hygiene Plan</h2>
    <ul>
      <li>${showerPlan}</li>
      <li>Brush teeth twice a day 🦷</li>
      <li>Use deodorant daily 🧴</li>
      <li>Change clothes regularly 👕</li>
    </ul>
    <p><strong>Reminder:</strong> ${reminder}</p>
  `;
}

// SAVE DAILY TRACKER
function saveToday() {
  const allDone =
    checked("shower") &&
    checked("teeth") &&
    checked("deo") &&
    checked("clothes");

  const today = new Date().toDateString();

  if (today !== lastDate) {
    if (allDone) {
      streak++;
      checkAchievements();
    } else {
      streak = 0;
      alert(getPunishment());
    }
    lastDate = today;
  }

  localStorage.setItem("streak", streak);
  localStorage.setItem("lastDate", lastDate);
  document.getElementById("streak").innerText = streak;
}

// ACHIEVEMENTS
function checkAchievements() {
  if (streak === 3) addAchievement("3-day streak 🥉");
  if (streak === 7) addAchievement("7-day streak 🥈");
  if (streak === 25) addAchievement("25-day hygiene hero 🥇");
}

function addAchievement(text) {
  if (!achievements.includes(text)) {
    achievements.push(text);
    localStorage.setItem("achievements", JSON.stringify(achievements));
    renderAchievements();
  }
}

function renderAchievements() {
  const list = document.getElementById("achievements");
  list.innerHTML = "";
  achievements.forEach(a => {
    const li = document.createElement("li");
    li.innerText = a;
    list.appendChild(li);
  });
}

// HELPERS
function checked(id) {
  return document.getElementById(id).checked;
}

function activityValue() {
  return document.getElementById("activity").value;
}
function sweatValue() {
  return document.getElementById("sweat").value;
}
function busyValue() {
  return document.getElementById("busy").value;
}
function savageMode() {
  return document.getElementById("savage").checked;
}

// REMINDERS (EDIT THIS!!)
function getReminder(busy, savage) {
  const normalReminders = [
    "Clean habits = clean commits.",
    "Future you will thank you.",
    "A 5-minute shower is still a shower."
  ];

  const savageReminders = [
    "Your keyboard deserves better than this.",
    "Your code compiles. You don’t.",
    "This is why people open windows near you."
  ];

  const list = savage ? savageReminders : normalReminders;
  return list[Math.floor(Math.random() * list.length)];
}

// PUNISHMENTS (EDIT THIS!!)
function getPunishment() {
  const punishments = [
    "🚨 HYGIENE ALERT: STREAK DESTROYED 🚨",
    "The deodorant gods are disappointed.",
    "Your hoodie can walk away on its own."
  ];
  return punishments[Math.floor(Math.random() * punishments.length)];
}

