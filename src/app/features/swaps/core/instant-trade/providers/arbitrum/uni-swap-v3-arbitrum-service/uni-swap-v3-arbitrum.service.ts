import { Injectable } from '@angular/core';
import { CommonUniswapV3Service } from '@features/swaps/core/instant-trade/providers/common/uniswap-v3/common-uniswap-v3.service';
import { UNI_SWAP_V3_ARBITRUM_CONSTANTS } from '@features/swaps/core/instant-trade/providers/arbitrum/uni-swap-v3-arbitrum-service/uni-swap-v3-arbitrum.constants';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class UniSwapV3ArbitrumService extends CommonUniswapV3Service {
  constructor() {
    super(UNI_SWAP_V3_ARBITRUM_CONSTANTS);
  }
}
