
import { App } from "@capacitor/app";

App.addListener("backButton", () => {

  // Check whether a Settings subsection is open.
  const settingsSubsections = [
    "settings-theme-view",
    "settings-appearance-view",
    "settings-reminder-view",
    "settings-data-view",
    "settings-font-view",
    "settings-about-view"
  ];

  const subsectionIsOpen = settingsSubsections.some((id) => {
    const view = document.getElementById(id);
    return view && !view.hidden;
  });

  // Return to Settings home.
  if (subsectionIsOpen) {
    window.history.back();
    return;
  }

  // Check the active main page.
  const activePage = document.querySelector(".page.active");

  // Return to Orbit Home.
  if (activePage && activePage.id !== "home") {
    window.openPage("home");
    return;
  }

  // Exit only when already on Home.
  App.exitApp();
});
