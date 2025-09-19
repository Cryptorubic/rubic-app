import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, Observable, shareReplay, timer } from 'rxjs';
import { BadgeInfoForComponent, TradeState } from '@features/trade/models/trade-state';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  pairwise,
  startWith,
  switchMap
} from 'rxjs/operators';
import {
  BlockchainName,
  BlockchainsInfo,
  compareCrossChainTrades,
  CROSS_CHAIN_TRADE_TYPE,
  EvmWrapTrade,
  nativeTokensList,
  OnChainTrade,
  Token,
  WrappedCrossChainTradeOrNull,
  CrossChainTrade
} from '@cryptorubic/sdk';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { WrappedSdkTrade } from '@features/trade/models/wrapped-sdk-trade';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { CalculationProgress } from '@features/trade/models/calculationProgress';
import BigNumber from 'bignumber.js';
import { compareAddresses, compareObjects, compareTokens } from '@shared/utils/utils';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { CalculationStatus } from '@features/trade/models/calculation-status';
import { shareReplayConfig } from '@shared/constants/common/share-replay-config';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { defaultCalculationStatus } from '@features/trade/services/swaps-state/constants/default-calculation-status';
import { defaultTradeState } from '@features/trade/services/swaps-state/constants/default-trade-state';
import { HeaderStore } from '@core/header/services/header.store';
import { SPECIFIC_BADGES_FOR_PROVIDERS } from './constants/specific-badges-for-trades';
import { SPECIFIC_BADGES_FOR_CHAINS } from './constants/specific-badges-for-chains';
import { AlternativeRoutesService } from '../alternative-route-api-service/alternative-routes.service';
import {
  CENTRALIZATION_CONFIG,
  CentralizationStatus,
  hasCentralizationStatus
} from '../../constants/centralization-status';
import { RefundService } from '../refund-service/refund.service';
import { CrossChainTradeType, OnChainTradeType } from '@cryptorubic/core';
import { SolanaGaslessStateService } from '../solana-gasless/solana-gasless-state.service';

@Injectable()
export class SwapsStateService {
  private readonly defaultState: SelectedTrade = defaultTradeState;

  private swapType: SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;

  /**
   * Trade state
   */
  private readonly _tradeState$ = new BehaviorSubject<SelectedTrade>(this.defaultState);

  public readonly tradeState$ = this._tradeState$.asObservable().pipe(debounceTime(0));

  public get tradeState(): SelectedTrade {
    return this._tradeState$.value;
  }

  /**
   * Current trade
   */
  public readonly currentTrade$ = this.tradeState$.pipe(map(el => el?.trade));

  public readonly wrongBlockchain$ = this.swapsFormService.fromToken$.pipe(
    filter(Boolean),
    combineLatestWith(this.walletConnector.networkChange$),
    map(([fromToken, network]) => fromToken?.blockchain !== network),
    startWith(false)
  );

  public readonly notEnoughBalance$ = this.swapsFormService.fromToken$.pipe(
    filter(Boolean),
    combineLatestWith(
      this.tokensStoreService.tokens$,
      this.swapsFormService.fromAmount$,
      this.walletConnector.networkChange$,
      this.walletConnector.addressChange$
    ),
    map(([inputToken, storeTokens, amount, network, userAddress]) => {
      const token = storeTokens.find(currentToken => compareTokens(inputToken, currentToken));

      try {
        const tokenChainType = BlockchainsInfo.getChainType(token.blockchain);
        const currentChainType = BlockchainsInfo.getChainType(network);

        if (!userAddress || !currentChainType || tokenChainType !== currentChainType || !token) {
          return false;
        }

        return token.amount?.isFinite() ? token.amount.lt(amount?.actualValue) : true;
      } catch {
        return false;
      }
    })
  );

  private set currentTrade(state: SelectedTrade) {
    this._tradeState$.next(state);
  }

  public get currentTrade(): SelectedTrade {
    return this._tradeState$.getValue();
  }

  /**
   * Trades Store
   */
  private readonly _tradesStore$ = new BehaviorSubject<TradeState[]>([]);

  public readonly tradesStore$ = this._tradesStore$.asObservable();

  private readonly _calculationProgress$ = new BehaviorSubject<CalculationProgress>({
    total: 0,
    current: 0
  });

  public readonly calculationProgress$ = this._calculationProgress$.asObservable();

  // @ts-ignore
  public readonly calculationStatus$ = this.initCalculationStatus();

