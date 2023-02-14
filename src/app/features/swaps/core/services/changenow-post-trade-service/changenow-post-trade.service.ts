import { Injectable } from '@angular/core';
import { ChangenowPostTrade } from '@features/swaps/core/services/changenow-post-trade-service/models/changenow-post-trade';
import { StoreService } from '@core/services/store/store.service';

@Injectable()
export class ChangenowPostTradeService {
  public trade: ChangenowPostTrade | undefined;

  constructor(private readonly storeService: StoreService) {
    this.trade = this.storeService.getItem('changenowPostTrade');
  }
}
