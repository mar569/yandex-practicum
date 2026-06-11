import { Block } from "@/core/Block";

export interface FormProps {
  id: string;
  className?: string;
  ariaLabel?: string;
  onSubmit: (fields: Record<string, string>) => void;
  children: HTMLElement[];
}

export class Form extends Block<FormProps> {
  protected render(): HTMLElement {
    const form = this.createElement("form", [
      this.props.className ?? "",
    ]) as HTMLFormElement;
    form.id = this.props.id;
    form.setAttribute("aria-label", this.props.ariaLabel ?? "Форма");
    form.noValidate = true;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries()) as Record<
        string,
        string
      >;
      this.props.onSubmit(data);
    });

    for (const child of this.props.children) {
      form.appendChild(child);
    }

    return form;
  }
}
