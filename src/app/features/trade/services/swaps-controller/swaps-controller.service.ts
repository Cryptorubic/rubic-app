import { Injectable } from '@angular/core';
import { combineLatestWith, concatMap, forkJoin, from, Observable, of, Subject } from 'rxjs';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  startWith,
  switchMap,
  tap
} from 'rxjs/operators';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { CrossChainService } from '@features/trade/services/cross-chain/cross-chain.service';
import { OnChainService } from '@features/trade/services/on-chain/on-chain.service';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { ErrorsService } from '@core/errors/errors.service';
import { AuthService } from '@core/services/auth/auth.service';

import { RefreshService } from '@features/trade/services/refresh-service/refresh.service';
import {
  CrossChainIsUnavailableError,
  LowSlippageError,
  NoLinkedAccountError,
  NotSupportedTokensError,
  RubicSdkError,
  SimulationFailedError as SdkSimulationFailedError,
  UnsupportedReceiverAddressError,
  UserRejectError as SdkUserRejectError
} from '@cryptorubic/web3';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import CrossChainIsUnavailableWarning from '@core/errors/models/cross-chain/cross-chainIs-unavailable-warning';
import TooLowAmountError from '@core/errors/models/common/too-low-amount-error';
import { RubicSdkErrorParser } from '@core/errors/models/rubic-sdk-error-parser';
import { ExecutionRevertedError } from '@core/errors/models/common/execution-reverted-error';
import CrossChainPairCurrentlyUnavailableError from '@core/errors/models/cross-chain/cross-chain-pair-currently-unavailable-error';
import NotWhitelistedProviderWarning from '@core/errors/models/common/not-whitelisted-provider-warning';
import UnsupportedDeflationTokenWarning from '@core/errors/models/common/unsupported-deflation-token.warning';
import { ModalService } from '@core/modals/services/modal.service';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import DelayedApproveError from '@core/errors/models/common/delayed-approve.error';
import AmountChangeWarning from '@core/errors/models/cross-chain/amount-change-warning';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { CrossChainApiService } from '../cross-chain-routing-api/cross-chain-api.service';
import { OnChainApiService } from '../on-chain-api/on-chain-api.service';
import { compareObjects } from '@app/shared/utils/utils';
import CrossChainSwapUnavailableWarning from '@core/errors/models/cross-chain/cross-chain-swap-unavailable-warning';
import { WrappedSdkTrade } from '@features/trade/models/wrapped-sdk-trade';
import { onChainBlacklistProviders } from '@features/trade/services/on-chain/constants/on-chain-blacklist';
import BigNumber from 'bignumber.js';
import {
  BLOCKCHAIN_NAME,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  OnChainTradeType,
  Token
} from '@cryptorubic/core';
import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { SimulationFailedError } from '@app/core/errors/models/common/simulation-failed.error';
import { RateChangeInfo } from '../../models/rate-change-info';
import { UserRejectError } from '@app/core/errors/models/provider/user-reject-error';

@Injectable()
export class SwapsControllerService {
  private readonly _calculateTrade$ = new Subject<{
    isForced?: boolean;
    stop?: boolean;
  }>();

  public readonly calculateTrade$ = this._calculateTrade$.asObservable().pipe(debounceTime(20));

  /**
   * Contains trades types, which were disabled due to critical errors.
   */
  private disabledTradesTypes: {
    crossChain: CrossChainTradeType[];
    onChain: OnChainTradeType[];
  } = {
    crossChain: [],
    onChain: []
  };

