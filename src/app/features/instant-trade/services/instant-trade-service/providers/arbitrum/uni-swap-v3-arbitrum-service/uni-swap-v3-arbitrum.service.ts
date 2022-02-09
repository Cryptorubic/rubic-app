import { Injectable } from '@angular/core';
import { CommonUniswapV3Service } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/common-uniswap-v3.service';
import { UNI_SWAP_V3_ARBITRUM_CONSTANTS } from '@features/instant-trade/services/instant-trade-service/providers/arbitrum/uni-swap-v3-arbitrum-service/uni-swap-v3-ethereum.constants';

@Injectable({
  providedIn: 'root'
})
export class UniSwapV3ArbitrumService extends CommonUniswapV3Service {
  constructor() {
    super(UNI_SWAP_V3_ARBITRUM_CONSTANTS);
  }
}
