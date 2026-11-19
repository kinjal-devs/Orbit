/* =========================================
   KUMI - APPLICATION
   Complete application JavaScript
========================================= */

/* =========================================
   1. SHARED HELPERS
========================================= */

function getElement(id) {
  return document.getElementById(id);
}

function loadStorage(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Could not save ${key}:`, error);
    alert("Kumi couldn't save this change. Your browser storage may be full.");
    return false;
  }
}

function formatISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseISODate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getMonday(date) {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;

  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);

  return result;
}

function getDayName(date) {
  return [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ][(date.getDay() + 6) % 7];
}
// NATIVE TIME PICKER
["class-start", "class-end"].forEach((id) => {
  const input = document.getElementById(id);

  if (input) {
    input.addEventListener("click", () => {
      if (input.showPicker) {
        input.showPicker();
      }
    });
  }
});
/* =========================================
   2. LIVE DATE
========================================= */

const dateElement = getElement("current-date");

function updateDate() {
  if (!dateElement) return;

  dateElement.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

updateDate();

/* =========================================
   3. SIDEBAR NAVIGATION
========================================= */

const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

function openPage(targetPage) {
  const selectedPage = getElement(targetPage);

  if (!selectedPage) return;

  pages.forEach((page) => page.classList.remove("active"));
  navItems.forEach((item) => item.classList.remove("active"));

  selectedPage.classList.add("active");

  document
    .querySelectorAll(`.nav-item[data-page="${targetPage}"]`)
    .forEach((item) => item.classList.add("active"));

  try {
    localStorage.setItem("kumiLastPage", targetPage);
  } catch (error) {
    console.warn("Could not save the current page.");
  }
}

navItems.forEach((button) => {
  button.addEventListener("click", () => {
    openPage(button.dataset.page);
  });
});

// Restore the last opened page after refreshing.
const savedPage = localStorage.getItem("kumiLastPage");

const pageToOpen = savedPage && getElement(savedPage) ? savedPage : "home";

openPage(pageToOpen);

/* =========================================
   4. PROFILE PHOTO
========================================= */

const profileImage = getElement("profile-image");
const photoUpload = getElement("photo-upload");

const savedPhoto = localStorage.getItem("kumiProfilePhoto");

if (profileImage && savedPhoto) {
  profileImage.src = savedPhoto;
}

if (photoUpload) {
  photoUpload.addEventListener("change", function () {
    const file = this.files[0];

    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        localStorage.setItem("kumiProfilePhoto", event.target.result);

        if (profileImage) {
          profileImage.src = event.target.result;
        }
      } catch {
        alert("This photo is too large to save. Try a smaller image.");
      }
    };

    reader.readAsDataURL(file);
  });
}

/* =========================================
   5. PROFILE DETAILS
========================================= */

const profileFields = document.querySelectorAll(
  ".profile-details p[contenteditable='true']",
);

profileFields.forEach((field, index) => {
  const savedValue = localStorage.getItem(`kumiProfile_${index}`);

  if (savedValue !== null) {
    field.textContent = savedValue;
  }

  field.addEventListener("input", () => {
    localStorage.setItem(`kumiProfile_${index}`, field.textContent);
  });
});

/* =========================================
   6. TO-DO LIST
========================================= */

const taskInput = getElement("task-input");
const addTaskButton = getElement("add-task");
const todoList = getElement("todo-list");
const taskFilter = getElement("task-filter");

let tasks = loadStorage("kumiTasks", []);

if (!Array.isArray(tasks)) tasks = [];

tasks = tasks.filter(
  (task) =>
    task &&
    typeof task.text === "string" &&
    typeof task.completed === "boolean",
);

function saveTasks() {
  saveStorage("kumiTasks", tasks);
}

function addTask() {
  if (!taskInput) return;

  const taskText = taskInput.value.trim();

  if (!taskText) return;

  tasks.push({
    id: Date.now().toString(),
    text: taskText,
    completed: false,
  });

  saveTasks();

  taskInput.value = "";
  renderTasks();
}

function renderTasks() {
  if (!todoList || !taskFilter) return;

  todoList.innerHTML = "";

  const filter = taskFilter.value;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;

    return true;
  });

  if (filteredTasks.length === 0) {
    const message = document.createElement("p");

    message.className = "empty-message";
    message.textContent = "Nothing here yet ♡";

    todoList.appendChild(message);
    return;
  }

  filteredTasks.forEach((task) => {
    const taskItem = document.createElement("div");
    taskItem.className = "task-item";

    if (task.completed) {
      taskItem.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.text}`);

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const taskText = document.createElement("span");
    taskText.textContent = task.text;

    taskItem.append(checkbox, taskText);
    todoList.appendChild(taskItem);
  });
}

