import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  combineLatestWith,
  Observable,
  shareReplay,
  timer
} from 'rxjs';
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
  CROSS_CHAIN_TRADE_TYPE,
  nativeTokensList,
  Token
} from '@cryptorubic/core';
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
import { CalculationStatus } from '@features/trade/models/calculation-status';
import { shareReplayConfig } from '@shared/constants/common/share-replay-config';
import { BalanceToken } from '@shared/models/tokens/balance-token';
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
import { compareCrossChainTrades } from '../../utils/compare-cross-chain-trades';
import { CrossChainTradeType, ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '@cryptorubic/core';
import { SolanaGaslessStateService } from '../solana-gasless/solana-gasless-state.service';
import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { WrappedCrossChainTradeOrNull } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/models/wrapped-cross-chain-trade-or-null';
import { EvmWrapTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/evm-wrap-trade/evm-wrap-trade';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { NeedTrustlineOptions } from '../trustline-service/models/need-trustline-options';
import { RubicSdkError } from '@cryptorubic/web3';
import { isPrivateTrade } from '@app/core/services/sdk/sdk-legacy/features/common/utils/is-private-trade';
import { QueryParamsService } from '@core/services/query-params/query-params.service';

@Injectable()
export class SwapsStateService {
  private readonly defaultState: SelectedTrade = defaultTradeState;

  private swapType: SWAP_PROVIDER_TYPE | null = null;

  private userSelectedTradeType: TradeState['tradeType'] | null = null;

  private readonly seenTradeTypesThisCycle = new Set<string>();

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
      this.tokensFacade.tokens$,
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

  private readonly _backupTrades$ = new BehaviorSubject<TradeState[]>([]);

  private set backupTrades(trades: TradeState[]) {
    this._backupTrades$.next(trades);
  }

  public get backupTrades(): TradeState[] {
    return this._backupTrades$.getValue();
  }

  public readonly backupTradesCount$ = this._backupTrades$.pipe(
    map(trades => {
      return trades.length;
    })
  );

  private readonly _calculationProgress$ = new BehaviorSubject<CalculationProgress>({
    total: 0,
    current: 0,
    privateTotal: 0,
    privateCurrent: 0
  });

  public readonly calculationProgress$ = this._calculationProgress$.asObservable();

  public lastBestPrivateTradeType: TradeProvider | null = null;

  // @ts-ignore
  public readonly calculationStatus$ = this.initCalculationStatus();

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly walletConnector: WalletConnectorService,
    private readonly tradePageService: TradePageService,
    private readonly headerStore: HeaderStore,
    private readonly alternativeRouteService: AlternativeRoutesService,
    private readonly refundService: RefundService,
    private readonly solanaGaslessStateService: SolanaGaslessStateService,
    private readonly tokensFacade: TokensFacadeService,
    private readonly queryParamsService: QueryParamsService
  ) {
    this.subscribeOnTradeChange();
    this.subscribeOnFormChange();
  }

  public updateTrade(
    wrappedTrade: WrappedSdkTrade,
    type: SWAP_PROVIDER_TYPE,
    needApprove: boolean,
    needAuthWallet: boolean,
    needTrustlineOptions: NeedTrustlineOptions
  ): void {
    const trade = wrappedTrade?.trade;
    if (wrappedTrade?.tradeType) {
      this.seenTradeTypesThisCycle.add(wrappedTrade.tradeType);
    }
    const isPrivate = Boolean(wrappedTrade?.private);
    const defaultState: TradeState = !trade
      ? {
          error: wrappedTrade.error,
          trade: null,
          needApprove,
          needAuthWallet,
          tradeType: wrappedTrade.tradeType,
          tags: { isBest: false, cheap: false },
          routes: [],
          centralizationStatus: null,
          needTrustlineOptions: {
            needTrustlineAfterSwap: false,
            needTrustlineBeforeSwap: false
          },
          warnings: [],
          private: isPrivate
        }
      : {
          error: wrappedTrade?.error || this.setSpecificError(type, needTrustlineOptions),
          trade,
          needApprove,
          needAuthWallet,
          needTrustlineOptions,
          tradeType: wrappedTrade.tradeType,
          tags: { isBest: false, cheap: false },
          routes: trade.getTradeInfo().routePath || [],
          badges: this.setSpecificBadges(trade),
          centralizationStatus: this.setCentralizationStatus(trade),
          warnings: trade.warnings,
          private: isPrivate
        };

    let currentTrades = this._tradesStore$.getValue();

    // Already contains trades
    if (currentTrades.length) {
      // Same list
      if (type === this.swapType) {
        const providerIndex = currentTrades.findIndex(
          provider => provider?.tradeType === wrappedTrade?.tradeType
        );
        // New or old
        if (providerIndex !== -1) {
          if (trade) {
            currentTrades[providerIndex] = {
              ...currentTrades[providerIndex],
              trade: defaultState.trade!,
              needApprove: defaultState.needApprove,
              error: defaultState.error,
              routes: defaultState.routes,
              private: defaultState.private
            };
          } else {
            currentTrades.splice(providerIndex, 1);
          }
        } else if (trade) {
          currentTrades.push(defaultState);
        }
      } else {
        // Swap mode changed — discard previous providers
        currentTrades = trade ? [defaultState] : [];
      }
    } else if (trade) {
      currentTrades.push(defaultState);
    }
    this.swapType = type;
    this._tradesStore$.next(currentTrades);
  }

  public clearProviders(isTradeError: boolean = false): void {
    this.seenTradeTypesThisCycle.clear();
    this._tradeState$.next(this.getClearedTradeState());
    this._tradesStore$.next([]);
    this.swapType = null;
    this.tradePageService.setProvidersVisibility(false);
    if (isTradeError) {
      this.setCalculationProgress(1, 1);
    } else {
      this.setCalculationProgress(0, 0);
    }
  }

  public removeOldProvider(tradeType: CrossChainTradeType | OnChainTradeType): void {
    this.seenTradeTypesThisCycle.add(tradeType);
    let currentTrades = this._tradesStore$.getValue();

    const providerIndex = currentTrades.findIndex(provider => provider?.trade?.type === tradeType);
    if (providerIndex !== -1) {
      currentTrades.splice(providerIndex, 1);
    }

    this._tradesStore$.next(currentTrades);
  }

  public pickProvider(isCalculationEnd: boolean): void {
    let currentTrades = this._tradesStore$.getValue();

    const { fromToken, toToken } = this.swapsFormService.inputValue;
    if (!fromToken || !toToken) {
      this.swapType = null;
      currentTrades = [];
    } else {
      const expectOnChain = fromToken.blockchain === toToken.blockchain;
      this.swapType = expectOnChain
        ? SWAP_PROVIDER_TYPE.INSTANT_TRADE
        : SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
    }

    if (currentTrades.length) {
      currentTrades = this.filterTradesByCurrentSwapType(currentTrades);

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

      this._tradesStore$.next(currentTrades);
    }

    this.applySelectedTrade(currentTrades, isCalculationEnd);
  }

  private applySelectedTrade(currentTrades: TradeState[], isCalculationEnd: boolean): void {
    const { trade: userSelectedTrade, finished } = this.tryGetUserSelectedTrade(
      currentTrades,
      isCalculationEnd
    );
    if (!finished) {
      this.currentTrade = this.getClearedTradeState();
      return;
    }

    const selectedTradeState =
      userSelectedTrade ?? this.getDefaultSelectedTrade(currentTrades, isCalculationEnd);
    if (!selectedTradeState) {
      this.currentTrade = {
        ...this.defaultState,
        status: isCalculationEnd ? TRADE_STATUS.DISABLED : TRADE_STATUS.LOADING
      };
      return;
    }

    const trade: SelectedTrade = {
      ...selectedTradeState,
      selectedByUser: !!userSelectedTrade,
      status: TRADE_STATUS.READY_TO_SWAP
    };
    if (trade.error) {
      trade.status = TRADE_STATUS.DISABLED;
    }
    if (trade.needApprove) {
      trade.status = TRADE_STATUS.READY_TO_APPROVE;
    }
    this.currentTrade = trade;
  }

  private tryGetUserSelectedTrade(
    currentTrades: TradeState[],
    isCalculationEnd: boolean
  ): {
    finished: boolean;
    trade?: TradeState;
  } {
    if (!this.userSelectedTradeType) {
      return {
        finished: true
      };
    }

    const userTrade = currentTrades.find(
      tradeState => tradeState.tradeType === this.userSelectedTradeType
    );

    if (userTrade?.trade && !userTrade.error) {
      return {
        finished: true,
        trade: userTrade
      };
    }

    const wasSeenThisCycle = this.seenTradeTypesThisCycle.has(this.userSelectedTradeType);
    const hasFailed =
      Boolean(userTrade?.error) ||
      Boolean(userTrade && !userTrade.trade) ||
      (wasSeenThisCycle && !userTrade) ||
      (isCalculationEnd && !userTrade);

    if (hasFailed) {
      this.userSelectedTradeType = null;
      return {
        finished: true
      };
    }

    return {
      finished: false
    };
  }

  private getClearedTradeState(): SelectedTrade {
    const userTradeType = this.userSelectedTradeType;
    if (!userTradeType) {
      return this.defaultState;
    }

    return {
      ...this.defaultState,
      tradeType: userTradeType,
      selectedByUser: true,
      status: TRADE_STATUS.LOADING
    };
  }

  /**
   * Safety net: keep only trades matching current form mode.
   */
  private filterTradesByCurrentSwapType(currentTrades: TradeState[]): TradeState[] {
    if (!this.swapType) {
      return [];
    }

    const hasCrossChain = currentTrades.some(el => el?.trade instanceof CrossChainTrade);
    const hasOnChain = currentTrades.some(el => el?.trade instanceof OnChainTrade);
    if (!hasCrossChain || !hasOnChain) {
      return currentTrades;
    }

    return currentTrades.filter(tradeState => {
      if (!tradeState?.trade) {
        return false;
      }
      return this.swapType === SWAP_PROVIDER_TYPE.INSTANT_TRADE
        ? tradeState.trade instanceof OnChainTrade
        : tradeState.trade instanceof CrossChainTrade;
    });
  }

  /**
   * Default selection is the best non-private provider.
   * When privateOnly is on (query / switcher): pick the best private as soon as it has a quote.
   */
  private getDefaultSelectedTrade(
    currentTrades: TradeState[],
    isCalculationEnd: boolean
  ): TradeState | null {
    const tradesWithQuote = currentTrades.filter(tradeState => tradeState.trade);
    const privateTrades = tradesWithQuote.filter(tradeState => isPrivateTrade(tradeState));
    const nonPrivateTrades = tradesWithQuote.filter(tradeState => !isPrivateTrade(tradeState));
    const privateOnly = this.queryParamsService.queryParams?.privateOnly === 'true';

    if (privateOnly) {
      if (privateTrades.length > 0) {
        return privateTrades[0];
      }

      return isCalculationEnd ? (nonPrivateTrades[0] ?? null) : null;
    }

    if (nonPrivateTrades.length > 0) {
      return nonPrivateTrades[0];
    }

    if (privateTrades[0] && isCalculationEnd) {
      return privateTrades[0];
    }

    return null;
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
    const nativeTokenPrice = this.tokensFacade.tokens.find(token =>
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
      } else {
        // @TODO remove after lifi fix
        if (a.trade.type === ON_CHAIN_TRADE_TYPE.LIFI) return 1;
        if (b.trade.type === ON_CHAIN_TRADE_TYPE.LIFI) return -1;

        return 0;
      }
    });
  }

  public async selectTrade(tradeType: TradeProvider): Promise<void> {
    const trade = this._tradesStore$.value.find(el => el.tradeType === tradeType);
    if (!trade) {
      return;
    }

    this.userSelectedTradeType = trade.tradeType;
    this.currentTrade = { ...trade, selectedByUser: true, status: this.currentTrade.status };
    this.setBackupsForTrade(trade);
    this.swapsFormService.outputControl.patchValue({
      toAmount: trade.trade?.to?.tokenAmount || null
    });
    this.refundService.onTradeSelection(this.currentTrade);
  }

  public setBackupsForTrade(trade: TradeState): void {
    this.backupTrades = [];
    this.updateBackups(trade);
  }

  public updateBackups(tradeToExclude: TradeState): void {
    const source = this.backupTrades.length > 0 ? this.backupTrades : this._tradesStore$.value;
    this.backupTrades = source.filter(t => t.tradeType !== tradeToExclude.tradeType);
  }

  public selectNextBackupTrade(): SelectedTrade {
    if (this.backupTrades.length === 0) {
      return null;
    }

    const trade: SelectedTrade = {
      ...this.backupTrades[0],
      selectedByUser: false,
      status: TRADE_STATUS.READY_TO_SWAP
    };

    if (trade.error) {
      trade.status = TRADE_STATUS.DISABLED;
    }

    if (trade.needApprove) {
      trade.status = TRADE_STATUS.READY_TO_APPROVE;
    }

    return trade;
  }

  public resetBackupTrades(): void {
    this.backupTrades = [];
  }

  private subscribeOnTradeChange(): void {
    this.currentTrade$.subscribe(trade => {
      this.swapsFormService.outputControl.patchValue({
        toAmount: trade?.to?.tokenAmount || null
      });
    });
  }

  private subscribeOnFormChange(): void {
    combineLatest([
      this.swapsFormService.fromToken$,
      this.swapsFormService.toToken$,
      this.swapsFormService.fromAmount$
    ])
      .pipe(
        distinctUntilChanged(
          ([prevFrom, prevTo, prevFromAmount], [nextFrom, nextTo, nextFromAmount]) =>
            compareTokens(prevFrom, nextFrom) &&
            compareTokens(prevTo, nextTo) &&
            prevFromAmount?.visibleValue === nextFromAmount?.visibleValue
        ),
        pairwise()
      )
      .subscribe(() => {
        this.userSelectedTradeType = null;
        this.lastBestPrivateTradeType = null;
      });
  }

  public patchCalculationState(): void {
    this._tradeState$.next({
      ...this._tradeState$.value,
      status: TRADE_STATUS.LOADING
    });
  }

  public setCalculationProgress(
    total: number,
    current: number,
    privateTotal: number = 0,
    privateCurrent: number = 0
  ): void {
    this._calculationProgress$.next({ total, current, privateTotal, privateCurrent });

    if (privateTotal > 0 && privateCurrent === privateTotal) {
      const bestPrivate = this._tradesStore$
        .getValue()
        .find(tradeState => isPrivateTrade(tradeState));
      this.lastBestPrivateTradeType = bestPrivate?.tradeType ?? null;
    }
  }

  private checkWrap(fromToken: BalanceToken | null, toToken: BalanceToken | null): boolean {
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
      distinctUntilChanged(this.shouldEmitToken.bind(this)),
      combineLatestWith(
        this.swapsFormService.toToken$.pipe(distinctUntilChanged(this.shouldEmitToken.bind(this)))
      ),
      switchMap(this.getTimerObservable.bind(this)),
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

  private shouldEmitToken(oldToken: BalanceToken, newToken: BalanceToken): boolean {
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

  private setSpecificError(
    type: SWAP_PROVIDER_TYPE,
    options: NeedTrustlineOptions
  ): RubicSdkError | undefined {
    //@TODO remove after fix receiver connection on mobile
    if (
      type === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING &&
      this.headerStore.isMobile &&
      (options.needTrustlineAfterSwap || options.needTrustlineBeforeSwap)
    ) {
      return new RubicSdkError(
        'Trustline not detected. Please open your wallet and add the trustline to enable this swap.'
      );
    }
  }
}
