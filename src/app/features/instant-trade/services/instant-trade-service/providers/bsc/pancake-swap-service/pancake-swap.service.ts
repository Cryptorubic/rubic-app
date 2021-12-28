import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { pancakeSwapConstants } from '@features/instant-trade/services/instant-trade-service/providers/bsc/pancake-swap-service/pancake-swap-constants';

@Injectable({
  providedIn: 'root'
})
export class PancakeSwapService extends CommonUniswapV2Service {
  constructor() {
    super(pancakeSwapConstants);
  }
}
