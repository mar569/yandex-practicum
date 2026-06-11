import { clearText, setText } from "@/utils/dom";
import type { ValidationSchema } from "@/utils/validation";

export type FormDataRecord = Record<string, string>;

export function collectFormData(form: HTMLFormElement): FormDataRecord {
  return Object.fromEntries(new FormData(form).entries()) as FormDataRecord;
}

export function validateField(
  field: HTMLInputElement,
  validators: ValidationSchema,
): string | null {
  const value = field.value;
  const validator = validators[field.name];
  if (!validator) return null;
  return validator(value);
}

export function showFieldError(name: string, message: string | null): void {
  const errorId = `err-${name}`;
  clearText(errorId);
  if (message) {
    setText(errorId, message);
  }
}

export function bindFormValidation(
  form: HTMLFormElement,
  schema: ValidationSchema,
  onSubmit: (data: FormDataRecord) => void,
): void {
  const fields = Array.from(form.elements).filter(
    (element): element is HTMLInputElement =>
      element instanceof HTMLInputElement && element.name !== "",
  );

  fields.forEach((field) => {
    field.addEventListener("blur", () => {
      const error = validateField(field, schema);
      showFieldError(field.name, error);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = collectFormData(form);
    console.log(data);

    const errors = Object.fromEntries(
      Object.entries(schema).map(([name, validator]) => [
        name,
        validator(data[name] ?? ""),
      ]),
    ) as Record<string, string | null>;

    let hasError = false;
    for (const [name, errorMessage] of Object.entries(errors)) {
      showFieldError(name, errorMessage);
      if (errorMessage) {
        hasError = true;
      }
    }

    if (!hasError) {
      onSubmit(data);
    }
  });
}
