const menuButton = document.querySelector(".site-nav__toggle");
const mainNavigation = document.getElementById("main-navigation");

if (menuButton && mainNavigation) {
  function closeMenu() {
    mainNavigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  }

  menuButton.addEventListener("click", () => {
    const isOpen = mainNavigation.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  mainNavigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNavigation.classList.contains("is-open")) {
      closeMenu();
      menuButton.focus();
    }
  });

  window.matchMedia("(min-width: 900px)").addEventListener("change", closeMenu);
}

const THEME_KEY = "greenHomeTheme";
const themeButton = document.querySelector(".js-theme-toggle");

function applyTheme(theme) {
  document.body.classList.toggle("theme-dark", theme === "dark");
  if (themeButton) {
    themeButton.textContent = theme === "dark" ? "Светлая тема" : "Тёмная тема";
    themeButton.setAttribute("aria-pressed", String(theme === "dark"));
  }
}

applyTheme(localStorage.getItem(THEME_KEY) || "light");

if (themeButton) {
  themeButton.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("theme-dark") ? "light" : "dark";
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  });
}

document.querySelectorAll(".js-product-select").forEach((select) => {
  window.products.forEach((product) => {
    const option = document.createElement("option");
    option.value = String(product.id);
    option.textContent = `${product.title} — ${product.price.toLocaleString("ru-RU")} руб.`;
    option.disabled = !product.isAvailable;
    select.append(option);
  });
});
