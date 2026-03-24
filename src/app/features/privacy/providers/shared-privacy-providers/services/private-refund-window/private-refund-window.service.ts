import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { SwapAmount } from '../../models/swap-info';

@Injectable()
export class PrivateRefundWindowService {
  private readonly _transferAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly transferAsset$ = this._transferAsset$.asObservable();

  public get transferAsset(): BalanceToken | null {
    return this._transferAsset$.getValue();
  }

  public set transferAsset(value: BalanceToken | null) {
    this._transferAsset$.next(value);
  }

  private readonly _transferAmount$ = new BehaviorSubject<SwapAmount | null>(null);

  public readonly transferAmount$ = this._transferAmount$.asObservable();

  public get transferAmount(): SwapAmount | null {
    return this._transferAmount$.getValue();
  }

  public set transferAmount(value: SwapAmount | null) {
    this._transferAmount$.next(value);
  }
}
