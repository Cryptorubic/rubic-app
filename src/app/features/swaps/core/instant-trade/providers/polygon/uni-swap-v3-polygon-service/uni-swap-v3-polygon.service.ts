import { Injectable } from '@angular/core';
import { CommonUniswapV3Service } from '@features/swaps/core/instant-trade/providers/common/uniswap-v3/common-uniswap-v3.service';
import { UNI_SWAP_V3_POLYGON_CONSTANTS } from '@features/swaps/core/instant-trade/providers/polygon/uni-swap-v3-polygon-service/uni-swap-v3-polygon.constants';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class UniSwapV3PolygonService extends CommonUniswapV3Service {
  constructor() {
    super(UNI_SWAP_V3_POLYGON_CONSTANTS);
  }
}