if (addTaskButton) {
  addTaskButton.addEventListener("click", addTask);
}

if (taskInput) {
  taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addTask();
  });
}

if (taskFilter) {
  taskFilter.addEventListener("change", renderTasks);
}

renderTasks();

/* =========================================
   8. PHOTO EDITOR
========================================= */

(() => {
  const image = getElement("profile-image");
  const editor = getElement("photo-editor");
  const preview = getElement("photo-preview-image");
  const previewBox = document.querySelector(".photo-preview");
  const fileInput = getElement("new-photo-upload");
  const zoomSlider = getElement("photo-zoom");

  const saveButton = getElement("save-photo");
  const cancelButton = getElement("cancel-photo");
  const resetButton = getElement("reset-photo");

  if (
    !image ||
    !editor ||
    !preview ||
    !previewBox ||
    !fileInput ||
    !zoomSlider
  ) {
    return;
  }

  let imageSource = "";
  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;
  let startX = 0;
  let startY = 0;
  let dragging = false;

  function updatePreview() {
    preview.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;
  }

  function openEditor() {
    if (!image.src) return;

    imageSource = image.src;
    preview.src = imageSource;

    zoom = 1;
    offsetX = 0;
    offsetY = 0;

    zoomSlider.value = 1;

    updatePreview();
    editor.hidden = false;
  }

  image.addEventListener("click", openEditor);
  image.style.cursor = "pointer";

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      imageSource = reader.result;
      preview.src = imageSource;

      zoom = 1;
      offsetX = 0;
      offsetY = 0;
      zoomSlider.value = 1;

      updatePreview();
    };

    reader.readAsDataURL(file);
  });

  zoomSlider.addEventListener("input", () => {
    zoom = Number(zoomSlider.value);
    updatePreview();
  });

  previewBox.addEventListener("pointerdown", (event) => {
    if (!imageSource) return;

    dragging = true;

    startX = event.clientX - offsetX;
    startY = event.clientY - offsetY;

    previewBox.setPointerCapture(event.pointerId);
  });

  previewBox.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    offsetX = event.clientX - startX;
    offsetY = event.clientY - startY;

    updatePreview();
  });

  previewBox.addEventListener("pointerup", () => {
    dragging = false;
  });

  previewBox.addEventListener("pointercancel", () => {
    dragging = false;
  });

  resetButton?.addEventListener("click", () => {
    zoom = 1;
    offsetX = 0;
    offsetY = 0;

    zoomSlider.value = 1;
    updatePreview();
  });

  cancelButton?.addEventListener("click", () => {
    editor.hidden = true;
    fileInput.value = "";
  });

  saveButton?.addEventListener("click", () => {
    if (!imageSource) return;

    const sourceImage = new Image();

    sourceImage.onload = () => {
      const rect = previewBox.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const outputSize = 600;

      const baseScale = Math.max(
        rect.width / sourceImage.width,
        rect.height / sourceImage.height,
      );

      const scale = baseScale * zoom;

      const cropWidth = rect.width / scale;
      const cropHeight = rect.height / scale;

      const cropX = Math.max(
        0,
        Math.min(
          sourceImage.width - cropWidth,
          (sourceImage.width - cropWidth) / 2 - offsetX / scale,
        ),
      );

      const cropY = Math.max(
        0,
        Math.min(
          sourceImage.height - cropHeight,
          (sourceImage.height - cropHeight) / 2 - offsetY / scale,
        ),
      );

      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;

      const context = canvas.getContext("2d");

      if (!context) return;

      context.drawImage(
        sourceImage,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputSize,
        outputSize,
      );

      try {
        const saved = canvas.toDataURL("image/jpeg", 0.88);

        localStorage.setItem("kumiProfilePhoto", saved);
        image.src = saved;

        editor.hidden = true;
        fileInput.value = "";
      } catch {
        alert("Could not save this photo. Try a smaller image.");
      }
    };

    sourceImage.onerror = () => {
      alert("Could not load this image. Please choose another.");
    };

    sourceImage.src = imageSource;
  });
})();

/* =========================================
   9. PERSONAL MOTTO
========================================= */

const mottoCard = document.querySelector(".motto-card");

if (mottoCard) {
  const savedMotto = localStorage.getItem("kumiPersonalMotto");

  if (savedMotto) {
    mottoCard.innerHTML = savedMotto;
  }

  mottoCard.addEventListener("input", () => {
    localStorage.setItem("kumiPersonalMotto", mottoCard.innerHTML);
  });
}

/* =========================================
   10. PROFILE STICKERS
========================================= */


/* =========================================
   10. PROFILE STICKERS
========================================= */

