import { Injectable } from '@angular/core';
import { AbstractUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/abstract-service/abstract-uniswap-v2.service';
import { pancakeSwapConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/pancake-swap-service/pankace-swap-constants';

@Injectable({
  providedIn: 'root'
})
export class PancakeSwapService extends AbstractUniswapV2Service {
  constructor() {
    super(pancakeSwapConstants);
  }
}
