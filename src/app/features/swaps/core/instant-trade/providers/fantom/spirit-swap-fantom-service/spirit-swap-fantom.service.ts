import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { SPIRIT_SWAP_FANTOM_CONSTANTS } from '@features/swaps/core/instant-trade/providers/fantom/spirit-swap-fantom-service/spirit-swap-fantom.constants';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class SpiritSwapFantomService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.SPIRITSWAP;

  constructor() {
    super(SPIRIT_SWAP_FANTOM_CONSTANTS);
  }
}
