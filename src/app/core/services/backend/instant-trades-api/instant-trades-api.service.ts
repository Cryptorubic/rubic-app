import { Injectable } from '@angular/core';
import { HttpService } from '../../http/http.service';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import InstantTrade from '../../../../features/swaps-page/instant-trades/models/InstantTrade';

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
    const { trade, ...req } = body;
    req.amountFrom = trade.from.amount;
    req.amountTo = trade.to.amount;
    req.symbolFrom = trade.from.token.symbol;
    req.symbolTo = trade.to.token.symbol;

    return this.httpService.post(this.botUrl, req).toPromise();
  }
}
