const validatedForms = document.querySelectorAll(".js-validated-form");

function getErrorText(field) {
  if (field.validity.valueMissing) return "Заполните это поле.";
  if (field.validity.typeMismatch) return "Введите корректный e-mail.";
  if (field.validity.tooShort) return `Минимум ${field.minLength} символа.`;
  if (field.validity.patternMismatch) return "Используйте формат +7 (900) 000-00-00.";
  return "Проверьте введённое значение.";
}

function getErrorElement(field) {
  const errorId = `${field.id}-error`;
  let error = document.getElementById(errorId);

  if (!error) {
    error = document.createElement("span");
    error.id = errorId;
    error.classList.add("field-error");
    const agreement = field.closest(".order-form__agreement");
    if (agreement) {
      agreement.insertAdjacentElement("afterend", error);
    } else {
      field.insertAdjacentElement("afterend", error);
    }
  }

  field.setAttribute("aria-describedby", errorId);
  return error;
}

function showFieldError(field) {
  const error = getErrorElement(field);
  error.textContent = getErrorText(field);
  field.setAttribute("aria-invalid", "true");
}

function clearFieldError(field) {
  const error = document.getElementById(`${field.id}-error`);
  if (error) error.textContent = "";
  field.removeAttribute("aria-invalid");
}

validatedForms.forEach((form) => {
  const fields = Array.from(form.elements).filter((field) => field.willValidate);

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      if (field.checkValidity()) clearFieldError(field);
    });

    field.addEventListener("blur", () => {
      if (!field.checkValidity()) showFieldError(field);
    });
  });

  form.addEventListener("reset", () => {
    fields.forEach(clearFieldError);
    const successMessage = document.getElementById(form.dataset.success);
    if (successMessage) successMessage.hidden = true;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let firstInvalidField = null;

    fields.forEach((field) => {
      if (field.checkValidity()) {
        clearFieldError(field);
      } else {
        showFieldError(field);
        if (!firstInvalidField) firstInvalidField = field;
      }
    });

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    const successMessage = document.getElementById(form.dataset.success);
    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Отправляем…";

    window.setTimeout(() => {
      form.reset();
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.defaultText || "Отправить заявку";
      if (form.closest("dialog")) form.hidden = true;

      successMessage.textContent = form.dataset.successText || "Заявка подготовлена. Это учебная имитация отправки.";
      successMessage.hidden = false;
      successMessage.setAttribute("tabindex", "-1");
      successMessage.focus();
    }, 500);
  });
});
