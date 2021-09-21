import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { UniswapV2ProviderAbstract } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/abstract-provider/uniswap-v2-provider.abstract';
import { uniSwapV2Constants } from './uni-swap-v2-constants';

@Injectable({
  providedIn: 'root'
})
export class UniSwapV2Service extends UniswapV2ProviderAbstract {
  constructor(
    commonUniswapV2: CommonUniswapV2Service,
    useTestingModeService: UseTestingModeService
  ) {
    const blockchain = BLOCKCHAIN_NAME.ETHEREUM;
    super(blockchain, uniSwapV2Constants, commonUniswapV2, useTestingModeService);
  }
}
