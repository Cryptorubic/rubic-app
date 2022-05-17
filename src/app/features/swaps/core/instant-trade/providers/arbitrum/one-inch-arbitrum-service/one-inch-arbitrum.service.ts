import { Injectable } from '@angular/core';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { CommonOneinchService } from '@features/swaps/core/instant-trade/providers/common/oneinch/common-service/common-oneinch.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class OneInchArbitrumService extends CommonOneinchService {
  public readonly providerType = INSTANT_TRADE_PROVIDER.ONEINCH;

  constructor() {
    super(BLOCKCHAIN_NAME.ARBITRUM);
  }
}
