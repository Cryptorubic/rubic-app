/**
 * Queue structure implementation.
 */
export class Queue<T> {
  /**
   * Private queue store.
   */
  private store: T[] = [];

  /**
   * Push value to the store.
   * @param value Value to insert in the store.
   */
  public push(value: T): void {
    this.store.push(value);
  }

  /**
   * Pop value from the store.
   */
  public pop(): T | undefined {
    return this.store.shift();
  }
}
