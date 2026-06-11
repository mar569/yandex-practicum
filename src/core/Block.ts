export type Props = Record<string, unknown>;

export abstract class Block<P = Props> {
  protected props: P;
  private element: HTMLElement | null = null;

  constructor(props: P = {} as P) {
    this.props = props;
    this.init();
  }

  protected init(): void {}

  protected abstract render(): HTMLElement;

  public getContent(): HTMLElement {
    if (!this.element) {
      this.element = this.render();
    }
    return this.element;
  }

  public mount(root: HTMLElement): void {
    root.replaceChildren(this.getContent());
    this.componentDidMount();
  }

  public setProps(nextProps: Partial<P>): void {
    if (!nextProps) return;
    const oldProps = { ...this.props };
    this.props = { ...this.props, ...nextProps } as P;
    if (this.componentDidUpdate(oldProps, this.props)) {
      this._reRender();
    }
  }

  protected componentDidMount(): void {}

  protected componentDidUpdate(_oldProps: P, _newProps: P): boolean {
    return true;
  }

  private _reRender(): void {
    if (!this.element) return;
    const prev = this.element;
    this.element = this.render();
    if (prev.parentElement && this.element) {
      prev.parentElement.replaceChild(this.element, prev);
    }
  }

  protected createElement(
    tagName = "div",
    classNames: string[] = [],
  ): HTMLElement {
    const element = document.createElement(tagName);
    if (classNames.length) {
      element.className = classNames.join(" ");
    }
    return element;
  }
}
