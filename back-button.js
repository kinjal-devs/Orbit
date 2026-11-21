import { App } from "@capacitor/app";

document.addEventListener("DOMContentLoaded", () => {
  const settingsViewIds = [
    "settings-theme-view",
    "settings-appearance-view",
    "settings-reminder-view",
    "settings-data-view",
    "settings-font-view",
    "settings-about-view"
  ];

  const settingsHome = document.getElementById("settings-home-view");
  const pageHistory = [];
  let currentPage = document.querySelector(".page.active")?.id || "home";
  let handlingBack = false;

  // Track only real page changes. This does not alter sidebar navigation.
  const originalOpenPage = window.openPage;
  if (typeof originalOpenPage === "function") {
    window.openPage = function (targetPage) {
      if (targetPage && targetPage !== currentPage) {
        pageHistory.push(currentPage);
      }
      const result = originalOpenPage.apply(this, arguments);
      currentPage = document.querySelector(".page.active")?.id || targetPage || currentPage;
      return result;
    };
  }

  function closeSettingsSubpage() {
    const openSubpage = settingsViewIds.some((id) => {
      const view = document.getElementById(id);
      return view && !view.hidden;
    });

    if (!openSubpage) return false;

    settingsViewIds.forEach((id) => {
      const view = document.getElementById(id);
      if (view) view.hidden = true;
    });

    if (settingsHome) settingsHome.hidden = false;
    return true;
  }

  App.addListener("backButton", async () => {
    if (handlingBack) return;
    handlingBack = true;

    try {
      // Settings sections return to the Settings menu first.
      if (closeSettingsSubpage()) return;

      // Return to the previously visited main page.
      while (pageHistory.length) {
        const previousPage = pageHistory.pop();
        if (previousPage && document.getElementById(previousPage)) {
          if (typeof originalOpenPage === "function") {
            originalOpenPage(previousPage);
          }
          currentPage = previousPage;
          return;
        }
      }

      // Home is the only page from which Android Back may exit the app.
      if (currentPage !== "home") {
        if (typeof originalOpenPage === "function") originalOpenPage("home");
        currentPage = "home";
        return;
      }

      if (window.confirm("Do you want to exit ORBIT?")) {
        await App.exitApp();
      }
    } finally {
      handlingBack = false;
    }
  });
});
