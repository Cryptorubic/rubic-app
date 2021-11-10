import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PriceImpactService {
  private _priceImpact$ = new BehaviorSubject<number | null>(undefined);

  public priceImpact$ = this._priceImpact$.asObservable();

  public get priceImpact(): number | null {
    return this._priceImpact$.getValue();
  }

  public static calculatePriceImpact(
    fromTokenPrice: number,
    toTokenPrice: number,
    fromAmount: BigNumber,
    toAmount: BigNumber
  ): number {
    if (!fromTokenPrice || !toTokenPrice || !fromAmount?.isFinite() || !toAmount?.isFinite()) {
      return null;
    }

    const fromTokenCost = fromAmount.multipliedBy(fromTokenPrice);
    const toTokenCost = toAmount.multipliedBy(toTokenPrice);
    return fromTokenCost
      .minus(toTokenCost)
      .dividedBy(fromTokenCost)
      .multipliedBy(100)
      .dp(2, BigNumber.ROUND_HALF_UP)
      .toNumber();
  }

  constructor() {}

  public setPriceImpact(priceImpact: number | null): void {
    this._priceImpact$.next(priceImpact);
  }
}
