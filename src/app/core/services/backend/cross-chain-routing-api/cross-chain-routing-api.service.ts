import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableToken, TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import { map } from 'rxjs/operators';
import { FROM_BACKEND_BLOCKCHAINS } from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { HttpService } from 'src/app/core/services/http/http.service';
import { CrossChainTradesResponseApi } from 'src/app/core/services/backend/cross-chain-routing-api/models/CrossChainTradesResponseApi';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingApiService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * @description get list of user's cross chain trades
   * @param walletAddress wallet address of user
   * @return list of trades
   */
  public getUserTrades(walletAddress: string): Observable<TableTrade[]> {
    return this.httpService
      .get(
        'trades/',
        { user: walletAddress.toLowerCase() },
        'https://dev-crosschain.rubic.exchange/api/'
      )
      .pipe(
        map((trades: CrossChainTradesResponseApi[]) =>
          trades.map(trade => this.parseTradeApiToTableTrade(trade))
        )
      );
  }

  private parseTradeApiToTableTrade(tradeApi: CrossChainTradesResponseApi): TableTrade {
    function getTableToken(type: 'from' | 'to'): TableToken {
      const token = type === 'from' ? tradeApi.fromToken : tradeApi.toToken;
      const amount = type === 'from' ? tradeApi.fromAmount : tradeApi.toAmount;
      return {
        blockchain: FROM_BACKEND_BLOCKCHAINS[token.network] || BLOCKCHAIN_NAME.ETHEREUM,
        symbol: token.symbol,
        amount,
        image: '',
        address: token.address
      };
    }

    const transactionHash = tradeApi.toTransactionHash || tradeApi.fromTransactionHash;

    return {
      transactionHash,
      status: tradeApi.status,
      provider: 'CROSS_CHAIN_ROUTING_PROVIDER',
      fromToken: getTableToken('from'),
      toToken: getTableToken('to'),
      date: new Date(tradeApi.statusUpdatedAt)
    };
  }
}
