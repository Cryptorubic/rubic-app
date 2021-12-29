import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { pancakeSwapConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/pancake-swap-service/pankace-swap-constants';
import { INSTANT_TRADES_PROVIDER } from '@shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

@Injectable({
  providedIn: 'root'
})
export class PancakeSwapService extends CommonUniswapV2Service {
  public get providerType(): INSTANT_TRADES_PROVIDER {
    return INSTANT_TRADES_PROVIDER.PANCAKESWAP;
  }

  constructor() {
    super(pancakeSwapConstants);
  }
}
