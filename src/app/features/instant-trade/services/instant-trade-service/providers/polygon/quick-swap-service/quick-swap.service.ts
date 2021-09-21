import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { UniswapV2ProviderAbstract } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/abstract-provider/uniswap-v2-provider.abstract';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { Injectable } from '@angular/core';
import { quickSwapConstants } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/quick-swap-service/quick-swap-constants';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

@Injectable({
  providedIn: 'root'
})
export class QuickSwapService extends UniswapV2ProviderAbstract {
  constructor(
    commonUniswapV2: CommonUniswapV2Service,
    useTestingModeService: UseTestingModeService
  ) {
    const blockchain = BLOCKCHAIN_NAME.POLYGON;
    super(blockchain, quickSwapConstants, commonUniswapV2, useTestingModeService);
  }
}