(() => {
  const stickerArea = getElement("sticker-area");
  const input = getElement("custom-sticker");
  const container = getElement("profile-stickers");

  if (!stickerArea || !input || !container) return;

  let stickers = loadStorage("kumiStickers", []);

  if (!Array.isArray(stickers)) stickers = [];

  function renderStickers() {
    container.innerHTML = "";

    // Show plus only when there are no stickers
    stickerArea.classList.toggle(
      "has-stickers",
      stickers.length > 0
    );

    stickers.forEach((sticker, index) => {
      const item = document.createElement("span");

      item.className = "profile-sticker";
      item.textContent = sticker;
      item.title = "Tap to remove";

      item.addEventListener("click", (event) => {
        event.stopPropagation();

        stickers.splice(index, 1);

        if (saveStorage("kumiStickers", stickers)) {
          renderStickers();
        }
      });

      container.appendChild(item);
    });
  }

  // Touch or click the plus area to add stickers
  stickerArea.addEventListener("click", () => {
    input.focus();
  });

  input.addEventListener("input", () => {
    const value = input.value.trim();

    if (!value) return;

    stickers.push(value);

    if (saveStorage("kumiStickers", stickers)) {
      input.value = "";
      renderStickers();
    } else {
      stickers.pop();
    }
  });

  renderStickers();
})();


/* =========================================
   11. INTERACTIVE CALENDAR
========================================= */

