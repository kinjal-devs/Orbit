

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

  let handlingBack = false;

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

    const settingsHome = document.getElementById("settings-home-view");
    if (settingsHome) settingsHome.hidden = false;

    return true;
  }

  App.addListener("backButton", async () => {
    if (handlingBack) return;

    handlingBack = true;

    try {
      if (closeSettingsSubpage()) return;

      const activePage = document.querySelector(".page.active");

      if (activePage && activePage.id !== "home") {
        if (typeof window.showPage === "function") {
          window.showPage("home");
        }
        return;
      }

      await App.exitApp();

    } catch (error) {
      console.error("Android back button error:", error);
    } finally {
      handlingBack = false;
    }
  });
});
