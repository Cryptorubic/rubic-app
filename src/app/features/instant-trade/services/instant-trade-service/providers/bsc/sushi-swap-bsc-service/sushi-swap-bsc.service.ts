import { UniswapV2ProviderAbstract } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/abstract-provider/uniswap-v2-provider.abstract';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { sushiSwapBscConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/sushi-swap-bsc-service/sushi-swap-bsc-constants';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapBscService extends UniswapV2ProviderAbstract {
  constructor(
    commonUniswapV2: CommonUniswapV2Service,
    useTestingModeService: UseTestingModeService
  ) {
    const blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
    super(
      blockchain,
      sushiSwapBscConstants.contractAddressNetMode,
      sushiSwapBscConstants.wethAddressNetMode,
      sushiSwapBscConstants.routingProvidersNetMode,
      sushiSwapBscConstants.maxTransitTokens,
      commonUniswapV2,
      useTestingModeService
    );
  }
}
