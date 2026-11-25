const catalogGrid = document.querySelector(".js-catalog-grid");

if (catalogGrid) {
  const searchInput = document.querySelector(".js-catalog-search");
  const categorySelect = document.querySelector(".js-category-filter");
  const sortSelect = document.querySelector(".js-sort-select");
  const resultCount = document.querySelector(".js-result-count");
  const emptyState = document.querySelector(".js-catalog-empty");
  const FAVORITES_KEY = "greenHomeFavorites";

  function readFavorites() {
    try {
      const savedFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY));
      return Array.isArray(savedFavorites) ? savedFavorites : [];
    } catch (error) {
      return [];
    }
  }

  function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }

  function createProductCard(product) {
    const card = document.createElement("article");
    card.classList.add("product-card");
    if (product.badge === "Хит") card.classList.add("product-card--hit");

    if (product.badge) {
      const badge = document.createElement("span");
      badge.classList.add("product-card__badge");
      badge.textContent = product.badge;
      card.append(badge);
    }

    const image = document.createElement("img");
    image.classList.add("product-card__image");
    image.src = product.image;
    image.srcset = `${product.imageSmall} 400w, ${product.image} 800w`;
    image.sizes = "(max-width: 599px) 100vw, (max-width: 999px) 50vw, 33vw";
    image.width = 800;
    image.height = 800;
    image.loading = "lazy";
    image.alt = product.alt;

    const content = document.createElement("div");
    content.classList.add("product-card__content");

    const category = document.createElement("p");
    category.classList.add("product-card__category");
    category.textContent = product.categoryTitle;

    const title = document.createElement("h3");
    title.classList.add("product-card__title");
    title.textContent = product.title;

    const description = document.createElement("p");
    description.classList.add("product-card__description");
    description.textContent = product.description;

    const availability = document.createElement("p");
    availability.classList.add("product-card__availability");
    availability.textContent = product.isAvailable ? "В наличии" : "Временно нет в наличии";
    if (!product.isAvailable) availability.classList.add("product-card__availability--missing");

    const price = document.createElement("p");
    price.classList.add("product-card__price");
    price.textContent = `${product.price.toLocaleString("ru-RU")} руб.`;

    const actions = document.createElement("div");
    actions.classList.add("product-card__actions");

    const detailsLink = document.createElement("a");
    detailsLink.classList.add("button", "button--secondary");
    detailsLink.href = product.id === 1 ? "product.html" : `product.html?id=${product.id}`;
    detailsLink.textContent = "Подробнее";

    const addButton = document.createElement("button");
    addButton.classList.add("button", "js-add-to-cart");
    addButton.type = "button";
    addButton.dataset.productId = String(product.id);
    addButton.textContent = product.isAvailable ? "В корзину" : "Нет в наличии";
    addButton.disabled = !product.isAvailable;

    const favoriteButton = document.createElement("button");
    favoriteButton.classList.add("favorite-button", "js-favorite");
    favoriteButton.type = "button";
    favoriteButton.dataset.productId = String(product.id);
    const isFavorite = readFavorites().includes(product.id);
    favoriteButton.classList.toggle("is-active", isFavorite);
    favoriteButton.textContent = isFavorite ? "★ В избранном" : "☆ В избранное";
    favoriteButton.setAttribute("aria-pressed", String(isFavorite));

    actions.append(detailsLink, addButton);
    content.append(category, title, description, availability, price, actions, favoriteButton);
    card.append(image, content);
    return card;
  }

  function getFilteredProducts() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedCategory =  categorySelect.value;
    const sortValue = sortSelect.value;

    const filteredProducts = window.products.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchText);
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const sortedProducts = [...filteredProducts];
    if (sortValue === "price-asc") sortedProducts.sort((a, b) => a.price - b.price);
    if (sortValue === "price-desc") sortedProducts.sort((a, b) => b.price - a.price);
    if (sortValue === "title") sortedProducts.sort((a, b) => a.title.localeCompare(b.title, "ru"));

    return sortedProducts;
  }

  function renderCatalog() {
    const visibleProducts = getFilteredProducts();
    catalogGrid.replaceChildren();

    visibleProducts.forEach((product) => {
      catalogGrid.append(createProductCard(product));
    });

    resultCount.textContent = `Найдено товаров: ${visibleProducts.length}`;
    emptyState.hidden = visibleProducts.length !== 0;
  }

  searchInput.addEventListener("input", renderCatalog);
  categorySelect.addEventListener("change", renderCatalog);
  sortSelect.addEventListener("change", renderCatalog);

  document.querySelectorAll(".js-reset-catalog").forEach((resetButton) => {
    resetButton.addEventListener("click", () => {
      searchInput.value = "";
      categorySelect.value = "all";
      sortSelect.value = "default";
      renderCatalog();
      searchInput.focus();
    });
  });

  catalogGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".js-favorite");
    if (!button) return;

    const productId = Number(button.dataset.productId);
    const favorites = readFavorites();
    const isFavorite = favorites.includes(productId);
    const updatedFavorites = isFavorite
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];

    saveFavorites(updatedFavorites);
    button.classList.toggle("is-active", !isFavorite);
    button.textContent = isFavorite ? "☆ В избранное" : "★ В избранном";
    button.setAttribute("aria-pressed", String(!isFavorite));
  });

  renderCatalog();
}
