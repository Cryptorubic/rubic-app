import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { ZrxService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/zrx/zrx.service';

@Injectable({
  providedIn: 'root'
})
export class ZrxEthService extends ZrxService {
  constructor() {
    super(BLOCKCHAIN_NAME.ETHEREUM);
  }
}
