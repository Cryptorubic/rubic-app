import { Injectable } from '@angular/core';
import { BehaviorSubject, from, of, Subject } from 'rxjs';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { catchError, debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { RefreshService } from '@features/swaps/core/services/refresh-service/refresh.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { SwapFormInputFiats } from '@core/services/swaps/models/swap-form-fiats';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { AuthService } from '@core/services/auth/auth.service';
import { FiatAsset } from '@shared/models/fiats/fiat-asset';
import { RubicSdkErrorParser } from '@core/errors/models/rubic-sdk-error-parser';
import { ExecutionRevertedError } from '@core/errors/models/common/execution-reverted-error';
import { OnramperCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-calculation.service';

@Injectable()
export class OnramperFormCalculationService {
  /**
   * Controls trade calculation flow.
   * When `next` is called, recalculation is started.
   */
  private readonly _calculateTrade$ = new Subject<{ isForced?: boolean; stop?: boolean }>();

  private readonly _tradeStatus$ = new BehaviorSubject<TRADE_STATUS>(TRADE_STATUS.DISABLED);

  public readonly tradeStatus$ = this._tradeStatus$.asObservable();

  private readonly _isDirectSwap$ = new BehaviorSubject<boolean>(true);

  private readonly _buyingTokenCode$ = new BehaviorSubject<string | null>(null);

  public readonly buyingTokenCode$ = this._buyingTokenCode$.asObservable();

  public get buyingTokenCode(): string {
    return this._buyingTokenCode$.getValue();
  }

  public readonly isDirectSwap$ = this._isDirectSwap$.asObservable();

  public get isDirectSwap(): boolean {
    return this._isDirectSwap$.getValue();
  }

  public get tradeStatus(): TRADE_STATUS {
    return this._tradeStatus$.getValue();
  }

  public set tradeStatus(value: TRADE_STATUS) {
    if (this.tradeStatus !== TRADE_STATUS.BUY_NATIVE_IN_PROGRESS) {
      this._tradeStatus$.next(value);
    }
  }

  private readonly _tradeError$ = new BehaviorSubject<RubicError<ERROR_TYPE> | null>(null);

  public readonly tradeError$ = this._tradeError$.asObservable();

  public get tradeError(): RubicError<ERROR_TYPE> | null {
    return this._tradeError$.value;
  }

  private set tradeError(value: RubicError<ERROR_TYPE> | null) {
    this._tradeError$.next(value);
  }

  /**
   * Counts amount of auto-refresh calls.
   */
  private refreshServiceCallsCounter = 0;

  /**
   * Returns form input value.
   * Must be used only if form contains fiat asset type.
   */
  public get inputValue(): SwapFormInputFiats {
    const inputForm = this.swapFormService.inputValue;
    if (inputForm.fromAssetType && inputForm.fromAssetType !== 'fiat') {
      throw new RubicError('Cannot use onramper');
    }
    return {
      ...inputForm,
      fromFiat: inputForm.fromAsset as FiatAsset
    } as SwapFormInputFiats;
  }

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly refreshService: RefreshService,
    private readonly onramperCalculationService: OnramperCalculationService,
    private readonly swapTypeService: SwapTypeService,
    private readonly authService: AuthService
  ) {
    this.subscribeOnCalculation();

    this.subscribeOnFormChanges();
    this.subscribeOnRefreshServiceCalls();
  }

  /**
   * Subscribe on 'calculate' subject, which controls flow of calculation.
   * Can be called only once in constructor.
   */
  private subscribeOnCalculation(): void {
    this._calculateTrade$
      .pipe(
        debounceTime(200),
        map(calculateData => {
          if (calculateData.stop || !this.swapFormService.isFilled) {
            this.tradeStatus = TRADE_STATUS.DISABLED;

            if (this.swapTypeService.getSwapProviderType() === SWAP_PROVIDER_TYPE.ONRAMPER) {
              this.refreshService.setStopped();
              this.swapFormService.outputControl.patchValue({ toAmount: null });
            }

            return { ...calculateData, stop: true };
          }
          return { ...calculateData, stop: false };
        }),
        switchMap(calculateData => {
          if (calculateData.stop) {
            return of(null);
          }

          if (calculateData.isForced) {
            this.unsetTradeData();
          }
          if (
            this.tradeStatus !== TRADE_STATUS.READY_TO_APPROVE &&
            this.tradeStatus !== TRADE_STATUS.READY_TO_SWAP &&
            this.tradeStatus !== TRADE_STATUS.OLD_TRADE_DATA
          ) {
            this.tradeStatus = TRADE_STATUS.LOADING;
          }
          this.refreshService.setRefreshing();

          return from(this.onramperCalculationService.getOutputAmount(this.inputValue)).pipe(
            tap(result => {
              const outputTokenAmount = result?.amount;
              this._isDirectSwap$.next(result.direct);
              this._buyingTokenCode$.next(result.code || null);
              this.tradeStatus = outputTokenAmount?.isFinite()
                ? TRADE_STATUS.READY_TO_BUY_NATIVE
                : TRADE_STATUS.DISABLED;
              this.refreshService.setStopped();

              this.swapFormService.outputControl.patchValue({ toAmount: outputTokenAmount });
            })
          );
        }),
        catchError((err, caught$) => {
          this.tradeStatus = TRADE_STATUS.DISABLED;
          this.refreshService.setStopped();

          const parsedError = RubicSdkErrorParser.parseError(err);
          this.tradeError =
            parsedError instanceof ExecutionRevertedError
              ? new RubicError<ERROR_TYPE>('Trade is unavailable, please try later')
              : parsedError;
          return caught$;
        })
      )
      .subscribe();
  }

  /**
   * Subscribes on input form changes and controls recalculation after it.
   */
  private subscribeOnFormChanges(): void {
    this.swapFormService.inputValueDistinct$.subscribe(() => {
      this.startRecalculation();
    });
  }

  /**
   * Subscribes on refresh button calls and controls recalculation after it.
   */
  private subscribeOnRefreshServiceCalls(): void {
    this.refreshService.onRefresh$.subscribe(({ isForced }) => {
      if (isForced) {
        this.startRecalculation();
      } else {
        if (!this.authService.userAddress || this.tradeError) {
          return;
        }
        if (this.refreshServiceCallsCounter >= 4) {
          this.tradeStatus = TRADE_STATUS.OLD_TRADE_DATA;
          return;
        }

        this.refreshServiceCallsCounter += 1;
        this.startRecalculation(false);
      }
    });
  }

  private unsetTradeData(): void {
    this.tradeError = null;
    this.refreshServiceCallsCounter = 0;

    this.swapFormService.outputControl.patchValue({ toAmount: null });
  }

  /**
   * Makes pre-calculation checks and start recalculation.
   */
  private startRecalculation(isForced = true): void {
    if (this.swapTypeService.getSwapProviderType() !== SWAP_PROVIDER_TYPE.ONRAMPER) {
      this._calculateTrade$.next({ stop: true });
      return;
    }

    this._calculateTrade$.next({ isForced });
  }

  public updateRate(): void {
    this.tradeStatus = TRADE_STATUS.LOADING;
    this.startRecalculation();
  }

  public stopBuyNativeInProgress(): void {
    this._tradeStatus$.next(TRADE_STATUS.LOADING);
    this.startRecalculation();
  }
}
