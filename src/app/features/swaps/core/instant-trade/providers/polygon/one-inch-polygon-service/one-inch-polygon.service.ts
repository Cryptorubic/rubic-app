import { CommonOneinchService } from '@features/swaps/core/instant-trade/providers/common/oneinch/common-service/common-oneinch.service';
import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class OneInchPolygonService extends CommonOneinchService {
  public readonly providerType = INSTANT_TRADE_PROVIDER.ONEINCH;

  constructor() {
    super(BLOCKCHAIN_NAME.POLYGON);
  }
}
