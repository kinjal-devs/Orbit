(() => {
  const NOTEBOOKS_KEY = "orbitNotebooks";
  const NOTES_KEY = "orbitNotes";

  const $ = (id) => document.getElementById(id);

  const notebookSlider = $("notes-notebook-slider");
  const recentList = $("notes-recent-list");
  const openedList = $("opened-notebook-list");

  if (!notebookSlider || !recentList || !openedList) return;

  let notebooks = loadData(NOTEBOOKS_KEY, [
    { id: "college", name: "College" },
    { id: "personal", name: "Personal" }
  ]);

  let notes = loadData(NOTES_KEY, []);

  let editingNoteId = null;
  let editingNotebookId = null;
  let activeNotebookId = null;
  let menuNotebookId = null;

  function loadData(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveData() {
    localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(notebooks));
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }

  function createId() {
    return Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8);
  }

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  function getNotebookName(id) {
    const notebook = notebooks.find((item) => item.id === id);
    return notebook ? notebook.name : "Unfiled";
  }

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function getNotebookNotes(notebookId) {
    return notes
      .filter((note) => note.notebookId === notebookId)
      .sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return Number(b.pinned) - Number(a.pinned);
        }

        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
  }

  function renderNotebooks() {
    notebookSlider.innerHTML = notebooks.map((notebook) => {
      const count = notes.filter(
        (note) => note.notebookId === notebook.id
      ).length;

      return `
        <article
          class="notes-notebook-card"
          data-open-notebook="${escapeHTML(notebook.id)}"
          tabindex="0"
          role="button"
          aria-label="Open ${escapeHTML(notebook.name)} notebook"
        >
          <div class="notes-notebook-top">
            <span class="notes-notebook-icon">▤</span>

            <button
              type="button"
              class="notes-notebook-menu-button"
              data-notebook-menu="${escapeHTML(notebook.id)}"
              aria-label="Notebook options"
            >⋯</button>
          </div>

          <span class="notes-notebook-name">
            ${escapeHTML(notebook.name)}
          </span>

          <span class="notes-notebook-count">
            ${count} ${count === 1 ? "note" : "notes"}
          </span>
        </article>
      `;
    }).join("");

    if (notebooks.length === 0) {
      notebookSlider.innerHTML = `
        <div class="notes-empty">
          <span>▤</span>
          <h3>No notebooks yet</h3>
          <p>Create a notebook to organise your notes.</p>
        </div>
      `;
    }
  }

  function createNoteCard(note) {
    const preview = note.content
      ? note.content.slice(0, 150)
      : "No content yet...";

    return `
      <article class="notes-note-card">

        <div class="notes-note-top">
          <h3 class="notes-note-title">
            ${escapeHTML(note.title || "Untitled note")}
          </h3>

          <span class="notes-note-pin">
            ${note.pinned ? "📌" : ""}
          </span>
        </div>

        <div class="notes-note-meta">
          <span class="notes-note-notebook">
            ${escapeHTML(getNotebookName(note.notebookId))}
          </span>

          <span class="notes-note-date">
            ${formatDate(note.updatedAt)}
          </span>
        </div>

        <p class="notes-note-preview">
          ${escapeHTML(preview)}
        </p>

        <div class="notes-note-actions">

          <button
            type="button"
            data-pin-note="${escapeHTML(note.id)}"
          >
            ${note.pinned ? "Unpin" : "Pin"}
          </button>

          <button
            type="button"
            data-edit-note="${escapeHTML(note.id)}"
          >
            Edit
          </button>

          <button
            type="button"
            data-delete-note="${escapeHTML(note.id)}"
          >
            Delete
          </button>

        </div>

      </article>
    `;
  }

  function emptyMessage(title, message) {
    return `
      <div class="notes-empty">
        <span>✧</span>
        <h3>${escapeHTML(title)}</h3>
        <p>${escapeHTML(message)}</p>
      </div>
    `;
  }

  function renderRecentNotes(search = "") {
  const query = search.trim().toLowerCase();
  $("notes-notebooks-section").hidden = Boolean(query);
$("notes-recent-heading").hidden = Boolean(query);

  const filteredNotes = notes
    .filter((note) => {
      if (!query) return true;

      const title = (note.title || "").toLowerCase();
      const content = (note.content || "").toLowerCase();

      return title.includes(query) || content.includes(query);
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return Number(b.pinned) - Number(a.pinned);
      }

      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  recentList.innerHTML = filteredNotes.length
    ? filteredNotes.map(createNoteCard).join("")
    : emptyMessage(
        query ? "No matching notes" : "No notes yet",
        query
          ? "Try searching with another word."
          : "Create your first note to get started."
      );
}

  function renderOpenedNotebook() {
    const notebook = notebooks.find(
      (item) => item.id === activeNotebookId
    );

    if (!notebook) {
      closeNotebookView();
      return;
    }

    const notebookNotes = getNotebookNotes(activeNotebookId);

    $("opened-notebook-title").textContent = notebook.name;
    $("opened-notebook-count").textContent =
      `${notebookNotes.length} ${
        notebookNotes.length === 1 ? "note" : "notes"
      }`;

    openedList.innerHTML = notebookNotes.length
      ? notebookNotes.map(createNoteCard).join("")
      : emptyMessage(
          "This notebook is empty",
          "Create a note to add it to this notebook."
        );
  }

  function renderAll() {
    renderNotebooks();
    renderRecentNotes($("notes-search-input").value);

    if (activeNotebookId) {
      renderOpenedNotebook();
    }

    updateNotebookSelect();
  }

  // NOTEBOOK OPENING

function openNotebook(notebookId) {
  if (!activeNotebookId) {
    history.pushState(
      { ...history.state, orbitNotesNotebook: true },
      ""
    );
  }

  activeNotebookId = notebookId;

  $("notes-home-view").hidden = true;
  $("notes-notebook-view").hidden = false;

  renderOpenedNotebook();
}

  function closeNotebookView(fromPopState = false) {
    if (!fromPopState && history.state?.orbitNotesNotebook) {
  history.back();
}
    activeNotebookId = null;

    $("notes-home-view").hidden = false;
    $("notes-notebook-view").hidden = true;

    renderAll();
  }

  notebookSlider.addEventListener("click", (event) => {
    const menuButton = event.target.closest("[data-notebook-menu]");

    if (menuButton) {
      event.stopPropagation();
      showNotebookMenu(menuButton);
      return;
    }

    const card = event.target.closest("[data-open-notebook]");

    if (card) {
      openNotebook(card.dataset.openNotebook);
    }
  });

  notebookSlider.addEventListener("keydown", (event) => {
    if (event.target.closest("button")) return;

    if (event.key === "Enter" || event.key === " ") {
      const card = event.target.closest("[data-open-notebook]");

      if (card) {
        event.preventDefault();
        openNotebook(card.dataset.openNotebook);
      }
    }
  });

  // NOTEBOOK MENU

  function showNotebookMenu(button) {
    menuNotebookId = button.dataset.notebookMenu;

    const menu = $("notebook-menu");
    const rect = button.getBoundingClientRect();

    menu.hidden = false;

    const menuWidth = 190;
    const left = Math.min(
      window.innerWidth - menuWidth - 10,
      Math.max(10, rect.right - menuWidth)
    );

    menu.style.left = `${left}px`;
    menu.style.top = `${Math.min(
      window.innerHeight - 100,
      rect.bottom + 5
    )}px`;
  }

  document.addEventListener("click", (event) => {
    if (
      !event.target.closest("#notebook-menu") &&
      !event.target.closest("[data-notebook-menu]")
    ) {
      $("notebook-menu").hidden = true;
    }
  });

  $("edit-notebook-menu-btn").addEventListener("click", () => {
    const notebook = notebooks.find(
      (item) => item.id === menuNotebookId
    );

    if (!notebook) return;

    editingNotebookId = notebook.id;

    $("notebook-form-heading").textContent = "Edit Notebook";
    $("notebook-name-input").value = notebook.name;

    $("notebook-modal").hidden = false;
    $("notebook-menu").hidden = true;
  });

  $("delete-notebook-menu-btn").addEventListener("click", () => {
    const notebook = notebooks.find(
      (item) => item.id === menuNotebookId
    );

    if (!notebook) return;

    if (notebooks.length <= 1) {
      alert("You must keep at least one notebook.");
      return;
    }

    const confirmed = confirm(
      `Delete "${notebook.name}"? Its notes will be moved to another notebook.`
    );

    if (!confirmed) return;

    const replacement = notebooks.find(
      (item) => item.id !== notebook.id
    );

    notes.forEach((note) => {
      if (note.notebookId === notebook.id) {
        note.notebookId = replacement.id;
      }
    });

    notebooks = notebooks.filter(
      (item) => item.id !== notebook.id
    );

    if (activeNotebookId === notebook.id) {
      closeNotebookView();
    }

    saveData();
    renderAll();

    $("notebook-menu").hidden = true;
  });

  // CREATE / EDIT NOTEBOOK

  $("add-notebook-btn").addEventListener("click", () => {
    editingNotebookId = null;

    $("notebook-form").reset();
    $("notebook-form-heading").textContent = "New Notebook";

    $("notebook-modal").hidden = false;
  });

  $("close-notebook-modal").addEventListener("click", () => {
    $("notebook-modal").hidden = true;
  });

  $("notebook-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("notebook-name-input").value.trim();

    if (!name) return;

    const duplicate = notebooks.some((notebook) =>
      notebook.name.toLowerCase() === name.toLowerCase() &&
      notebook.id !== editingNotebookId
    );

    if (duplicate) {
      alert("A notebook with this name already exists.");
      return;
    }

    if (editingNotebookId) {
      const notebook = notebooks.find(
        (item) => item.id === editingNotebookId
      );

      if (notebook) notebook.name = name;
    } else {
      notebooks.push({
        id: createId(),
        name
      });
    }

    saveData();
    renderAll();

    $("notebook-modal").hidden = true;
    $("notebook-form").reset();
    editingNotebookId = null;
  });

  // NOTEBOOK SELECT

  function updateNotebookSelect() {
    const select = $("note-notebook-select");
    const previousValue = select.value;

    select.innerHTML = notebooks.map((notebook) => `
      <option value="${escapeHTML(notebook.id)}">
        ${escapeHTML(notebook.name)}
      </option>
    `).join("");

    if (notebooks.some((item) => item.id === previousValue)) {
      select.value = previousValue;
    }
  }

  // CREATE / EDIT NOTES

  function openNoteEditor(noteId = null, notebookId = null) {
    editingNoteId = noteId;

    const note = notes.find((item) => item.id === noteId);

    if (!note && notebooks.length === 0) {
      alert("Create a notebook first.");
      return;
    }

    updateNotebookSelect();

    $("notes-editor-heading").textContent =
      note ? "Edit Note ♡" : "New Note ♡";

    $("note-title-input").value = note?.title || "";
    $("note-content-input").value = note?.content || "";

    $("note-notebook-select").value =
      note?.notebookId ||
      notebookId ||
      notebooks[0]?.id ||
      "";

    $("notes-save-status").textContent =
      "Changes are saved automatically.";

    $("notes-editor-modal").hidden = false;

    $("note-title-input").focus();
  }

  function saveCurrentNote() {
    const title = $("note-title-input").value.trim();
    const content = $("note-content-input").value;
    const notebookId = $("note-notebook-select").value;

    if (!notebookId) return;

    let note = notes.find((item) => item.id === editingNoteId);

    if (!note) {
      note = {
        id: createId(),
        title: "",
        content: "",
        notebookId,
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      notes.push(note);
      editingNoteId = note.id;
    }

    note.title = title || "Untitled note";
    note.content = content;
    note.notebookId = notebookId;
    note.updatedAt = new Date().toISOString();

    saveData();
    renderAll();

    $("notes-save-status").textContent = "Saved ♡";
  }

  $("create-note-btn").addEventListener("click", () => {
    openNoteEditor();
  });

  $("create-notebook-note-btn").addEventListener("click", () => {
    openNoteEditor(null, activeNotebookId);
  });

  $("close-notes-editor").addEventListener("click", () => {
    $("notes-editor-modal").hidden = true;
    renderAll();
  });

  $("save-notes-btn").addEventListener("click", () => {
    saveCurrentNote();
    $("notes-editor-modal").hidden = true;
    renderAll();
  });

  $("note-title-input").addEventListener("input", saveCurrentNote);
  $("note-content-input").addEventListener("input", saveCurrentNote);
  $("note-notebook-select").addEventListener("change", saveCurrentNote);

  // NOTE ACTIONS

  function handleNoteAction(event) {
    const editButton = event.target.closest("[data-edit-note]");
    const deleteButton = event.target.closest("[data-delete-note]");
    const pinButton = event.target.closest("[data-pin-note]");

    if (editButton) {
      openNoteEditor(editButton.dataset.editNote);
      return;
    }

    if (deleteButton) {
      const noteId = deleteButton.dataset.deleteNote;

      if (!confirm("Are you sure you want to delete this note?")) {
        return;
      }

      notes = notes.filter((note) => note.id !== noteId);

      saveData();
      renderAll();
      return;
    }

    if (pinButton) {
      const note = notes.find(
        (item) => item.id === pinButton.dataset.pinNote
      );

      if (!note) return;

      note.pinned = !note.pinned;

      saveData();
      renderAll();
    }
  }

  recentList.addEventListener("click", handleNoteAction);
  openedList.addEventListener("click", handleNoteAction);

  // SEARCH

  $("notes-search-input").addEventListener("input", (event) => {
    renderRecentNotes(event.target.value);
  });

  // INITIALISE

  renderAll();
window.addEventListener("popstate", () => {
  if (activeNotebookId) {
    closeNotebookView(true);
  }
});

})();
