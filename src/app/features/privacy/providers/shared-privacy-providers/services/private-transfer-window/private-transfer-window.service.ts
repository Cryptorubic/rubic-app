import { Injectable } from '@angular/core';
import { SwapAmount } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PrivateTransferWindowService {
  private readonly _transferAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly transferAsset$ = this._transferAsset$.asObservable();

  public get transferAsset(): BalanceToken | null {
    return this._transferAsset$.getValue();
  }

  public setTransferAsset(value: BalanceToken | null): void {
    this._transferAsset$.next(value);
  }

  private readonly _transferAmount$ = new BehaviorSubject<SwapAmount | null>(null);

  public readonly transferAmount$ = this._transferAmount$.asObservable();

  public get transferAmount(): SwapAmount | null {
    return this._transferAmount$.getValue();
  }

  public setTransferAmount(value: SwapAmount | null): void {
    this._transferAmount$.next(value);
  }
}
