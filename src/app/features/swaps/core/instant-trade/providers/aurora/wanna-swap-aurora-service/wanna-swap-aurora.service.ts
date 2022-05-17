import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { WANNA_SWAP_AURORA_CONSTANTS } from '@features/swaps/core/instant-trade/providers/aurora/wanna-swap-aurora-service/wanna-swap-aurora.constants';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class WannaSwapAuroraService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.WANNASWAP;

  constructor() {
    super(WANNA_SWAP_AURORA_CONSTANTS);
  }
}
