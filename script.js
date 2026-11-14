/* =========================
   KUMI - APPLICATION
========================= */

/* 1. LIVE DATE */

const dateElement = document.getElementById("current-date");

function updateDate() {
  const today = new Date();

  dateElement.textContent = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

updateDate();

/* 2. SIDEBAR NAVIGATION */

/* 2. SIDEBAR NAVIGATION */

const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

// Open a page and remember it
function openPage(targetPage) {
  navItems.forEach((item) => {
    item.classList.remove("active");
  });

  pages.forEach((page) => {
    page.classList.remove("active");
  });

  const selectedPage = document.getElementById(targetPage);

  if (selectedPage) {
    selectedPage.classList.add("active");

    const selectedNav = document.querySelector(
      `.nav-item[data-page="${targetPage}"]`,
    );

    if (selectedNav) {
      selectedNav.classList.add("active");
    }

    localStorage.setItem("kumiLastPage", targetPage);
  }
}

// Sidebar navigation clicks
navItems.forEach((button) => {
  button.addEventListener("click", function () {
    const targetPage = this.dataset.page;

    openPage(targetPage);
  });
});

// Restore the last opened page after refresh
const savedPage = localStorage.getItem("kumiLastPage");

const pageToOpen =
  savedPage && document.getElementById(savedPage) ? savedPage : "home";

openPage(pageToOpen);

/* 3. PROFILE PHOTO */

const photoUpload = document.getElementById("photo-upload");
const profileImage = document.getElementById("profile-image");

const savedPhoto = localStorage.getItem("kumiProfilePhoto");

if (savedPhoto) {
  profileImage.src = savedPhoto;
}

photoUpload.addEventListener("change", function () {
  const file = this.files[0];

  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        localStorage.setItem("kumiProfilePhoto", event.target.result);

        profileImage.src = event.target.result;
      } catch (error) {
        alert("Photo is too large to save. Try a smaller image.");
      }
    };

    reader.readAsDataURL(file);
  }
});

/* 4. PROFILE DETAILS */

const profileFields = document.querySelectorAll(
  ".profile-details p[contenteditable='true']",
);

profileFields.forEach((field, index) => {
  const savedValue = localStorage.getItem("kumiProfile_" + index);

  if (savedValue !== null) {
    field.textContent = savedValue;
  }

  field.addEventListener("input", function () {
    localStorage.setItem("kumiProfile_" + index, field.textContent);
  });
});

/* 5. TO-DO LIST */

const taskInput = document.getElementById("task-input");
const addTaskButton = document.getElementById("add-task");
const todoList = document.getElementById("todo-list");
const taskFilter = document.getElementById("task-filter");

/* RESTORE TASKS */

let tasks = [];

try {
  const savedTasks = JSON.parse(localStorage.getItem("kumiTasks") || "[]");

  if (Array.isArray(savedTasks)) {
    tasks = savedTasks.filter(
      (task) =>
        task &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean",
    );
  }
} catch (error) {
  tasks = [];
}

/* SAVE TASKS */

function saveTasks() {
  localStorage.setItem("kumiTasks", JSON.stringify(tasks));
}

/* ADD TASK */

function addTask() {
  const taskText = taskInput.value.trim();

  if (!taskText) return;

  tasks.push({
    id: Date.now(),
    text: taskText,
    completed: false,
  });

  saveTasks();

  taskInput.value = "";

  renderTasks();
}

/* DISPLAY TASKS */

function renderTasks() {
  todoList.innerHTML = "";

  const filter = taskFilter.value;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") {
      return !task.completed;
    }

    if (filter === "completed") {
      return task.completed;
    }

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

    checkbox.addEventListener("change", function () {
      task.completed = checkbox.checked;

      saveTasks();

      renderTasks();
    });

    const taskText = document.createElement("span");

    taskText.textContent = task.text;

    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);

    todoList.appendChild(taskItem);
  });
}

/* 6. TASK EVENTS */

addTaskButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

taskFilter.addEventListener("change", renderTasks);

/* 7. INITIALISE */

renderTasks();

// KUMI THEME SYSTEM

const themeButtons = document.querySelectorAll(".theme-option");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  localStorage.setItem("kumiTheme", theme);

  themeButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.theme === theme);
  });
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyTheme(button.dataset.theme);
  });
});

