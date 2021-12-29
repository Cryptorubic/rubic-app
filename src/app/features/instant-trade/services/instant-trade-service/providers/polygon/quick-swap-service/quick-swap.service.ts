import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { Injectable } from '@angular/core';
import { quickSwapConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/quick-swap-service/quick-swap-constants';
import { INSTANT_TRADES_PROVIDER } from '@shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

@Injectable({
  providedIn: 'root'
})
export class QuickSwapService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADES_PROVIDER.QUICKSWAP;

  constructor() {
    super(quickSwapConstants);
  }
}
