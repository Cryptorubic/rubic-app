import { Injectable } from '@angular/core';
import { UNI_SWAP_V3_CONSTANTS } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/uni-swap-v3-constants';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { CommonUniswapV3Service } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/common-uniswap-v3.service';

@Injectable({
  providedIn: 'root'
})
export class UniSwapV3Service extends CommonUniswapV3Service {
  public readonly providerType = INSTANT_TRADES_PROVIDERS.UNISWAP_V3;

  constructor() {
    super(UNI_SWAP_V3_CONSTANTS);
  }
}
