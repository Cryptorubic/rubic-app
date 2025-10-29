import { Injectable } from '@angular/core';

import { AssetsService } from '@features/trade/components/assets-selector/services/blockchains-list-service/utils/assets.service';
import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';

@Injectable({
  providedIn: 'root'
})
export class FromAssetsService extends AssetsService {
  public isDisabledFrom(blockchain: AvailableBlockchain): boolean {
    return blockchain.disabledFrom;
  }
}
