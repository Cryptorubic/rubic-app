import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { ZrxService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/zrx/zrx.service';
import { InstantTradeModule } from '@features/swaps/features/instant-trade/instant-trade.module';

@Injectable({
  providedIn: InstantTradeModule
})
export class ZrxEthService extends ZrxService {
  constructor() {
    super(BLOCKCHAIN_NAME.ETHEREUM);
  }
}
