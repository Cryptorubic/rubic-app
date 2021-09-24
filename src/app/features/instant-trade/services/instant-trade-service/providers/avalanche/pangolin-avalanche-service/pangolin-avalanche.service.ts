import { Injectable } from '@angular/core';
import { pangolinAvalancheConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/pangolin-avalanche-service/pangolin-avalanche-constants';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';

@Injectable({
  providedIn: 'root'
})
export class PangolinAvalancheService extends CommonUniswapV2Service {
  constructor() {
    super(pangolinAvalancheConstants);
  }
}
