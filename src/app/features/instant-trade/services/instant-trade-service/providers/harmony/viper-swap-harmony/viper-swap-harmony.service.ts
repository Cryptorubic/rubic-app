import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { viperSwapHarmonyConstants } from '@features/instant-trade/services/instant-trade-service/providers/harmony/viper-swap-harmony/viper-swap-harmony.constants';

@Injectable({
  providedIn: 'root'
})
export class ViperSwapHarmonyService extends CommonUniswapV2Service {
  constructor() {
    super(viperSwapHarmonyConstants);
  }
}
