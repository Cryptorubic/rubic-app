import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { WANNA_SWAP_AURORA_CONSTANTS } from '@features/instant-trade/services/instant-trade-service/providers/aurora/wanna-swap-aurora-service/wanna-swap-aurora.constants';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';

@Injectable({
  providedIn: 'root'
})
export class WannaSwapAuroraService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADES_PROVIDERS.WANNASWAP;

  constructor() {
    super(WANNA_SWAP_AURORA_CONSTANTS);
  }
}
