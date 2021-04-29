import { Injectable } from '@angular/core';
import { HttpService } from '../../http/http.service';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import InstantTrade from '../../../../features/swaps-page/instant-trades/models/InstantTrade';
import { BOT_URL } from '../constants/BOT_URL';

@Injectable({
  providedIn: 'root'
})
export class InstantTradesApiService {
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
      symbolTo: trade.to.token.symbol,
      tokenFromUsdPrice: trade.from.token.price
    };

    return this.httpService.post(BOT_URL.INSTANT_TRADES, req).toPromise();
  }
}
