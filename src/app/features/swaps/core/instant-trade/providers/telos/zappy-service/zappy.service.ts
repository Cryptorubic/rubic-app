import { Injectable } from '@angular/core';
import { ZAPPY_CONSTANTS } from '@features/swaps/core/instant-trade/providers/telos/zappy-service/zappy-constants';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { CommonUniswapV2Service } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class ZappyService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.ZAPPY;

  constructor() {
    super(ZAPPY_CONSTANTS);
  }
}
