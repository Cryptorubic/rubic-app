import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  FROM_BACKEND_BLOCKCHAINS,
  TO_BACKEND_BLOCKCHAINS,
  ToBackendBlockchains
} from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TableToken, TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import { InstantTradesPostApi } from 'src/app/core/services/backend/instant-trades-api/models/InstantTradesPostApi';
import { InstantTradesResponseApi } from 'src/app/core/services/backend/instant-trades-api/models/InstantTradesResponseApi';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { INSTANT_TRADES_PROVIDER } from 'src/app/shared/models/instant-trade/INSTANT_TRADES_PROVIDER';
import { InstantTradeBotRequest } from 'src/app/core/services/backend/instant-trades-api/models/InstantTradesBotRequest';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { HttpService } from '../../http/http.service';
import { BOT_URL } from '../constants/BOT_URL';
import { UseTestingModeService } from '../../use-testing-mode/use-testing-mode.service';
import { ProviderConnectorService } from '../../blockchain/provider-connector/provider-connector.service';

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
    private useTestingModeService: UseTestingModeService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly iframeService: IframeService
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
   * send request to server for add trade
   * @return instant trade object
   */
  public createTrade(
    hash: string,
    provider: INSTANT_TRADES_PROVIDER,
    trade: InstantTrade,
    blockchain: BLOCKCHAIN_NAME
  ): Observable<InstantTradesResponseApi> {
    let tradeInfo: InstantTradesPostApi;
    if (provider === INSTANT_TRADES_PROVIDER.ONEINCH) {
      tradeInfo = {
        hash,
        network: TO_BACKEND_BLOCKCHAINS[blockchain as ToBackendBlockchains],
        provider,
        from_token: trade.from.token.address,
        to_token: trade.to.token.address,
        from_amount: Web3Public.toWei(trade.from.amount, trade.from.token.decimals),
        to_amount: Web3Public.toWei(trade.to.amount, trade.to.token.decimals)
      };
    } else if (provider === INSTANT_TRADES_PROVIDER.WRAPPED) {
      tradeInfo = {
        hash,
        provider,
        network: TO_BACKEND_BLOCKCHAINS[blockchain as ToBackendBlockchains],
        from_token: trade.from.token.address,
        to_token: trade.to.token.address
      };
    } else {
      tradeInfo = {
        hash,
        provider,
        network: TO_BACKEND_BLOCKCHAINS[blockchain as ToBackendBlockchains]
      };
    }

    if (this.isTestingMode) {
      tradeInfo.network = 'ethereum-test';
    }

    return this.httpService
      .post<InstantTradesResponseApi>(instantTradesApiRoutes.createData, tradeInfo)
      .pipe(delay(1000));
  }

  /**
   * update status of trade
   * @param hash hash of transaction what we want to update
   */
  public patchTrade(hash: string): Observable<InstantTradesResponseApi> {
    const url = instantTradesApiRoutes.editData;
    return this.httpService.patch(url, { hash });
  }

  /**
   * get list of user's instant trades
   * @param walletAddress wallet address of user
   * @return list of trades
   */
  public getUserTrades(walletAddress: string): Observable<TableTrade[]> {
    return this.httpService
      .get(instantTradesApiRoutes.getData, { user: walletAddress.toLowerCase() })
      .pipe(
        map((swaps: InstantTradesResponseApi[]) =>
          swaps.map(swap => this.parseTradeApiToTableTrade(swap))
        )
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
      transactionHash: tradeApi.hash,
      status: tradeApi.status,
      provider,
      fromToken: getTableToken('from'),
      toToken: getTableToken('to'),
      date: new Date(tradeApi.status_updated_at)
    };
  }
}
