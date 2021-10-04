import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { seaDexMoonRiverConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/moonriver/seadex-moonriver/seadex-moonriver-constants';

@Injectable({
  providedIn: 'root'
})
export class SeaDexMoonrRiverService extends CommonUniswapV2Service {
  constructor() {
    super(seaDexMoonRiverConstants);
  }
}
