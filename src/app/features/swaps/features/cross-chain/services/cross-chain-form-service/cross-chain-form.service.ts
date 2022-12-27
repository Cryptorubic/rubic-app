import { Inject, Injectable, Injector, INJECTOR } from '@angular/core';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap
} from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, combineLatest, from, of, Subject } from 'rxjs';
import {
  BlockchainName,
  BlockchainsInfo,
  compareCrossChainTrades,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainIsUnavailableError,
  CrossChainTradeType,
  LowSlippageError,
  MaxAmountError,
  MinAmountError,
  NotSupportedTokensError,
  RubicSdkError,
  TooLowAmountError,
  UnsupportedReceiverAddressError
} from 'rubic-sdk';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { RefreshService } from '@features/swaps/core/services/refresh-service/refresh.service';
import { AuthService } from '@core/services/auth/auth.service';
import { CrossChainCalculationService } from '@features/swaps/features/cross-chain/services/cross-chain-calculation-service/cross-chain-calculation.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { CrossChainCalculatedTrade } from '@features/swaps/features/cross-chain/models/cross-chain-calculated-trade';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { CrossChainTaggedTrade } from '@features/swaps/features/cross-chain/models/cross-chain-tagged-trade';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { ErrorsService } from '@core/errors/errors.service';
import { RubicSdkErrorParser } from '@core/errors/models/rubic-sdk-error-parser';
import NotWhitelistedProviderWarning from '@core/errors/models/common/not-whitelisted-provider-warning';
import { ExecutionRevertedError } from '@core/errors/models/common/execution-reverted-error';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { AutoSlippageWarningModalComponent } from '@shared/components/via-slippage-warning-modal/auto-slippage-warning-modal.component';
import { IframeService } from '@core/services/iframe/iframe.service';
import { TuiDialogService } from '@taiga-ui/core';
import CrossChainPairCurrentlyUnavailableError from '@core/errors/models/cross-chain/cross-chain-pair-currently-unavailable-error';
import CrossChainUnsupportedBlockchainError from '@core/errors/models/cross-chain/cross-chain-unsupported-blockchain-error';
import UnsupportedDeflationTokenWarning from '@core/errors/models/common/unsupported-deflation-token.warning';
import CrossChainIsUnavailableWarning from '@core/errors/models/cross-chain/cross-chainIs-unavailable-warning';
import { UserRejectError } from '@core/errors/models/provider/user-reject-error';
import { SWAP_PROCESS } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/models/swap-process';
import CrossChainSwapUnavailableWarning from '@core/errors/models/cross-chain/cross-chain-swap-unavailable-warning';
import { compareTradesRoutes } from '@features/swaps/features/cross-chain/utils/compare-trades-routes';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';
import { SwapFormInputTokens } from '@core/services/swaps/models/swap-form-tokens';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';

@Injectable()
export class CrossChainFormService {
  private static setTags(calculatedTrade: CrossChainCalculatedTrade): CrossChainTaggedTrade {
    return {
      ...calculatedTrade,
      tags: {
        minAmountWarning: calculatedTrade.error instanceof MinAmountError,
        maxAmountWarning: calculatedTrade.error instanceof MaxAmountError
      }
    };
  }

  /**
   * Controls trade calculation flow.
   * When `next` is called, recalculation is started.
   */
  private readonly _calculateTrade$ = new Subject<{ isForced?: boolean; stop?: boolean }>();

  /**
   * Current status of trade.
   */
  private readonly _tradeStatus$ = new BehaviorSubject<TRADE_STATUS>(TRADE_STATUS.DISABLED);

  public readonly tradeStatus$ = this._tradeStatus$.asObservable();

  public get tradeStatus(): TRADE_STATUS {
    return this._tradeStatus$.getValue();
  }

  private set tradeStatus(value: TRADE_STATUS) {
    this._tradeStatus$.next(value);
  }

