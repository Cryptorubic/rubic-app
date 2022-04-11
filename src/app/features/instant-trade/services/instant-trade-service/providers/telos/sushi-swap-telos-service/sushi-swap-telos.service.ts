import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { SUSHI_SWAP_TELOS_CONSTANTS } from '@features/instant-trade/services/instant-trade-service/providers/telos/sushi-swap-telos-service/sushi-swap-telos-constants';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapTelosService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADES_PROVIDERS.SUSHISWAP;

  constructor() {
    super(SUSHI_SWAP_TELOS_CONSTANTS);
  }
}
