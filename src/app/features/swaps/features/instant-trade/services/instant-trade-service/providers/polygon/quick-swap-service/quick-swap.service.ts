import { CommonUniswapV2Service } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { Injectable } from '@angular/core';
import { QUICK_SWAP_CONSTANTS } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/polygon/quick-swap-service/quick-swap-constants';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { InstantTradeModule } from '@features/swaps/features/instant-trade/instant-trade.module';

@Injectable({
  providedIn: InstantTradeModule
})
export class QuickSwapService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.QUICKSWAP;

  constructor() {
    super(QUICK_SWAP_CONSTANTS);
  }
}
