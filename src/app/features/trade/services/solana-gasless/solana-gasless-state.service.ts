import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SolanaGaslessStateService {
  private readonly _showInfo$ = new BehaviorSubject<boolean>(true);

  private readonly _gaslessTxCount24hrs$ = new BehaviorSubject<number>(0);

  public get showInfo(): boolean {
    return this._showInfo$.value;
  }

  public get madeLessThan5Txs(): boolean {
    return this._gaslessTxCount24hrs$.value < 5;
  }

  public get gaslessTxCount24hrs(): number {
    return this._gaslessTxCount24hrs$.value;
  }

  public markInfoAsShown(): void {
    this._showInfo$.next(false);
  }

  public markInfoAsNotShown(): void {
    this._showInfo$.next(true);
  }

  public setGaslessTxCount24hrs(count: number): void {
    this._gaslessTxCount24hrs$.next(count);
  }

  public incrementGaslessTxCount24hrs(): void {
    this._gaslessTxCount24hrs$.next(this.gaslessTxCount24hrs + 1);
  }
}
