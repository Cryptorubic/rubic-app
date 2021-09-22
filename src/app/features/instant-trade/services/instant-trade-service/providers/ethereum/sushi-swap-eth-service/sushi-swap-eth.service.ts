import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { sushiSwapEthConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/sushi-swap-eth-service/sushi-swap-eth-constants';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapEthService extends CommonUniswapV2Service {
  constructor() {
    super(sushiSwapEthConstants);
  }
}
