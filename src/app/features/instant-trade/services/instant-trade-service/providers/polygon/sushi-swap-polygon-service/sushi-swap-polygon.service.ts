import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { SUSHI_SWAP_POLYGON_CONSTANTS } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/sushi-swap-polygon-service/sushi-swap-polygon-constants';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapPolygonService extends CommonUniswapV2Service {
  constructor() {
    super(SUSHI_SWAP_POLYGON_CONSTANTS);
  }
}
