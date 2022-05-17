import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { PANCAKE_SWAP_CONSTANTS } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/bsc/pancake-swap-service/pancake-swap-constants';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { InstantTradeModule } from '@features/swaps/features/instant-trade/instant-trade.module';

@Injectable({
  providedIn: InstantTradeModule
})
export class PancakeSwapService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.PANCAKESWAP;

  constructor() {
    super(PANCAKE_SWAP_CONSTANTS);
  }
}
