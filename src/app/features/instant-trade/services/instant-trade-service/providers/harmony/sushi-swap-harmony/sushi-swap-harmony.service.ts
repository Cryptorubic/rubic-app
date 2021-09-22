import { Injectable } from '@angular/core';
import { AbstractUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/abstract-service/abstract-uniswap-v2.service';
import { sushiSwapHarmonyConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/harmony/sushi-swap-harmony/sushi-swap-harmony.constants';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapHarmonyService extends AbstractUniswapV2Service {
  constructor() {
    super(sushiSwapHarmonyConstants);
  }
}
