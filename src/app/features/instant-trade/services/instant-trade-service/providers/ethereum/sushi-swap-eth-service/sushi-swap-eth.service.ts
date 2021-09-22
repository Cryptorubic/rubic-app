import { Injectable } from '@angular/core';
import { AbstractUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/abstract-service/abstract-uniswap-v2.service';
import { sushiSwapEthConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/sushi-swap-eth-service/sushi-swap-eth-constants';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapEthService extends AbstractUniswapV2Service {
  constructor() {
    super(sushiSwapEthConstants);
  }
}
