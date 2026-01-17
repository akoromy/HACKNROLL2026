/************** TODAY'S CHECKLIST **************/
const tasks = [
  "Brush teeth",
  "Wash face",
  "Shower",
  "Drink water",
  "Skincare routine"
];

const todayKey = new Date().toDateString();
const saved = JSON.parse(localStorage.getItem(todayKey)) || {};

const checklist = document.getElementById("checklist");

tasks.forEach(task => {
  const li = document.createElement("li");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = saved[task] || false;

  checkbox.addEventListener("change", () => {
    saved[task] = checkbox.checked;
    localStorage.setItem(todayKey, JSON.stringify(saved));
  });

  li.appendChild(checkbox);
  li.append(" " + task);
  checklist.appendChild(li);
});

/************** STREAK CALENDAR (MONTH) **************/
const calendar = document.getElementById("calendar");
const daysInMonth = new Date(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  0
).getDate();

for (let i = 1; i <= daysInMonth; i++) {
  const day = document.createElement("span");
  day.textContent = i;
  day.style.margin = "4px";
  day.style.display = "inline-block";
  day.style.width = "24px";
  day.style.borderRadius = "50%";
  day.style.background = "#ffd6e8";
  calendar.appendChild(day);
}

/************** YEAR VIEW **************/
document.getElementById("calendarCard").onclick = () => {
  alert("📅 Yearly streak view (future expansion)");
};

/************** CHICKEN SOUP **************/
const quotes = [
  "You’re doing better than you think 🌱",
  "Small steps still move you forward 🐾",
  "Consistency beats perfection 💖",
  "Taking care of yourself matters 🌸"
];

document.getElementById("quote").textContent =
  quotes[Math.floor(Math.random() * quotes.length)];

/************** BADGES **************/
document.getElementById("badgeCard").onclick = () => {
  alert("🏅 All badges:\n• Beginner\n• 7-Day Streak\n• Hygiene Hero");
};
