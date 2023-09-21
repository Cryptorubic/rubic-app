import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith } from 'rxjs';
import { TradeState } from '@features/trade/models/trade-state';
import { debounceTime, filter, map, startWith } from 'rxjs/operators';
import { compareCrossChainTrades, OnChainTrade, WrappedCrossChainTradeOrNull } from 'rubic-sdk';
import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { TradeProvider } from '@features/swaps/shared/models/trade-provider/trade-provider';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { WrappedSdkTrade } from '@features/trade/models/wrapped-sdk-trade';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';

@Injectable()
export class SwapsStateService {
  private readonly defaultState: SelectedTrade = {
    trade: null,
    error: null,
    needApprove: false,
    tradeType: undefined,
    tags: {
      isBest: false,
      cheap: false
    },
    routes: [],
    selectedByUser: false,
    status: TRADE_STATUS.NOT_INITIATED
  };

  private swapType: SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;

  /**
   * Trade state
   */
  private readonly _tradeState$ = new BehaviorSubject<SelectedTrade>(this.defaultState);

  public readonly tradeState$ = this._tradeState$.asObservable().pipe(debounceTime(10));

  public get tradeState(): TradeState {
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

  public set currentTrade(state: SelectedTrade) {
    this._tradeState$.next(state);
  }

  public get currentTrade(): SelectedTrade {
    return this._tradeState$.getValue();
  }

  // /**
  //  * Error
  //  */
  // public readonly error$ = this.tradeState$.pipe(map(el => el?.error));
  //
  // public set error(error: TradeState['error']) {
  //   this._tradeState$.next({
  //     ...this.tradeState,
  //     error,
  //     trade: null,
  //     selectedByUser: false,
  //     needApprove: false
  //   });
  // }

  /**
   * Trades Store
   */
  private readonly _tradesStore$ = new BehaviorSubject<TradeState[]>([]);

  public readonly tradesStore$ = this._tradesStore$.asObservable();

  /**
   * Receiver address
   */
  private receiverAddress: string | null;

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly walletConnector: WalletConnectorService
  ) {
    this.subscribeOnTradeChange();
  }

  public updateTrade(
    wrappedTrade: WrappedSdkTrade,
    type: SWAP_PROVIDER_TYPE,
    needApprove: boolean
  ): void {
    if (!wrappedTrade?.trade) {
      return;
    }
    const trade = wrappedTrade.trade;
    const defaultState: TradeState = wrappedTrade?.error
      ? {
          error: wrappedTrade.error,
          trade: null,
          needApprove,
          tradeType: wrappedTrade.tradeType,
          tags: { isBest: false, cheap: false },
          routes: []
        }
      : {
          error: null,
          trade,
          needApprove,
          tradeType: wrappedTrade.tradeType,
          tags: { isBest: false, cheap: false },
          routes: trade.getTradeInfo().routePath || []
        };

    let currentTrades = this._tradesStore$.getValue();

    // Already contains trades
    if (currentTrades.length) {
      // Same list
      if (type === this.swapType) {
        const providerIndex = currentTrades.findIndex(
          provider => provider.tradeType === trade.type
        );
        // New or old
        if (providerIndex !== -1) {
          currentTrades[providerIndex] = {
            ...currentTrades[providerIndex],
            trade: defaultState.trade!,
            needApprove: defaultState.needApprove,
            tags: { isBest: false, cheap: false },
            error: null
          };
        } else {
          currentTrades.push(defaultState);
        }
      } else {
        // Make a new list with one element
        currentTrades = [defaultState];
      }
    } else {
      currentTrades.push(defaultState);
    }
    this.swapType = type;
    this._tradesStore$.next(currentTrades);
  }

  public clearProviders(): void {
    this._tradeState$.next(this.defaultState);
    this._tradesStore$.next([]);
  }

  public pickProvider(): void {
    const currentTrades = this._tradesStore$.getValue();

    if (currentTrades.length) {
      const isCrossChain = currentTrades.some(el => el?.trade instanceof CrossChainTrade);
      const isOnChain = currentTrades.some(el => el?.trade instanceof OnChainTrade);
      if (isCrossChain) {
        (currentTrades as WrappedCrossChainTradeOrNull[]).sort(compareCrossChainTrades);
      } else if (isOnChain) {
        currentTrades.sort();
      } else {
        return;
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

      this.currentTrade = trade;
    } else {
      this.currentTrade = {
        ...this.defaultState,
        status: TRADE_STATUS.LOADING
      };
    }
  }

  public setTags(): void {
    // const currentTrades = this._tradesStore$.getValue();
    // const clearedTags = currentTrades.map(trade => trade);
  }

  public async selectTrade(tradeType: TradeProvider): Promise<void> {
    const trade = this._tradesStore$.value.find(el => el.tradeType === tradeType);
    this.currentTrade = { ...trade, selectedByUser: false, status: this.currentTrade.status };
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
}
