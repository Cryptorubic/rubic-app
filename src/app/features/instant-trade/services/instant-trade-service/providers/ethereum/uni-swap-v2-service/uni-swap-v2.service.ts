import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { UNI_SWAP_V2_CONSTANTS } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v2-service/uni-swap-v2.constants';

@Injectable({
  providedIn: 'root'
})
export class UniSwapV2Service extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADES_PROVIDERS.UNISWAP_V2;

  constructor() {
    super(UNI_SWAP_V2_CONSTANTS);
  }
}
