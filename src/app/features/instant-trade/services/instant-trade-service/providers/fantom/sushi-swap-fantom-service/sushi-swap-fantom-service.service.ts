import { Injectable } from '@angular/core';
import { sushiSwapFantomConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/fantom/sushi-swap-fantom-service/sushi-swap-fantom.constants';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapFantomServiceService extends CommonUniswapV2Service {
  constructor() {
    super(sushiSwapFantomConstants);
  }
}
