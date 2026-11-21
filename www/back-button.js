
import { App } from "@capacitor/app";

document.addEventListener("DOMContentLoaded", async () => {
  const originalOpenPage = window.openPage;

  if (typeof originalOpenPage !== "function") {
    console.error("ORBIT: openPage function not found.");
    return;
  }

  const settingsViews = [
    "settings-theme-view",
    "settings-appearance-view",
    "settings-reminder-view",
    "settings-data-view",
    "settings-font-view",
    "settings-about-view"
  ];

  let currentPage =
    document.querySelector(".page.active")?.id || "home";

  const history = [];

  window.openPage = function (targetPage) {
    if (targetPage !== currentPage) {
      history.push(currentPage);
      currentPage = targetPage;
    }

    return originalOpenPage.apply(this, arguments);
  };

  await App.addListener("backButton", async () => {

    const activeSettingsView = settingsViews.find(id => {
      const element = document.getElementById(id);
      return element && !element.hidden;
    });

    if (activeSettingsView) {
      settingsViews.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.hidden = true;
      });

      document.getElementById("settings-home-view").hidden = false;
      return;
    }

    if (currentPage === "settings") {
      history.length = 0;
      currentPage = "home";
      originalOpenPage("home");
      return;
    }

    if (history.length > 0) {
      currentPage = history.pop();
      originalOpenPage(currentPage);
      return;
    }

    if (currentPage === "home") {
      if (window.confirm("Do you want to exit ORBIT?")) {
        await App.exitApp();
      }
    }
  });
});

