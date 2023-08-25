import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TradeState } from '@features/trade/models/trade-state';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { map } from 'rxjs/operators';

@Injectable()
export class SwapsStateService {
  /**
   * Trade state
   */
  private readonly _tradeState$ = new BehaviorSubject<TradeState>({
    trade: null,
    status: TRADE_STATUS.NOT_INITIATED,
    error: null,
    selectedByUser: false,
    needApprove: false
  });

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
}
