import { Injectable } from '@angular/core';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { StoreService } from '@core/services/store/store.service';
import { BehaviorSubject, map } from 'rxjs';
import networks from '../constants/blockchain/networks';
import { RecentTrade } from '../models/my-trades/recent-trades.interface';
import { asyncMap } from '../utils/utils';

const MAX_LATEST_TRADES = 3;

@Injectable({
  providedIn: 'root'
})
export class RecentTradesService {
  get recentTradesFromLs(): RecentTrade[] {
    return this.storeService.fetchData().recentTrades;
  }

  private readonly _recentTrades$ = new BehaviorSubject(this.recentTradesFromLs);

  public readonly recentTrades$ = this._recentTrades$
    .asObservable()
    .pipe(map(trades => (trades?.length > 0 ? asyncMap(trades, this.parseRecentTradeForUi) : [])));

  constructor(
    private readonly storeService: StoreService,
    private readonly web3Public: PublicBlockchainAdapterService
  ) {}

  public saveTrade(tradeData: RecentTrade): void {
    let currentRecentTrades = [...(this.recentTradesFromLs || [])];

    if (this?.recentTradesFromLs?.length === MAX_LATEST_TRADES) {
      currentRecentTrades.pop();
    }
    currentRecentTrades.unshift(tradeData);

    this.storeService.setItem('recentTrades', currentRecentTrades);
    this._recentTrades$.next(currentRecentTrades);
  }

  private async parseRecentTradeForUi(tx: RecentTrade): Promise<unknown> {
    const { fromBlockchain, toBlockchain, toToken, fromToken, srcTxHash } = tx;
    const sourceTransaction = this.web3Public[fromBlockchain].getTransactionByHash(srcTxHash);
    console.log(sourceTransaction);
    return {
      fromBlockchain: networks.find(network => network.name === fromBlockchain),
      toBlockchain: networks.find(network => network.name === toBlockchain),
      fromToken,
      toToken
    };
  }
}
