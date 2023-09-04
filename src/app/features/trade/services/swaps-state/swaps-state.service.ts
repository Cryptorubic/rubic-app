import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TradeState } from '@features/trade/models/trade-state';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { map } from 'rxjs/operators';
import {
  compareCrossChainTrades,
  CrossChainReactivelyCalculatedTradeData,
  OnChainReactivelyCalculatedTradeData,
  OnChainTrade
} from 'rubic-sdk';
import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';

@Injectable()
export class SwapsStateService {
  private readonly defaultState: TradeState = {
    trade: null,
    status: TRADE_STATUS.NOT_INITIATED,
    error: null,
    selectedByUser: false,
    needApprove: false
  };

  /**
   * Trade state
   */
  private readonly _tradeState$ = new BehaviorSubject<TradeState>(this.defaultState);

  public readonly tradeState$ = this._tradeState$.asObservable();

  public get tradeState(): TradeState {
    return this._tradeState$.value;
  }

  /**
   * Current trade
   */
  public readonly currentTrade$ = this.tradeState$.pipe(map(el => el?.trade));

  public set currentTrade(state: { trade: TradeState['trade']; needApprove: boolean }) {
    this._tradeState$.next({
      ...this.tradeState,
      trade: state.trade,
      error: null,
      needApprove: state.needApprove
    });
  }

  /**
   * Error
   */
  public readonly error$ = this.tradeState$.pipe(map(el => el?.error));

  public set error(error: TradeState['error']) {
    this._tradeState$.next({
      ...this.tradeState,
      error,
      trade: null,
      selectedByUser: false,
      needApprove: false
    });
  }

  /**
   * Trades Store
   */
  private readonly _tradesStore$ = new BehaviorSubject<TradeState['trade'][]>([]);

  public readonly tradeStore$ = this._tradesStore$.asObservable();

  /**
   * Receiver address
   */
  private receiverAddress: string | null;

  /**
   * Need approve
   */
  public needApprove: boolean;

  constructor() {}

  public updateTrade(
    container: OnChainReactivelyCalculatedTradeData | CrossChainReactivelyCalculatedTradeData
  ): void {
    const wrappedTrade = container?.wrappedTrade;
    if (!wrappedTrade) {
      return;
    }
    let currentTrades = this._tradesStore$.getValue();

    // Already contains trades
    if (currentTrades.length) {
      const isCrossChainList = currentTrades?.[0].trade instanceof CrossChainTrade;
      const isCrossChainTrade = wrappedTrade instanceof CrossChainTrade;

      // Add to or modify same list
      if ((isCrossChainList && isCrossChainTrade) || (!isCrossChainList && !isCrossChainTrade)) {
        const providerIndex = currentTrades.findIndex(
          provider => provider.tradeType === wrappedTrade.tradeType
        );
        if (providerIndex !== -1) {
          currentTrades[providerIndex] = wrappedTrade;
        } else {
          currentTrades.push(wrappedTrade);
        }
      } else {
        // Make a new list with one element
        currentTrades = [wrappedTrade];
      }
    } else {
      currentTrades.push(wrappedTrade);
    }
    this._tradesStore$.next(currentTrades);
  }

  public pickProvider(): void {
    const currentTrades = this._tradesStore$.getValue();

    if (currentTrades.length) {
      const isCrossChain = currentTrades.some(el => el?.trade instanceof CrossChainTrade);
      const isOnChain = currentTrades.some(el => el?.trade instanceof OnChainTrade);
      if (isCrossChain) {
        currentTrades.sort(compareCrossChainTrades);
      } else if (isOnChain) {
        currentTrades.sort();
      } else {
        return;
      }

      const bestTrade = currentTrades[0];

      this.currentTrade = { trade: bestTrade, needApprove: false };
    } else {
      this.currentTrade = this.defaultState;
    }
  }
}
