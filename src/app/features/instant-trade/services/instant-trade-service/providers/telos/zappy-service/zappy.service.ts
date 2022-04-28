import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { ZAPPY_CONSTANTS } from '@features/instant-trade/services/instant-trade-service/providers/telos/zappy-service/zappy-constants';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';

@Injectable({
  providedIn: 'root'
})
export class ZappyService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.ZAPPY;

  constructor() {
    super(ZAPPY_CONSTANTS);
  }
}
