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
        base: {
          name: tradeApi.from_token.name,
          symbol: tradeApi.from_token.symbol,
          blockchain: FROM_BACKEND_BLOCKCHAINS[tradeApi.from_token.blockchain_network],
          address: tradeApi.from_token.address,
          decimals: tradeApi.from_token.decimals,
          image: tradeApi.from_token.image,
          rank: tradeApi.from_token.rank,
          price: tradeApi.from_token.usd_price
        },
        quote: {
          name: tradeApi.to_token.name,
          symbol: tradeApi.to_token.symbol,
          blockchain: FROM_BACKEND_BLOCKCHAINS[tradeApi.to_token.blockchain_network],
          address: tradeApi.to_token.address,
          decimals: tradeApi.to_token.decimals,
          image: tradeApi.to_token.image,
          rank: tradeApi.to_token.rank,
          price: tradeApi.to_token.usd_price
        }
      },
      blockchain: FROM_BACKEND_BLOCKCHAINS[tradeApi.contract.blockchain_network.title],
      fromAmount: new BigNumber(tradeApi.from_amount)
        .dividedBy(10 ** tradeApi.from_token.decimals)
        .precision(6),
      toAmount: new BigNumber(tradeApi.to_amount)
        .dividedBy(10 ** tradeApi.to_token.decimals)
        .precision(6),
      status: tradeApi.status,
      date: moment(tradeApi.status_udated_at)
    } as InstantTradesTradeData;

    return tradeData;
  }
}
