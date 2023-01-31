import { Injectable } from '@angular/core';
import { SwapFormService } from '@app/core/services/swaps/swap-form.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
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

  private readonly decimalPoints = 6;

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly limitOrdersService: LimitOrdersService
  ) {
    this.subscribeOnTokensChange();
    this.subscribeOnAmountsChange();
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
          const marketRate =
            fromAsset.blockchain === toToken.blockchain
              ? (await this.limitOrdersService.getMarketRate(fromAsset, toToken)).dp(
                  this.decimalPoints
                )
              : new BigNumber(NaN);
          this._rate$.next({
            value: marketRate,
            percentDiff: this.getPercentDiff(marketRate)
          });
        }
      });
  }

  private subscribeOnAmountsChange(): void {
    combineLatest([this.swapFormService.fromToken$, this.swapFormService.toAmount$]).subscribe(
      () => {
        const marketRate = this._rate$.getValue().value;
        this._rate$.next({
          value: marketRate,
          percentDiff: this.getPercentDiff(marketRate)
        });
      }
    );
  }

  private getPercentDiff(marketRate: BigNumber): number {
    if (!marketRate.isFinite() || marketRate.eq(0)) {
      return 0;
    }

    const { fromAmount } = this.swapFormService.inputValue;
    const { toAmount } = this.swapFormService.outputValue;
    const formRate =
      fromAmount?.isFinite() && toAmount?.isFinite() ? toAmount.div(fromAmount) : null;
    return formRate?.isFinite()
      ? Math.min(formRate.minus(marketRate).div(marketRate).multipliedBy(100).dp(2).toNumber(), 999)
      : 0;
  }

  public setRateToMarket(): void {
    // this.updateRate(this.marketRate, true); todo
  }
}
