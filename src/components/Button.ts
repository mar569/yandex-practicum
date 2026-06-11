import { Block } from '@/core/Block';

export interface ButtonProps {
  type: 'button' | 'submit';
  label: string;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

export class Button extends Block<ButtonProps> {
  protected render(): HTMLElement {
    const button = this.createElement('button', ['btn']) as HTMLButtonElement;
    button.type = this.props.type;
    button.textContent = this.props.label;
    if (this.props.className) {
      button.className = `${button.className} ${this.props.className}`.trim();
    }
    if (this.props.ariaLabel) {
      button.setAttribute('aria-label', this.props.ariaLabel);
    }
    if (typeof this.props.onClick === 'function') {
      button.addEventListener('click', this.props.onClick);
    }
    return button;
  }
}
