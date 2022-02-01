import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { SUSHI_SWAP_ARBITRUM_CONSTANTS } from '@features/instant-trade/services/instant-trade-service/providers/arbitrum/sushi-swap-arbitrum-service/sushi-swap-arbitrum.constants';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapArbitrumService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADES_PROVIDERS.SUSHISWAP;

  constructor() {
    super(SUSHI_SWAP_ARBITRUM_CONSTANTS);
  }
}
