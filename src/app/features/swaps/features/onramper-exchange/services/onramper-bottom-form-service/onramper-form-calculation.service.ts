import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, from, Observable, of, shareReplay, Subject, tap } from 'rxjs';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap
} from 'rxjs/operators';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { RefreshService } from '@features/swaps/core/services/refresh-service/refresh.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { shareReplayConfig } from '@shared/constants/common/share-replay-config';
import { SwapFormInputFiats } from '@features/swaps/core/services/swap-form-service/models/swap-form-fiats';
import { OnramperCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-calculation-service/onramper-calculation.service';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { AuthService } from '@core/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OnramperFormCalculationService {
  /**
   * Controls trade calculation flow.
   * When `next` is called, recalculation is started.
   */
  private readonly _calculateTrade$ = new Subject<{ isForced?: boolean; stop?: boolean }>();

  private readonly _tradeStatus$ = new BehaviorSubject<TRADE_STATUS>(TRADE_STATUS.DISABLED);

  public readonly tradeStatus$ = this._tradeStatus$.asObservable();

  public get tradeStatus(): TRADE_STATUS {
    return this._tradeStatus$.getValue();
  }

  public set tradeStatus(value: TRADE_STATUS) {
    this._tradeStatus$.next(value);
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
    if (inputForm.fromAssetType !== 'fiat') {
      throw new RubicError('Cannot use onramper');
    }
    return inputForm as SwapFormInputFiats;
  }

  public get inputValue$(): Observable<SwapFormInputFiats> {
    return this.swapFormService.inputValue$.pipe(
      filter(inputForm => inputForm.fromAssetType === 'fiat'),
      map(inputForm => inputForm as SwapFormInputFiats),
      shareReplay(shareReplayConfig)
    );
  }

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly refreshService: RefreshService,
    private readonly onramperCalculationService: OnramperCalculationService,
    private readonly swapsService: SwapsService,
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
            this.refreshService.setStopped();
            this.swapFormService.outputControl.patchValue({ toAmount: null });

            return { ...calculateData, isFormFilled: false };
          }
          return { ...calculateData, isFormFilled: true };
        }),
        switchMap(calculateData => {
          if (!calculateData.isFormFilled) {
            return of(null);
          }

          if (
            this.tradeStatus !== TRADE_STATUS.READY_TO_APPROVE &&
            this.tradeStatus !== TRADE_STATUS.READY_TO_SWAP &&
            this.tradeStatus !== TRADE_STATUS.OLD_TRADE_DATA
          ) {
            this.tradeStatus = TRADE_STATUS.LOADING;
          }
          this.refreshService.setRefreshing();

          return from(this.onramperCalculationService.getOutputTokenAmount(this.inputValue)).pipe(
            tap(outputTokenAmount => {
              this.tradeStatus = outputTokenAmount?.isFinite()
                ? TRADE_STATUS.READY_TO_BUY_NATIVE
                : TRADE_STATUS.DISABLED;

              this.swapFormService.outputControl.patchValue({ toAmount: outputTokenAmount });
            }),
            catchError(err => {
              this.tradeStatus = TRADE_STATUS.DISABLED;
              this.tradeError = err as RubicError<ERROR_TYPE>;
              return of(null);
            }),
            finalize(() => {
              this.refreshService.setStopped();
            })
          );
        })
      )
      .subscribe();
  }

  /**
   * Subscribes on input form changes and controls recalculation after it.
   */
  private subscribeOnFormChanges(): void {
    this.inputValue$
      .pipe(
        distinctUntilChanged(
          (prev, next) =>
            prev.toBlockchain === next.toBlockchain &&
            prev.fromAssetType === next.fromAssetType &&
            prev.fromAsset?.symbol === next.fromAsset?.symbol &&
            prev.toToken?.address === next.toToken?.address &&
            prev.fromAmount === next.fromAmount
        )
      )
      .subscribe(() => {
        this.unsetTradeData();
        this.startRecalculation();
      });
  }

  /**
   * Subscribes on refresh button calls and controls recalculation after it.
   */
  private subscribeOnRefreshServiceCalls(): void {
    this.refreshService.onRefresh$.subscribe(({ isForced }) => {
      if (isForced) {
        this.unsetTradeData();
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
    if (this.swapsService.swapMode !== SWAP_PROVIDER_TYPE.ONRAMPER) {
      return;
    }
    this._calculateTrade$.next({ isForced });
  }

  public updateRate(): void {
    this.tradeStatus = TRADE_STATUS.LOADING;
    this.startRecalculation();
  }
}
