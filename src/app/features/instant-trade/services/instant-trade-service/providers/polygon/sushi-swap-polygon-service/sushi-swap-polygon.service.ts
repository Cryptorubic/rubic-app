import { Injectable } from '@angular/core';
import { AbstractUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/abstract-service/abstract-uniswap-v2.service';
import { sushiSwapPolygonConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/sushi-swap-polygon-service/sushi-swap-polygon-constants';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapPolygonService extends AbstractUniswapV2Service {
  constructor() {
    super(sushiSwapPolygonConstants);
  }
}
