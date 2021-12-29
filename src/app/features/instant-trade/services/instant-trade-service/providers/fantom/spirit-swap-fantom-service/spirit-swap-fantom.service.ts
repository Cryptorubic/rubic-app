import { Injectable } from '@angular/core';
import { spiritSwapFantomConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/fantom/spirit-swap-fantom-service/spirit-swap-fantom.constants';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { INSTANT_TRADES_PROVIDER } from '@shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

@Injectable({
  providedIn: 'root'
})
export class SpiritSwapFantomService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADES_PROVIDER.SPIRITSWAP;

  constructor() {
    super(spiritSwapFantomConstants);
  }
}