  constructor(
    private readonly swapFormService: SwapsFormService,
    private readonly crossChainService: CrossChainService,
    private readonly onChainService: OnChainService,
    private readonly swapsStateService: SwapsStateService,
    private readonly errorsService: ErrorsService,
    private readonly authService: AuthService,
    private readonly refreshService: RefreshService,
    private readonly modalService: ModalService,
    private readonly settingsService: SettingsService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly crossChainApiService: CrossChainApiService,
    private readonly onChainApiService: OnChainApiService,
    private readonly rubicApiService: RubicApiService
  ) {
    this.subscribeOnFormChanges();
    this.subscribeOnCalculation();
    this.subscribeOnRefreshServiceCalls();
    this.subscribeOnAddressChange();
    this.subscribeOnSettings();
    this.subscribeOnReceiverChange();
    this.subscribeOnSwapFormFilled();
  }

  /**
   * Subscribes on input form changes and controls recalculation after it.
   */
  private subscribeOnFormChanges(): void {
    this.swapFormService.inputValueDistinct$.subscribe(() => {
      this.startRecalculation(true);
      this.swapsStateService.clearProviders(false);
    });
  }

  private startRecalculation(isForced = false): void {
    this._calculateTrade$.next({ isForced });
  }

  private subscribeOnCalculation(): void {
    this.handleWs();
    this.calculateTrade$
      .pipe(
        debounceTime(220),
        map(calculateData => {
          if (calculateData.stop || !this.swapFormService.isFilled) {
            this.refreshService.setStopped();
            return { ...calculateData, stop: true };
          }
          return { ...calculateData, stop: false };
        }),
        tap(calculateData => {
          if (!calculateData.stop) {
            this.refreshService.setRefreshing();
            this.swapsStateService.setCalculationProgress(1, 0);
            if (calculateData.isForced) {
              this.swapsStateService.clearProviders(false);
              this.disabledTradesTypes.crossChain = [];
              this.disabledTradesTypes.onChain = [];
            }
            this.swapsStateService.patchCalculationState();
          }
        }),
        switchMap(calculateData => {
          if (calculateData.stop) {
            return of(null);
          }

          const { fromToken, toToken } = this.swapFormService.inputValue;

          // @TODO API
          const isAlgebraWrap = false;

          if (isAlgebraWrap) {
            this.disabledTradesTypes.crossChain = [
              ...Object.values(CROSS_CHAIN_TRADE_TYPE).filter(type => type !== 'layerzero')
            ];
          } else {
            this.disabledTradesTypes.crossChain = [
              ...this.disabledTradesTypes.crossChain,
              'layerzero'
            ];
          }

          if (fromToken?.blockchain === toToken?.blockchain) {
            return this.onChainService.calculateTrades([
              ...this.disabledTradesTypes.onChain,
              ...onChainBlacklistProviders
            ]);
          }
          return this.crossChainService.calculateTrades([...this.disabledTradesTypes.crossChain]);
        }),
        catchError(err => {
          console.debug(err);
          return of(null);
        })
      )
      .subscribe();
  }

  private subscribeOnRefreshServiceCalls(): void {
    this.refreshService.onRefresh$.subscribe(refreshState => {
      this.startRecalculation(refreshState.isForced);
    });
  }

