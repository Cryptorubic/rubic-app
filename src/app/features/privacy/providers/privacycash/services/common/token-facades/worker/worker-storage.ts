export class WorkerStorage implements Storage {
  private store: Map<string, string>;

  public get length(): number {
    return this.store.size;
  }

  constructor(initialData: Record<string, string>) {
    this.store = new Map(Object.entries(initialData || {}));
  }

  public getStorageData(): Record<string, string> {
    return Object.fromEntries(this.store.entries());
  }

  public clear(): void {
    this.store.clear();
  }

  public getItem(key: string): string {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  public key(index: number): string {
    if (index > this.length - 1) return null;
    let targetKey = null;
    let idx = 0;
    for (const key of this.store.keys()) {
      if (idx === index) targetKey = key;
      idx++;
    }
    return targetKey;
  }

  public removeItem(key: string): void {
    this.store.delete(key);
  }

  public setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}
