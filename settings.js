
/* =========================================
   KUMI SETTINGS SYSTEM
========================================= */

(() => {

  const root = document.documentElement;

  /* COLOUR PALETTES */

  const palettes = {
    "strawberry-matcha": [
      "#4A6644", "#C66F80", "#FCEBF1",
      "#9FAA74", "#F4C7D0", "#D7DAB3"
    ],

    "sweet-raspberry": [
      "#823C44", "#EAA6AE", "#B04859",
      "#D8798A", "#F5D5D9", "#FBEFF1"
    ],

    "morning-coffee": [
      "#A49A98", "#9D8A7C", "#796254",
      "#523F31", "#DCC8B0", "#8B725D"
    ],

    "lavender-skies": [
      "#5B506C", "#B1A4C3", "#D0BFDD",
      "#E6DDF0", "#E2D3F2", "#C9BEDA"
    ],

    "sylva-green": [
      "#455826", "#6B7F3A", "#92AA58",
      "#B6C77B", "#F3F5E3", "#DDE3BA"
    ],

    "ocean-blues": [
      "#B3D2E3", "#C4D6D4", "#E2ECFB",
      "#B0D2D2", "#A8D1F0", "#C2D0E9"
    ],

    "midnight-tides": [
      "#263042", "#354E6B", "#ACBFD4",
      "#889BB0", "#15253F", "#566C86"
    ],

    "warm-autumn": [
    "#9A5937", "#958C71", "#956361",
    "#7B0E02", "#F0CCAC", "#F4E2D4"
],

    "woodland-kiss": [
      "#E2B8AD", "#87564B", "#6D322A",
      "#D2BDAB", "#CFA195", "#A59383",
      "#C6B8AB"
    ],

    "dusty-rose": [
      "#574144", "#F9F1E8", "#BF7E81",
      "#B79EA1", "#FFE4E1"
    ]
  };

  let currentPalette =
    localStorage.getItem("kumiPalette") || "strawberry-matcha";

  let currentMode =
    localStorage.getItem("kumiDisplayMode") || "light";


  /* FIND LIGHTEST COLOUR IN PALETTE */

  function getLightestColour(colours) {

    return colours.reduce((lightest, colour) => {

      const brightness = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        return (r * 299 + g * 587 + b * 114) / 1000;
      };

      return brightness(colour) > brightness(lightest)
        ? colour
        : lightest;

    });
  }

/* KUMI THEME WALLPAPERS */

const wallpaperFiles = {
  "strawberry-matcha": "strawberry.jpeg",
  "sweet-raspberry": "raspberry.jpeg",
  "morning-coffee": "coffee.jpeg",
  "lavender-skies": "lavender.jpeg",
  "sylva-green": "sylva.jpeg",
  "ocean-blues": "ocean.jpeg",
  "midnight-tides": "midnight.jpeg",
  "warm-autumn": "autumn.jpeg",
  "woodland-kiss": "woodland.jpeg",
  "dusty-rose": "dusty.jpeg"
};
  /* APPLY BOTH THEME AND DISPLAY MODE */

  function updateAppearance() {
function updateFontColour() {
  root.style.setProperty("--text", "#FFFFFF");
  root.style.setProperty("--muted", "#FFFFFF");
}

    const colours = palettes[currentPalette];
    const lightestColour = getLightestColour(colours);
    root.style.setProperty(
  "--theme-wallpaper",
  `url("images/${wallpaperFiles[currentPalette]}")`
);

    root.style.setProperty("--primary", colours[0]);
    root.style.setProperty("--secondary", colours[1]);

    if (currentMode === "dark") {

      root.style.setProperty("--background", "#000000");
      root.style.setProperty("--text", "#FFFFFF");
      root.style.setProperty("--muted", "#BDBDBD");
      root.style.setProperty("--border", "#383838");
      root.style.setProperty("--card", "#202020");

    } else {

      root.style.setProperty("--background", "#FFFFFF");
      root.style.setProperty("--text", "#38313E");
      root.style.setProperty("--muted", "#938A99");
      root.style.setProperty("--border", "#E9E2EF");
      root.style.setProperty("--card", lightestColour);

    }

    root.dataset.displayMode = currentMode;

    localStorage.setItem("kumiPalette", currentPalette);
    localStorage.setItem("kumiDisplayMode", currentMode);

    updateSelectedButtons();
    updateFontColour();
    updateSelectedButtons();
  }


  /* UPDATE SELECTED BUTTONS */

  function updateSelectedButtons() {

    document.querySelectorAll(".theme-option").forEach((button) => {

      button.classList.toggle(
        "selected",
        button.dataset.theme === currentPalette
      );

    });

    document.querySelectorAll(".display-mode-option").forEach((button) => {

      button.classList.toggle(
        "selected",
        button.dataset.mode === currentMode
      );

    });
  }




/* SETTINGS SCREEN NAVIGATION */

const homeView = document.getElementById("settings-home-view");
const themeView = document.getElementById("settings-theme-view");
const appearanceView = document.getElementById("settings-appearance-view");
const reminderView = document.getElementById("settings-reminder-view");
const dataView = document.getElementById("settings-data-view");
const fontView = document.getElementById("settings-font-view");
const aboutView = document.getElementById("settings-about-view");

let currentSettingsView = "home";

function showSettingsView(view) {
  currentSettingsView = view;

  homeView.hidden = view !== "home";
  themeView.hidden = view !== "theme";
  appearanceView.hidden = view !== "appearance";
  reminderView.hidden = view !== "reminders";
  dataView.hidden = view !== "data";
  fontView.hidden = view !== "font";
  aboutView.hidden = view !== "about";
}

/* OPEN THEME */

document.getElementById("open-theme-settings")
  .addEventListener("click", () => {
    history.pushState({}, "");
    showSettingsView("theme");
  });

/* OPEN APPEARANCE */

document.getElementById("open-appearance-settings")
  .addEventListener("click", () => {
    history.pushState({}, "");
    showSettingsView("appearance");
  });

/* OPEN REMINDERS */

document.getElementById("open-reminder-settings")
  .addEventListener("click", () => {
    history.pushState({}, "");
    showSettingsView("reminders");
  });

/* OPEN DATA MANAGEMENT */

document.getElementById("open-data-settings")
  .addEventListener("click", () => {
    history.pushState({}, "");
    showSettingsView("data");
  });

/* OPEN FONT SETTINGS */
/* OPEN ABOUT KUMI */

document.getElementById("open-about-settings")
  .addEventListener("click", () => {
    history.pushState({}, "");
    showSettingsView("about");
  });

document.getElementById("open-font-settings")
  .addEventListener("click", () => {
    history.pushState({}, "");
    showSettingsView("font");
  });

/* ANDROID BACK BUTTON */

window.addEventListener("popstate", () => {
  if (currentSettingsView !== "home") {
    showSettingsView("home");
  }
});

/* FONT SELECTION */

const fontStyles = {
  default: "Arial, sans-serif",
  serif: "Georgia, serif",
  rounded: "Trebuchet MS, sans-serif",
  mono: "monospace",

  camellia: "Camellia, sans-serif",
  tulip: "Tulip, sans-serif",
  wisteria: "Wisteria, sans-serif",
  lotus: "Lotus, sans-serif",
  rosemary: "Rosemary, sans-serif",
  petunia: "Petunia, sans-serif",
  alpinia: "Alpinia, sans-serif",
  orchid: "Orchid, sans-serif",
  freesia: "Freesia, sans-serif",
  verbena: "Verbena, sans-serif",
  lavender: "Lavender, sans-serif",
  daisy: "Daisy, sans-serif",
  oxalis: "Oxalis, sans-serif",
  forsythia: "Forsythia, sans-serif",
  marigold: "Marigold, sans-serif",
  gardenia: "Gardenia, sans-serif",
  pansy: "Pansy, sans-serif",
  daffodil: "Daffodil, sans-serif",
  peony: "Peony, sans-serif",
  sunflower: "Sunflower, sans-serif",
  amaryllis: "Amaryllis, sans-serif"
};
let currentFont =
  localStorage.getItem("kumiFont") || "default";

function applyFont() {
  if (!fontStyles[currentFont]) {
    currentFont = "default";
  }

  document.body.style.fontFamily = fontStyles[currentFont];

  localStorage.setItem("kumiFont", currentFont);

  document.querySelectorAll(".font-option").forEach((button) => {
    button.classList.toggle(
      "selected",
      button.dataset.font === currentFont
    );
  });
}

document.querySelectorAll(".font-option").forEach((button) => {
  button.addEventListener("click", () => {
    currentFont = button.dataset.font;
    applyFont();
  });
});

applyFont();




/* REMINDER SWITCHES */

const allReminders = document.getElementById("all-reminders");
const reminderToggles = document.querySelectorAll(".reminder-toggle");

/* LOAD SAVED REMINDER SETTINGS */

reminderToggles.forEach((toggle) => {
  const saved = localStorage.getItem(toggle.id);

  if (saved !== null) {
    toggle.checked = saved === "true";
  }
});

/* UPDATE ALL REMINDERS SWITCH */

function updateAllRemindersSwitch() {
  allReminders.checked = [...reminderToggles]
    .every((toggle) => toggle.checked);
}

updateAllRemindersSwitch();

/* MASTER SWITCH */

allReminders.addEventListener("change", () => {
  reminderToggles.forEach((toggle) => {
    toggle.checked = allReminders.checked;
    localStorage.setItem(toggle.id, toggle.checked);
  });
});

/* INDIVIDUAL SWITCHES */

reminderToggles.forEach((toggle) => {
  toggle.addEventListener("change", () => {
    localStorage.setItem(toggle.id, toggle.checked);
    updateAllRemindersSwitch();
  });
});

/* EXPORT NOTES */


/* EXPORT NOTES */

const exportNotesButton = document.getElementById("export-notes-button");
const exportOptions = document.getElementById("export-options");
const shareNotesButton = document.getElementById("share-notes-button");
const googleDriveButton = document.getElementById("google-drive-button");
const closeExportPopup = document.getElementById("close-export-popup");

let readableNotesFile = null;


// EXPORT BUTTON

if (exportNotesButton) {
  exportNotesButton.addEventListener("click", () => {

    const notebooks = JSON.parse(
      localStorage.getItem("kumiNotebooks") || "[]"
    );

    const notes = JSON.parse(
      localStorage.getItem("kumiNotes") || "[]"
    );

    // Download JSON backup

    const backup = {
      app: "Kumi",
      type: "notes-export",
      exportedAt: new Date().toISOString(),
      notebooks,
      notes
    };

    const jsonBlob = new Blob(
      [JSON.stringify(backup, null, 2)],
      { type: "application/json" }
    );

    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement("a");

    jsonLink.href = jsonUrl;
    jsonLink.download = "Kumi-Notes-Backup.json";
    jsonLink.click();

    setTimeout(() => URL.revokeObjectURL(jsonUrl), 1000);


    // Create readable TXT file

    let textContent = "KUMI NOTES\n\n";

    notes.forEach((note) => {
      textContent += "TITLE: " + note.title + "\n\n";
      textContent += note.content + "\n\n";
      textContent += "-------------------------\n\n";
    });

    readableNotesFile = new File(
      [textContent],
      "Kumi-Notes.txt",
      { type: "text/plain" }
    );


    // Show popup

    if (exportOptions) {
      exportOptions.hidden = false;
    }

  });
}


// CLOSE POPUP

if (closeExportPopup) {
  closeExportPopup.addEventListener("click", () => {
    if (exportOptions) {
      exportOptions.hidden = true;
    }
  });
}


// SHARE NOTES

if (shareNotesButton) {
  shareNotesButton.addEventListener("click", async () => {

    if (!readableNotesFile) return;

    if (
      navigator.canShare &&
      navigator.canShare({ files: [readableNotesFile] })
    ) {
      await navigator.share({
        files: [readableNotesFile],
        title: "My Kumi Notes"
      });
    } else {
      const url = URL.createObjectURL(readableNotesFile);
      const link = document.createElement("a");

      link.href = url;
      link.download = "Kumi-Notes.txt";
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

  });
}


// GOOGLE DRIVE

if (googleDriveButton) {
  googleDriveButton.addEventListener("click", async () => {

    if (!readableNotesFile) return;

    if (
      navigator.canShare &&
      navigator.canShare({ files: [readableNotesFile] })
    ) {
      await navigator.share({
        files: [readableNotesFile],
        title: "Save Kumi Notes"
      });
    } else {
      alert("Please use Share Notes to save your TXT file to Google Drive.");
    }

  });
}

  /* THEME SELECTION */

  document.querySelectorAll(".theme-option").forEach((button) => {

    button.addEventListener("click", () => {

      const selectedTheme = button.dataset.theme;

      if (!palettes[selectedTheme]) return;

      currentPalette = selectedTheme;

      updateAppearance();

    });

  });


  /* LIGHT AND DARK MODE */

  document.querySelectorAll(".display-mode-option").forEach((button) => {

    button.addEventListener("click", () => {

      currentMode = button.dataset.mode;

      updateAppearance();

    });

  });


  /* LOAD SAVED SETTINGS */

  if (!palettes[currentPalette]) {
    currentPalette = "strawberry-matcha";
  }

  if (currentMode !== "light" && currentMode !== "dark") {
    currentMode = "light";
  }

  updateAppearance();
  updateFontColour();
})();
