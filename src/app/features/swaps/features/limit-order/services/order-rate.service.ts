import { Injectable } from '@angular/core';
import { SwapFormService } from '@app/core/services/swaps/swap-form.service';
import { BehaviorSubject } from 'rxjs';
import BigNumber from 'bignumber.js';
import { distinctUntilChanged } from 'rxjs/operators';
import { compareAssets } from '@features/swaps/shared/utils/compare-assets';
import { compareTokens } from '@shared/utils/utils';
import { isMinimalToken } from '@shared/utils/is-token';

import { OrderRate } from '@features/swaps/features/limit-order/services/models/order-rate';
import { LimitOrdersService } from '@core/services/limit-orders/limit-orders.service';

@Injectable()
export class OrderRateService {
  private readonly _rate$ = new BehaviorSubject<OrderRate>({
    value: new BigNumber(0),
    percentDiff: 0
  });

  public readonly rate$ = this._rate$.asObservable();

  public get rateValue(): BigNumber {
    return this._rate$.getValue().value;
  }

  /**
   * Stores market rate for currently selected tokens.
   */
  private marketRate: BigNumber;

  private readonly decimalPoints = 6;

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly limitOrdersService: LimitOrdersService
  ) {
    this.subscribeOnTokensChange();
  }

  private subscribeOnTokensChange(): void {
    this.swapFormService.inputValueDistinct$
      .pipe(
        distinctUntilChanged(
          (prev, next) =>
            compareAssets(prev.fromAsset, next.fromAsset) &&
            compareTokens(prev.toToken, next.toToken)
        )
      )
      .subscribe(async ({ fromAsset, toToken }) => {
        if (isMinimalToken(fromAsset) && toToken) {
          this.marketRate = await this.limitOrdersService.getMarketRate(fromAsset, toToken);
          this.setRateToMarket();
        }
      });
  }

  /**
   * Updates rate with new value.
   * @param newRate Update rate.
   * @param form True, if rate is update by user through form.
   */
  public updateRate(newRate: string | BigNumber, form = false): void {
    const rate = new BigNumber(newRate).dp(this.decimalPoints);
    if (!this.marketRate?.isFinite() || this.marketRate.lte(0)) {
      this._rate$.next({
        value: rate,
        percentDiff: 0
      });
    } else {
      const percentDiff = Math.min(
        rate.minus(this.marketRate).div(this.marketRate).multipliedBy(100).dp(2).toNumber(),
        999
      );
      this._rate$.next({
        value: rate,
        percentDiff
      });
    }
    if (form) {
      this.updateToAmountByRate();
    }
  }

  public recalculateRateBySwapForm(): void {
    const { fromAmount } = this.swapFormService.inputValue;
    const { toAmount } = this.swapFormService.outputValue;
    if (fromAmount?.gt(0)) {
      this.updateRate(toAmount.div(fromAmount));
    }
  }

  public setRateToMarket(): void {
    this._rate$.next({
      value: this.marketRate.dp(this.decimalPoints),
      percentDiff: 0
    });
    this.updateToAmountByRate();
  }

  private updateToAmountByRate(): void {
    const orderRate = this.rateValue;
    const { fromAmount } = this.swapFormService.inputValue;
    this.swapFormService.outputControl.patchValue({
      toAmount: fromAmount?.isFinite() ? fromAmount.multipliedBy(orderRate) : new BigNumber(NaN)
    });
  }
}
