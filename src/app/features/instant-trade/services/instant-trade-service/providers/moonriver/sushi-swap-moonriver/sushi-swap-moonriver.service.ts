import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { sushiSwapMoonRiverConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-constants';
import { INSTANT_TRADES_PROVIDER } from '@shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapMoonRiverService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADES_PROVIDER.SUSHISWAP;

  constructor() {
    super(sushiSwapMoonRiverConstants);
  }
}
