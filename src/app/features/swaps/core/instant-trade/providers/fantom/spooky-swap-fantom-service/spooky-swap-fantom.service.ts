import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { SPOOKY_SWAP_FANTOM_CONSTANTS } from '@features/swaps/core/instant-trade/providers/fantom/spooky-swap-fantom-service/spooky-swap-fantom.constants';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class SpookySwapFantomService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.SPOOKYSWAP;

  constructor() {
    super(SPOOKY_SWAP_FANTOM_CONSTANTS);
  }
}
