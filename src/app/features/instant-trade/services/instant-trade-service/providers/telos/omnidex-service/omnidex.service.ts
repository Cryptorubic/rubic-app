import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { OMNIDEX_CONSTANTS } from '@features/instant-trade/services/instant-trade-service/providers/telos/omnidex-service/omnidex-constants';

@Injectable({
  providedIn: 'root'
})
export class OmnidexService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADES_PROVIDERS.OMNIDEX;

  constructor() {
    super(OMNIDEX_CONSTANTS);
  }
}
