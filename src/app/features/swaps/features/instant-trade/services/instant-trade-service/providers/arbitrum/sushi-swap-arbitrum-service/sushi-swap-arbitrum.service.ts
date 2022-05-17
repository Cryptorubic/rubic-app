import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { SUSHI_SWAP_ARBITRUM_CONSTANTS } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/arbitrum/sushi-swap-arbitrum-service/sushi-swap-arbitrum.constants';
import { InstantTradeModule } from '@features/swaps/features/instant-trade/instant-trade.module';

@Injectable({
  providedIn: InstantTradeModule
})
export class SushiSwapArbitrumService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.SUSHISWAP;

  constructor() {
    super(SUSHI_SWAP_ARBITRUM_CONSTANTS);
  }
}