(() => {
  const monthDisplay = getElement("calendar-month");
  const yearDisplay = getElement("calendar-year");
  const daysContainer = getElement("calendar-days");

  const prevButton = getElement("prev-month");
  const nextButton = getElement("next-month");

  const selectedDateTitle = getElement("selected-date-heading");
  const selectedDateEvents = getElement("selected-date-events");
  const eventList = getElement("calendar-event-list");

  const addEventButton = getElement("add-event-btn");
  const eventForm = getElement("event-form");
  const closeEventButton = getElement("close-event-form");
  const saveEventButton = getElement("save-event-btn");

  const eventTitleInput = getElement("event-title");
  const eventDateInput = getElement("event-date");
  const eventCategoryInput = getElement("event-category");

  if (!monthDisplay || !daysContainer || !eventList) return;

  const today = new Date();

  let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  let selectedDate = formatISODate(today);
  let editingEventId = null;

  let events = loadStorage("kumiCalendarEvents", []);

  if (!Array.isArray(events)) events = [];

  events = events.filter(
    (event) =>
      event &&
      event.id !== undefined &&
      typeof event.title === "string" &&
      typeof event.date === "string",
  );

  const categoryColours = {
    College: "#A8B99A",
    Study: "#F3E5B5",
    Exam: "#C77B83",
    Personal: "#A9C6D8",
    Other: "#E8B4C8",
  };

  function saveEvents() {
    return saveStorage("kumiCalendarEvents", events);
  }

  function getDateLabel(dateString) {
    return parseISODate(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function renderSelectedDateEvents() {
    if (!selectedDateEvents || !selectedDateTitle) return;

    selectedDateTitle.textContent = getDateLabel(selectedDate);
    selectedDateEvents.innerHTML = "";

    const selectedEvents = events.filter(
      (event) => event.date === selectedDate,
    );

    if (selectedEvents.length === 0) {
      const empty = document.createElement("div");

      empty.className = "selected-date-empty";
      empty.innerHTML = `
        <span>✧</span>
        <p>No plans for this day yet.</p>
        <small>A little space for something new ♡</small>
      `;

      selectedDateEvents.appendChild(empty);
      return;
    }

    selectedEvents.forEach((event) => {
      const card = document.createElement("div");
      card.className = "selected-date-event";

      card.style.setProperty(
        "--event-colour",
        categoryColours[event.category] || "#E8B4C8",
      );

      const title = document.createElement("h3");
      title.textContent = event.title;

      const category = document.createElement("small");
      category.textContent = event.category;

      card.append(title, category);
      selectedDateEvents.appendChild(card);
    });
  }

  function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    monthDisplay.textContent = currentMonth.toLocaleDateString("en-IN", {
      month: "long",
    });

    if (yearDisplay) yearDisplay.textContent = year;

    daysContainer.innerHTML = "";

    const firstDay = new Date(year, month, 1);
    const startDay = (firstDay.getDay() + 6) % 7;

    const gridStart = new Date(year, month, 1 - startDay);

    for (let index = 0; index < 42; index++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);

      const dateString = formatISODate(date);

      const button = document.createElement("button");

      button.type = "button";
      button.className = "calendar-day";
      button.dataset.date = dateString;

      const number = document.createElement("span");
      number.className = "calendar-day-number";
      number.textContent = date.getDate();

      button.appendChild(number);

      if (date.getMonth() !== month) {
        button.classList.add("other-month");
      }

      if (dateString === formatISODate(today)) {
        button.classList.add("today");
      }

      if (dateString === selectedDate) {
        button.classList.add("selected");
      }

      const dayEvents = events.filter((event) => event.date === dateString);

      if (dayEvents.length) {
        const dots = document.createElement("span");
        dots.className = "calendar-day-dots";

        const categories = [
          ...new Set(dayEvents.map((event) => event.category)),
        ];

        categories.forEach((category) => {
          const dot = document.createElement("span");

          dot.className = "calendar-category-dot";
          dot.style.backgroundColor = categoryColours[category] || "#E8B4C8";

          dots.appendChild(dot);
        });

        button.appendChild(dots);
      }

      button.addEventListener("click", () => {
        selectedDate = dateString;

        currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);

        renderAll();
      });

      daysContainer.appendChild(button);
    }
  }

  function renderEvents() {
    const title = getElement("monthly-events-title");

    if (title) {
      title.textContent =
        currentMonth.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        }) + " Events";
    }

    eventList.innerHTML = "";

    const monthlyEvents = events
      .filter((event) => {
        const date = parseISODate(event.date);

        return (
          date.getFullYear() === currentMonth.getFullYear() &&
          date.getMonth() === currentMonth.getMonth()
        );
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    if (monthlyEvents.length === 0) {
      const empty = document.createElement("div");

      empty.className = "calendar-empty";
      empty.innerHTML = `
        <span>✧</span>
        <p>No events planned for this month yet.</p>
        <small>Your upcoming plans will appear here ♡</small>
      `;

      eventList.appendChild(empty);
      return;
    }

    monthlyEvents.forEach((event) => {
      const card = document.createElement("div");
      card.className = "calendar-event-item";

      const colour = categoryColours[event.category] || "#E8B4C8";

      card.style.setProperty("--event-colour", colour);

      const details = document.createElement("div");
      details.className = "calendar-event-details";

      const title = document.createElement("h3");
      title.textContent = event.title;

      const dateLabel = document.createElement("small");
      dateLabel.textContent = parseISODate(event.date).toLocaleDateString(
        "en-IN",
        {
          weekday: "short",
          day: "numeric",
          month: "long",
        },
      );

      const category = document.createElement("span");
      category.className = "event-category-tag";
      category.textContent = event.category;
      category.style.backgroundColor = colour;

      details.append(title, dateLabel, category);

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "edit-event";
      editButton.textContent = "Edit";

      editButton.addEventListener("click", () => {
        editingEventId = event.id;

        eventTitleInput.value = event.title;
        eventDateInput.value = event.date;
        eventCategoryInput.value = event.category;

        eventForm.querySelector("h2").textContent = "Edit Event ♡";
        saveEventButton.textContent = "Update Event";

        eventForm.hidden = false;
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete-event";
      deleteButton.textContent = "×";
      deleteButton.setAttribute("aria-label", "Delete event");

      deleteButton.addEventListener("click", () => {
        if (!confirm("Delete this event?")) return;

        events = events.filter((item) => item.id !== event.id);

        saveEvents();
        renderAll();
      });

      card.append(details, editButton, deleteButton);
      eventList.appendChild(card);
    });
  }

  function resetEventForm() {
    editingEventId = null;

    if (eventForm) {
      eventForm.hidden = true;

      const heading = eventForm.querySelector("h2");
      if (heading) heading.textContent = "New Event ♡";
    }

    if (saveEventButton) {
      saveEventButton.textContent = "Save Event";
    }
  }

  addEventButton?.addEventListener("click", () => {
    editingEventId = null;

    eventTitleInput.value = "";
    eventDateInput.value = selectedDate;

    eventForm.querySelector("h2").textContent = "New Event ♡";
    saveEventButton.textContent = "Save Event";

    eventForm.hidden = false;
  });

  closeEventButton?.addEventListener("click", resetEventForm);

  eventForm?.addEventListener("click", (event) => {
    if (event.target === eventForm) resetEventForm();
  });

  saveEventButton?.addEventListener("click", () => {
    const title = eventTitleInput.value.trim();
    const date = eventDateInput.value;
    const category = eventCategoryInput.value;

    if (!title || !date) {
      alert("Please enter an event name and date.");
      return;
    }

    if (editingEventId !== null) {
      const existing = events.find((event) => event.id === editingEventId);

      if (existing) {
        existing.title = title;
        existing.date = date;
        existing.category = category;
      }
    } else {
      events.push({
        id: Date.now().toString(),
        title,
        date,
        category,
      });
    }

    if (!saveEvents()) return;

    selectedDate = date;

    const selected = parseISODate(date);
    currentMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);

    resetEventForm();
    renderAll();
  });

  prevButton?.addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    selectedDate = formatISODate(currentMonth);
    renderAll();
  });

  nextButton?.addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    selectedDate = formatISODate(currentMonth);
    renderAll();
  });

  function renderAll() {
    renderCalendar();
    renderEvents();
    renderSelectedDateEvents();
  }

  renderAll();
})();

