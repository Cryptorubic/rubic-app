import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { PANCAKE_SWAP_CONSTANTS } from '@features/instant-trade/services/instant-trade-service/providers/bsc/pancake-swap-service/pancake-swap-constants';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';

@Injectable({
  providedIn: 'root'
})
export class PancakeSwapService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADES_PROVIDERS.PANCAKESWAP;

  constructor() {
    super(PANCAKE_SWAP_CONSTANTS);
  }
}
