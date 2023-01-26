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
import { Token } from '@shared/models/tokens/token';
import { WithRoundPipe } from '@shared/pipes/with-round.pipe';

@Injectable()
export class OrderRateService {
  private readonly _rate$ = new BehaviorSubject<OrderRate>({
    value: new BigNumber(0),
    percentDiff: 0,
    unknown: false
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

  public isFixed = false;

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly limitOrdersService: LimitOrdersService,
    private readonly withRoundPipe: WithRoundPipe
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
          this.marketRate =
            fromAsset.blockchain === toToken.blockchain
              ? (await this.limitOrdersService.getMarketRate(fromAsset, toToken)).dp(6)
              : new BigNumber(0);
          this.updateRate(this.marketRate, true);
        }
      });
  }

  /**
   * Updates rate with new value.
   * @param newRate Update rate.
   * @param shouldUpdateToAmount True, if to amount must be updated after.
   */
  public updateRate(newRate: string | BigNumber, shouldUpdateToAmount = false): void {
    const rate = new BigNumber(newRate).dp(this.decimalPoints);
    if (this.marketRate) {
      if (this.marketRate.eq(0)) {
        this._rate$.next({
          value: rate.isFinite() ? rate : new BigNumber(-1),
          percentDiff: 0,
          unknown: true
        });
      } else {
        const percentDiff = Math.min(
          rate.minus(this.marketRate).div(this.marketRate).multipliedBy(100).dp(2).toNumber(),
          999
        );
        this._rate$.next({
          value: rate,
          percentDiff: rate.isFinite() ? percentDiff : 0,
          unknown: false
        });
      }
    } else {
      this._rate$.next({
        value: rate,
        percentDiff: 0,
        unknown: false
      });
    }
    if (shouldUpdateToAmount) {
      this.updateToAmountByRate();
    }
  }

  public recalculateRateBySwapForm(formType: 'from' | 'to'): void {
    if (this.isFixed) {
      if (formType === 'to') {
        this.updateFromAmountByRate();
      } else {
        this.updateToAmountByRate();
      }
    } else {
      const { fromAmount } = this.swapFormService.inputValue;
      const { toAmount } = this.swapFormService.outputValue;
      if (formType === 'to') {
        if (fromAmount?.gt(0)) {
          this.updateRate(toAmount.div(fromAmount));
        }
      } else {
        this.updateToAmountByRate();
      }
    }
  }

  public setRateToMarket(): void {
    this.updateRate(this.marketRate, true);
  }

  private updateFromAmountByRate(): void {
    const orderRate = this.rateValue;
    const { fromAsset } = this.swapFormService.inputValue;
    const { toAmount } = this.swapFormService.outputValue;
    const amount = toAmount?.isFinite()
      ? this.withRoundPipe.transform(toAmount.dividedBy(orderRate).toFixed(), 'fixedValue', {
          decimals: Math.min((fromAsset as Token)?.decimals || 6, 6)
        })
      : NaN;
    this.swapFormService.inputControl.patchValue({
      fromAmount: new BigNumber(amount)
    });
  }

  private updateToAmountByRate(): void {
    const orderRate = this.rateValue;
    const { fromAmount, toToken } = this.swapFormService.inputValue;
    const amount = fromAmount?.isFinite()
      ? this.withRoundPipe.transform(fromAmount.multipliedBy(orderRate).toFixed(), 'fixedValue', {
          decimals: Math.min(toToken?.decimals || 6, 6)
        })
      : NaN;
    this.swapFormService.outputControl.patchValue({
      toAmount: new BigNumber(amount)
    });
  }
}
