import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';
import { UNI_SWAP_V2_CONSTANTS } from '@features/swaps/core/instant-trade/providers/ethereum/uni-swap-v2-service/uni-swap-v2.constants';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class UniSwapV2Service extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.UNISWAP_V2;

  constructor() {
    super(UNI_SWAP_V2_CONSTANTS);
  }
}
