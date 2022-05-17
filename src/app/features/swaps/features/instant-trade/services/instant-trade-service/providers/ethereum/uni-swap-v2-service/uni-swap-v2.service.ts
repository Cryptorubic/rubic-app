import { Injectable } from '@angular/core';
import { CommonUniswapV2Service } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { UNI_SWAP_V2_CONSTANTS } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v2-service/uni-swap-v2.constants';
import { InstantTradeModule } from '@features/swaps/features/instant-trade/instant-trade.module';

@Injectable({
  providedIn: InstantTradeModule
})
export class UniSwapV2Service extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.UNISWAP_V2;

  constructor() {
    super(UNI_SWAP_V2_CONSTANTS);
  }
}
