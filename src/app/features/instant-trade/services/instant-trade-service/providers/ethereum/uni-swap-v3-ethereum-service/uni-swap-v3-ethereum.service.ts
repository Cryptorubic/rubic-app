import { Injectable } from '@angular/core';
import { UNI_SWAP_V3_ETHEREUM_CONSTANTS } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-ethereum-service/uni-swap-v3-ethereum.constants';
import { CommonUniswapV3Service } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/common-uniswap-v3.service';

@Injectable({
  providedIn: 'root'
})
export class UniSwapV3EthereumService extends CommonUniswapV3Service {
  constructor() {
    super(UNI_SWAP_V3_ETHEREUM_CONSTANTS);
  }
}