  private setTradeAmount(): void {
    const trade = this.swapsStateService.tradeState?.trade;
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
      onError?: (err: RubicError<ERROR_TYPE> | null) => void;
      onSimulationSuccess?: () => Promise<boolean>;
      onRateChange?: (rateChangeInfo: RateChangeInfo) => Promise<boolean>;
    }
  ): Promise<void> {
    const trade = tradeState.trade;
    let txHash: string;

    try {
      const isEqulaFromAmount = this.checkIsEqualFromAmount(trade.from.tokenAmount);
      if (!isEqulaFromAmount) {
        throw new Error('Trade has invalid from amount');
      }
      const allowSlippageAndPI = await this.settingsService.checkSlippageAndPriceImpact(
        trade instanceof CrossChainTrade
          ? SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING
          : SWAP_PROVIDER_TYPE.INSTANT_TRADE,
        trade
      );

      if (!allowSlippageAndPI) {
        callback.onError?.(null);
        return;
      }
      if (trade instanceof CrossChainTrade) {
        txHash = await this.crossChainService.swapTrade(
          trade,
          callback.onHash,
          callback.onSimulationSuccess
        );
      } else {
        txHash = await this.onChainService.swapTrade(
          trade,
          callback.onHash,
          callback.onSimulationSuccess
        );
      }
    } catch (err) {
      if (err instanceof AmountChangeWarning) {
        const rateChangeInfo = {
          oldAmount: Token.fromWei(err.oldAmount, trade.to.decimals),
          newAmount: Token.fromWei(err.newAmount, trade.to.decimals),
          tokenSymbol: trade.to.symbol
        };

        const allowSwap = await callback.onRateChange(rateChangeInfo);

        if (allowSwap) {
          try {
            if (trade instanceof CrossChainTrade) {
              txHash = await this.crossChainService.swapTrade(
                trade,
                callback.onHash,
                callback.onSimulationSuccess,
                {
                  skipAmountCheck: true,
                  useCacheData: true
                }
              );
            } else {
              txHash = await this.onChainService.swapTrade(
                trade,
                callback.onHash,
                callback.onSimulationSuccess,
                {
                  skipAmountCheck: true,
                  useCacheData: true
                }
              );
            }
          } catch (innerErr) {
            this.catchSwapError(innerErr, tradeState, callback?.onError);
          }
        } else {
          this.catchSwapError(new SdkUserRejectError('manual'), tradeState, callback?.onError);
        }
      } else {
        this.catchSwapError(err, tradeState, callback?.onError);
      }
    }

    if (txHash) {
      callback.onSwap?.();
    }
  }

  public async approve(
    tradeState: SelectedTrade,
    callback?: {
      onHash?: (hash: string) => void;
      onSwap?: (...args: unknown[]) => void;
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
      let error = err;
      if (err?.message?.includes('Transaction was not mined within 50 blocks')) {
        error = new DelayedApproveError();
      }
      this.errorsService.catch(error);
    }
  }

  public async authWallet(
    tradeState: SelectedTrade,
    callback?: {
      onHash?: (hash: string) => void;
      onSwap?: (...args: unknown[]) => void;
      onError?: () => void;
    }
  ): Promise<void> {
    const trade = tradeState.trade as CrossChainTrade;
    try {
      await trade.authWallet();
      callback.onSwap();
    } catch (err) {
      console.error(err);
      callback.onError();
      this.errorsService.catch(err);
    }
  }

  private subscribeOnAddressChange(): void {
    this.authService.currentUser$
      .pipe(
        distinctUntilChanged(),
        switchMap(() => this.swapFormService.isFilled$),
        filter(isFilled => isFilled)
      )
      .subscribe(() => {
        this.startRecalculation(true);
      });
  }

  private parseCalculationError(error: RubicSdkError): RubicError<ERROR_TYPE> {
    if (error instanceof NotSupportedTokensError) {
      return new RubicError('Currently, Rubic does not support swaps between these tokens.');
    }
    if (error instanceof UnsupportedReceiverAddressError) {
      return new RubicError('This provider doesn’t support the receiver address.');
    }
    if (error instanceof CrossChainIsUnavailableError) {
      return new CrossChainIsUnavailableWarning();
    }
    if (error instanceof LowSlippageError) {
      return new RubicError('Slippage is too low for transaction.');
    }
    if (error instanceof TooLowAmountError) {
      return new RubicError(
        "The swap can't be executed with the entered amount of tokens. Please change it to the greater amount."
      );
    }
    if (error instanceof SdkSimulationFailedError) {
      return new SimulationFailedError(error.apiError);
    }
    if (error instanceof SdkUserRejectError && error?.message === 'manual') {
      const manualReject = new UserRejectError();
      manualReject.showAlert = false;
      return manualReject;
    }
    if (error.message?.includes('No available routes')) {
      return new RubicError('No available routes.');
    }
    if (error.message?.includes('There are no providers for trade')) {
      return new RubicError('There are no providers for trade.');
    }
    if (error.message?.includes('Representation of ')) {
      return new RubicError('The swap between this pair of blockchains is currently unavailable.');
    }
    if (error.message?.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
      return new RubicError('Please, increase the slippage or amount and try again!');
    }

    const parsedError = RubicSdkErrorParser.parseError(error);
    if (!parsedError) {
      return new CrossChainPairCurrentlyUnavailableError();
    } else {
      return parsedError;
    }
  }

  private isExecutionCriticalError(error: RubicError<ERROR_TYPE>): boolean {
    return [
      NotWhitelistedProviderWarning,
      UnsupportedDeflationTokenWarning,
      ExecutionRevertedError,
      CrossChainSwapUnavailableWarning,
      CrossChainPairCurrentlyUnavailableError
    ].some(CriticalError => error instanceof CriticalError);
  }

  private checkIsNotLinkedAccount(
    trade: CrossChainTrade | OnChainTrade,
    error: RubicSdkError | undefined
  ): Observable<boolean> {
    if (error && error instanceof NoLinkedAccountError) {
      return of(true);
    }
    if (
      trade instanceof CrossChainTrade &&
      trade.type === CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS &&
      trade.to.blockchain === BLOCKCHAIN_NAME.SEI
    ) {
      return from(trade.checkBlockchainRequirements());
    }
    return of(false);
  }

  private needAuthWallet(trade: CrossChainTrade | OnChainTrade): boolean {
    if (trade instanceof CrossChainTrade) {
      return trade.needAuthWallet;
    }
    return false;
  }

  private catchSwapError(
    err: RubicSdkError,
    tradeState: SelectedTrade,
    onError?: (err: RubicError<ERROR_TYPE> | null) => void
  ): void {
    console.error(err);
    const parsedError = this.parseCalculationError(err);
    if (this.isExecutionCriticalError(parsedError)) {
      if (tradeState.trade instanceof CrossChainTrade) {
        this.disabledTradesTypes.crossChain.push(tradeState.trade.type);
      } else {
        this.disabledTradesTypes.onChain.push(tradeState.trade.type);
      }
      this.swapsStateService.updateTrade(
        {
          trade: null,
          error: parsedError,
          tradeType: tradeState.tradeType
        } as WrappedSdkTrade,
        tradeState.trade instanceof CrossChainTrade
          ? SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING
          : SWAP_PROVIDER_TYPE.INSTANT_TRADE,
        false,
        false
      );
      this.swapsStateService.pickProvider(true);
    }

    if (this.showErrorAlert(parsedError)) this.errorsService.catch(parsedError);
    onError?.(parsedError);
  }

  private showErrorAlert(error: RubicError<ERROR_TYPE>): boolean {
    return error.showAlert && !(error instanceof SimulationFailedError);
  }

  private subscribeOnSettings(): void {
    this.settingsService.crossChainRoutingValueChanges
      .pipe(
        startWith(this.settingsService.crossChainRoutingValue),
        distinctUntilChanged((prev, next) => prev.useMevBotProtection !== next.useMevBotProtection),
        combineLatestWith(
          this.settingsService.instantTradeValueChanges.pipe(
            startWith(this.settingsService.instantTradeValue),
            distinctUntilChanged(
              (prev, next) => prev.useMevBotProtection !== next.useMevBotProtection
            )
          )
        ),
        debounceTime(10),
        pairwise(),
        filter(([prev, next]) => !compareObjects(prev, next))
      )
      .subscribe(() => {
        this.startRecalculation(true);
      });
  }

  private subscribeOnReceiverChange(): void {
    this.targetNetworkAddressService.address$
      .pipe(combineLatestWith(this.targetNetworkAddressService.isAddressValid$), debounceTime(50))
      .subscribe(([address, isValid]) => {
        if (address === '' || (address && isValid)) {
          this.startRecalculation(true);
        }
      });
  }

  private handleWs(): void {
    this.rubicApiService
      .handleQuotesAsync()
      .pipe(
        tap(() => this.refreshService.setRefreshing()),
        map(wrap => {
          const { fromToken, toToken } = this.swapFormService.inputValue;
          return {
            value: wrap,
            type:
              fromToken.blockchain === toToken.blockchain
                ? SWAP_PROVIDER_TYPE.INSTANT_TRADE
                : SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING
          };
        }),
        catchError(err => {
          console.debug(err);
          return of(null);
        }),
        concatMap(container => {
          const wrappedTrade = container?.value?.wrappedTrade;
          const isCalculationEnd = container.value.total === container.value.calculated;

          if (wrappedTrade && this.swapFormService.isFilled) {
            const needApprove$ = wrappedTrade?.trade?.needApprove().catch(() => false) || of(false);
            const isNotLinkedAccount$ = this.checkIsNotLinkedAccount(
              wrappedTrade.trade,
              wrappedTrade?.error
            );

            const isEqualFromAmount = this.checkIsEqualFromAmount(
              wrappedTrade.trade.from.tokenAmount
            );

            if (!isEqualFromAmount) {
              wrappedTrade.trade = null;
            }

            return forkJoin([
              of(wrappedTrade),
              needApprove$,
              of(container.type),
              isNotLinkedAccount$
            ])
              .pipe(
                tap(([trade, needApprove, type, isNotLinkedAccount]) => {
                  try {
                    if (isNotLinkedAccount) {
                      this.errorsService.catch(new NoLinkedAccountError());
                      trade.trade = null;
                    }

                    // @TODO API
                    const needAuthWallet = this.needAuthWallet(trade.trade);
                    this.swapsStateService.updateTrade(trade, type, needApprove, needAuthWallet);
                    this.swapsStateService.pickProvider(isCalculationEnd);
                    this.swapsStateService.setCalculationProgress(
                      container.value.total,
                      container.value.calculated
                    );
                    this.setTradeAmount();
                    if (isCalculationEnd) {
                      this.refreshService.setStopped();
                    }
                  } catch (err) {
                    console.error(err);
                  }
                })
              )
              .pipe(
                catchError(() => {
                  // this.swapsStateService.updateTrade(trade, type, needApprove);
                  this.swapsStateService.pickProvider(isCalculationEnd);
                  return of(null);
                })
              );
          }
          if (isCalculationEnd) {
            this.refreshService.setStopped();
          }
          if (!container?.value || !this.swapFormService.isFilled) {
            this.refreshService.setStopped();
            this.swapsStateService.clearProviders(true);
          } else {
            this.swapsStateService.setCalculationProgress(
              container.value.total,
              container.value.calculated
            );
          }
          if (container.value.tradeType) {
            this.swapsStateService.removeOldProvider(container.value.tradeType);
          }
          return of(null);
        }),
        catchError((_err: unknown) => {
          this.refreshService.setStopped();
          this.swapsStateService.pickProvider(true);
          return of(null);
        })
      )
      .subscribe();
  }

  private subscribeOnSwapFormFilled(): void {
    this.swapFormService.isFilled$
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(isFilled => {
        if (!isFilled) this.rubicApiService.stopCalculation();
      });
  }

  private checkIsEqualFromAmount(fromAmount: BigNumber): boolean {
    // In API values of tokenAmount are limited by token decimals. Now we compare amounts taking this into accounts
    const formSourceToken = this.swapFormService.inputValue;
    const formSourceTokenAmount = formSourceToken.fromAmount.actualValue;
    const formSourceTokenDecimals = formSourceToken.fromToken.decimals;
    const formSourceTokenWeiAmount = Token.toWei(formSourceTokenAmount, formSourceTokenDecimals);
    const formSourceTokenNonWeiAmount = Token.fromWei(
      formSourceTokenWeiAmount,
      formSourceTokenDecimals
    );

    return fromAmount.eq(formSourceTokenNonWeiAmount);
  }
}
