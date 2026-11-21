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

  const originalOpenPage = window.openPage;
  if (typeof originalOpenPage === "function") {
    window.openPage = function (targetPage) {
      if (targetPage && targetPage !== currentPage) pageHistory.push(currentPage);
      const result = originalOpenPage.apply(this, arguments);
      currentPage = document.querySelector(".page.active")?.id || targetPage || currentPage;
      return result;
    };
  }

  function closeSettingsSubpage() {
    const isOpen = settingsViewIds.some((id) => {
      const view = document.getElementById(id);
      return view && !view.hidden;
    });
    if (!isOpen) return false;

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
      if (closeSettingsSubpage()) return;

      while (pageHistory.length) {
        const previousPage = pageHistory.pop();
        if (previousPage && document.getElementById(previousPage)) {
          if (typeof originalOpenPage === "function") originalOpenPage(previousPage);
          currentPage = previousPage;
          return;
        }
      }

      if (currentPage !== "home") {
        if (typeof originalOpenPage === "function") originalOpenPage("home");
        currentPage = "home";
        return;
      }

      if (window.confirm("Do you want to exit ORBIT?")) await App.exitApp();
    } finally {
      handlingBack = false;
    }
  });
});
