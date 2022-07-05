import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableData, TableToken, TableTrade } from '@shared/models/my-trades/table-trade';
import { map } from 'rxjs/operators';
import { FROM_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/backend-blockchains';
import { HttpService } from 'src/app/core/services/http/http.service';
import {
  CrossChainTokenApi,
  CrossChainTradeApi,
  CrossChainTradesResponseApi
} from '@core/services/backend/cross-chain-routing-api/models/cross-chain-trades-response-api';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { ENVIRONMENT } from 'src/environments/environment';

export const BASE_URL = `${ENVIRONMENT.crossChain.apiBaseUrl}/`;

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingApiService {
  constructor(private readonly httpService: HttpService) {}

  static getTableToken(token: CrossChainTokenApi, amount: string): TableToken {
    return {
      blockchain:
        FROM_BACKEND_BLOCKCHAINS[token.network as keyof typeof FROM_BACKEND_BLOCKCHAINS] ||
        BLOCKCHAIN_NAME.ETHEREUM,
      symbol: token.symbol,
      amount,
      image: token.image,
      address: token.address
    };
  }

  static parseTradeApiToTableTrade(tradeApi: CrossChainTradeApi): TableTrade {
    const transactionHashScanUrl = tradeApi.toTransactionScanURL || tradeApi.fromTransactionScanURL;

    // change date format for safari
    const date = tradeApi.statusUpdatedAt.replace(/-/g, '/').slice(0, 19) + ' GMT+0000';
    return {
      fromTransactionHash: tradeApi.fromTransactionHash,
      toTransactionHash: tradeApi.toTransactionHash,
      transactionHashScanUrl,
      status: tradeApi.status,
      provider: 'CROSS_CHAIN_ROUTING_PROVIDER',
      fromToken: CrossChainRoutingApiService.getTableToken(tradeApi.fromToken, tradeApi.fromAmount),
      toToken: CrossChainRoutingApiService.getTableToken(tradeApi.toToken, tradeApi.toAmount),
      date: new Date(date)
    };
  }

  /**
   * Gets list of user's cross chain trades.
   * @param walletAddress Wallet address of user.
   * @param page Page in pagination.
   * @param pageSize Page size in pagination.
   */
  public getUserTrades(
    walletAddress: string,
    page: number,
    pageSize: number
  ): Observable<TableData> {
    return this.httpService
      .get('trades/', { user: walletAddress, page: page + 1, page_size: pageSize }, BASE_URL)
      .pipe(
        map((trades: CrossChainTradesResponseApi) => {
          return {
            totalCount: trades.count,
            trades: trades.results.map(trade =>
              CrossChainRoutingApiService.parseTradeApiToTableTrade(trade)
            )
          };
        })
      );
  }
}
