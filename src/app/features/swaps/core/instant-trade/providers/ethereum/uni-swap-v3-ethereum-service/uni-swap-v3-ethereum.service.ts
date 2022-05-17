import { Injectable } from '@angular/core';
import { UNI_SWAP_V3_ETHEREUM_CONSTANTS } from '@features/swaps/core/instant-trade/providers/ethereum/uni-swap-v3-ethereum-service/uni-swap-v3-ethereum.constants';
import { CommonUniswapV3Service } from '@features/swaps/core/instant-trade/providers/common/uniswap-v3/common-uniswap-v3.service';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class UniSwapV3EthereumService extends CommonUniswapV3Service {
  constructor() {
    super(UNI_SWAP_V3_ETHEREUM_CONSTANTS);
  }
}
