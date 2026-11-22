
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  const pages = document.querySelectorAll(".main-content > .page");

  function showPage(pageId) {
    const targetPage = document.getElementById(pageId);

    // Make sure the requested page exists
    if (!targetPage || !targetPage.classList.contains("page")) {
      console.warn("Page not found:", pageId);
      return;
    }

    // Hide all pages
    pages.forEach((page) => {
      page.classList.remove("active");
    });

    // Show selected page
    targetPage.classList.add("active");

    // Update sidebar active button
    navItems.forEach((item) => {
      item.classList.toggle(
        "active",
        item.dataset.page === pageId
      );
    });
  }

  // Sidebar navigation
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      showPage(item.dataset.page);
    });
  });

  // Make showPage available to your existing HTML onclick buttons
  window.showPage = showPage;

  // Set Home as the initial page
  showPage("home");
});

