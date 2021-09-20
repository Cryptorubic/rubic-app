import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableToken, TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import { catchError, map, mapTo } from 'rxjs/operators';
import {
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS,
  ToBackendBlockchains
} from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { HttpService } from 'src/app/core/services/http/http.service';
import {
  CrossChainTokenApi,
  CrossChainTradesResponseApi
} from 'src/app/core/services/backend/cross-chain-routing-api/models/CrossChainTradesResponseApi';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { environment } from 'src/environments/environment';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';

export const BASE_URL = `${environment.crossChainApiBaseUrl}/`;

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingApiService {
  constructor(private readonly httpService: HttpService, private iframeService: IframeService) {}

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

  static parseTradeApiToTableTrade(tradeApi: CrossChainTradesResponseApi): TableTrade {
    const transactionHash = tradeApi.toTransactionHash || tradeApi.fromTransactionHash;
    const transactionHashScanUrl = tradeApi.toTransactionScanURL || tradeApi.fromTransactionScanURL;

    return {
      transactionHash,
      transactionHashScanUrl,
      status: tradeApi.status,
      provider: 'CROSS_CHAIN_ROUTING_PROVIDER',
      fromToken: CrossChainRoutingApiService.getTableToken(tradeApi.fromToken, tradeApi.fromAmount),
      toToken: CrossChainRoutingApiService.getTableToken(tradeApi.toToken, tradeApi.toAmount),
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

  /**
   * @description post trade with domain query {@link HTTPInterceptor} to save extended trade info in backend
   * @param transactionHash hash of crosschain swap transaction
   * @param blockchain swap origin blockchain
   */
  public postTradeInWidget(transactionHash: string, blockchain: BLOCKCHAIN_NAME): Promise<void> {
    if (!this.iframeService.isIframe) {
      return Promise.resolve();
    }
    const network = TO_BACKEND_BLOCKCHAINS[blockchain as ToBackendBlockchains];
    return this.httpService
      .patch('trades/', { transactionHash, network }, {}, BASE_URL)
      .pipe(
        catchError(err => {
          console.error(err);
          return undefined;
        }),
        mapTo(undefined)
      )
      .toPromise();
  }
}
