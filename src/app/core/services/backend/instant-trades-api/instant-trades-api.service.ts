import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InstantTradesTradeData } from 'src/app/features/swaps-page/models/trade-data';
import * as moment from 'moment';
import { FROM_BACKEND_BLOCKCHAINS } from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import BigNumber from 'bignumber.js';
import { HttpService } from '../../http/http.service';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import InstantTrade from '../../../../features/swaps-page/instant-trades/models/InstantTrade';
import { InstantTradesRequestApi, InstantTradesResponseApi } from './types/trade-api';
import { Web3PublicService } from '../../blockchain/web3-public-service/web3-public.service';

@Injectable({
  providedIn: 'root'
})
export class InstantTradesApiService {
  private readonly botUrl = 'bot/instanttrades';

  constructor(private httpService: HttpService) {}

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
      symbolTo: trade.to.token.symbol
    };

    return this.httpService.post(this.botUrl, req).toPromise();
  }

  public createTrade(tradeInfo: InstantTradesRequestApi): Observable<InstantTradesResponseApi> {
    console.log(tradeInfo);
    return this.httpService.post('instant_trades/', tradeInfo);
  }

  public patchTrade(hash: string): Observable<InstantTradesResponseApi> {
    return this.httpService.patch('instant_trades/', {}, hash);
  }

  public fetchSwaps(): Observable<InstantTradesTradeData[]> {
    return this.httpService.get('instant_trades/').pipe(
      map((swaps: InstantTradesResponseApi[]) => {
        return swaps.map(swap => {
          return this.tradeApiToTradeData(swap);
        });
      })
    );
  }

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
      blockchain: FROM_BACKEND_BLOCKCHAINS[tradeApi.contract.blockchain_network.title],
      status: tradeApi.status,
      date: moment(tradeApi.status_udated_at)
    } as InstantTradesTradeData;

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
