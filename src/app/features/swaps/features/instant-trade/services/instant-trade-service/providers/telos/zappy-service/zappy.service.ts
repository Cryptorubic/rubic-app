import { Injectable } from '@angular/core';
import { ZAPPY_CONSTANTS } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/telos/zappy-service/zappy-constants';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { CommonUniswapV2Service } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';

@Injectable({
  providedIn: 'root'
})
export class ZappyService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.ZAPPY;

  constructor() {
    super(ZAPPY_CONSTANTS);
  }
}
