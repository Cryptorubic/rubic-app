import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { Injectable } from '@angular/core';
import { QUICK_SWAP_CONSTANTS } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/quick-swap-service/quick-swap-constants';

@Injectable({
  providedIn: 'root'
})
export class QuickSwapService extends CommonUniswapV2Service {
  constructor() {
    super(QUICK_SWAP_CONSTANTS);
  }
}
