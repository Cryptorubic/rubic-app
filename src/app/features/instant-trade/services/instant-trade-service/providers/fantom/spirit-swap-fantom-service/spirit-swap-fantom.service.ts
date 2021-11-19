import { Injectable } from '@angular/core';
import { spiritSwapFantomConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/fantom/spirit-swap-fantom-service/spirit-swap-fantom.constants';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';

@Injectable({
  providedIn: 'root'
})
export class SpiritSwapFantomService extends CommonUniswapV2Service {
  constructor() {
    super(spiritSwapFantomConstants);
  }
}
