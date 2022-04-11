import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { ZAPPY_CONSTANTS } from '@features/instant-trade/services/instant-trade-service/providers/telos/zappy-service/zappy-constants';

@Injectable({
  providedIn: 'root'
})
export class ZappyService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADES_PROVIDERS.ZAPPY;

  constructor() {
    super(ZAPPY_CONSTANTS);
  }
}
