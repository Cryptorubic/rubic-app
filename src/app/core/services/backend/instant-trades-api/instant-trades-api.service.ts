import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InstantTradesTradeData } from 'src/app/features/swaps-page/models/trade-data';
import { FROM_BACKEND_BLOCKCHAINS } from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { HttpService } from '../../http/http.service';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import InstantTrade from '../../../../features/swaps-page/instant-trades/models/InstantTrade';
import { BOT_URL } from '../constants/BOT_URL';
import { InstantTradesRequestApi, InstantTradesResponseApi } from './types/trade-api';
import { Web3PublicService } from '../../blockchain/web3-public-service/web3-public.service';
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
  public createTrade(tradeInfo: InstantTradesRequestApi): Observable<InstantTradesResponseApi> {
    if (this.isTestingMode) tradeInfo.network = 'ethereum-test';
    return this.httpService.post(instantTradesApiRoutes.createData, tradeInfo);
  }

  /**
   * @description update status of trade
   * @param hash hash of transaction what we want to update
   * @param status status of trade what we want to set
   */
  public patchTrade(hash: string, status: string): Observable<InstantTradesResponseApi> {
    const url = instantTradesApiRoutes.editData + hash;
    return this.httpService.patch(url, { status });
  }

  /**
   * @description get list of trades from server
   * @return list of trades
   */
  public fetchSwaps(): Observable<InstantTradesTradeData[]> {
    return this.httpService
      .get(instantTradesApiRoutes.getData)
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
    const tradeData = ({
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
        FROM_BACKEND_BLOCKCHAINS[tradeApi.contract.blockchain_network.title] || 'ETH_TESTNET',
      status: tradeApi.status,
      date: new Date(tradeApi.status_updated_at)
    } as unknown) as InstantTradesTradeData;

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
