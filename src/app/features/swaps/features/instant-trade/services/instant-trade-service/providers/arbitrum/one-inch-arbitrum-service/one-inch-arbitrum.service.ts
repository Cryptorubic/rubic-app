import { Injectable } from '@angular/core';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { CommonOneinchService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-service/common-oneinch.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { InstantTradeModule } from '@features/swaps/features/instant-trade/instant-trade.module';

@Injectable({
  providedIn: InstantTradeModule
})
export class OneInchArbitrumService extends CommonOneinchService {
  public readonly providerType = INSTANT_TRADE_PROVIDER.ONEINCH;

  constructor() {
    super(BLOCKCHAIN_NAME.ARBITRUM);
  }
}