  /**
   * True, if calculation process is in progress.
   */
  private readonly _isCalculating$ = new BehaviorSubject<boolean>(false);

  public readonly isCalculating$ = this._isCalculating$.asObservable();

  private set isCalculating(value: boolean) {
    this._isCalculating$.next(value);
  }

  /**
   * Contains calculated tagged trades.
   */
  private readonly _taggedTrades$ = new BehaviorSubject<CrossChainTaggedTrade[]>([]);

  public readonly taggedTrades$ = this._taggedTrades$.asObservable();

  public get taggedTrades(): CrossChainTaggedTrade[] {
    return this._taggedTrades$.getValue();
  }

  private set taggedTrades(value: CrossChainTaggedTrade[]) {
    this._taggedTrades$.next(value);
  }

  /**
   * Currently selected trade to show in form.
   */
  private readonly _selectedTrade$ = new BehaviorSubject<CrossChainTaggedTrade | null>(null);

  public readonly selectedTrade$ = this._selectedTrade$.asObservable();

  public get selectedTrade(): CrossChainTaggedTrade | null {
    return this._selectedTrade$.getValue();
  }

  private set selectedTrade(value: CrossChainTaggedTrade | null) {
    this._selectedTrade$.next(value);
    this._selectedTradeError$.next(value?.error ? this.parseCalculationError(value.error) : null);
  }

  /**
   * Currently selected trade's error to show in button.
   */
  private readonly _selectedTradeError$ = new BehaviorSubject<RubicError<ERROR_TYPE.TEXT> | null>(
    null
  );

  public readonly selectedTradeError$ = this._selectedTradeError$.asObservable();

  /**
   * Contains trade, which must be selected after `Rate is updated`
   * button is clicked.
   */
  private updatedSelectedTrade: CrossChainTaggedTrade | null = null;

  /**
   * Contains error to show in form, in case there is no successfully calculated trade.
   */
  private readonly _criticalError$ = new BehaviorSubject<RubicError<ERROR_TYPE> | null>(null);

  public readonly criticalError$ = this._criticalError$.asObservable();

  private set criticalError(value: RubicError<ERROR_TYPE> | null) {
    this._criticalError$.next(value);
  }

  /**
   * Contains calculated tagged trades, which cannot be shown, because they
   * are identical in route to those trades, which are already displayed.
   */
  private replacedTaggedTrades: CrossChainTaggedTrade[] = [];

  /**
   * Contains trades types, which were disabled due to critical errors.
   */
  private disabledTradesTypes: CrossChainTradeType[] = [];

  /**
   * Contains true, in case `approve` button must be shown in form.
   */
  private readonly _displayApproveButton$ = new BehaviorSubject<boolean>(false);

  public readonly displayApproveButton$ = this._displayApproveButton$.asObservable();

  private set displayApproveButton(value: boolean) {
    this._displayApproveButton$.next(value);
  }

  /**
   * True, if swap (approve-swap) process has started.
   */
  private isSwapStarted: SWAP_PROCESS = SWAP_PROCESS.NONE;

  private isTradeSelectedByUser = false;

  private tradeSelectedByUserTimeout: NodeJS.Timeout;

  /**
   * True, when user is hovered on approve/swap button.
   */
  private isButtonHovered = false;

  /**
   * Counts amount of auto-refresh calls.
   */
  private refreshServiceCallsCounter = 0;

