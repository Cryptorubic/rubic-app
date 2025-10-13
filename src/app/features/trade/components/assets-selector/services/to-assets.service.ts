import { Injectable } from '@angular/core';

import { AssetsService } from '@features/trade/components/assets-selector/services/blockchains-list-service/utils/assets.service';

@Injectable({
  providedIn: 'root'
})
export class ToAssetsService extends AssetsService {}
