import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableToken, TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import { map } from 'rxjs/operators';
import { FROM_BACKEND_BLOCKCHAINS } from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { HttpService } from 'src/app/core/services/http/http.service';
import {
  CrossChainTokenApi,
  CrossChainTradesResponseApi
} from 'src/app/core/services/backend/cross-chain-routing-api/models/CrossChainTradesResponseApi';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { environment } from 'src/environments/environment';

export const BASE_URL = `${environment.crossChainApiBaseUrl}/`;

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingApiService {
  constructor(private readonly httpService: HttpService) {}

  static getTableToken(token: CrossChainTokenApi, amount: string): TableToken {
    return {
      blockchain: FROM_BACKEND_BLOCKCHAINS[token.network] || BLOCKCHAIN_NAME.ETHEREUM,
      symbol: token.symbol,
      amount,
      image: token.image,
      address: token.address
    };
  }

  static parseTradeApiToTableTrade(tradeApi: CrossChainTradesResponseApi): TableTrade {
    const transactionHash = tradeApi.toTransactionHash || tradeApi.fromTransactionHash;
    const transactionHashScanUrl = tradeApi.toTransactionScanURL || tradeApi.fromTransactionScanURL;

    return {
      transactionHash,
      transactionHashScanUrl,
      status: tradeApi.status,
      provider: 'CROSS_CHAIN_ROUTING_PROVIDER',
      fromToken: CrossChainRoutingApiService.getTableToken(tradeApi.fromToken, tradeApi.fromAmount),
      toToken: CrossChainRoutingApiService.getTableToken(tradeApi.toToken, tradeApi.fromAmount),
      date: new Date(tradeApi.statusUpdatedAt)
    };
  }

  /**
   * @description get list of user's cross chain trades
   * @param walletAddress wallet address of user
   * @return list of trades
   */
  public getUserTrades(walletAddress: string): Observable<TableTrade[]> {
    return this.httpService
      .get('trades/', { user: walletAddress.toLowerCase() }, BASE_URL)
      .pipe(
        map((trades: CrossChainTradesResponseApi[]) =>
          trades.map(trade => CrossChainRoutingApiService.parseTradeApiToTableTrade(trade))
        )
      );
  }
}