// Load saved theme
const savedTheme = localStorage.getItem("kumiTheme") || "lavender";
applyTheme(savedTheme);

// KUMI PHOTO EDITOR

(() => {
  const profileImage = document.getElementById("profile-image");
  const editor = document.getElementById("photo-editor");
  const preview = document.getElementById("photo-preview-image");
  const previewBox = document.querySelector(".photo-preview");
  const fileInput = document.getElementById("new-photo-upload");
  const zoomSlider = document.getElementById("photo-zoom");

  const saveButton = document.getElementById("save-photo");
  const cancelButton = document.getElementById("cancel-photo");
  const resetButton = document.getElementById("reset-photo");

  if (!profileImage || !editor || !preview) return;

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
    if (!profileImage.src) return;

    imageSource = profileImage.src;
    preview.src = imageSource;
    zoom = 1;
    offsetX = 0;
    offsetY = 0;
    zoomSlider.value = 1;
    updatePreview();
    editor.hidden = false;
  }

  profileImage.addEventListener("click", openEditor);
  profileImage.style.cursor = "pointer";

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

  resetButton.addEventListener("click", () => {
    zoom = 1;
    offsetX = 0;
    offsetY = 0;
    zoomSlider.value = 1;
    updatePreview();
  });

  cancelButton.addEventListener("click", () => {
    editor.hidden = true;
    fileInput.value = "";
  });

  saveButton.addEventListener("click", () => {
    if (!imageSource) return;

    const image = new Image();

    image.onload = () => {
      const rect = previewBox.getBoundingClientRect();
      const width = 600;
      const height = Math.round((width * rect.height) / rect.width);

      const baseScale = Math.max(
        rect.width / image.width,
        rect.height / image.height,
      );

      const scale = baseScale * zoom;
      const cropWidth = rect.width / scale;
      const cropHeight = rect.height / scale;

      const cropX = Math.max(
        0,
        Math.min(
          image.width - cropWidth,
          (image.width - cropWidth) / 2 - offsetX / scale,
        ),
      );

      const cropY = Math.max(
        0,
        Math.min(
          image.height - cropHeight,
          (image.height - cropHeight) / 2 - offsetY / scale,
        ),
      );

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      context.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        width,
        height,
      );

      const savedPhoto = canvas.toDataURL("image/jpeg", 0.9);

      profileImage.src = savedPhoto;
      localStorage.setItem("kumiProfilePhoto", savedPhoto);

      editor.hidden = true;
      fileInput.value = "";
    };

    image.src = imageSource;
  });
})();
// SAVE PERSONAL MOTTO CARD
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
// ===== KUMI STICKER SYSTEM =====

const addSticker = document.getElementById("add-sticker");
const customSticker = document.getElementById("custom-sticker");
const stickerContainer = document.getElementById("profile-stickers");

let stickers = JSON.parse(localStorage.getItem("kumiStickers") || "[]");

function displayStickers() {
  stickerContainer.innerHTML = "";

  stickers.forEach((sticker, index) => {
    const item = document.createElement("span");

    item.className = "profile-sticker";
    item.textContent = sticker;
    item.title = "Tap to remove";

    item.addEventListener("click", () => {
      stickers.splice(index, 1);
      saveStickers();
    });

    stickerContainer.appendChild(item);
  });
}

function saveStickers() {
  localStorage.setItem("kumiStickers", JSON.stringify(stickers));

  displayStickers();
}

// Open phone keyboard
addSticker.addEventListener("click", () => {
  customSticker.focus();
});

// Add any typed emoji
customSticker.addEventListener("input", () => {
  const emoji = customSticker.value.trim();

  if (emoji) {
    stickers.push(emoji);
    saveStickers();
    customSticker.value = "";
  }
});

displayStickers();

// ===== END KUMI STICKER SYSTEM =====

/* =================================
   KUMI INTERACTIVE CALENDAR
================================= */

