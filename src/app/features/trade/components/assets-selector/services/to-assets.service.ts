import { Injectable } from '@angular/core';

import { AssetsService } from '@features/trade/components/assets-selector/services/blockchains-list-service/utils/assets.service';
import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';

@Injectable({
  providedIn: 'root'
})
export class ToAssetsService extends AssetsService {
  public isDisabledFrom(_blockchain: AvailableBlockchain): boolean {
    return false;
  }
}
