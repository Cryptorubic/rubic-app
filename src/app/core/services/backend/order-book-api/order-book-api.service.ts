import { Injectable } from '@angular/core';
import { HttpService } from '../../http/http.service';
import { OrderBookTradeApi } from '../../order-book/types/trade-api';

@Injectable({
  providedIn: 'root'
})
export class OrderBookApiService {
  constructor(private httpService: HttpService) {}

  public createTrade(tradeInfo: OrderBookTradeApi): Promise<OrderBookTradeApi> {
    return this.httpService.post('create_swap3/', tradeInfo).toPromise();
  }

  public getTradeData(uniqueLink: string): Promise<OrderBookTradeApi> {
    return this.httpService
      .get('get_swap3_for_unique_link/', {
        unique_link: uniqueLink
      })
      .toPromise();
  }
}