  /**
   * Receiver address
   */
  private receiverAddress: string | null;

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly walletConnector: WalletConnectorService,
    private readonly tradePageService: TradePageService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly headerStore: HeaderStore,
    private readonly alternativeRouteService: AlternativeRoutesService,
    private readonly refundService: RefundService,
    private readonly solanaGaslessStateService: SolanaGaslessStateService
  ) {
    this.subscribeOnTradeChange();
  }

  public updateTrade(
    wrappedTrade: WrappedSdkTrade,
    type: SWAP_PROVIDER_TYPE,
    needApprove: boolean,
    needAuthWallet: boolean
  ): void {
    const trade = wrappedTrade?.trade;
    const defaultState: TradeState = !trade
      ? {
          error: wrappedTrade.error,
          trade: null,
          needApprove,
          needAuthWallet,
          tradeType: wrappedTrade.tradeType,
          tags: { isBest: false, cheap: false },
          routes: [],
          centralizationStatus: null
        }
      : {
          error: wrappedTrade?.error,
          trade,
          needApprove,
          needAuthWallet,
          tradeType: wrappedTrade.tradeType,
          tags: { isBest: false, cheap: false },
          routes: trade.getTradeInfo().routePath || [],
          badges: this.setSpecificBadges(trade),
          centralizationStatus: this.setCentralizationStatus(trade)
        };

    let currentTrades = this._tradesStore$.getValue();

    // Already contains trades
    if (currentTrades.length) {
      // Same list
      if (type === this.swapType) {
        const providerIndex = currentTrades.findIndex(
          provider => provider?.trade?.type === wrappedTrade?.tradeType
        );
        // New or old
        if (providerIndex !== -1) {
          if (trade) {
            currentTrades[providerIndex] = {
              ...currentTrades[providerIndex],
              trade: defaultState.trade!,
              needApprove: defaultState.needApprove,
              error: defaultState.error,
              routes: defaultState.routes
            };
          } else {
            currentTrades.splice(providerIndex, 1);
          }
        } else {
          if (trade) {
            currentTrades.push(defaultState);
          }
        }
      } else {
        if (trade) {
          // Make a new list with one element
          currentTrades = [defaultState];
        }
      }
    } else {
      if (trade) {
        currentTrades.push(defaultState);
      }
    }
    this.swapType = type;
    this._tradesStore$.next(currentTrades);
  }

  public clearProviders(isTradeError: boolean = false): void {
    this._tradeState$.next(this.defaultState);
    this._tradesStore$.next([]);
    this.tradePageService.setProvidersVisibility(false);
    if (isTradeError) {
      this.setCalculationProgress(1, 1);
    } else {
      this.setCalculationProgress(0, 0);
    }
  }

  public removeOldProvider(tradeType: CrossChainTradeType | OnChainTradeType): void {
    let currentTrades = this._tradesStore$.getValue();

    const providerIndex = currentTrades.findIndex(provider => provider?.trade?.type === tradeType);
    if (providerIndex !== -1) {
      currentTrades.splice(providerIndex, 1);
    }

    this._tradesStore$.next(currentTrades);
  }

  public pickProvider(isCalculationEnd: boolean): void {
    let currentTrades = this._tradesStore$.getValue();

    if (currentTrades.length) {
      const isCrossChain = currentTrades.some(el => el?.trade instanceof CrossChainTrade);
      const isOnChain = currentTrades.some(el => el?.trade instanceof OnChainTrade);
      const isThereTokenWithoutPrice = currentTrades
        .filter(trade => trade?.trade?.to)
        .some(currentTrade => !currentTrade.trade.to?.price?.gt(0));

      if (isCrossChain || isOnChain) {
        currentTrades = isCrossChain
          ? this.sortCrossChainTrades(currentTrades, isThereTokenWithoutPrice)
          : this.sortOnChainTrades(currentTrades, isThereTokenWithoutPrice);
      }

      const bestTrade = currentTrades[0];

      const trade: SelectedTrade = {
        ...bestTrade,
        selectedByUser: false,
        status: TRADE_STATUS.READY_TO_SWAP
      };
      if (trade.error) {
        trade.status = TRADE_STATUS.DISABLED;
      }
      if (trade.needApprove) {
        trade.status = TRADE_STATUS.READY_TO_APPROVE;
      }

      this._tradesStore$.next(currentTrades);
      this.currentTrade = trade;
    } else {
      this.currentTrade = {
        ...this.defaultState,
        status: isCalculationEnd ? TRADE_STATUS.DISABLED : TRADE_STATUS.LOADING
      };
    }
  }

  private sortCrossChainTrades(
    currentTrades: TradeState[],
    isThereTokenWithoutPrice: boolean
  ): TradeState[] {
    return (currentTrades as WrappedCrossChainTradeOrNull[]).sort((nextTrade, prevTrade) => {
      const nativePriceForNextTrade = nextTrade?.trade
        ? this.getNativeTokenPrice(nextTrade.trade.from.blockchain)
        : new BigNumber(0);
      const nativePriceForPrevTrade = prevTrade?.trade
        ? this.getNativeTokenPrice(prevTrade.trade.from.blockchain)
        : new BigNumber(0);

      // Raises RBC-RBC via Arbitrum_Bridge in top
      if (this.isArbitrumBridgeForRBCTokens(nextTrade?.trade)) {
        return -1;
      } else {
        return compareCrossChainTrades(
          nextTrade,
          prevTrade,
          nativePriceForNextTrade,
          nativePriceForPrevTrade,
          isThereTokenWithoutPrice
        );
      }
    }) as TradeState[];
  }

  private isArbitrumBridgeForRBCTokens(trade: CrossChainTrade): boolean {
    return (
      trade.to.symbol.toLowerCase() === 'rbc' &&
      trade.from.symbol.toLowerCase() === 'rbc' &&
      trade.type === CROSS_CHAIN_TRADE_TYPE.ARBITRUM
    );
  }

  private getNativeTokenPrice(blockchain: BlockchainName): BigNumber {
    const nativeToken = nativeTokensList[blockchain];
    const nativeTokenPrice = this.tokensStoreService.tokens.find(token =>
      compareTokens(token, { blockchain, address: nativeToken.address })
    ).price;

    return new BigNumber(nativeTokenPrice);
  }

  private sortOnChainTrades(
    currentTrades: TradeState[],
    isThereTokenWithoutPrice: boolean
  ): TradeState[] {
    return currentTrades.sort((a, b) => {
      let aValue: BigNumber;
      let bValue: BigNumber;

      if (isThereTokenWithoutPrice) {
        aValue = a.trade.to.tokenAmount;
        bValue = b.trade.to.tokenAmount;
      } else {
        aValue = (a.trade as OnChainTrade).to.price.multipliedBy(a.trade.to.tokenAmount);
        bValue = (b.trade as OnChainTrade).to.price.multipliedBy(b.trade.to.tokenAmount);
      }

      if (aValue.gt(bValue)) {
        return -1;
      } else if (bValue.gt(aValue)) {
        return 1;
      }
      return 0;
    });
  }

  public async selectTrade(tradeType: TradeProvider): Promise<void> {
    const trade = this._tradesStore$.value.find(el => el.tradeType === tradeType);
    this.currentTrade = { ...trade, selectedByUser: false, status: this.currentTrade.status };
    this.swapsFormService.outputControl.patchValue({
      toAmount: trade?.trade?.to?.tokenAmount || null
    });
    this.refundService.onTradeSelection(this.currentTrade);
  }

  private subscribeOnTradeChange(): void {
    this.currentTrade$.subscribe(trade => {
      this.swapsFormService.outputControl.patchValue({
        toAmount: trade?.to?.tokenAmount || null
      });
    });
  }

  public patchCalculationState(): void {
    this._tradeState$.next({
      ...this._tradeState$.value,
      status: TRADE_STATUS.LOADING
    });
  }

  public setCalculationProgress(total: number, current: number): void {
    this._calculationProgress$.next({ total, current });
  }

  private checkWrap(fromToken: TokenAmount | null, toToken: TokenAmount | null): boolean {
    if (!fromToken?.address || !toToken?.address) {
      return false;
    }
    const fromSdkToken = new Token(fromToken);
    const toSdkToken = new Token(toToken);

    return (
      ((fromSdkToken.isNative && toSdkToken.isWrapped) ||
        (fromSdkToken.isWrapped && toSdkToken.isNative)) &&
      fromToken.blockchain === toToken.blockchain
    );
  }

  private initCalculationStatus(): Observable<CalculationStatus> {
    return this.swapsFormService.fromToken$.pipe(
      distinctUntilChanged(this.shouldEmitToken),
      combineLatestWith(
        this.swapsFormService.toToken$.pipe(distinctUntilChanged(this.shouldEmitToken))
      ),
      switchMap(this.getTimerObservable),
      combineLatestWith(
        this.swapsFormService.isFilled$.pipe(distinctUntilChanged()),
        this.tradesStore$,
        this.calculationProgress$,
        this.tradePageService.formContent$.pipe(
          pairwise(),
          map(([oldContent, newContent]) => oldContent === newContent || newContent !== 'form'),
          startWith(false),
          combineLatestWith(this.headerStore.getMobileDisplayStatus().pipe(first())),
          map(([forceExit, isMobile]) => forceExit && !isMobile)
        )
      ),
      map(options => {
        const calcStatus = this.getCalculationStatus(options);
        const currentAlternativeRoute = this.alternativeRouteService.currentAlternativeRoute;
        const { fromToken, toToken } = this.swapsFormService.inputValue;
        if (currentAlternativeRoute) {
          const isAlternativeRoute =
            compareAddresses(fromToken.address, currentAlternativeRoute.from.address) &&
            compareAddresses(toToken.address, currentAlternativeRoute.to.address);

          if (calcStatus.noRoutes && isAlternativeRoute) {
            this.alternativeRouteService.setPrevAlternativeRoute(currentAlternativeRoute);
          }
        }

        return calcStatus;
      }),
      debounceTime(50),
      distinctUntilChanged((prev, curr) => compareObjects(prev, curr)),
      shareReplay(shareReplayConfig),
      startWith(defaultCalculationStatus)
    );
  }

  private getCalculationStatus(
    options: [boolean, boolean, TradeState[], CalculationProgress, boolean]
  ): CalculationStatus {
    const [timerEmit, formFilled, trades, progress, forceExit] = options;
    const { fromToken, toToken } = this.swapsFormService.inputValue;
    const wrapTrade =
      trades.some(el => el.trade instanceof EvmWrapTrade) || this.checkWrap(fromToken, toToken);

    const hasRealTrades = trades.filter(el => Boolean(el.trade)).length > 0;
    const activeCalculation = progress.current !== progress.total;

    const calculationResult: CalculationStatus = {
      noRoutes: !activeCalculation && !hasRealTrades && progress.total > 0,
      showSidebar: false,
      activeCalculation,
      calculationProgress: progress
    };

    if (!formFilled || wrapTrade || forceExit) {
      return { ...calculationResult, showSidebar: false };
    }

    const defaultState = progress.total === 1 && progress.current === 0;
    const realCalculation = progress.total > 0;

    if (((defaultState || realCalculation) && hasRealTrades) || timerEmit) {
      return { ...calculationResult, showSidebar: true };
    }

    return calculationResult;
  }

  private shouldEmitToken(oldToken: TokenAmount, newToken: TokenAmount): boolean {
    return Boolean(oldToken && newToken) ?? compareTokens(oldToken, newToken);
  }

  private getTimerObservable(): Observable<boolean> {
    return timer(2_000).pipe(
      map(() => true),
      startWith(false)
    );
  }

  private setSpecificBadges(trade: CrossChainTrade | OnChainTrade): BadgeInfoForComponent[] {
    const badgesByProvider = Object.entries(SPECIFIC_BADGES_FOR_PROVIDERS).find(
      ([key]) => key === trade.type
    );
    const badgesByChain = Object.entries(SPECIFIC_BADGES_FOR_CHAINS)
      .filter(([chain]) => chain === trade.to.blockchain || chain === trade.from.blockchain)
      .flatMap(([_, badgeInfo]) => badgeInfo);

    if (!badgesByProvider && !badgesByChain) return [];

    const providerBadges = badgesByProvider?.[1] || [];
    const chainBadges = badgesByChain || [];
    const allBadges = [...providerBadges, ...chainBadges];

    const tradeSpecificBadges = allBadges
      .filter(Boolean)
      .filter(info => {
        if (!info.showLabel(trade)) return false;
        return !!(
          !info.fromSdk ||
          (info.fromSdk && 'promotions' in trade && trade.promotions?.length)
        );
      })
      .map(info => ({
        label: info.getLabel(trade),
        bgColor: info?.getBgColor(trade, {
          solanaGaslessStateService: this.solanaGaslessStateService
        }),
        hint: info?.getHint?.(trade),
        href: info?.getUrl?.(trade)
      }));

    return tradeSpecificBadges;
  }

  private setCentralizationStatus(
    trade: CrossChainTrade | OnChainTrade
  ): CentralizationStatus | null {
    if (hasCentralizationStatus(trade.type)) {
      return CENTRALIZATION_CONFIG[trade.type];
    }
    return null;
  }
}
