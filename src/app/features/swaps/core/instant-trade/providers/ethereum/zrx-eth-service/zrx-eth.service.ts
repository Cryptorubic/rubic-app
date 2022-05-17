import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { ZrxService } from '@features/swaps/core/instant-trade/providers/common/zrx/zrx.service';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';

@Injectable({
  providedIn: SwapsCoreModule
})
export class ZrxEthService extends ZrxService {
  constructor() {
    super(BLOCKCHAIN_NAME.ETHEREUM);
  }
}
