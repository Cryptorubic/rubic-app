import { CommonOneinchService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-service/common-oneinch.service';
import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { InstantTradeModule } from '@features/swaps/features/instant-trade/instant-trade.module';

@Injectable({
  providedIn: InstantTradeModule
})
export class OneInchPolygonService extends CommonOneinchService {
  public readonly providerType = INSTANT_TRADE_PROVIDER.ONEINCH;

  constructor() {
    super(BLOCKCHAIN_NAME.POLYGON);
  }
}
