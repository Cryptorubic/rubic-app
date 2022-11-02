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
  BlockchainsInfo,
  CelerCrossChainTrade,
  compareCrossChainTrades,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainIsUnavailableError,
  DebridgeCrossChainTrade,
  EvmBridgersCrossChainTrade,
  EvmCrossChainTrade,
  LifiCrossChainTrade,
  LowSlippageError,
  MaxAmountError,
  MinAmountError,
  MultichainCrossChainTrade,
  RangoCrossChainTrade,
  RubicSdkError,
  SymbiosisCrossChainTrade,
  TooLowAmountError,
  TronBridgersCrossChainTrade,
  UnsupportedReceiverAddressError,
  ViaCrossChainTrade
} from 'rubic-sdk';
import { switchTap } from '@shared/utils/utils';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { RefreshService } from '@features/swaps/core/services/refresh-service/refresh.service';
import { AuthService } from '@core/services/auth/auth.service';
import { CrossChainCalculationService } from '@features/swaps/features/cross-chain/services/cross-chain-calculation-service/cross-chain-calculation.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { CalculatedTradesAmounts } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/models/calculated-trades-amounts';
import { CrossChainCalculatedTrade } from '@features/swaps/features/cross-chain/models/cross-chain-calculated-trade';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { CrossChainTaggedTrade } from '@features/swaps/features/cross-chain/models/cross-chain-tagged-trade';
import {
  CelerRubicTradeInfo,
  SymbiosisTradeInfo
} from '@features/swaps/features/cross-chain/services/cross-chain-form-service/models/cross-chain-trade-info';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';
import { TargetNetworkAddressService } from '@features/swaps/shared/components/target-network-address/services/target-network-address.service';
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

