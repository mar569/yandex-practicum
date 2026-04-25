import Handlebars from "handlebars";
import field from "../components/field.hbs?raw";

let registered = false;

export function registerFieldPartial(): void {
  if (registered) return;
  Handlebars.registerPartial("field", field);
  registered = true;
}
