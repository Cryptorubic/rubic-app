import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { UniswapV2ProviderAbstract } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/abstract-provider/uniswap-v2-provider.abstract';
import { sushiSwapEthConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/sushi-swap-eth-service/sushi-swap-eth-constants';

@Injectable({
  providedIn: 'root'
})
export class SushiSwapEthService extends UniswapV2ProviderAbstract {
  constructor(
    commonUniswapV2: CommonUniswapV2Service,
    useTestingModeService: UseTestingModeService
  ) {
    const blockchain = BLOCKCHAIN_NAME.ETHEREUM;
    super(
      blockchain,
      sushiSwapEthConstants.contractAddressNetMode,
      sushiSwapEthConstants.wethAddressNetMode,
      sushiSwapEthConstants.routingProvidersNetMode,
      sushiSwapEthConstants.maxTransitTokens,
      commonUniswapV2,
      useTestingModeService
    );
  }
}
