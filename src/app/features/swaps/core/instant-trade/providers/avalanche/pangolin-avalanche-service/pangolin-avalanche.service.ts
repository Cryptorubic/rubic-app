import { Injectable } from '@angular/core';
import { PANGOLIN_AVALANCHE_CONSTANTS } from '@features/swaps/core/instant-trade/providers/avalanche/pangolin-avalanche-service/pangolin-avalanche-constants';
import { CommonUniswapV2Service } from '@features/swaps/core/instant-trade/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import AVAX_CONTRACT_ABI from '@features/swaps/core/instant-trade/providers/avalanche/models/avax-contract-abi';
import { AVAX_SWAP_METHOD } from '@features/swaps/core/instant-trade/providers/avalanche/models/swap-method';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class PangolinAvalancheService extends CommonUniswapV2Service {
  public readonly providerType = INSTANT_TRADE_PROVIDER.PANGOLIN;

  protected readonly contractAbi = AVAX_CONTRACT_ABI;

  protected readonly swapsMethod = AVAX_SWAP_METHOD;

  constructor() {
    super(PANGOLIN_AVALANCHE_CONSTANTS);
  }
}
