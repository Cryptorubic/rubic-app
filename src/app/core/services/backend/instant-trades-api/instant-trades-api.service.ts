import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { InstantTradesTradeData } from 'src/app/features/swaps-page-old/models/trade-data';
import { FROM_BACKEND_BLOCKCHAINS } from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { HttpService } from '../../http/http.service';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import InstantTrade from '../../../../features/swaps-page-old/instant-trades/models/InstantTrade';
import { BOT_URL } from '../constants/BOT_URL';
import { InstantTradesRequestApi, InstantTradesResponseApi } from './types/trade-api';
import { Web3PublicService } from '../../blockchain/web3-public-service/web3-public.service';
import { UseTestingModeService } from '../../use-testing-mode/use-testing-mode.service';
import { ProviderConnectorService } from '../../blockchain/provider-connector/provider-connector.service';
import { QueryParamsService } from '../../query-params/query-params.service';

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

  private isIframe: boolean;

  constructor(
    private httpService: HttpService,
    private useTestingModeService: UseTestingModeService,
    private readonly providerConnectorService: ProviderConnectorService,
    private queryParamsService: QueryParamsService
  ) {
    this.useTestingModeService.isTestingMode.subscribe(res => (this.isTestingMode = res));
    this.queryParamsService.$isIframe.subscribe(res => (this.isIframe = res));
  }

  public notifyInstantTradesBot(body: {
    provider: string;
    blockchain: BLOCKCHAIN_NAME;
    walletAddress: string;
    trade: InstantTrade;
    txHash: string;
  }): Promise<void> {
    const { trade, ...props } = body;
    const req = {
      ...props,
      amountFrom: trade.from.amount,
      amountTo: trade.to.amount,
      symbolFrom: trade.from.token.symbol,
      symbolTo: trade.to.token.symbol,
      tokenFromUsdPrice: trade.from.token.price
    };

    return this.httpService.post(BOT_URL.INSTANT_TRADES, req).toPromise();
  }

  /**
   * @description send request to server for add trade
   * @param tradeInfo data body for request
   * @return instant trade object
   */
  public createTrade(
    tradeInfo: InstantTradesRequestApi
  ): Observable<InstantTradesResponseApi | null> {
    if (this.isIframe) {
      return of(null);
    }

    if (this.isTestingMode) {
      tradeInfo.network = 'ethereum-test';
    }
    return this.httpService.post(instantTradesApiRoutes.createData, tradeInfo).pipe(delay(1000));
  }

  /**
   * @description update status of trade
   * @param hash hash of transaction what we want to update
   * @param status status of trade what we want to set
   */
  public patchTrade(hash: string, status: string): Observable<InstantTradesResponseApi | null> {
    if (this.isIframe) {
      return of(null);
    }

    const url = instantTradesApiRoutes.editData + hash;
    return this.httpService.patch(url, { status });
  }

  /**
   * @description get list of trades from server
   * @return list of trades
   */
  // TODO: use AuthService to get user wallet address instead of Web3Private after Coinbase realease
  public fetchSwaps(): Observable<InstantTradesTradeData[]> {
    return this.httpService
      .get(instantTradesApiRoutes.getData, { user: this.providerConnectorService.address })
      .pipe(
        map((swaps: InstantTradesResponseApi[]) =>
          swaps.map(swap => this.tradeApiToTradeData(swap))
        )
      );
  }

  /**
   * @description transform data structure to our format
   * @param tradeApi data from server
   */
  public tradeApiToTradeData(tradeApi: InstantTradesResponseApi): InstantTradesTradeData {
    const tradeData = {
      hash: tradeApi.hash,
      provider: tradeApi.contract.name,
      token: {
        from: {
          ...tradeApi.from_token,
          blockchain: FROM_BACKEND_BLOCKCHAINS[tradeApi.from_token.blockchain_network],
          price: tradeApi.from_token.usd_price
        },
        to: {
          ...tradeApi.to_token,
          blockchain: FROM_BACKEND_BLOCKCHAINS[tradeApi.to_token.blockchain_network],
          price: tradeApi.to_token.usd_price
        }
      },
      blockchain:
        FROM_BACKEND_BLOCKCHAINS[tradeApi.contract.blockchain_network.title] ||
        BLOCKCHAIN_NAME.ETHEREUM,
      status: tradeApi.status,
      date: new Date(tradeApi.status_updated_at)
    } as unknown as InstantTradesTradeData;

    tradeData.fromAmount = Web3PublicService.tokenWeiToAmount(
      tradeData.token.from,
      tradeApi.from_amount
    );
    tradeData.toAmount = Web3PublicService.tokenWeiToAmount(
      tradeData.token.from,
      tradeApi.to_amount
    );

    return tradeData;
  }
}
