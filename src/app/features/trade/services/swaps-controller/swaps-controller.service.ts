import { Injectable } from '@angular/core';
import { forkJoin, of, Subject } from 'rxjs';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { catchError, debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { SdkService } from '@core/services/sdk/sdk.service';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { CrossChainService } from '@features/trade/services/cross-chain/cross-chain.service';
import { OnChainService } from '@features/trade/services/on-chain/on-chain.service';
import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { ErrorsService } from '@core/errors/errors.service';
import { BlockchainsInfo, ChainType, RubicSdkError } from 'rubic-sdk';
import { AuthService } from '@core/services/auth/auth.service';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';

import { RefreshService } from '@features/trade/services/refresh-service/refresh.service';

@Injectable()
export class SwapsControllerService {
  private readonly _calculateTrade$ = new Subject<{ isForced?: boolean; stop?: boolean }>();

  constructor(
    private readonly swapFormService: SwapsFormService,
    private readonly sdkService: SdkService,
    private readonly swapsState: SwapsStateService,
    private readonly crossChainService: CrossChainService,
    private readonly onChainService: OnChainService,
    private readonly swapStateService: SwapsStateService,
    private readonly errorsService: ErrorsService,
    private readonly authService: AuthService,
    private readonly tradePageService: TradePageService,
    private readonly refreshService: RefreshService
  ) {
    this.subscribeOnFormChanges();
    this.subscribeOnCalculation();
    this.subscribeOnRefreshServiceCalls();
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

  private startCalculation(isForced = false): void {
    this._calculateTrade$.next({ isForced });
  }

  private subscribeOnCalculation(): void {
    this._calculateTrade$
      .pipe(
        debounceTime(200),
        map(calculateData => {
          if (calculateData.stop || !this.swapFormService.isFilled) {
            this.refreshService.setStopped();
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
        tap(calculateData => {
          this.refreshService.setRefreshing();
          this.swapsState.setCalculationProgress(1, 0);
          if (calculateData.isForced) {
            this.swapStateService.clearProviders();
            // this.page
          }
          this.swapStateService.patchCalculationState();
        }),
        switchMap(calculateData => {
          if (calculateData.stop) {
            return of(null);
          }

          const { toBlockchain, fromToken } = this.swapFormService.inputValue;

          if (fromToken.blockchain === toBlockchain) {
            return this.onChainService.calculateTrades();
          } else {
            return this.crossChainService.calculateTrades([]);
          }
        }),
        switchMap(container => {
          const wrappedTrade = container?.value?.wrappedTrade;
          if (wrappedTrade) {
            return forkJoin([
              of(wrappedTrade),
              wrappedTrade?.trade?.needApprove() || of(false),
              of(container.type)
            ]).pipe(
              tap(([trade, needApprove, type]) => {
                if (!this.haveEnoughBalance()) {
                  trade.error = new RubicSdkError('Not enough balance');
                }
                this.swapsState.updateTrade(trade, type, needApprove);
                this.swapsState.pickProvider();
                this.swapsState.setCalculationProgress(
                  container.value.total,
                  container.value.calculated
                );
                this.setTradeAmount();
                if (container.value.total === container.value.calculated) {
                  this.refreshService.setStopped();
                }
              })
            );
          }
          return of(null);
        }),
        catchError((_err: unknown) => {
          this.refreshService.setStopped();
          return of(null);
        })
      )
      .subscribe();
  }

  private subscribeOnRefreshServiceCalls(): void {
    this.refreshService.onRefresh$.subscribe(() => {
      this.startRecalculation();
    });
  }

  private setTradeAmount(): void {
    const trade = this.swapsState.tradeState?.trade;
    if (trade) {
      this.swapFormService.outputControl.patchValue({
        toAmount: trade.to.tokenAmount
      });
    }
  }

  public async swap(
    tradeState: SelectedTrade,
    callback?: {
      onHash?: (hash: string) => void;
      onSwap?: () => void;
      onError?: () => void;
    }
  ): Promise<void> {
    try {
      if (tradeState.trade instanceof CrossChainTrade) {
        await this.crossChainService.swapTrade(tradeState.trade, callback.onHash);
      } else {
        await this.onChainService.swapTrade(tradeState.trade, callback.onHash);
      }
      callback?.onSwap();
    } catch (err) {
      console.error(err);
      callback?.onError();
      this.errorsService.catch(err);
    }
  }

  public async approve(
    tradeState: SelectedTrade,
    callback?: {
      onHash?: (hash: string) => void;
      onSwap?: () => void;
      onError?: () => void;
    }
  ): Promise<void> {
    try {
      if (tradeState.trade instanceof CrossChainTrade) {
        await this.crossChainService.approveTrade(tradeState.trade, callback.onHash);
      } else {
        await this.onChainService.approveTrade(tradeState.trade, callback.onHash);
      }
      callback?.onSwap();
    } catch (err) {
      console.error(err);
      callback?.onError();
      this.errorsService.catch(err);
    }
  }

  private haveEnoughBalance(): boolean {
    const { fromToken, fromAmount } = this.swapFormService.inputValue;

    let fromChainType: ChainType | undefined;
    try {
      fromChainType = BlockchainsInfo.getChainType(fromToken.blockchain);
    } catch {}
    if (
      !fromToken ||
      !this.authService.userAddress ||
      !fromChainType ||
      fromChainType !== this.authService.userChainType
    ) {
      return true;
    }

    if (fromToken.amount?.isFinite()) {
      return fromToken.amount.gte(fromAmount);
    }
    return true;
  }
}
