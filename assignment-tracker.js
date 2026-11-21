/* =================================
   ORBIT ASSIGNMENT TRACKER
================================= */

(() => {

  const STORAGE_KEY = "orbitAssignments";
  const FOLDER_KEY = "orbitAssignmentFolders";

  const $ = (id) => document.getElementById(id);

  function loadData(key, fallback) {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      return Array.isArray(data) ? data : fallback;
    } catch {
      return fallback;
    }
  }

  let assignments = loadData(STORAGE_KEY, []);
  let folders = loadData(FOLDER_KEY, []);

  let editingAssignmentId = null;
  let selectedFolder = "all";

  const modal = $("assignment-modal");
  const form = $("assignment-form");

  const titleInput = $("assignment-title");
  const subjectInput = $("assignment-subject");
  const dueDateInput = $("assignment-due-date");
  const folderSelect = $("assignment-folder-select");
  const descriptionInput = $("assignment-description");

  function saveAssignments() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(assignments)
    );
  }

  function saveFolders() {
    localStorage.setItem(
      FOLDER_KEY,
      JSON.stringify(folders)
    );
  }

  /* UPDATE OVERVIEW */

  function renderOverview() {

    const total = assignments.length;

    const completed = assignments.filter(
      item => item.completed
    ).length;

    const pending = total - completed;

    const percentage = total
      ? Math.round((completed / total) * 100)
      : 0;

    $("assignment-total").textContent = total;
    $("assignment-pending").textContent = pending;
    $("assignment-completed").textContent = completed;

    $("assignment-progress-text").textContent =
      percentage + "%";

    $("assignment-progress-fill").style.width =
      percentage + "%";
  }

  /* FORMAT DUE DATE */

  function formatDueDate(value) {

    if (!value) return "No due date";

    const date = new Date(value + "T00:00:00");

    return "Due: " + date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  /* RENDER ASSIGNMENTS */

  function renderAssignments() {

    const container = $("assignment-list");
    container.innerHTML = "";

    const visibleAssignments = assignments.filter(item => {
      return (
        selectedFolder === "all" ||
        item.folder === selectedFolder
      );
    });

    if (visibleAssignments.length === 0) {

      const empty = document.createElement("div");
      empty.className = "assignment-empty";

      const icon = document.createElement("span");
      icon.textContent = "✧";

      const message = document.createElement("p");
      message.textContent =
        selectedFolder === "all"
          ? "No assignments added yet."
          : "No assignments in this folder yet.";

      const small = document.createElement("small");
      small.textContent =
        "Click Add to create an assignment ♡";

      empty.append(icon, message, small);
      container.appendChild(empty);

      return;
    }

    visibleAssignments.forEach(item => {

      const card = document.createElement("article");
      card.className = "assignment-card";

      const top = document.createElement("div");
      top.className = "assignment-card-top";

      const details = document.createElement("div");

      const title = document.createElement("h3");
      title.textContent = item.title;

      const subject = document.createElement("p");
      subject.className = "assignment-card-subject";
      subject.textContent = item.subject || "General";

      details.append(title, subject);

      const status = document.createElement("span");
      status.className = "assignment-status " +
        (item.completed ? "completed" : "pending");

      status.textContent =
        item.completed ? "Completed" : "Pending";

      top.append(details, status);

      card.appendChild(top);

      if (item.description) {

        const description = document.createElement("p");
        description.className = "assignment-card-description";
        description.textContent = item.description;

        card.appendChild(description);
      }

      const dueDate = document.createElement("small");
      dueDate.className = "assignment-due-date";
      dueDate.textContent = formatDueDate(item.dueDate);

      card.appendChild(dueDate);

      const actions = document.createElement("div");
      actions.className = "assignment-card-actions";

      const completeButton = document.createElement("button");
      completeButton.type = "button";
      completeButton.className = "assignment-complete-btn";

      completeButton.textContent =
        item.completed ? "Mark Pending" : "Mark Completed";

      completeButton.addEventListener("click", () => {

        item.completed = !item.completed;

        saveAssignments();
        renderAll();

      });

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Edit";

      editButton.addEventListener("click", () => {
        openEditForm(item);
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "assignment-delete-btn";
      deleteButton.textContent = "Delete";

      deleteButton.addEventListener("click", () => {

        if (!confirm("Delete this assignment?")) return;

        assignments = assignments.filter(
          assignment => assignment.id !== item.id
        );

        saveAssignments();
        renderAll();

      });

      actions.append(
        completeButton,
        editButton,
        deleteButton
      );

      card.appendChild(actions);

      container.appendChild(card);

    });
  }

  /* UPDATE FOLDER OPTIONS */

  function renderFolderOptions() {

    folderSelect.innerHTML = "";

    const noFolder = document.createElement("option");
    noFolder.value = "";
    noFolder.textContent = "No folder";

    folderSelect.appendChild(noFolder);

    folders.forEach(folder => {

      const option = document.createElement("option");
      option.value = folder;
      option.textContent = folder;

      folderSelect.appendChild(option);

    });
  }

  /* RENDER FOLDERS */

  function renderFolders() {

    const container = $("assignment-folder-list");
    container.innerHTML = "";

    if (folders.length === 0) {

      const message = document.createElement("p");
      message.className = "assignment-no-folders";
      message.textContent =
        "No folders yet. Create your first folder ♡";

      container.appendChild(message);

      return;
    }

    folders.forEach(folder => {

      const count = assignments.filter(
        item => item.folder === folder
      ).length;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "assignment-folder";

      if (selectedFolder === folder) {
        button.classList.add("selected");
      }

      const icon = document.createElement("span");
      icon.className = "assignment-folder-icon";
      icon.textContent = "▱";

      const name = document.createElement("span");
      name.className = "assignment-folder-name";
      name.textContent = folder;

      const total = document.createElement("span");
      total.className = "assignment-folder-count";
      total.textContent =
        count + (count === 1 ? " assignment" : " assignments");

      button.append(icon, name, total);

      button.addEventListener("click", () => {

        selectedFolder =
          selectedFolder === folder ? "all" : folder;

        renderAll();

      });

      container.appendChild(button);

    });
  }

  /* ADD FOLDER */

  $("add-folder-btn").addEventListener("click", () => {

    const folderName = prompt("Enter your new folder name:");

    if (folderName === null) return;

    const name = folderName.trim();

    if (!name) {
      alert("Please enter a folder name.");
      return;
    }

    const alreadyExists = folders.some(
      folder => folder.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      alert("This folder already exists.");
      return;
    }

    folders.push(name);

    selectedFolder = name;

    saveFolders();
    renderAll();

  });

  /* OPEN NEW ASSIGNMENT FORM */

  $("add-assignment-btn").addEventListener("click", () => {

    editingAssignmentId = null;

    form.reset();

    renderFolderOptions();

    if (selectedFolder !== "all") {
      folderSelect.value = selectedFolder;
    }

    $("assignment-form-heading").textContent =
      "New Assignment ♡";

    form.querySelector(".assignment-save-btn").textContent =
      "Save Assignment";

    modal.hidden = false;

  });

  /* EDIT ASSIGNMENT */

  function openEditForm(item) {

    editingAssignmentId = item.id;

    renderFolderOptions();

    titleInput.value = item.title;
    subjectInput.value = item.subject || "";
    dueDateInput.value = item.dueDate || "";
    folderSelect.value = item.folder || "";
    descriptionInput.value = item.description || "";

    $("assignment-form-heading").textContent =
      "Edit Assignment ♡";

    form.querySelector(".assignment-save-btn").textContent =
      "Update Assignment";

    modal.hidden = false;

  }

  /* CLOSE FORM */

  function closeForm() {

    modal.hidden = true;
    form.reset();

    editingAssignmentId = null;

  }

  $("close-assignment-modal").addEventListener(
    "click",
    closeForm
  );

  modal.addEventListener("click", event => {

    if (event.target === modal) {
      closeForm();
    }

  });

  /* SAVE ASSIGNMENT */

  form.addEventListener("submit", event => {

    event.preventDefault();

    const title = titleInput.value.trim();

    if (!title) {
      alert("Please enter an assignment title.");
      return;
    }

    const existing = assignments.find(
      item => item.id === editingAssignmentId
    );

    const assignment = {
      id: editingAssignmentId || Date.now().toString(),
      title: title,
      subject: subjectInput.value.trim(),
      dueDate: dueDateInput.value,
      folder: folderSelect.value,
      description: descriptionInput.value.trim(),
      completed: existing ? existing.completed : false
    };

    if (existing) {

      assignments = assignments.map(item =>
        item.id === editingAssignmentId
          ? assignment
          : item
      );

    } else {

      assignments.push(assignment);

    }

    saveAssignments();

    closeForm();
    renderAll();

  });

  /* RENDER EVERYTHING */

  function renderAll() {

    renderOverview();
    renderAssignments();
    renderFolderOptions();
    renderFolders();

  }

  renderAll();

})();