@Injectable({
  providedIn: 'root'
})
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
  private readonly _calculateTrade$ = new Subject<void>();

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
   * Stores amounts of total and calculated trades.
   */
  private readonly _calculatedTradesAmounts$ = new BehaviorSubject<
    CalculatedTradesAmounts | undefined
  >(undefined);

  public readonly calculatedTradesAmounts$ = this._calculatedTradesAmounts$.asObservable();

  private set calculatedTradesAmounts(value: CalculatedTradesAmounts) {
    this._calculatedTradesAmounts$.next(value);
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
  }

  /**
   * Contains error to show in form, in case there is no successfully calculated trade.
   */
  private readonly _error$ = new BehaviorSubject<RubicError<ERROR_TYPE> | null>(null);

  public readonly error$ = this._error$.asObservable();

  private set error(value: RubicError<ERROR_TYPE> | null) {
    this._error$.next(value);
  }

  /**
   * Contains calculated tagged trades, which cannot be shown, because they
   * are identical in route to those trades, which are already displayed.
   */
  private replacedTaggedTrades: CrossChainTaggedTrade[] = [];

  /**
   * Contains true, in case `approve` button must be shown in form.
   */
  private readonly _displayApproveButton$ = new BehaviorSubject<boolean>(false);

  public readonly displayApproveButton$ = this._displayApproveButton$.asObservable();

  private set displayApproveButton(value: boolean) {
    this._displayApproveButton$.next(value);
  }

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly swapsService: SwapsService,
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
    @Inject(INJECTOR) private readonly injector: Injector
  ) {
    this.subscribeOnCalculation();

    this.subscribeOnFormChanges();
    this.subscribeOnSettingsChanges();
    this.subscribeOnReceiverAddressChanges();
    this.subscribeOnUserAddressChanges();

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
        map(() => {
          this.error = null;

          if (!this.swapFormService.isFilled) {
            this.tradeStatus = TRADE_STATUS.DISABLED;
            this.swapFormService.output.patchValue({
              toAmount: new BigNumber(NaN)
            });
            return false;
          }

          if (
            this.tradeStatus !== TRADE_STATUS.READY_TO_APPROVE &&
            this.tradeStatus !== TRADE_STATUS.READY_TO_SWAP
          ) {
            this.tradeStatus = TRADE_STATUS.LOADING;
          }
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
            map(({ total, calculated, lastCalculatedTrade }) => {
              this.calculatedTradesAmounts = {
                calculated,
                total
              };
              const calculationEnded = calculated === total;
              if (calculationEnded) {
                this.refreshService.setStopped();
              }

              this.updateBestTrade(lastCalculatedTrade, calculationEnded);
            }),
            catchError((error: RubicSdkError) => {
              this.tradeStatus = TRADE_STATUS.DISABLED;
              this.refreshService.setStopped();

              this.error = this.parseCalculationError(error);

              return of(null);
            })
          );
        })
      )
      .subscribe();
  }

  /**
   * Adds last calculated trade to trades lists and updates form with best trade.
   */
  private updateBestTrade(
    lastCalculatedTrade: CrossChainCalculatedTrade | null,
    calculationEnded: boolean
  ): void {
    if (lastCalculatedTrade) {
      this.taggedTrades = this.getUpdatedTradesList(lastCalculatedTrade);
    }

    const bestTaggedTrade = this.taggedTrades[0];
    if (bestTaggedTrade?.trade?.to.tokenAmount) {
      this.updateSelectedTrade(bestTaggedTrade);
    } else if (calculationEnded) {
      this.updateSelectedTrade(null);
    }
  }

  /**
   * Returns updated trades lists with last calculated trades.
   */
  private getUpdatedTradesList(
    lastCalculatedTrade: CrossChainCalculatedTrade
  ): CrossChainTaggedTrade[] {
    let updatedTaggedTrades = this.taggedTrades.filter(
      taggedTrade => taggedTrade.tradeType !== lastCalculatedTrade.tradeType
    );
    const taggedLastCalculatedTrade = CrossChainFormService.setTags(lastCalculatedTrade);

    const lastTrade = lastCalculatedTrade.trade;
    if (lastTrade) {
      const identicalTrade = updatedTaggedTrades.find(taggedTrade => {
        const listedTrade = taggedTrade.trade;
        if (!listedTrade) {
          return false;
        }
        return (
          listedTrade.onChainSubtype.from === lastTrade.onChainSubtype.from &&
          listedTrade.onChainSubtype.to === lastTrade.onChainSubtype.to &&
          listedTrade.bridgeSubtype.type === lastTrade.bridgeSubtype.type
        );
      });

      if (identicalTrade) {
        const updatedReplacedTaggedTrades = this.replacedTaggedTrades.filter(
          replacedTaggedTrade => replacedTaggedTrade.tradeType !== lastCalculatedTrade.tradeType
        );

        if (
          identicalTrade.trade.bridgeSubtype.isNative ||
          identicalTrade.trade.to.tokenAmount.gt(lastTrade.to.tokenAmount)
        ) {
          this.replacedTaggedTrades = updatedReplacedTaggedTrades.concat(taggedLastCalculatedTrade);

          return updatedTaggedTrades;
        } else {
          this.replacedTaggedTrades = updatedReplacedTaggedTrades.concat(identicalTrade);

          updatedTaggedTrades = updatedTaggedTrades.filter(
            taggedTrade => taggedTrade.tradeType !== identicalTrade.tradeType
          );
        }
      }
    }
    return updatedTaggedTrades.concat(taggedLastCalculatedTrade).sort(compareCrossChainTrades);
  }

  /**
   * Updates currently selected trade and output form value.
   */
  public updateSelectedTrade(taggedTrade: CrossChainTaggedTrade | null): void {
    this.selectedTrade = taggedTrade;

    if (taggedTrade) {
      this.swapFormService.output.patchValue({
        toAmount: taggedTrade.trade.to.tokenAmount
      });

      const { error, needApprove } = taggedTrade;
      if (error) {
        this.tradeStatus = TRADE_STATUS.DISABLED;
      } else {
        this.tradeStatus = needApprove ? TRADE_STATUS.READY_TO_APPROVE : TRADE_STATUS.READY_TO_SWAP;
        this.displayApproveButton = needApprove;
      }
    } else {
      this.swapFormService.output.patchValue({
        toAmount: new BigNumber(NaN)
      });

      this.tradeStatus = TRADE_STATUS.DISABLED;

      this.error = this.parseCalculationError(taggedTrade?.error);
    }
  }

  private parseCalculationError(error?: RubicSdkError): RubicError<ERROR_TYPE> {
    if (error instanceof UnsupportedReceiverAddressError) {
      return new RubicError('This provider doesn’t support the receiver address.');
    }
    if (error instanceof CrossChainIsUnavailableError) {
      return new CrossChainIsUnavailableWarning();
    }
    if (error?.message?.includes('Representation of ')) {
      return new RubicError('The swap between this pair of blockchains is currently unavailable.');
    }
    if (error instanceof LowSlippageError) {
      return new RubicError('Slippage is too low for transaction.');
    }
    if (error instanceof TooLowAmountError) {
      return new RubicError(
        "The swap can't be executed with the entered amount of tokens. Please change it to the greater amount."
      );
    }

    const parsedError = RubicSdkErrorParser.parseError(error);
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
    this.swapFormService.inputValueChanges
      .pipe(
        startWith(this.swapFormService.inputValue),
        distinctUntilChanged(
          (prev, next) =>
            prev.toBlockchain === next.toBlockchain &&
            prev.fromBlockchain === next.fromBlockchain &&
            prev.fromToken?.address === next.fromToken?.address &&
            prev.toToken?.address === next.toToken?.address &&
            prev.fromAmount === next.fromAmount
        )
      )
      .subscribe(() => {
        this.unsetCalculatedTrades();

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
        this.unsetCalculatedTrades();

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
        this.unsetCalculatedTrades();

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
        this.unsetCalculatedTrades();

        this.startRecalculation();
      });
  }

  /**
   * Sets stored trades to empty values.
   */
  private unsetCalculatedTrades(): void {
    this.taggedTrades = [];
    this.replacedTaggedTrades = [];

    this.updateSelectedTrade(null);

    this.error = null;
  }

  /**
   * Subscribes on refresh button calls and controls recalculation after it.
   */
  private subscribeOnRefreshServiceCalls(): void {
    this.refreshService.onRefresh$.subscribe(() => {
      this.startRecalculation();
    });
  }

  /**
   * Makes pre-calculation checks and start recalculation.
   */
  private startRecalculation(): void {
    if (this.swapsService.swapMode !== SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING) {
      return;
    }

    const { fromBlockchain, toBlockchain } = this.swapFormService.inputValue;
    if (!this.crossChainCalculationService.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
      let unsupportedBlockchain = undefined;
      if (!this.crossChainCalculationService.isSupportedBlockchain(fromBlockchain)) {
        unsupportedBlockchain = fromBlockchain;
      } else if (!this.crossChainCalculationService.isSupportedBlockchain(toBlockchain)) {
        unsupportedBlockchain = toBlockchain;
      }

      this.error = new CrossChainUnsupportedBlockchainError(unsupportedBlockchain);
      return;
    }

    this._calculateTrade$.next();
  }

  /**
   * Gets trade info to show in transaction info panel.
   */
  // @todo move to another service
  public async getTradeInfo(): Promise<CelerRubicTradeInfo | SymbiosisTradeInfo> {
    if (!this.selectedTrade?.trade) {
      return null;
    }

    const trade = this.selectedTrade.trade;
    const { estimatedGas } = trade as EvmCrossChainTrade;

    if (
      trade instanceof SymbiosisCrossChainTrade ||
      trade instanceof LifiCrossChainTrade ||
      trade instanceof DebridgeCrossChainTrade ||
      trade instanceof ViaCrossChainTrade ||
      trade instanceof RangoCrossChainTrade ||
      trade instanceof EvmBridgersCrossChainTrade ||
      trade instanceof TronBridgersCrossChainTrade ||
      trade instanceof MultichainCrossChainTrade
    ) {
      return {
        estimatedGas,
        feeAmount: new BigNumber(1),
        feeTokenSymbol: 'USDC',
        feePercent: trade.feeInfo.platformFee.percent,
        priceImpact: trade.priceImpact ? String(trade.priceImpact) : '0',
        networkFee: new BigNumber(trade.feeInfo.cryptoFee?.amount),
        networkFeeSymbol: trade.feeInfo.cryptoFee?.tokenSymbol
      };
    }

    if (trade instanceof CelerCrossChainTrade) {
      const { fromTrade, toTrade } = trade;
      const fromProvider = fromTrade.provider.type;
      const toProvider = toTrade.provider.type;

      const priceImpactFrom = PriceImpactService.calculatePriceImpact(
        fromTrade.fromToken.price.toNumber(),
        fromTrade.toToken.price.toNumber(),
        fromTrade.fromToken.tokenAmount,
        fromTrade.toToken.tokenAmount
      );

      const priceImpactTo = PriceImpactService.calculatePriceImpact(
        toTrade.fromToken.price.toNumber(),
        toTrade.toToken.price.toNumber(),
        toTrade.fromToken.tokenAmount,
        toTrade.toToken.tokenAmount
      );

      return {
        feePercent: trade.feeInfo.platformFee.percent,
        feeAmount: new BigNumber(1),
        feeTokenSymbol: 'USDC',
        cryptoFee: new BigNumber(trade.feeInfo?.cryptoFee?.amount).toNumber(),
        estimatedGas,
        priceImpactFrom: Number.isNaN(priceImpactFrom) ? 0 : priceImpactFrom,
        priceImpactTo: Number.isNaN(priceImpactTo) ? 0 : priceImpactTo,
        fromProvider,
        toProvider,
        fromPath: null,
        toPath: null,
        usingCelerBridge: trade.type === CROSS_CHAIN_TRADE_TYPE.CELER
      };
    }

    throw new RubicError('[RUBIC SDK] Unknown trade provider.');
  }

  public async approveTrade(): Promise<void> {
    const { fromBlockchain } = this.swapFormService.inputValue;

    this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;
    this.refreshService.startInProgress();

    try {
      await this.crossChainCalculationService.approve(this.selectedTrade);

      this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
      this.selectedTrade = {
        ...this.selectedTrade,
        needApprove: false
      };

      this.gtmService.updateFormStep(SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING, 'approve');

      await this.tokensService.updateNativeTokenBalance(fromBlockchain);
    } catch (err) {
      this.errorsService.catch(err);
      this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
    }

    this.refreshService.stopInProgress();
  }

  public async createTrade(): Promise<void> {
    if (!this.isSlippageCorrect()) {
      return;
    }

    this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
    this.refreshService.startInProgress();

    try {
      const { fromBlockchain, fromToken } = this.swapFormService.inputValue;
      await this.crossChainCalculationService.createTrade(this.selectedTrade, () => {
        this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
        this.refreshService.stopInProgress();
      });

      this.startRecalculation();

      await this.tokensService.updateTokenBalanceAfterCcrSwap({
        address: fromToken.address,
        blockchain: fromBlockchain
      });
    } catch (err) {
      const error = RubicSdkErrorParser.parseError(err);
      if (
        !(
          error instanceof NotWhitelistedProviderWarning ||
          error instanceof UnsupportedDeflationTokenWarning ||
          error instanceof ExecutionRevertedError
        )
      ) {
        this.errorsService.catch(err);
      }

      this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;

      this.refreshService.stopInProgress();
    }
  }

  private isSlippageCorrect(): boolean {
    if (
      this.settingsService.crossChainRoutingValue.autoSlippageTolerance ||
      [
        CROSS_CHAIN_TRADE_TYPE.VIA,
        CROSS_CHAIN_TRADE_TYPE.BRIDGERS,
        CROSS_CHAIN_TRADE_TYPE.MULTICHAIN
      ].every(crossChainType => crossChainType !== this.selectedTrade.trade.type)
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
}
