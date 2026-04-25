/**
 * URL HTML-страниц из папки `static/` при dev/preview Vite (корень: http://localhost:3000/).
 */
export function staticHtml(file: string): string {
  const name = file.replace(/^\//, "");
  return `/static/${name}`;
}