/* =========================================
   12. ATTENDANCE SYSTEM
========================================= */

(() => {
  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const dayPicker = getElement("timetable-day-picker");
  const scheduleContainer = getElement("timetable-schedule");

  const selectedDayTitle = getElement("timetable-selected-day");
  const weekLabel = getElement("timetable-week-label");

  const previousWeek = getElement("prev-week");
  const nextWeek = getElement("next-week");

  const addClassButton = getElement("add-class-btn");
  const classForm = getElement("class-form");
  const closeClassForm = getElement("close-class-form");
  const saveClassButton = getElement("save-class-btn");

  const classFormTitle = getElement("class-form-title");
  const subjectInput = getElement("class-subject");
  const dayInput = getElement("class-day");
  const startInput = getElement("class-start");
  const endInput = getElement("class-end");
  const roomInput = getElement("class-room");

  const subjectAttendanceList = getElement("subject-attendance-list");
  const attendanceCalendar = getElement("attendance-calendar");

  if (!dayPicker || !scheduleContainer || !classForm) return;

  let classes = loadStorage("kumiTimetable", []);
  let attendanceRecords = loadStorage("kumiAttendanceRecords", []);

  if (!Array.isArray(classes)) classes = [];
  if (!Array.isArray(attendanceRecords)) attendanceRecords = [];

  classes = classes.filter(
    (item) =>
      item &&
      item.id !== undefined &&
      typeof item.subject === "string" &&
      typeof item.day === "string" &&
      typeof item.start === "string" &&
      typeof item.end === "string",
  );

  attendanceRecords = attendanceRecords.filter(
    (record) =>
      record &&
      record.classId !== undefined &&
      typeof record.date === "string" &&
      ["Present", "Absent", "Cancelled"].includes(record.status),
  );

  let editingClassId = null;

  let currentWeek = getMonday(new Date());
  let selectedDate = formatISODate(new Date());

  let attendanceMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );

  /* TIME HELPERS */

  function parseTime12(value) {
    if (!value) return null;

    const cleaned = value.trim().toUpperCase();

    // Accept 24-hour input such as 09:45 or 14:30
    const time24 = cleaned.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);

    if (time24) {
      return String(Number(time24[1])).padStart(2, "0") + ":" + time24[2];
    }

    // Accept 12-hour input such as 9:45 AM or 2:30 PM
    const time12 = cleaned.match(/^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/);

    if (!time12) return null;

    let hours = Number(time12[1]);
    const minutes = Number(time12[2]);
    const period = time12[3];

    if (hours < 1 || hours > 12) return null;

    if (period === "AM" && hours === 12) hours = 0;
    if (period === "PM" && hours !== 12) hours += 12;

    return (
      String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0")
    );
  }

  function formatTime12(value) {
    if (!value || typeof value !== "string") return "";

    const [hourPart, minutes] = value.split(":");
    const hours = Number(hourPart);

    if (!Number.isInteger(hours) || hours < 0 || hours > 23 || !minutes) {
      return value;
    }

    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes} ${period}`;
  }

  /* SAVE DATA */

  function saveClasses() {
    return saveStorage("kumiTimetable", classes);
  }

  function saveAttendance() {
    return saveStorage("kumiAttendanceRecords", attendanceRecords);
  }

  /* WEEK LABEL AND DAY PICKER */

  function renderWeek() {
    const sunday = new Date(currentWeek);
    sunday.setDate(sunday.getDate() + 6);

    const options = {
      day: "numeric",
      month: "short",
    };

    if (weekLabel) {
      weekLabel.textContent =
        currentWeek.toLocaleDateString("en-IN", options) +
        " – " +
        sunday.toLocaleDateString("en-IN", options);
    }

    dayPicker.innerHTML = "";

    dayNames.forEach((day, index) => {
      const date = new Date(currentWeek);
      date.setDate(date.getDate() + index);

      const dateString = formatISODate(date);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "timetable-day";
      button.dataset.day = day;

      if (dateString === selectedDate) {
        button.classList.add("active");
      }
      if (dateString === formatISODate(new Date())) {
        button.classList.add("today");
      }

      const name = document.createElement("span");
      name.textContent = day.slice(0, 3).toUpperCase();

      const number = document.createElement("strong");
      number.textContent = date.getDate();

      button.append(name, number);

      button.addEventListener("click", () => {
        selectedDate = dateString;
        renderAll();
      });

      dayPicker.appendChild(button);
    });
  }

  /* DAILY SCHEDULE */

  function renderSchedule() {
    const date = parseISODate(selectedDate);
    const selectedDay = getDayName(date);

    if (selectedDayTitle) {
      selectedDayTitle.textContent = date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }

    scheduleContainer.innerHTML = "";

    const dailyClasses = classes
      .filter((item) => item.day === selectedDay)
      .sort((a, b) => a.start.localeCompare(b.start));

    if (dailyClasses.length === 0) {
      const empty = document.createElement("div");

      empty.className = "timetable-empty";
      empty.innerHTML = `
        <span>✧</span>
        <p>No classes scheduled for this day.</p>
        <small>Add a class to build your timetable ♡</small>
      `;

      scheduleContainer.appendChild(empty);
      return;
    }

    dailyClasses.forEach((item) => {
      const card = document.createElement("div");
      card.className = "timetable-class-card";

      const details = document.createElement("div");
      details.className = "timetable-class-details";

      const subject = document.createElement("h3");
      subject.textContent = item.subject;

      const time = document.createElement("p");
      time.textContent = `${formatTime12(item.start)} – ${formatTime12(item.end)}`;

      const room = document.createElement("small");
      room.textContent = item.room || "Room not specified";

      details.append(subject, time, room);

      const record = attendanceRecords.find(
        (entry) =>
          String(entry.classId) === String(item.id) &&
          entry.date === selectedDate,
      );

      const status = record?.status || "";

      const actions = document.createElement("div");
      actions.className = "timetable-class-actions";

      const presentButton = document.createElement("button");
      presentButton.type = "button";
      presentButton.textContent = "Present";
      presentButton.className = "attendance-mark-button";

      if (status === "Present") {
        presentButton.classList.add("marked-present");
      }

      presentButton.addEventListener("click", () => {
        markAttendance(item, "Present");
      });

      const absentButton = document.createElement("button");
      absentButton.type = "button";
      absentButton.textContent = "Absent";
      absentButton.className = "attendance-mark-button";

      if (status === "Absent") {
        absentButton.classList.add("marked-absent");
      }

      absentButton.addEventListener("click", () => {
        markAttendance(item, "Absent");
      });

     const cancelledButton = document.createElement("button");
cancelledButton.type = "button";
cancelledButton.textContent = "Cancelled";
cancelledButton.className = "attendance-mark-button";

if (status === "Cancelled") {
  cancelledButton.classList.add("marked-cancelled");
}

cancelledButton.addEventListener("click", () => {
  markAttendance(item, "Cancelled");
});

actions.append(presentButton, absentButton, cancelledButton);

      actions.append(presentButton, absentButton, cancelledButton);

      const management = document.createElement("div");
      management.className = "timetable-management";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Edit";
      editButton.className = "edit-event";

      editButton.addEventListener("click", () => {
        openClassForm(item);
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "×";
      deleteButton.className = "delete-event";
      deleteButton.setAttribute("aria-label", "Delete class");

      deleteButton.addEventListener("click", () => {
        if (!confirm("Delete this class from your timetable?")) return;

        classes = classes.filter(
          (classItem) => String(classItem.id) !== String(item.id),
        );

        attendanceRecords = attendanceRecords.filter(
          (entry) => String(entry.classId) !== String(item.id),
        );

        saveClasses();
        saveAttendance();
        renderAll();
      });

      management.append(editButton, deleteButton);

      card.append(details, actions, management);
      scheduleContainer.appendChild(card);
    });
  }

  /* MARK ATTENDANCE */

function markAttendance(item, status) {
  const existing = attendanceRecords.find((record) => {
    return (
      String(record.classId) === String(item.id) &&
      record.date === selectedDate
    );
  });

  if (existing) {
    existing.status = status;
    existing.subject = item.subject;
  } else {
    attendanceRecords.push({
      classId: item.id,
      subject: item.subject,
      date: selectedDate,
      status: status,
    });
  }

  saveAttendance();
  renderAll();
}

  /* SUBJECT ATTENDANCE PERCENTAGES */

  /* OVERALL ATTENDANCE CIRCLE */

  function renderOverallAttendance() {
    const percentageElement = getElement("overall-attendance-percentage");

    const ring = getElement("overall-attendance-ring");

    const total = attendanceRecords.filter((record) =>
      ["Present", "Absent", "Cancelled"].includes(record.status),
    ).length;

    const present = attendanceRecords.filter(
      (record) => record.status === "Present",
    ).length;

    const absent = attendanceRecords.filter(
      (record) => record.status === "Absent",
    ).length;

    const percentage = total ? Math.round((present / total) * 100) : 0;

    if (percentageElement) {
      percentageElement.textContent = `${percentage}%`;
    }

    if (ring) {
      const radius = 82;
      const circumference = 2 * Math.PI * radius;

      ring.style.strokeDasharray = circumference;
      ring.style.strokeDashoffset = circumference * (1 - percentage / 100);
    }
  }
  function renderSubjectAttendance() {
    if (!subjectAttendanceList) return;

    subjectAttendanceList.innerHTML = "";

    const subjects = [...new Set(classes.map((item) => item.subject))];

    if (subjects.length === 0) {
      subjectAttendanceList.innerHTML =
        '<p class="empty-message">Add classes to see your attendance progress ♡</p>';
      return;
    }

    subjects.forEach((subject) => {
      const records = attendanceRecords.filter(
        (record) =>
          record.subject === subject &&
          ["Present", "Absent"].includes(record.status),
      );

      const present = records.filter(
        (record) => record.status === "Present",
      ).length;

      const total = records.length;

      const percentage = total ? Math.round((present / total) * 100) : 0;

      const item = document.createElement("div");
      item.className = "subject-attendance-item";

      const heading = document.createElement("div");
      heading.className = "subject-attendance-heading";

      const name = document.createElement("span");
      name.textContent = subject;

      const value = document.createElement("strong");
      value.textContent = total ? `${percentage}%` : "Not marked yet";

      heading.append(name, value);

      const track = document.createElement("div");
      track.className = "subject-attendance-track";

      const fill = document.createElement("div");
      fill.className = "subject-attendance-fill";
      fill.style.width = `${percentage}%`;

      track.appendChild(fill);

      const summary = document.createElement("small");
      summary.className = "attendance-summary";
      summary.textContent = `${present} present · ${total - present} absent · ${total} recorded`;

      item.append(heading, track, summary);
      subjectAttendanceList.appendChild(item);
    });
  }

  /* CLASS FORM */

  function openClassForm(item = null) {
    editingClassId = item ? item.id : null;

    classFormTitle.textContent = item ? "Edit Class ♡" : "New Class ♡";

    saveClassButton.textContent = item ? "Update Class" : "Save Class";

    subjectInput.value = item ? item.subject : "";
    dayInput.value = item ? item.day : getDayName(parseISODate(selectedDate));

    startInput.value = item ? item.start : "";
    endInput.value = item ? item.end : "";
    roomInput.value = item ? item.room || "" : "";

    classForm.hidden = false;
  }

  function closeForm() {
    classForm.hidden = true;
    editingClassId = null;
  }

  addClassButton?.addEventListener("click", () => {
    openClassForm();
  });

  closeClassForm?.addEventListener("click", closeForm);

  classForm.addEventListener("click", (event) => {
    if (event.target === classForm) closeForm();
  });

  /* SAVE CLASS */

  saveClassButton?.addEventListener("click", () => {
    const subject = subjectInput.value.trim();
    const day = dayInput.value;

    const start = parseTime12(startInput.value);
    const end = parseTime12(endInput.value);

    const room = roomInput.value.trim();

    if (!subject || !start || !end) {
      alert("Please enter a subject and valid times, like 9:00 AM.");
      return;
    }

    if (!dayNames.includes(day)) {
      alert("Please select a valid day.");
      return;
    }

    if (end <= start) {
      alert("The class end time must be after its start time.");
      return;
    }

    if (editingClassId !== null) {
      const item = classes.find(
        (entry) => String(entry.id) === String(editingClassId),
      );

      if (item) {
        item.subject = subject;
        item.day = day;
        item.start = start;
        item.end = end;
        item.room = room;

        attendanceRecords.forEach((record) => {
          if (String(record.classId) === String(editingClassId)) {
            record.subject = subject;
          }
        });
      }
    } else {
      classes.push({
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        subject,
        day,
        start,
        end,
        room,
      });
    }

    if (!saveClasses()) return;

    saveAttendance();

    const selectedDayIndex = dayNames.indexOf(day);
    const classDate = new Date(currentWeek);

    classDate.setDate(classDate.getDate() + selectedDayIndex);

    selectedDate = formatISODate(classDate);

    closeForm();
    renderAll();
  });

  /* WEEK NAVIGATION */

  previousWeek?.addEventListener("click", () => {
    currentWeek.setDate(currentWeek.getDate() - 7);

    selectedDate = formatISODate(currentWeek);

    renderAll();
  });

  nextWeek?.addEventListener("click", () => {
    currentWeek.setDate(currentWeek.getDate() + 7);

    selectedDate = formatISODate(currentWeek);

    renderAll();
  });

  /* MONTHLY ATTENDANCE CALENDAR */

  let calendarDisplayedMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );

  let calendarSelectedDate =
    localStorage.getItem("kumiSelectedAttendanceDate") ||
    formatISODate(new Date());

  function renderAttendanceCalendar() {
    if (!attendanceCalendar) return;

    attendanceCalendar.innerHTML = "";

    const header = document.createElement("div");
    header.className = "attendance-calendar-header";

    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "calendar-nav";
    previous.textContent = "‹";

    previous.addEventListener("click", () => {
      calendarDisplayedMonth.setMonth(calendarDisplayedMonth.getMonth() - 1);
      renderAttendanceCalendar();
    });

    const heading = document.createElement("h3");
    heading.textContent = calendarDisplayedMonth.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

    const next = document.createElement("button");
    next.type = "button";
    next.className = "calendar-nav";
    next.textContent = "›";

    next.addEventListener("click", () => {
      calendarDisplayedMonth.setMonth(calendarDisplayedMonth.getMonth() + 1);
      renderAttendanceCalendar();
    });

    header.append(previous, heading, next);
    attendanceCalendar.appendChild(header);

    const weekdays = document.createElement("div");
    weekdays.className = "attendance-calendar-weekdays";

    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) => {
      const label = document.createElement("span");
      label.textContent = day;
      weekdays.appendChild(label);
    });

    attendanceCalendar.appendChild(weekdays);

    const grid = document.createElement("div");
    grid.className = "attendance-calendar-grid";

    const year = calendarDisplayedMonth.getFullYear();
    const month = calendarDisplayedMonth.getMonth();

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
      const key = formatISODate(date);

      const dayName = date.toLocaleDateString("en-US", {
        weekday: "long",
      });

      const scheduled = classes.filter((item) => item.day === dayName);
      const dayRecords = attendanceRecords.filter(
        (record) => record.date === key,
      );

      const present = dayRecords.filter(
        (record) => record.status === "Present",
      ).length;

      const absent = dayRecords.filter(
        (record) => record.status === "Absent",
      ).length;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "attendance-calendar-day";

      if (key === calendarSelectedDate) {
        button.classList.add("selected");
      }

      if (key === formatISODate(new Date())) {
        button.classList.add("today");
      }

      const number = document.createElement("span");
      number.className = "attendance-calendar-number";
      number.textContent = day;
      button.appendChild(number);
if (scheduled.length > 0) {
  const indicator = document.createElement("small");

  const cancelledCount = dayRecords.filter(
    (record) => record.status === "Cancelled"
  ).length;

  const effectiveTotal = scheduled.length - cancelledCount;

  if (effectiveTotal === 0 && cancelledCount > 0) {
    button.classList.add("attendance-day-cancelled");
    indicator.textContent = "Cancelled";
  } else if (present + absent > 0) {
    if (absent > 0) {
      button.classList.add("attendance-day-absent");
    } else {
      button.classList.add("attendance-day-recorded");
    }

    indicator.textContent = `${present}/${effectiveTotal}`;
  }

  button.appendChild(indicator);
}
      button.addEventListener("click", () => {
        calendarSelectedDate = key;
        localStorage.setItem("kumiSelectedAttendanceDate", key);

        attendanceCalendar.dispatchEvent(
          new CustomEvent("kumi-date-selected", {
            bubbles: true,
            detail: { date: key },
          }),
        );

        renderAttendanceCalendar();
      });

      grid.appendChild(button);
    }

    attendanceCalendar.appendChild(grid);

    const legend = document.createElement("div");
    legend.className = "attendance-calendar-legend";

    legend.innerHTML = `
  <span><i class="legend-present"></i> Present</span>
  <span><i class="legend-absent"></i> Absent</span>
  <span><i class="legend-cancelled"></i> Cancelled</span>
