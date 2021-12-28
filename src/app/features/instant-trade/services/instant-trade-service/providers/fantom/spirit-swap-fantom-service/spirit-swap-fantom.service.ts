import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { spiritSwapFantomConstants } from '@features/instant-trade/services/instant-trade-service/providers/fantom/spirit-swap-fantom-service/spirit-swap-fantom.constants';

@Injectable({
  providedIn: 'root'
})
export class SpiritSwapFantomService extends CommonUniswapV2Service {
  constructor() {
    super(spiritSwapFantomConstants);
  }
}
