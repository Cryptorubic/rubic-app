import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { TRISOLARIS_AURORA_CONSTANTS } from '@features/swaps/core/instant-trade/providers/aurora/trisolaris-aurora-service/trisolaris-aurora.constants';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class TrisolarisAuroraService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.TRISOLARIS;

  constructor() {
    super(TRISOLARIS_AURORA_CONSTANTS);
  }
}