  /**
   * Returns form input value.
   * Must be used only if form contains blockchains asset types.
   */
  public get inputValue(): SwapFormInputTokens {
    const inputForm = this.swapFormService.inputValue;
    if (inputForm.fromAssetType && !BlockchainsInfo.isBlockchainName(inputForm.fromAssetType)) {
      throw new RubicError('Cannot use cross chain');
    }
    return {
      ...inputForm,
      fromBlockchain: inputForm.fromAssetType as BlockchainName,
      fromToken: inputForm.fromAsset as TokenAmount
    };
  }

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly swapTypeService: SwapTypeService,
    private readonly refreshService: RefreshService,
    private readonly authService: AuthService,
    private readonly crossChainCalculationService: CrossChainCalculationService,
    private readonly tokensService: TokensService,
    private readonly settingsService: SettingsService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly errorsService: ErrorsService,
    private readonly iframeService: IframeService,
    private readonly dialogService: TuiDialogService,
    private readonly tradeService: TradeService,
    @Inject(INJECTOR) private readonly injector: Injector
  ) {
    this.subscribeOnCalculation();

    this.subscribeOnFormChanges();
    this.subscribeOnSettingsChanges();
    this.subscribeOnReceiverAddressChanges();
    this.subscribeOnUserAddressChanges();

    this.subscribeOnRefreshServiceCalls();

    this.subscribeOnIsButtonHoveredChanges();
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

            if (
              this.swapTypeService.getSwapProviderType() === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING
            ) {
              this.refreshService.setStopped();
              this.swapFormService.outputControl.patchValue({
                toAmount: new BigNumber(NaN)
              });
            }

            return { ...calculateData, stop: true };
          }
          return { ...calculateData, stop: false };
        }),
        switchMap(calculateData => {
          if (calculateData.stop) {
            return of(null);
          }

          const { fromBlockchain, fromToken, toToken, fromAmount } = this.inputValue;
          const isUserAuthorized =
            Boolean(this.authService.userAddress) &&
            this.authService.userChainType === BlockchainsInfo.getChainType(fromBlockchain);

          const balance$ = isUserAuthorized
            ? from(this.tokensService.getAndUpdateTokenBalance(fromToken))
            : of(null);
          return balance$.pipe(
            switchMap(balance => {
              if (!calculateData.isForced && balance !== null && balance.lt(fromAmount)) {
                return of(null);
              }

              if (calculateData.isForced) {
                this.unsetCalculatedTrades();
              }
              if (
                this.tradeStatus !== TRADE_STATUS.READY_TO_APPROVE &&
                this.tradeStatus !== TRADE_STATUS.READY_TO_SWAP &&
                this.tradeStatus !== TRADE_STATUS.OLD_TRADE_DATA
              ) {
                this.tradeStatus = TRADE_STATUS.LOADING;
              }
              this.isCalculating = true;
              this.refreshService.setRefreshing();

              const crossChainTrade$ = this.crossChainCalculationService.calculateTrade(
                isUserAuthorized,
                this.disabledTradesTypes,
                fromToken,
                toToken,
                fromAmount
              );
              return crossChainTrade$.pipe(
                map(({ total, calculated, lastCalculatedTrade }) => {
                  const calculationEnded = calculated === total;
                  if (calculationEnded) {
                    this.isCalculating = false;
                    this.refreshService.setStopped();
                  }

                  this.checkLastCalculatedTrade(lastCalculatedTrade, calculationEnded);
                }),
                catchError((error: RubicSdkError) => {
                  this.tradeStatus = TRADE_STATUS.DISABLED;
                  this.isCalculating = false;
                  this.refreshService.setStopped();

                  this.criticalError = this.parseCalculationError(error);

                  return of(null);
                })
              );
            })
          );
        })
      )
      .subscribe();
  }

  /**
   * Checks if last calculated trade can be added to list and updates form with best trade.
   */
  private checkLastCalculatedTrade(
    lastCalculatedTrade: CrossChainCalculatedTrade | null,
    calculationEnded: boolean
  ): void {
    let isExecutionCriticalError = false;
    if (lastCalculatedTrade?.error) {
      const parsedError = this.parseCalculationError(lastCalculatedTrade.error);
      if (this.isExecutionCriticalError(parsedError)) {
        isExecutionCriticalError = true;
        this.disableUnavailableTrade(lastCalculatedTrade.tradeType, false);
      }
    }

    if (lastCalculatedTrade && !isExecutionCriticalError) {
      this.updateTradesList(lastCalculatedTrade);

      if (
        this.isTradeSelectedByUser ||
        this.isButtonHovered ||
        this.isSwapStarted !== SWAP_PROCESS.NONE
      ) {
        this.compareSelectedTradeToBestTrade();
      } else {
        const bestTaggedTrade = this.taggedTrades[0];
        if (bestTaggedTrade?.trade?.to.tokenAmount.gt(0) || calculationEnded) {
          this.updateSelectedTrade(bestTaggedTrade);
        }
      }
    } else {
      if (calculationEnded) {
        const bestTaggedTrade = this.taggedTrades[0];
        this.updateSelectedTrade(bestTaggedTrade || null);
      }
    }
  }

  /**
   * Updates trades lists with last calculated trades.
   */
  private updateTradesList(lastCalculatedTrade: CrossChainCalculatedTrade): void {
    let updatedTaggedTrades = this.taggedTrades.filter(
      taggedTrade => taggedTrade.tradeType !== lastCalculatedTrade.tradeType
    );
    this.replacedTaggedTrades = this.replacedTaggedTrades.filter(
      replacedTaggedTrade => replacedTaggedTrade.tradeType !== lastCalculatedTrade.tradeType
    );
    const taggedLastCalculatedTrade = CrossChainFormService.setTags(lastCalculatedTrade);

    const lastTrade = lastCalculatedTrade.trade;
    if (lastTrade) {
      const identicalTrade = updatedTaggedTrades.find(taggedTrade => {
        const listedTrade = taggedTrade.trade;
        if (!listedTrade) {
          return false;
        }
        return compareTradesRoutes(listedTrade, lastTrade);
      });

      if (identicalTrade) {
        if (
          !identicalTrade.trade.isAggregator ||
          identicalTrade.trade.to.tokenAmount.gt(lastTrade.to.tokenAmount)
        ) {
          this.replacedTaggedTrades = this.replacedTaggedTrades.concat(taggedLastCalculatedTrade);
          this.taggedTrades = updatedTaggedTrades;
          return;
        } else {
          this.replacedTaggedTrades = this.replacedTaggedTrades.concat(identicalTrade);

          updatedTaggedTrades = updatedTaggedTrades.filter(
            taggedTrade => taggedTrade.tradeType !== identicalTrade.tradeType
          );
        }
      }
    }
    this.taggedTrades = updatedTaggedTrades
      .concat(taggedLastCalculatedTrade)
      .sort(compareCrossChainTrades);
  }

  /**
   * Compares currently selected trade and best trade in list, and
   * sets {@link updatedSelectedTrade} value.
   */
  public compareSelectedTradeToBestTrade(): void {
    let updatedSelectedTrade: CrossChainTaggedTrade;
    if (this.isTradeSelectedByUser) {
      updatedSelectedTrade = this.taggedTrades.find(
        taggedTrade =>
          taggedTrade?.trade && compareTradesRoutes(taggedTrade?.trade, this.selectedTrade.trade)
      );
    } else {
      if (
        this.tradeStatus === TRADE_STATUS.READY_TO_APPROVE ||
        (this.isSwapStarted === SWAP_PROCESS.NONE && this.isButtonHovered)
      ) {
        updatedSelectedTrade = this.taggedTrades[0];
      } else {
        updatedSelectedTrade = this.taggedTrades.find(
          taggedTrade => !taggedTrade.needApprove && !taggedTrade.error
        );
      }
    }
    if (!updatedSelectedTrade) {
      return;
    }

    if (
      this.selectedTrade.tradeType !== updatedSelectedTrade.tradeType ||
      !this.selectedTrade.trade.to.tokenAmount.eq(updatedSelectedTrade.trade.to.tokenAmount) ||
      (!this.selectedTrade.error && updatedSelectedTrade.error)
    ) {
      this.updatedSelectedTrade = updatedSelectedTrade;

      if (
        this.tradeStatus === TRADE_STATUS.READY_TO_APPROVE ||
        this.tradeStatus === TRADE_STATUS.READY_TO_SWAP
      ) {
        this.tradeStatus = TRADE_STATUS.OLD_TRADE_DATA;
      }
    } else {
      this.selectedTrade = updatedSelectedTrade;
    }
  }

  /**
   * Updates currently selected trade with updated one.
   */
  public updateRate(): void {
    if (this.updatedSelectedTrade) {
      this.updateSelectedTrade(this.updatedSelectedTrade);
    } else {
      this.tradeStatus = TRADE_STATUS.LOADING;
      this.startRecalculation();
    }
  }

  /**
   * Updates currently selected trade and output form value.
   */
  public updateSelectedTrade(
    taggedTrade: CrossChainTaggedTrade | null | undefined,
    selectedByUser = false
  ): void {
    this.selectedTrade = taggedTrade;
    this.updatedSelectedTrade = null;

    if (taggedTrade?.trade?.to.tokenAmount.gt(0)) {
      this.swapFormService.outputControl.patchValue({
        toAmount: taggedTrade.trade.to.tokenAmount
      });

      const { error, needApprove } = taggedTrade;
      if (error) {
        this.tradeStatus = TRADE_STATUS.DISABLED;
      } else {
        this.tradeStatus = needApprove ? TRADE_STATUS.READY_TO_APPROVE : TRADE_STATUS.READY_TO_SWAP;
        this.displayApproveButton = needApprove;
      }

      if (selectedByUser) {
        this.isTradeSelectedByUser = true;
        this.tradeSelectedByUserTimeout = setTimeout(() => {
          this.isTradeSelectedByUser = false;
        }, 10_000_000);
      }
    } else {
      this.swapFormService.outputControl.patchValue({
        toAmount: new BigNumber(NaN)
      });

      this.tradeStatus = TRADE_STATUS.DISABLED;

      this.criticalError = this.parseCalculationError(taggedTrade?.error);
    }
  }

  private parseCalculationError(error?: RubicSdkError): RubicError<ERROR_TYPE> {
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
    if (error?.message?.includes('No available routes')) {
      return new RubicError('No available routes.');
    }
    if (error?.message?.includes('There are no providers for trade')) {
      return new RubicError('There are no providers for trade.');
    }
    if (error?.message?.includes('Representation of ')) {
      return new RubicError('The swap between this pair of blockchains is currently unavailable.');
    }

    const parsedError = error && RubicSdkErrorParser.parseError(error);
    if (!parsedError || parsedError instanceof ExecutionRevertedError) {
      return new CrossChainPairCurrentlyUnavailableError();
    } else {
      return parsedError;
    }
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
   * Subscribes on cross-chain settings changes and controls recalculation after it.
   */
  private subscribeOnSettingsChanges(): void {
    this.settingsService.crossChainRoutingValueChanges
      .pipe(
        startWith(this.settingsService.crossChainRoutingValue),
        distinctUntilChanged((prev, next) => prev.slippageTolerance === next.slippageTolerance)
      )
      .subscribe(() => {
        this.startRecalculation();
      });
  }

  /**
   * Subscribes on receiver address changes and controls recalculation after it.
   */
  private subscribeOnReceiverAddressChanges(): void {
    combineLatest([
      this.settingsService.crossChainRoutingValueChanges.pipe(
        startWith(this.settingsService.crossChainRoutingValue),
        map(settings => settings.showReceiverAddress)
      ),
      this.targetNetworkAddressService.address$
    ])
      .pipe(
        map(([showReceiverAddress, address]) => (showReceiverAddress ? address : null)),
        distinctUntilChanged((prev, cur) => (!prev && !cur) || prev === cur)
      )
      .subscribe(() => {
        this.startRecalculation();
      });
  }

  /**
   * Subscribes on user address changes and controls recalculation after it.
   */
  private subscribeOnUserAddressChanges(): void {
    this.authService.currentUser$
      .pipe(
        map(user => user?.address),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.startRecalculation();
      });
  }

  /**
   * Sets stored trades to empty values.
   */
  private unsetCalculatedTrades(): void {
    this.taggedTrades = [];
    this.replacedTaggedTrades = [];
    this.disabledTradesTypes = [];

    this.updateSelectedTrade(null);
    this.unsetTradeSelectedByUser();
    this.criticalError = null;

    this.isSwapStarted = SWAP_PROCESS.NONE;

    this.refreshServiceCallsCounter = 0;
  }

  /**
   * Subscribes on refresh button calls and controls recalculation after it.
   */
  private subscribeOnRefreshServiceCalls(): void {
    this.refreshService.onRefresh$.subscribe(({ isForced }) => {
      if (isForced) {
        this.unsetTradeSelectedByUser();
        this.isSwapStarted = SWAP_PROCESS.NONE;
        this.refreshServiceCallsCounter = 0;

        this.startRecalculation();
      } else {
        if (!this.authService.userAddress || !this.selectedTrade || this.selectedTrade.error) {
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

  private unsetTradeSelectedByUser(): void {
    this.isTradeSelectedByUser = false;
    clearTimeout(this.tradeSelectedByUserTimeout);
  }

  /**
   * Makes pre-calculation checks and start recalculation.
   */
  private startRecalculation(isForced = true): void {
    if (this.swapTypeService.getSwapProviderType() !== SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING) {
      this._calculateTrade$.next({ stop: true });
      return;
    }

    const { fromAssetType, toBlockchain } = this.swapFormService.inputValue;
    const fromBlockchain = fromAssetType as BlockchainName;
    if (!this.crossChainCalculationService.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
      let unsupportedBlockchain = undefined;
      if (!this.crossChainCalculationService.isSupportedBlockchain(fromBlockchain)) {
        unsupportedBlockchain = fromBlockchain;
      } else if (!this.crossChainCalculationService.isSupportedBlockchain(toBlockchain)) {
        unsupportedBlockchain = toBlockchain;
      }

      this.criticalError = new CrossChainUnsupportedBlockchainError(unsupportedBlockchain);
      this._calculateTrade$.next({ stop: true });
      return;
    }

    this._calculateTrade$.next({ isForced });
  }

  private subscribeOnIsButtonHoveredChanges(): void {
    this.tradeService.isButtonHovered$.subscribe(isHovered => {
      this.isButtonHovered = isHovered;
      if (!isHovered && this.isSwapStarted === SWAP_PROCESS.NONE && this.updatedSelectedTrade) {
        this.updateSelectedTrade(this.updatedSelectedTrade);
      }
    });
  }

  public async approveTrade(): Promise<void> {
    this.isSwapStarted = SWAP_PROCESS.APPROVE_STARTED;

    this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;
    this.refreshService.startInProgress();

    try {
      const fromBlockchain = this.selectedTrade.trade.from.blockchain;
      await this.crossChainCalculationService.approve(this.selectedTrade);

      if (this.updatedSelectedTrade) {
        this.tradeStatus = TRADE_STATUS.OLD_TRADE_DATA;
      } else {
        this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
        this.selectedTrade = {
          ...this.selectedTrade,
          needApprove: false
        };
      }

      this.gtmService.updateFormStep(SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING, 'approve');

      await this.tokensService.updateNativeTokenBalance(fromBlockchain);
    } catch (error) {
      const parsedError = RubicSdkErrorParser.parseError(error);
      if (parsedError instanceof UserRejectError) {
        this.isSwapStarted = SWAP_PROCESS.NONE;
      }

      this.errorsService.catch(parsedError);

      if (this.updatedSelectedTrade) {
        this.tradeStatus = TRADE_STATUS.OLD_TRADE_DATA;
      } else {
        this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
      }
    }

    this.refreshService.stopInProgress();
  }

  public async swapTrade(): Promise<void> {
    if (this.isSwapStarted === SWAP_PROCESS.NONE) {
      this.isSwapStarted = SWAP_PROCESS.SWAP_STARTED;
    }

    if (!this.isSlippageCorrect()) {
      return;
    }

    if (
      !(await this.settingsService.checkSlippageAndPriceImpact(
        SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING,
        this.selectedTrade.trade
      ))
    ) {
      return;
    }

    this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
    this.refreshService.startInProgress();

    const currentSelectedTrade = this.selectedTrade;
    try {
      await this.crossChainCalculationService.swapTrade(currentSelectedTrade, () => {
        this.isSwapStarted = SWAP_PROCESS.NONE;
        this.unsetTradeSelectedByUser();

        if (this.updatedSelectedTrade) {
          this.updateSelectedTrade(this.updatedSelectedTrade);
        }

        this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
        this.refreshService.stopInProgress();

        this.startRecalculation();
      });

      const fromToken = currentSelectedTrade.trade.from;
      await this.tokensService.updateTokenBalanceAfterCcrSwap(fromToken);
    } catch (error) {
      this.handleSwapError(error, currentSelectedTrade.tradeType);
    }
  }

  private isSlippageCorrect(): boolean {
    if (
      this.settingsService.crossChainRoutingValue.autoSlippageTolerance ||
      [CROSS_CHAIN_TRADE_TYPE.VIA, CROSS_CHAIN_TRADE_TYPE.BRIDGERS].every(
        crossChainType => crossChainType !== this.selectedTrade.trade.type
      )
    ) {
      return true;
    }

    const size = this.iframeService.isIframe ? 'fullscreen' : 's';
    this.dialogService
      .open(new PolymorpheusComponent(AutoSlippageWarningModalComponent, this.injector), {
        size
      })
      .subscribe();
    return false;
  }

  private handleSwapError(error: RubicSdkError, tradeType: CrossChainTradeType): void {
    const parsedError = RubicSdkErrorParser.parseError(error);
    if (this.isExecutionCriticalError(parsedError)) {
      this.isSwapStarted = SWAP_PROCESS.NONE;
      this.unsetTradeSelectedByUser();

      this.errorsService.catch(new CrossChainSwapUnavailableWarning());

      this.disableUnavailableTrade(tradeType, true);
    } else {
      if (
        parsedError instanceof UserRejectError &&
        this.isSwapStarted === SWAP_PROCESS.SWAP_STARTED
      ) {
        this.isSwapStarted = SWAP_PROCESS.NONE;
      }

      this.errorsService.catch(parsedError);
    }

    if (this.updatedSelectedTrade) {
      this.tradeStatus = TRADE_STATUS.OLD_TRADE_DATA;
    } else {
      this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
    }

    this.refreshService.stopInProgress();
  }

  /**
   * Checks if error is critical, after which provider must be disabled.
   */
  private isExecutionCriticalError(error: RubicError<ERROR_TYPE>): boolean {
    return [
      NotWhitelistedProviderWarning,
      UnsupportedDeflationTokenWarning,
      ExecutionRevertedError
    ].some(CriticalError => error instanceof CriticalError);
  }

  /**
   * Disables trade, which thrown execution critical error.
   */
  private disableUnavailableTrade(
    unavailableTradeType: CrossChainTradeType,
    updateBestTrade: boolean
  ): void {
    this.taggedTrades = this.taggedTrades.filter(
      taggedTrade => taggedTrade.tradeType !== unavailableTradeType
    );
    this.replacedTaggedTrades.forEach(replacedTrade => {
      this.updateTradesList(replacedTrade);
    });
    this.disabledTradesTypes.push(unavailableTradeType);

    if (updateBestTrade) {
      this.updateSelectedTrade(this.taggedTrades[0]);
    }
  }
}
