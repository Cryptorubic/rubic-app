import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { sushiSwapMoonRiverConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/moonriver/sushi-swap-moonriver/sushi-swap-moonriver-constants';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapMoonriverService extends CommonUniswapV2Service {
  constructor() {
    super(sushiSwapMoonRiverConstants);
  }
}
