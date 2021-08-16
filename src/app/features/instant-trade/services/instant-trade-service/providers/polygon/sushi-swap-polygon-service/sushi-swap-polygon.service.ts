import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { UniswapV2ProviderAbstract } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/abstract-provider/uniswap-v2-provider.abstract';
import { sushiSwapPolygonConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/sushi-swap-polygon-service/sushi-swap-polygon-constants';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapPolygonService extends UniswapV2ProviderAbstract {
  constructor(
    commonUniswapV2: CommonUniswapV2Service,
    useTestingModeService: UseTestingModeService
  ) {
    const blockchain = BLOCKCHAIN_NAME.POLYGON;
    super(
      blockchain,
      sushiSwapPolygonConstants.contractAddressNetMode,
      sushiSwapPolygonConstants.wethAddressNetMode,
      sushiSwapPolygonConstants.routingProvidersNetMode,
      sushiSwapPolygonConstants.maxTransitTokens,
      commonUniswapV2,
      useTestingModeService
    );
  }
}
