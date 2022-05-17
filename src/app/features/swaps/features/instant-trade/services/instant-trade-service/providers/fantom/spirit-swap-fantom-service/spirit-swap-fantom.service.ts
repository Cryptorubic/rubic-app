import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { SPIRIT_SWAP_FANTOM_CONSTANTS } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/fantom/spirit-swap-fantom-service/spirit-swap-fantom.constants';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { InstantTradeModule } from '@features/swaps/features/instant-trade/instant-trade.module';

@Injectable({
  providedIn: InstantTradeModule
})
export class SpiritSwapFantomService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.SPIRITSWAP;

  constructor() {
    super(SPIRIT_SWAP_FANTOM_CONSTANTS);
  }
}
