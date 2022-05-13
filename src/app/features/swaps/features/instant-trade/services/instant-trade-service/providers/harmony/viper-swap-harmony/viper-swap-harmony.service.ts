import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { viperSwapHarmonyConstants } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/harmony/viper-swap-harmony/viper-swap-harmony.constants';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';

@Injectable({
  providedIn: 'root'
})
export class ViperSwapHarmonyService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.VIPER;

  constructor() {
    super(viperSwapHarmonyConstants);
  }
}
