import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import {
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS,
  ToBackendBlockchain
} from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TableToken, TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import { InstantTradesPostApi } from 'src/app/core/services/backend/instant-trades-api/models/InstantTradesPostApi';
import { InstantTradesResponseApi } from 'src/app/core/services/backend/instant-trades-api/models/InstantTradesResponseApi';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { INSTANT_TRADES_PROVIDER } from 'src/app/shared/models/instant-trade/INSTANT_TRADES_PROVIDER';
import { InstantTradeBotRequest } from 'src/app/core/services/backend/instant-trades-api/models/InstantTradesBotRequest';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { HttpService } from '../../http/http.service';
import { BOT_URL } from '../constants/BOT_URL';
import { UseTestingModeService } from '../../use-testing-mode/use-testing-mode.service';

const instantTradesApiRoutes = {
  createData: 'instant_trades/',
  editData: 'instant_trades/',
  getData: 'instant_trades/'
};

@Injectable({
  providedIn: 'root'
})
export class InstantTradesApiService {
  private isTestingMode: boolean;

  constructor(
    private httpService: HttpService,
    private useTestingModeService: UseTestingModeService
  ) {
    this.useTestingModeService.isTestingMode.subscribe(res => (this.isTestingMode = res));
  }

  public notifyInstantTradesBot(body: {
    provider: INSTANT_TRADES_PROVIDER;
    blockchain: BLOCKCHAIN_NAME;
    walletAddress: string;
    trade: InstantTrade;
    txHash: string;
  }): Promise<void> {
    const { trade, ...props } = body;
    const req: InstantTradeBotRequest = {
      ...props,
      fromAmount: trade.from.amount.toNumber(),
      toAmount: trade.to.amount.toNumber(),
      fromSymbol: trade.from.token.symbol,
      toSymbol: trade.to.token.symbol,
      price: trade.from.token.price
    };

    return this.httpService.post<void>(BOT_URL.INSTANT_TRADES, req).toPromise();
  }

  /**
   * Sends request to add trade.
   * @return InstantTradesResponseApi Instant trade object.
   */
  public createTrade(
    hash: string,
    provider: INSTANT_TRADES_PROVIDER,
    trade: InstantTrade,
    blockchain: BLOCKCHAIN_NAME
  ): Observable<InstantTradesResponseApi> {
    const tradeInfo: InstantTradesPostApi = {
      hash,
      network: TO_BACKEND_BLOCKCHAINS[blockchain as ToBackendBlockchain],
      provider,
      from_token: trade.from.token.address,
      to_token: trade.to.token.address,
      from_amount: Web3Public.toWei(trade.from.amount, trade.from.token.decimals),
      to_amount: Web3Public.toWei(trade.to.amount, trade.to.token.decimals)
    };

    if (this.isTestingMode) {
      tradeInfo.network = 'ethereum-test';
    }

    return this.httpService
      .post<InstantTradesResponseApi>(instantTradesApiRoutes.createData, tradeInfo)
      .pipe(delay(1000));
  }

  /**
   * Sends request to update trade's status.
   * @param hash Hash of transaction what we want to update.
   * @param success If true status is `completed`, otherwise `cancelled`.
   * @return InstantTradesResponseApi Instant trade object.
   */
  public patchTrade(hash: string, success: boolean): Observable<InstantTradesResponseApi> {
    const url = instantTradesApiRoutes.editData;
    return this.httpService.patch(url, { hash, success });
  }

  /**
   * Sends request to get list of user's instant trades.
   * @param walletAddress Wallet address of user.
   * @param errorCallback Callback on error.
   * @return list List of trades.
   */
  public getUserTrades(
    walletAddress: string,
    errorCallback?: (error: unknown) => void
  ): Observable<TableTrade[]> {
    return this.httpService
      .get(instantTradesApiRoutes.getData, { user: walletAddress.toLowerCase() })
      .pipe(
        map((swaps: InstantTradesResponseApi[]) =>
          swaps.map(swap => this.parseTradeApiToTableTrade(swap))
        ),
        catchError((err: unknown) => {
          errorCallback?.(err);
          return of([]);
        })
      );
  }

  private parseTradeApiToTableTrade(tradeApi: InstantTradesResponseApi): TableTrade {
    function getTableToken(type: 'from' | 'to'): TableToken {
      const token = tradeApi[`${type}_token` as const];
      const amount = tradeApi[`${type}_amount` as const];
      return {
        blockchain:
          FROM_BACKEND_BLOCKCHAINS[
            token.blockchain_network as keyof typeof FROM_BACKEND_BLOCKCHAINS
          ],
        symbol: token.symbol,
        amount: Web3Public.fromWei(amount, token.decimals).toFixed(),
        image: token.image
      };
    }

    let provider = tradeApi.contract.name;
    if (provider === 'pancakeswap_old') {
      provider = INSTANT_TRADES_PROVIDER.PANCAKESWAP;
    }

    return {
      fromTransactionHash: tradeApi.hash,
      status: tradeApi.status,
      provider,
      fromToken: getTableToken('from'),
      toToken: getTableToken('to'),
      date: new Date(tradeApi.status_updated_at)
    };
  }
}
