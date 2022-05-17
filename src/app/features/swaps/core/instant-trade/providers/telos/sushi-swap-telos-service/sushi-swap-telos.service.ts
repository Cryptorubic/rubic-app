import { Injectable } from '@angular/core';
import { SUSHI_SWAP_TELOS_CONSTANTS } from '@features/swaps/core/instant-trade/providers/telos/sushi-swap-telos-service/sushi-swap-telos-constants';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { CommonUniswapV2Service } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class SushiSwapTelosService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.SUSHISWAP;

  constructor() {
    super(SUSHI_SWAP_TELOS_CONSTANTS);
  }
}
