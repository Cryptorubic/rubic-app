import { Injectable } from '@angular/core';
import { HttpService } from '../../http/http.service';
import { TradeInfoApi } from '../../order-book/types';

@Injectable({
  providedIn: 'root'
})
export class OrderBookApiService {
  constructor(private httpService: HttpService) {}

  public createTrade(tradeInfo: TradeInfoApi): Promise<TradeInfoApi> {
    return this.httpService.post('create_swap3/', tradeInfo).toPromise();
  }

  public getTradeData(uniqueLink: string): Promise<TradeInfoApi> {
    return this.httpService
      .get('get_swap3_for_unique_link/', {
        unique_link: uniqueLink
      })
      .toPromise();
  }
}
