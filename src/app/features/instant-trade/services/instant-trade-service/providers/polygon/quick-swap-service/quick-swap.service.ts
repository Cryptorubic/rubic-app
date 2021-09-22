import { AbstractUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/abstract-service/abstract-uniswap-v2.service';
import { Injectable } from '@angular/core';
import { quickSwapConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/quick-swap-service/quick-swap-constants';

@Injectable({
  providedIn: 'root'
})
export class QuickSwapService extends AbstractUniswapV2Service {
  constructor() {
    super(quickSwapConstants);
  }
}
