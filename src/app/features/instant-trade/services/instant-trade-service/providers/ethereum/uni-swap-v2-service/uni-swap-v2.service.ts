import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { uniSwapV2Constants } from './uni-swap-v2-constants';
import { INSTANT_TRADES_PROVIDER } from '@shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

@Injectable({
  providedIn: 'root'
})
export class UniSwapV2Service extends CommonUniswapV2Service {
  public get providerType(): INSTANT_TRADES_PROVIDER {
    return INSTANT_TRADES_PROVIDER.UNISWAP_V2;
  }

  constructor() {
    super(uniSwapV2Constants);
  }
}
