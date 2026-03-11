import { Injectable } from '@angular/core';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PrivateTransferService {
  private readonly _transferAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly transferAsset$ = this._transferAsset$.asObservable();

  public get transferAsset(): BalanceToken | null {
    return this._transferAsset$.getValue();
  }

  public set transferAsset(value: BalanceToken | null) {
    this._transferAsset$.next(value);
  }

  private readonly _transferAmount$ = new BehaviorSubject<{
    visibleValue: string;
    actualValue: BigNumber;
  } | null>(null);

  public readonly transferAmount$ = this._transferAmount$.asObservable();

  public get transferAmount(): {
    visibleValue: string;
    actualValue: BigNumber;
  } | null {
    return this._transferAmount$.getValue();
  }

  public set transferAmount(
    value: {
      visibleValue: string;
      actualValue: BigNumber;
    } | null
  ) {
    this._transferAmount$.next(value);
  }
}
