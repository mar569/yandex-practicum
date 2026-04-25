/** Рендер HTML из шаблона без присвоения innerHTML существующим узлам. */
export function renderHandlebarsFragment(container: HTMLElement, html: string): void {
  const doc = new DOMParser().parseFromString(html.trim(), "text/html");
  container.replaceChildren(...Array.from(doc.body.childNodes));
}

export function setText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export function clearText(id: string): void {
  setText(id, "");
}
