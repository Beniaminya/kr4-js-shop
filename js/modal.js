const orderDialog = document.getElementById("order-dialog");

if (orderDialog) {
  const dialogProduct = document.getElementById("dialog-product");

  document.querySelectorAll(".js-open-dialog").forEach((button) => {
    button.addEventListener("click", () => {
      const dialogForm = orderDialog.querySelector("form");
      const successMessage = orderDialog.querySelector(".success-message");

      dialogForm.hidden = false;
      dialogForm.reset();
      successMessage.hidden = true;
      dialogProduct.value = button.dataset.product;
      orderDialog.showModal();
      orderDialog.querySelector("input[name='name']").focus();
    });
  });

  orderDialog.querySelectorAll(".js-close-dialog").forEach((button) => {
    button.addEventListener("click", () => orderDialog.close());
  });

  orderDialog.addEventListener("click", (event) => {
    if (event.target === orderDialog) orderDialog.close();
  });
}
