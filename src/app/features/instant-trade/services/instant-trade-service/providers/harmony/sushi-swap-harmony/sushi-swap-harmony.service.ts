import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { sushiSwapHarmonyConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/harmony/sushi-swap-harmony/sushi-swap-harmony.constants';
import { INSTANT_TRADES_PROVIDER } from '@shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapHarmonyService extends CommonUniswapV2Service {
  public get providerType(): INSTANT_TRADES_PROVIDER {
    return INSTANT_TRADES_PROVIDER.SUSHISWAP;
  }

  constructor() {
    super(sushiSwapHarmonyConstants);
  }
}
