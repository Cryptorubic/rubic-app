import { Injectable } from '@angular/core';
import {
  AVAX_SWAP_METHOD,
  joeAvalancheConstants
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/joe-avalanche-service/joe-avalanche-constants';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';

@Injectable({
  providedIn: 'root'
})
export class JoeAvalancheService extends CommonUniswapV2Service {
  constructor() {
    super(joeAvalancheConstants);
    this.swapsMethod = AVAX_SWAP_METHOD;
  }
}
