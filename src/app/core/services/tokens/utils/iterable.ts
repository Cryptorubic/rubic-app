export class Iterable {
  private readonly maxValue: number;

  private value: number = 0;

  private _done: boolean = false;

  public get done(): boolean {
    return this._done;
  }

  constructor(maxValue: number) {
    this.maxValue = maxValue;
  }

  next(): void {
    this.value += 1;
    this._done = this.value >= this.maxValue;
  }
}
