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
}
