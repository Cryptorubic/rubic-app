import { Injectable } from '@angular/core';
import { UNI_SWAP_V3_ETHEREUM_CONSTANTS } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-ethereum-service/uni-swap-v3-ethereum.constants';
import { CommonUniswapV3Service } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/common-uniswap-v3.service';
import { InstantTradeModule } from '@features/swaps/features/instant-trade/instant-trade.module';

@Injectable({
  providedIn: InstantTradeModule
})
export class UniSwapV3EthereumService extends CommonUniswapV3Service {
  constructor() {
    super(UNI_SWAP_V3_ETHEREUM_CONSTANTS);
  }
}
