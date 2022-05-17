import { CommonUniswapV2Service } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { Injectable } from '@angular/core';
import { QUICK_SWAP_CONSTANTS } from '@features/swaps/core/instant-trade/providers/polygon/quick-swap-service/quick-swap-constants';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class QuickSwapService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.QUICKSWAP;

  constructor() {
    super(QUICK_SWAP_CONSTANTS);
  }
}
