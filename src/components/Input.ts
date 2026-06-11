import { Block } from '@/core/Block';

export interface InputProps {
  id: string;
  label: string;
  name: string;
  type: string;
  value?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  onBlur?: (value: string) => void;
  onInput?: (value: string) => void;
}

export class Input extends Block<InputProps> {
  protected render(): HTMLElement {
    const wrapper = this.createElement('div', ['field']);

    const label = this.createElement('label', [
      'field__label',
    ]) as HTMLLabelElement;
    label.htmlFor = this.props.id;
    label.textContent = this.props.label;

    const input = this.createElement('input', [
      'field__input',
    ]) as HTMLInputElement;
    input.id = this.props.id;
    input.name = this.props.name;
    input.type = this.props.type;
    input.value = this.props.value ?? '';
    input.placeholder = this.props.placeholder ?? '';
    input.required = this.props.required ?? false;

    const error = this.createElement('span', ['field__error']);
    error.id = `err-${this.props.name}`;
    error.setAttribute('role', 'alert');
    if (this.props.error) {
      error.textContent = String(this.props.error);
    }

    input.addEventListener('blur', () => {
      if (typeof this.props.onBlur === 'function') {
        this.props.onBlur(input.value);
      }
    });

    input.addEventListener('input', () => {
      if (typeof this.props.onInput === 'function') {
        this.props.onInput(input.value);
      }
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(error);

    return wrapper;
  }

  protected componentDidUpdate(): boolean {
    return true;
  }
}
