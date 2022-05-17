import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { SUSHI_SWAP_HARMONY_CONSTANTS } from '@features/swaps/core/instant-trade/providers/harmony/sushi-swap-harmony/sushi-swap-harmony.constants';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class SushiSwapHarmonyService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.SUSHISWAP;

  constructor() {
    super(SUSHI_SWAP_HARMONY_CONSTANTS);
  }
}
