import { Injectable } from '@angular/core';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { BehaviorSubject } from 'rxjs';
import { SwapAmount } from '../../models/swap-info';

@Injectable()
export class RevealWindowService {
  private readonly _revealAsset$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly revealAsset$ = this._revealAsset$.asObservable();

  public get revealAsset(): BalanceToken | null {
    return this._revealAsset$.getValue();
  }

  public setRevealAsset(value: BalanceToken | null): void {
    this._revealAsset$.next(value);
  }

  private readonly _revealAmount$ = new BehaviorSubject<SwapAmount | null>(null);

  public readonly revealAmount$ = this._revealAmount$.asObservable();

  public get revealAmount(): SwapAmount | null {
    return this._revealAmount$.getValue();
  }

  public setRevealAmount(value: SwapAmount | null): void {
    this._revealAmount$.next(value);
  }
}
