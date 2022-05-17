import { Injectable } from '@angular/core';
import { SUSHI_SWAP_TELOS_CONSTANTS } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/telos/sushi-swap-telos-service/sushi-swap-telos-constants';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { CommonUniswapV2Service } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { InstantTradeModule } from '@features/swaps/features/instant-trade/instant-trade.module';

@Injectable({
  providedIn: InstantTradeModule
})
export class SushiSwapTelosService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.SUSHISWAP;

  constructor() {
    super(SUSHI_SWAP_TELOS_CONSTANTS);
  }
}
