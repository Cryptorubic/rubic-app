import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InstantTradesTradeData } from 'src/app/features/swaps-page/models/trade-data';
import * as moment from 'moment';
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
    return this.httpService.post('instant_trades/', tradeInfo);
  }

  public patchTrade(hash: string): Observable<InstantTradesResponseApi> {
    return this.httpService.patch('instant_trades/', {}, hash);
  }

  public fetchSwaps(): Observable<Promise<InstantTradesTradeData>[]> {
    return this.httpService.get('instant_trades/').pipe(
      map((swaps: InstantTradesResponseApi[]) => {
        return swaps.map(async swap => {
          return this.tradeApiToTradeData(swap);
        });
      })
    );
  }

  public async tradeApiToTradeData(
    tradeApi: InstantTradesResponseApi
  ): Promise<InstantTradesTradeData> {
    const tradeData = {
      hash: tradeApi.hash,
      provider: tradeApi.contract.blockchain_network.title,
      fromToken: {
        name: tradeApi.from_token.name,
        symbol: tradeApi.from_token.symbol,
        blockchain: tradeApi.from_token.blockchain,
        address: tradeApi.from_token.address,
        decimals: tradeApi.from_token.decimals,
        image: tradeApi.from_token.image,
        rank: tradeApi.from_token.rank,
        price: tradeApi.from_token.price
      },
      toToken: {
        name: tradeApi.to_token.name,
        symbol: tradeApi.to_token.symbol,
        blockchain: tradeApi.to_token.blockchain,
        address: tradeApi.to_token.address,
        decimals: tradeApi.to_token.decimals,
        image: tradeApi.to_token.image,
        rank: tradeApi.to_token.rank,
        price: tradeApi.to_token.price
      },
      blockchain: tradeApi.contract.blockchain_network.title,
      fromAmount: tradeApi.from_amount,
      toAmount: tradeApi.to_amount,
      status: tradeApi.status,
      createDate: moment(new Date(tradeApi.status_udated_at))
    } as InstantTradesTradeData;

    return tradeData;
  }
}
