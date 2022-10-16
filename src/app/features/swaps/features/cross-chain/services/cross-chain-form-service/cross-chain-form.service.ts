import { Injectable } from '@angular/core';
import { CrossChainModule } from '@features/swaps/features/cross-chain/cross-chain.module';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, from, of, Subject } from 'rxjs';
import { BlockchainsInfo, RubicSdkError } from 'rubic-sdk';
import { switchTap } from '@shared/utils/utils';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { RefreshService } from '@features/swaps/core/services/refresh-service/refresh.service';
import { AuthService } from '@core/services/auth/auth.service';
import { CrossChainCalculationService } from '@features/swaps/features/cross-chain/services/cross-chain-calculation-service/cross-chain-calculation.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { CalculatedTradesAmounts } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/models/calculated-trades-amounts';
import { CalculatedCrossChainTrade } from '@features/swaps/features/cross-chain/models/calculated-cross-chain-trade';

@Injectable({
  providedIn: CrossChainModule
})
export class CrossChainFormService {
  /**
   * Controls trade calculation flow.
   * When `next` is called, recalculation is started.
   */
  private readonly _calculateTrade$ = new Subject();

  private readonly _tradeStatus$ = new BehaviorSubject<TRADE_STATUS>(TRADE_STATUS.DISABLED);

  public readonly tradeStatus$ = this._tradeStatus$.asObservable();

  public get tradeStatus(): TRADE_STATUS {
    return this._tradeStatus$.getValue();
  }

  private set tradeStatus(value: TRADE_STATUS) {
    this._tradeStatus$.next(value);
  }

  private readonly _calculatedTradesAmounts$ = new BehaviorSubject<
    CalculatedTradesAmounts | undefined
  >(undefined);

  public readonly calculatedTradesAmounts$ = this._calculatedTradesAmounts$.asObservable();

  private set calculatedTradesAmounts(value: CalculatedTradesAmounts) {
    this._calculatedTradesAmounts$.next(value);
  }

  private readonly _selectedTrade$ = new BehaviorSubject<CalculatedCrossChainTrade | undefined>(
    undefined
  );

  public readonly selectedTrade$ = this._selectedTrade$.asObservable();

  public get selectedTrade(): CalculatedCrossChainTrade | undefined {
    return this._selectedTrade$.getValue();
  }

  public set selectedTrade(value: CalculatedCrossChainTrade | undefined) {
    this._selectedTrade$.next(value);
  }

  public errorMessage: string;

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly refreshService: RefreshService,
    private readonly authService: AuthService,
    private readonly crossChainCalculationService: CrossChainCalculationService,
    private readonly tokensService: TokensService
  ) {}

  private subscribeOnCalculation(): void {
    this._calculateTrade$
      .pipe(
        debounceTime(200),
        map(() => {
          this.errorMessage = '';

          if (!this.swapFormService.isFilled) {
            this.tradeStatus = TRADE_STATUS.DISABLED;
            this.swapFormService.output.patchValue({
              toAmount: new BigNumber(NaN)
            });
            return false;
          }

          this.tradeStatus = TRADE_STATUS.LOADING;
          this.refreshService.setRefreshing();
          return true;
        }),
        switchMap(isFormFilled => {
          if (!isFormFilled) {
            return of(null);
          }

          const { fromBlockchain } = this.swapFormService.inputValue;
          const isUserAuthorized =
            Boolean(this.authService.userAddress) &&
            this.authService.userChainType === BlockchainsInfo.getChainType(fromBlockchain);

          const crossChainTrade$ =
            this.crossChainCalculationService.calculateTrade(isUserAuthorized);

          const balance$ = from(
            this.tokensService.getAndUpdateTokenBalance(this.swapFormService.inputValue.fromToken)
          );

          return crossChainTrade$.pipe(
            switchTap(() => balance$),
            tap(({ totalProviders, currentProviders }) => {
              this.calculatedTradesAmounts = {
                calculated: currentProviders,
                total: totalProviders
              };
            }),
            map(calculatedTrade => {
              this.selectTrade(calculatedTrade);
            })
          );
        }),
        tap(() => {
          if (this.calculatedTradesAmounts?.calculated === this.calculatedTradesAmounts?.total) {
            this.refreshService.setStopped();
          }
        })
      )
      .subscribe();
  }

  public selectTrade(calculatedTrade: CalculatedCrossChainTrade): void {
    this.selectedTrade = calculatedTrade;

    const { trade, error, needApprove, totalProviders, currentProviders } = calculatedTrade;
    if (currentProviders === 0) {
      return;
    }

    if (trade?.to?.tokenAmount) {
      this.swapFormService.output.patchValue({
        toAmount: trade.to.tokenAmount
      });

      if (error) {
        this.tradeStatus = TRADE_STATUS.DISABLED;
      } else {
        this.tradeStatus = needApprove ? TRADE_STATUS.READY_TO_APPROVE : TRADE_STATUS.READY_TO_SWAP;
      }
    } else if (currentProviders === totalProviders) {
      this.swapFormService.output.patchValue({
        toAmount: new BigNumber(NaN)
      });
      this.tradeStatus = TRADE_STATUS.DISABLED;

      this.setCalculationError(error);
    }
  }

  public setCalculationError(error: RubicSdkError | undefined): void {
    const parsedError = this.crossChainCalculationService.parseCalculationError(error);
    this.errorMessage = parsedError.translateKey || parsedError.message;
  }
}
