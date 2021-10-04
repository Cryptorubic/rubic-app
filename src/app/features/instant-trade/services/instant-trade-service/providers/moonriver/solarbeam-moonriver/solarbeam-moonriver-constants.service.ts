import { Injectable } from '@angular/core';
import { solarBeamMoonRiverConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/moonriver/solarbeam-moonriver/solarbeam-moonriver-constants';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';

@Injectable({
  providedIn: 'root'
})
export class SolarBeamMoonRiverService extends CommonUniswapV2Service {
  constructor() {
    super(solarBeamMoonRiverConstants);
  }
}
