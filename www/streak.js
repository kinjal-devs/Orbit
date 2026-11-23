/* =========================================
   ORBIT — STREAK JOURNEY PAGE
   Reads the same orbitStudyStreak data as Home.
========================================= */
(() => {
  const page = document.getElementById("streak");
  if (!page) return;

  const storageKey = "orbitStudyStreak";
  const $ = (id) => document.getElementById(id);
  const dateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  };

  function readHistory() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch {
      return {};
    }
  }

  function getActiveDates(history) {
    return Object.keys(history).filter((date) =>
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      Array.isArray(history[date]) && history[date].length > 0
    ).sort();
  }

  function getCurrentStreak(activeDates, today) {
    const active = new Set(activeDates);
    const cursor = new Date(today + "T00:00:00");
    const yesterday = new Date(cursor);
    yesterday.setDate(yesterday.getDate() - 1);
    if (!active.has(today)) {
      if (!active.has(dateKey(yesterday))) return 0;
      cursor.setTime(yesterday.getTime());
    }
    let count = 0;
    while (active.has(dateKey(cursor))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  function getBestStreak(activeDates) {
    let best = 0;
    let run = 0;
    let previous = null;
    activeDates.forEach((date) => {
      if (previous) {
        const next = new Date(previous + "T00:00:00");
        next.setDate(next.getDate() + 1);
        run = dateKey(next) === date ? run + 1 : 1;
      } else run = 1;
      best = Math.max(best, run);
      previous = date;
    });
    return best;
  }

  function render() {
    const history = readHistory();
    const activeDates = getActiveDates(history);
    const active = new Set(activeDates);
    const today = dateKey(new Date());
    const current = getCurrentStreak(activeDates, today);
    const best = getBestStreak(activeDates);
    const total = activeDates.length;
    const xp = total * 10;
    const level = Math.floor(xp / 100) + 1;
    const levelNames = ["Seedling", "Sprout", "Growing", "Blooming", "Flourishing", "Evergreen"];

    $("journey-current").textContent = current;
    $("journey-best").textContent = best + (best === 1 ? " day" : " days");
    $("journey-total-days").textContent = total;
    $("journey-xp").textContent = xp;
    $("journey-level").textContent = level;
    $("journey-level-name").textContent = levelNames[Math.min(level - 1, levelNames.length - 1)];
    const plant = $("journey-plant");
    if (plant) {
      const growthStage = level >= 4 ? "blooming" : level >= 3 ? "growing" : level >= 2 ? "sprout" : "seedling";
      plant.dataset.growthStage = growthStage;
      plant.setAttribute("aria-label", "Your study plant is at the " + growthStage + " stage");
    }


    $("journey-message").textContent = current
      ? "You're building something wonderful. Keep your rhythm going!"
      : "Every journey starts with one small step. Log an activity on Home today.";

    const week = $("journey-week");
    week.innerHTML = "";
    for (let offset = 6; offset >= 0; offset--) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = dateKey(date);
      const day = document.createElement("div");
      day.className = "journey-week-day" +
        (active.has(key) ? " is-active" : "") +
        (key === today ? " is-today" : "");
      const dot = document.createElement("span");
      dot.className = "journey-week-dot";
      dot.textContent = active.has(key) ? "✓" : "";
      const label = document.createElement("span");
      label.textContent = date.toLocaleDateString("en-IN", { weekday: "short" });
      day.append(dot, label);
      day.title = date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
      week.appendChild(day);
    }

    const garden = $("journey-garden");
    garden.innerHTML = "";
    for (let offset = 27; offset >= 0; offset--) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = dateKey(date);
      const cell = document.createElement("span");
      cell.className = "journey-garden-day" +
        (active.has(key) ? " is-active" : "") +
        (key === today ? " is-today" : "");
      cell.title = key + (active.has(key) ? " · Activity completed" : " · No activity");
      cell.setAttribute("aria-label", cell.title);
      garden.appendChild(cell);
    }

    const milestones = [
      { days: 1, title: "First Step", icon: "🌱" },
      { days: 3, title: "Finding Rhythm", icon: "✨" },
      { days: 7, title: "One Week Strong", icon: "🔥" },
      { days: 14, title: "Two-Week Flow", icon: "🌿" },
      { days: 30, title: "Consistency Star", icon: "⭐" },
      { days: 60, title: "Blooming", icon: "🌸" }
    ];
    const list = $("journey-milestones");
    list.innerHTML = "";
    milestones.forEach((milestone) => {
      const unlocked = best >= milestone.days;
      const item = document.createElement("article");
      item.className = "journey-milestone" + (unlocked ? " is-unlocked" : "");
      const icon = document.createElement("span");
      icon.className = "journey-milestone-icon";
      icon.textContent = milestone.icon;
      const copy = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = milestone.title;
      const detail = document.createElement("small");
      detail.textContent = unlocked ? "Unlocked · " + milestone.days + " day streak" : milestone.days + " day streak";
      copy.append(title, detail);
      item.append(icon, copy);
      list.appendChild(item);
    });
  }

  render();
  window.addEventListener("storage", render);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) render();
  });
})();
