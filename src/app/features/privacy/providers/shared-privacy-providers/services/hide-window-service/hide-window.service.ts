import { Injectable } from '@angular/core';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { BehaviorSubject } from 'rxjs';
import { SwapAmount } from '../../models/swap-info';

@Injectable()
export class HideWindowService {
  private readonly _hideAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly hideAsset$ = this._hideAsset$.asObservable();

  public get hideAsset(): BalanceToken | null {
    return this._hideAsset$.getValue();
  }

  public setHideAsset(value: BalanceToken | null): void {
    this._hideAsset$.next(value);
  }

  private readonly _hideAmount$ = new BehaviorSubject<SwapAmount | null>(null);

  public readonly hideAmount$ = this._hideAmount$.asObservable();

  public get hideAmount(): SwapAmount | null {
    return this._hideAmount$.getValue();
  }

  public setHideAmount(value: SwapAmount | null): void {
    this._hideAmount$.next(value);
  }
}
