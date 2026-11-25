const CART_KEY = "greenHomeCart";
const PROMO_KEY = "greenHomePromo";

function readCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(savedCart) ? savedCart : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadges();
}

function getProduct(productId) {
  return window.products.find((product) => product.id === productId);
}

function getCartCount() {
  return readCart().reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadges() {
  const count = getCartCount();

  document.querySelectorAll(".js-cart-count").forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
}

function showPageMessage(text) {
  const message = document.querySelector(".js-page-message");
  if (!message) return;

  message.textContent = text;
  message.hidden = false;
  window.clearTimeout(showPageMessage.timerId);
  showPageMessage.timerId = window.setTimeout(() => {
    message.hidden = true;
  }, 2500);
}

function addToCart(productId) {
  const product = getProduct(productId);
  if (!product || !product.isAvailable) return;

  const cart = readCart();
  const item = cart.find((cartItem) => cartItem.productId === productId);

  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }

  saveCart(cart);
  showPageMessage(`${product.title} добавлен в корзину.`);
}

function changeQuantity(productId, step) {
  const cart = readCart();
  const item = cart.find((cartItem) => cartItem.productId === productId);
  if (!item) return;

  item.quantity += step;
  const updatedCart = cart.filter((cartItem) => cartItem.quantity > 0);
  saveCart(updatedCart);
  renderCart();
}

function removeFromCart(productId) {
  const updatedCart = readCart().filter((item) => item.productId !== productId);
  saveCart(updatedCart);
  renderCart();
}

function formatPrice(price) {
  return `${price.toLocaleString("ru-RU")} руб.`;
}

function createCartButton(text, className, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.classList.add("cart-button", className);
  button.setAttribute("aria-label", label);
  return button;
}

function createCartItem(cartItem) {
  const product = getProduct(cartItem.productId);
  if (!product) return null;

  const article = document.createElement("article");
  article.classList.add("cart-item");
  article.dataset.productId = String(product.id);

  const image = document.createElement("img");
  image.classList.add("cart-item__image");
  image.src = product.imageSmall;
  image.alt = product.alt;
  image.width = 400;
  image.height = 400;

  const info = document.createElement("div");
  info.classList.add("cart-item__info");

  const title = document.createElement("h2");
  title.classList.add("cart-item__title");
  title.textContent = product.title;

  const price = document.createElement("p");
  price.textContent = `${formatPrice(product.price)} за штуку`;

  const controls = document.createElement("div");
  controls.classList.add("cart-item__controls");

  const decreaseButton = createCartButton("−", "js-decrease", `Уменьшить количество товара ${product.title}`);
  const quantity = document.createElement("span");
  quantity.classList.add("cart-item__quantity");
  quantity.textContent = String(cartItem.quantity);
  quantity.setAttribute("aria-label", `Количество: ${cartItem.quantity}`);
  const increaseButton = createCartButton("+", "js-increase", `Увеличить количество товара ${product.title}`);

  controls.append(decreaseButton, quantity, increaseButton);

  const removeButton = createCartButton("Удалить", "js-remove", `Удалить ${product.title} из корзины`);
  removeButton.classList.add("button", "button--secondary");

  info.append(title, price, controls, removeButton);

  const total = document.createElement("p");
  total.classList.add("cart-item__total");
  total.textContent = formatPrice(product.price * cartItem.quantity);

  article.append(image, info, total);
  return article;
}

function renderCart() {
  const cartList = document.querySelector(".js-cart-list");
  if (!cartList) return;

  const cart = readCart().filter((item) => getProduct(item.productId));
  const emptyState = document.querySelector(".js-cart-empty");
  const summary = document.querySelector(".js-cart-summary");
  cartList.replaceChildren();

  if (cart.length === 0) {
    emptyState.hidden = false;
    summary.hidden = true;
    return;
  }

  emptyState.hidden = true;
  summary.hidden = false;

  cart.forEach((item) => {
    const cartElement = createCartItem(item);
    if (cartElement) cartList.append(cartElement);
  });

  const subtotal = cart.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + product.price * item.quantity;
  }, 0);

  const hasPromo = localStorage.getItem(PROMO_KEY) === "GREEN10";
  const discount = hasPromo ? Math.round(subtotal * 0.1) : 0;

  document.querySelector(".js-cart-subtotal").textContent = formatPrice(subtotal);
  document.querySelector(".js-cart-discount").textContent = discount > 0 ? `− ${formatPrice(discount)}` : "0 руб.";
  document.querySelector(".js-cart-total").textContent = formatPrice(subtotal - discount);

  const promoInput = document.querySelector(".js-promo-input");
  const promoMessage = document.querySelector(".js-promo-message");
  if (hasPromo) {
    promoInput.value = "GREEN10";
    promoMessage.textContent = "Промокод применён: скидка 10%.";
  }
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest(".js-add-to-cart");
  if (addButton) {
    addToCart(Number(addButton.dataset.productId));
    return;
  }

  const cartItem = event.target.closest(".cart-item");
  if (!cartItem) return;
  const productId = Number(cartItem.dataset.productId);

  if (event.target.closest(".js-increase")) changeQuantity(productId, 1);
  if (event.target.closest(".js-decrease")) changeQuantity(productId, -1);
  if (event.target.closest(".js-remove")) removeFromCart(productId);
});

const promoForm = document.querySelector(".js-promo-form");
if (promoForm) {
  promoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const promoInput = promoForm.querySelector(".js-promo-input");
    const promoMessage = promoForm.querySelector(".js-promo-message");
    const promoCode = promoInput.value.trim().toUpperCase();

    if (promoCode === "GREEN10") {
      localStorage.setItem(PROMO_KEY, promoCode);
      promoMessage.textContent = "Промокод применён: скидка 10%.";
    } else {
      localStorage.removeItem(PROMO_KEY);
      promoMessage.textContent = "Такого промокода нет. Попробуйте GREEN10.";
    }

    renderCart();
  });
}

const cartList = document.querySelector(".js-cart-list");
if (cartList) renderCart();
updateCartBadges();

window.shopCart = { addToCart, updateCartBadges };
