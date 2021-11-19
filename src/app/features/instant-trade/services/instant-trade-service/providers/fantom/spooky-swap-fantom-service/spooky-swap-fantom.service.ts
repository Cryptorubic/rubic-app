import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { spookySwapFantomConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/fantom/spooky-swap-fantom-service/spooky-swap-fantom.constants';

@Injectable({
  providedIn: 'root'
})
export class SpookySwapFantomService extends CommonUniswapV2Service {
  constructor() {
    super(spookySwapFantomConstants);
  }
}
