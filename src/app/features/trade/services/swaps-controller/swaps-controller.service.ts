import { Injectable } from '@angular/core';
import { of, Subject } from 'rxjs';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { SdkService } from '@core/services/sdk/sdk.service';

@Injectable()
export class SwapsControllerService {
  private readonly _calculateTrade$ = new Subject<{ isForced?: boolean; stop?: boolean }>();

  constructor(
    private readonly swapFormService: SwapsFormService,
    private readonly sdkService: SdkService
  ) {
    this.subscribeOnFormChanges();
    this.subscribeOnCalculation();
  }

  /**
   * Subscribes on input form changes and controls recalculation after it.
   */
  private subscribeOnFormChanges(): void {
    this.swapFormService.inputValueDistinct$.subscribe(() => {
      this.startRecalculation();
    });
  }

  private startRecalculation(isForced = true): void {
    this._calculateTrade$.next({ isForced });
  }

  private subscribeOnCalculation(): void {
    this._calculateTrade$
      .pipe(
        debounceTime(200),
        map(calculateData => {
          if (calculateData.stop || !this.swapFormService.isFilled) {
            // this.tradeStatus = TRADE_STATUS.DISABLED;

            // if (
            //   this.swapTypeService.getSwapProviderType() === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING
            // ) {
            //   this.refreshService.setStopped();
            //   this.swapFormService.outputControl.patchValue({
            //     toAmount: new BigNumber(NaN)
            //   });
            // }

            return { ...calculateData, stop: true };
          }
          return { ...calculateData, stop: false };
        }),
        switchMap(calculateData => {
          if (calculateData.stop) {
            return of(null);
          }

          const { toBlockchain, fromAsset, toToken, fromAmount } = this.swapFormService.inputValue;

          if ('blockchain' in fromAsset) {
            if (fromAsset.blockchain === toBlockchain) {
              return this.sdkService.instantTrade.calculateTradeReactively(
                fromAsset,
                fromAmount.toFixed(),
                toToken.address
              );
            } else {
              return this.sdkService.crossChain.calculateTradesReactively(
                fromAsset,
                fromAmount.toFixed(),
                toToken
              );
            }
          }
        }),
        tap(() => {})
      )
      .subscribe(trade => {
        console.log(trade);
        // if (trade) {
        //   providers = trade.calculated === 0 ? [] : [...providers, trade];
        //   if (trade.calculated === trade.total && this.selectedTrade && trade?.calculated !== 0) {
        //     this.saveTrade(providers);
        //   }
        // }
      });
  }
}
