export class EventBus {
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  public on(event: string, callback: (...args: unknown[]) => void): void {
    const existing = this.listeners.get(event) ?? new Set();
    existing.add(callback);
    this.listeners.set(event, existing);
  }

  public off(event: string, callback?: (...args: unknown[]) => void): void {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const existing = this.listeners.get(event);
    if (!existing) return;
    existing.delete(callback);
    if (existing.size === 0) {
      this.listeners.delete(event);
    }
  }

  public emit(event: string, ...args: unknown[]): void {
    const existing = this.listeners.get(event);
    if (!existing) return;
    for (const callback of Array.from(existing)) {
      callback(...args);
    }
  }
}
