import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { uniSwapV2Constants } from './uni-swap-v2-constants';

@Injectable({
  providedIn: 'root'
})
export class UniSwapV2Service extends CommonUniswapV2Service {
  constructor() {
    super(uniSwapV2Constants);
  }
}