`;

    attendanceCalendar.appendChild(legend);
  }

  window.addEventListener("storage", renderAttendanceCalendar);

  attendanceCalendar?.addEventListener("kumi-date-selected", (event) => {
    const dateString = event.detail.date;
    const parts = dateString.split("-").map(Number);

    const chosenDate = new Date(parts[0], parts[1] - 1, parts[2]);

    selectedDate = dateString;
    calendarSelectedDate = dateString;
    currentWeek = getMonday(chosenDate);

    renderAll();
  });

  /* RENDER EVERYTHING */
  function renderAll() {
    renderWeek();
    renderSchedule();
    renderOverallAttendance();
    renderSubjectAttendance();
    renderAttendanceCalendar();
  }
  renderAll();
})();
/* =========================================
   END KUMI APPLICATION
========================================= */
let greeting = localStorage.getItem("kumiGreeting") || "Hello, Kinjal ♡";

function updateGreeting() {
  document.getElementById("greeting").textContent = greeting;
}

function editGreeting() {
  const newGreeting = prompt("Edit your greeting:", greeting);

  if (newGreeting && newGreeting.trim()) {
    greeting = newGreeting.trim();
    localStorage.setItem("kumiGreeting", greeting);
    updateGreeting();
  }
}

updateGreeting();

