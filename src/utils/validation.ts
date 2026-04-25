export type Validator = (value: string) => string | null;

export const validators: Record<string, Validator> = {
  login: (v) => {
    if (!v) return "Введите логин";
    if (!/^[A-Za-z0-9_-]{3,20}$/.test(v)) return "3-20 символов, латиница, цифры, - и _";
    if (/^\d+$/.test(v)) return "Логин не может состоять только из цифр";
    return null;
  },
  password: (v) => {
    if (!v) return "Введите пароль";
    if (v.length < 8 || v.length > 40) return "8-40 символов";
    if (!/[A-Z]/.test(v)) return "Нужна хотя бы одна заглавная буква";
    if (!/\d/.test(v)) return "Нужна хотя бы одна цифра";
    return null;
  },
  email: (v) => {
    if (!v) return "Введите почту";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Некорректный email";
    return null;
  },
  name: (v) => {
    if (!v) return "Поле обязательно";
    if (!/^[А-ЯA-ZЁ][а-яёa-z]*(-[А-ЯA-ZЁ][а-яёa-z]*)*$/.test(v))
      return "Латиница/кириллица, с заглавной, без пробелов и цифр";
    return null;
  },
  phone: (v) => {
    if (!v) return "Введите телефон";
    if (!/^\+?\d{10,15}$/.test(v)) return "10-15 цифр, можно с +";
    return null;
  },
  message: (v) => {
    if (!v || !v.trim()) return "Сообщение не может быть пустым";
    return null;
  },
  chatTitle: (v) => (v.trim() ? null : "Введите название чата"),
};

export const validateForm = (
  data: Record<string, string>,
  schema: Record<string, Validator>,
): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const key of Object.keys(schema)) {
    const err = schema[key](data[key] ?? "");
    if (err) errors[key] = err;
  }
  return errors;
};
