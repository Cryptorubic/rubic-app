import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { sushiSwapEthConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/sushi-swap-eth-service/sushi-swap-eth-constants';
import { INSTANT_TRADES_PROVIDER } from '@shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapEthService extends CommonUniswapV2Service {
  public get providerType(): INSTANT_TRADES_PROVIDER {
    return INSTANT_TRADES_PROVIDER.SUSHISWAP;
  }

  constructor() {
    super(sushiSwapEthConstants);
  }
}
