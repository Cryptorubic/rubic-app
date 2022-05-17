import { Injectable } from '@angular/core';
import { SUSHI_SWAP_FANTOM_CONSTANTS } from '@features/swaps/core/instant-trade/providers/fantom/sushi-swap-fantom-service/sushi-swap-fantom.constants';
import { CommonUniswapV2Service } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class SushiSwapFantomService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.SUSHISWAP;

  constructor() {
    super(SUSHI_SWAP_FANTOM_CONSTANTS);
  }
}
