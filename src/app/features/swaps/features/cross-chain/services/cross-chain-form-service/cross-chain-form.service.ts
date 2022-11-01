import { Injectable } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, from, of, Subject } from 'rxjs';
import {
  BlockchainsInfo,
  CelerCrossChainTrade,
  compareCrossChainTrades,
  CROSS_CHAIN_TRADE_TYPE,
  DebridgeCrossChainTrade,
  EvmBridgersCrossChainTrade,
  EvmCrossChainTrade,
  LifiCrossChainTrade,
  MaxAmountError,
  MinAmountError,
  RangoCrossChainTrade,
  SymbiosisCrossChainTrade,
  TronBridgersCrossChainTrade,
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
import CrossChainUnsupportedBlockchain from '@core/errors/models/cross-chain-routing/cross-chain-unsupported-blockchain';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { CrossChainTaggedTrade } from '@features/swaps/features/cross-chain/models/cross-chain-tagged-trade';
import {
  CelerRubicTradeInfo,
  SymbiosisTradeInfo
} from '@features/swaps/features/cross-chain/services/cross-chain-form-service/models/cross-chain-trade-info';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';

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
  private readonly _error$ = new BehaviorSubject<RubicError<ERROR_TYPE> | undefined>(undefined);

  public readonly error$ = this._error$.asObservable();

  private set error(value: RubicError<ERROR_TYPE> | undefined) {
    this._error$.next(value);
  }

  /**
   * Contains calculated tagged trades, which cannot be shown, because they
   * are identical in route to those trades, which are already displayed.
   */
  private replacedTaggedTrades: CrossChainTaggedTrade[] = [];

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly refreshService: RefreshService,
    private readonly authService: AuthService,
    private readonly crossChainCalculationService: CrossChainCalculationService,
    private readonly tokensService: TokensService
  ) {
    this.subscribeOnCalculation();

    this.subscribeOnFormChanges();
  }

  private startRecalculation(): void {
    this._calculateTrade$.next();
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
          this.error = undefined;

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
            map(({ total, calculated, lastCalculatedTrade }) => {
              this.calculatedTradesAmounts = {
                calculated,
                total
              };
              const calculationEnded = calculated === total;
              if (calculationEnded) {
                this.refreshService.setStopped();
              }

              if (lastCalculatedTrade) {
                this.updateBestTrade(lastCalculatedTrade, calculationEnded);
              }
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
    lastCalculatedTrade: CrossChainCalculatedTrade,
    calculationEnded: boolean
  ): void {
    this.taggedTrades = this.getUpdatedTradesList(lastCalculatedTrade);

    const bestTaggedTrade = this.taggedTrades[0];
    if (bestTaggedTrade.trade?.to?.tokenAmount) {
      const { trade, error, needApprove } = bestTaggedTrade;

      this.selectedTrade = bestTaggedTrade;
      this.swapFormService.output.patchValue({
        toAmount: trade.to.tokenAmount
      });

      if (error) {
        this.tradeStatus = TRADE_STATUS.DISABLED;
      } else {
        this.tradeStatus = needApprove ? TRADE_STATUS.READY_TO_APPROVE : TRADE_STATUS.READY_TO_SWAP;
      }
    } else if (calculationEnded) {
      this.selectedTrade = null;
      this.swapFormService.output.patchValue({
        toAmount: new BigNumber(NaN)
      });

      this.tradeStatus = TRADE_STATUS.DISABLED;

      this.error = this.crossChainCalculationService.parseCalculationError(bestTaggedTrade.error);
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
   * Subscribes on input form changes and controls recalculation after it.
   */
  private subscribeOnFormChanges(): void {
    this.swapFormService.inputValueChanges
      .pipe(
        startWith(this.swapFormService.inputValue),
        distinctUntilChanged((prev, next) => {
          return (
            prev.toBlockchain === next.toBlockchain &&
            prev.fromBlockchain === next.fromBlockchain &&
            prev.fromToken?.address === next.fromToken?.address &&
            prev.toToken?.address === next.toToken?.address &&
            prev.fromAmount === next.fromAmount
          );
        })
      )
      .subscribe(form => {
        this.taggedTrades = [];
        this.replacedTaggedTrades = [];

        if (
          !this.crossChainCalculationService.areSupportedBlockchains(
            form.fromBlockchain,
            form.toBlockchain
          )
        ) {
          let unsupportedBlockchain = undefined;
          if (this.crossChainCalculationService.isSupportedBlockchain(form.fromBlockchain)) {
            unsupportedBlockchain = form.fromBlockchain;
          } else if (!this.crossChainCalculationService.isSupportedBlockchain(form.toBlockchain)) {
            unsupportedBlockchain = form.toBlockchain;
          }

          this.error = new CrossChainUnsupportedBlockchain(unsupportedBlockchain);
          return;
        }

        this.startRecalculation();
      });
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
      trade instanceof TronBridgersCrossChainTrade
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
}
