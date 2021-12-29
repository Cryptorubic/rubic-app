import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { SUSHI_SWAP_MOON_RIVER_CONSTANTS } from 'src/app/features/instant-trade/services/instant-trade-service/providers/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-constants';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapMoonRiverService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.SUSHISWAP;

  constructor() {
    super(SUSHI_SWAP_MOON_RIVER_CONSTANTS);
  }
}
