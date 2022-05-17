import { Injectable } from '@angular/core';
import { CommonUniswapV3Service } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v3/common-uniswap-v3.service';
import { UNI_SWAP_V3_POLYGON_CONSTANTS } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/polygon/uni-swap-v3-polygon-service/uni-swap-v3-polygon.constants';
import { InstantTradeModule } from '@features/swaps/features/instant-trade/instant-trade.module';

@Injectable({
  providedIn: InstantTradeModule
})
export class UniSwapV3PolygonService extends CommonUniswapV3Service {
  constructor() {
    super(UNI_SWAP_V3_POLYGON_CONSTANTS);
  }
}