(function () {
  const monthDisplay = document.getElementById("calendar-month");
  const yearDisplay = document.getElementById("calendar-year");
  const daysContainer = document.getElementById("calendar-days");

  const prevButton = document.getElementById("prev-month");
  const nextButton = document.getElementById("next-month");

  const selectedDateTitle = document.getElementById("selected-date-heading");
  const selectedDateEvents = document.getElementById("selected-date-events");
  const eventList = document.getElementById("calendar-event-list");

  const addEventButton = document.getElementById("add-event-btn");
  const eventForm = document.getElementById("event-form");
  const closeEventButton = document.getElementById("close-event-form");
  const saveEventButton = document.getElementById("save-event-btn");

  const eventTitleInput = document.getElementById("event-title");
  const eventDateInput = document.getElementById("event-date");
  const eventCategoryInput = document.getElementById("event-category");

  if (!monthDisplay || !daysContainer) return;

  const today = new Date();

  let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  let selectedDate = formatDate(today);
let editingEventId = null;
  let events = [];

  try {
    events = JSON.parse(localStorage.getItem("kumiCalendarEvents") || "[]");

    if (!Array.isArray(events)) events = [];
  } catch {
    events = [];
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getDateLabel(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // CATEGORY COLOURS

  const categoryColours = {
    College: "#A8B99A",
    Study: "#F3E5B5",
    Exam: "#C77B83",
    Personal: "#A9C6D8",
    Other: "#E8B4C8",
  };

  // SHOW EVENTS FOR SELECTED DATE

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

      const colour = categoryColours[event.category] || "#E8B4C8";

      card.style.setProperty("--event-colour", colour);

      const title = document.createElement("h3");
      title.textContent = event.title;

      const category = document.createElement("small");
      category.textContent = event.category;

      card.appendChild(title);
      card.appendChild(category);

      selectedDateEvents.appendChild(card);
    });
  }

  function saveEvents() {
    localStorage.setItem("kumiCalendarEvents", JSON.stringify(events));
  }

  // RENDER CALENDAR

  function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    monthDisplay.textContent = currentMonth.toLocaleDateString("en-IN", {
      month: "long",
    });

    yearDisplay.textContent = year;

    daysContainer.innerHTML = "";

    const firstDay = new Date(year, month, 1);

    // Monday is the first day of the week
    const startDay = (firstDay.getDay() + 6) % 7;

    const gridStart = new Date(year, month, 1 - startDay);

    // Category colour mapping
    const categoryColours = {
      College: "#A8B99A",
      Study: "#F3E5B5",
      Exam: "#C77B83",
      Personal: "#A9C6D8",
      Other: "#E8B4C8",
    };

    for (let i = 0; i < 42; i++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);

      const dateString = formatDate(date);

      const button = document.createElement("button");

      button.type = "button";
      button.className = "calendar-day";
      button.dataset.date = dateString;

      // Date number
      const dayNumber = document.createElement("span");
      dayNumber.className = "calendar-day-number";
      dayNumber.textContent = date.getDate();

      button.appendChild(dayNumber);

      if (date.getMonth() !== month) {
        button.classList.add("other-month");
      }

      if (dateString === formatDate(today)) {
        button.classList.add("today");
      }

      if (dateString === selectedDate) {
        button.classList.add("selected");
      }

      // Find events on this date
      const dayEvents = events.filter((event) => event.date === dateString);

      if (dayEvents.length > 0) {
        button.classList.add("has-event");

        // Create category dots
        const dotsContainer = document.createElement("span");
        dotsContainer.className = "calendar-day-dots";

        // Show each category only once per date
        const categories = [
          ...new Set(dayEvents.map((event) => event.category)),
        ];

        categories.forEach((category) => {
          const dot = document.createElement("span");
          dot.className = "calendar-category-dot";

          dot.style.backgroundColor = categoryColours[category] || "#E8B4C8";

          dotsContainer.appendChild(dot);
        });

        button.appendChild(dotsContainer);
      }

      button.addEventListener("click", function () {
        selectedDate = dateString;

        if (date.getMonth() !== currentMonth.getMonth()) {
          currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        }

        renderCalendar();
        renderEvents();
        renderSelectedDateEvents();
      });

      daysContainer.appendChild(button);
    }
  }

  // SHOW ALL EVENTS FOR THE CURRENT MONTH

  function renderEvents() {
    const eventsTitle = document.getElementById("monthly-events-title");

    if (eventsTitle) {
      eventsTitle.textContent =
        currentMonth.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        }) + " Events";
    }

    eventList.innerHTML = "";

    // Get events belonging to the displayed month
    const monthlyEvents = events
      .filter((event) => {
        const [year, month] = event.date.split("-").map(Number);

        return (
          year === currentMonth.getFullYear() &&
          month === currentMonth.getMonth() + 1
        );
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Empty state
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

    // Display monthly events
    monthlyEvents.forEach((event) => {
      const card = document.createElement("div");
      card.className = "calendar-event-item";

      // Category colours
      const categoryColours = {
        College: "#A8B99A",
        Study: "#F3E5B5",
        Exam: "#C77B83",
        Personal: "#A9C6D8",
        Other: "#E8B4C8",
      };

      const eventColour = categoryColours[event.category] || "#E8B4C8";

      card.style.setProperty("--event-colour", eventColour);

      const details = document.createElement("div");
      details.className = "calendar-event-details";

      const title = document.createElement("h3");
      title.textContent = event.title;

      // Correct JavaScript month indexing
      const [year, month, day] = event.date.split("-").map(Number);
      const eventDate = new Date(year, month - 1, day);

      const dateLabel = document.createElement("small");

      dateLabel.textContent = eventDate.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "long",
      });

      const categoryTag = document.createElement("span");
      categoryTag.className = "event-category-tag";
      categoryTag.textContent = event.category;

      categoryTag.style.backgroundColor = eventColour;

const editButton = document.createElement("button");

editButton.type = "button";
editButton.className = "edit-event";
editButton.textContent = "Edit";

editButton.addEventListener("click", function () {
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

      deleteButton.addEventListener("click", function () {
        events = events.filter((item) => item.id !== event.id);

        saveEvents();
        renderCalendar();
        renderEvents();
        renderSelectedDateEvents();
      });

      details.appendChild(title);
      details.appendChild(dateLabel);
      details.appendChild(categoryTag);

      card.appendChild(details);
      card.appendChild(editButton);
      card.appendChild(deleteButton);

      eventList.appendChild(card);
    });
  }

  // OPEN EVENT FORM

  addEventButton.addEventListener("click", function () {
    eventDateInput.value = selectedDate;
    eventTitleInput.value = "";

    eventForm.hidden = false;
    editingEventId = null;
    eventForm.querySelector("h2").textContent = "New Event ♡";
    saveEventButton.textContent = "Save Event";
  });

  // CLOSE EVENT FORM

 
closeEventButton.addEventListener("click", function () {
    eventForm.hidden = true;

    editingEventId = null;

    eventForm.querySelector("h2").textContent = "New Event ♡";
    saveEventButton.textContent = "Save Event";
});


 
eventForm.addEventListener("click", function (event) {
    if (event.target === eventForm) {
        eventForm.hidden = true;

        editingEventId = null;

        eventForm.querySelector("h2").textContent = "New Event ♡";
        saveEventButton.textContent = "Save Event";
    }
});


  // SAVE OR UPDATE EVENT

  saveEventButton.addEventListener("click", function () {
    const title = eventTitleInput.value.trim();
    const date = eventDateInput.value;
    const category = eventCategoryInput.value;

    if (!title || !date) {
      alert("Please enter an event name and date.");
      return;
    }

    if (editingEventId) {
      const eventToEdit = events.find((event) => event.id === editingEventId);

      if (eventToEdit) {
        eventToEdit.title = title;
        eventToEdit.date = date;
        eventToEdit.category = category;
      }
    } else {
      events.push({
        id: Date.now().toString(),
        title: title,
        date: date,
        category: category,
      });
    }

    saveEvents();

    selectedDate = date;

    const [year, month] = date.split("-").map(Number);
    currentMonth = new Date(year, month - 1, 1);

    editingEventId = null;

    eventForm.querySelector("h2").textContent = "New Event ♡";
    saveEventButton.textContent = "Save Event";

    eventForm.hidden = true;

    renderCalendar();
    renderEvents();
    renderSelectedDateEvents();
  });

  // MONTH NAVIGATION
  prevButton.addEventListener("click", function () {
    currentMonth.setMonth(currentMonth.getMonth() - 1);

    selectedDate = formatDate(currentMonth);

    renderCalendar();
    renderEvents();
    renderSelectedDateEvents();
  });

  nextButton.addEventListener("click", function () {
    currentMonth.setMonth(currentMonth.getMonth() + 1);

    selectedDate = formatDate(currentMonth);

    renderCalendar();
    renderEvents();
    renderSelectedDateEvents();
  });

  // INITIAL DISPLAY

  renderCalendar();
  renderEvents();
  renderSelectedDateEvents();
})();

/* END KUMI CALENDAR */
