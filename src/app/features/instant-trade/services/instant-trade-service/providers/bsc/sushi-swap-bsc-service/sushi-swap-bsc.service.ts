import { Injectable } from '@angular/core';
import { AbstractUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/abstract-service/abstract-uniswap-v2.service';
import { sushiSwapBscConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/sushi-swap-bsc-service/sushi-swap-bsc-constants';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapBscService extends AbstractUniswapV2Service {
  constructor() {
    super(sushiSwapBscConstants);
  }
}
