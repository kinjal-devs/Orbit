
(() => {
  const calendar = document.getElementById("attendance-calendar");

  if (!calendar) return;

  let displayedMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  let selectedDate = new Date().toISOString().slice(0, 10);

  function getData(key) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function renderCalendar() {
    const classes = getData("orbitTimetable");
    const records = getData("orbitAttendanceRecords");

    calendar.innerHTML = "";

    const header = document.createElement("div");
    header.className = "attendance-calendar-header";

    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "calendar-nav";
    previous.textContent = "‹";

    previous.addEventListener("click", () => {
      displayedMonth.setMonth(displayedMonth.getMonth() - 1);
      renderCalendar();
    });

    const heading = document.createElement("h3");
    heading.textContent = displayedMonth.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric"
    });

    const next = document.createElement("button");
    next.type = "button";
    next.className = "calendar-nav";
    next.textContent = "›";

    next.addEventListener("click", () => {
      displayedMonth.setMonth(displayedMonth.getMonth() + 1);
      renderCalendar();
    });

    header.append(previous, heading, next);
    calendar.appendChild(header);

    const weekdays = document.createElement("div");
    weekdays.className = "attendance-calendar-weekdays";

    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(day => {
      const label = document.createElement("span");
      label.textContent = day;
      weekdays.appendChild(label);
    });

    calendar.appendChild(weekdays);

    const grid = document.createElement("div");
    grid.className = "attendance-calendar-grid";

    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < offset; i++) {
      const blank = document.createElement("span");
      blank.className = "attendance-calendar-blank";
      grid.appendChild(blank);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const key = dateKey(date);

      const dayName = date.toLocaleDateString("en-US", {
        weekday: "long"
      });

      const scheduled = classes.filter(item => item.day === dayName);

      const dayRecords = records.filter(record => record.date === key);

      const present = dayRecords.filter(
        record => record.status === "Present"
      ).length;

      const absent = dayRecords.filter(
        record => record.status === "Absent"
      ).length;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "attendance-calendar-day";

      if (key === selectedDate) {
        button.classList.add("selected");
      }

      if (key === dateKey(new Date())) {
        button.classList.add("today");
      }

      const number = document.createElement("span");
      number.className = "attendance-calendar-number";
      number.textContent = day;

      button.appendChild(number);

      if (scheduled.length > 0) {
        const indicator = document.createElement("small");

        if (dayRecords.length === 0) {
          button.classList.add("attendance-day-unmarked");
          indicator.textContent = "Not marked";
        } else if (absent > 0) {
          button.classList.add("attendance-day-absent");
          indicator.textContent = `${present}/${scheduled.length}`;
        } else {
          button.classList.add("attendance-day-recorded");
          indicator.textContent = `${present}/${scheduled.length}`;
        }

        button.appendChild(indicator);
      }

      button.addEventListener("click", () => {
        selectedDate = key;
        localStorage.setItem("orbitSelectedAttendanceDate", key);

        calendar.dispatchEvent(
          new CustomEvent("orbit-date-selected", {
            bubbles: true,
            detail: { date: key }
          })
        );

        renderCalendar();
      });

      grid.appendChild(button);
    }

    calendar.appendChild(grid);

    const legend = document.createElement("div");
    legend.className = "attendance-calendar-legend";

    legend.innerHTML = `
      <span><i class="legend-present"></i> Present</span>
      <span><i class="legend-absent"></i> Absent</span>
      <span><i class="legend-unmarked"></i> Not marked</span>
    `;

    calendar.appendChild(legend);
  }

  window.addEventListener("storage", renderCalendar);

  renderCalendar();
})();
