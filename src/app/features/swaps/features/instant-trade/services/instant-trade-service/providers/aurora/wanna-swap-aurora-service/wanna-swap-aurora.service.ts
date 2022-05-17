import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { WANNA_SWAP_AURORA_CONSTANTS } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/aurora/wanna-swap-aurora-service/wanna-swap-aurora.constants';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { InstantTradeModule } from '@features/swaps/features/instant-trade/instant-trade.module';

@Injectable({
  providedIn: InstantTradeModule
})
export class WannaSwapAuroraService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.WANNASWAP;

  constructor() {
    super(WANNA_SWAP_AURORA_CONSTANTS);
  }
}
