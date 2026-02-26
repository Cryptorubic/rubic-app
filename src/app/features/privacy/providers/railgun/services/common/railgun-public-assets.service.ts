import { Injectable } from '@angular/core';
import { fromPrivateToRubicChainMap } from '@features/privacy/providers/railgun/constants/network-map';
import { PrivateAssetsService } from '@features/privacy/providers/shared-privacy-providers/services/private-assets/private-assets.service';

@Injectable()
export class RailgunPublicAssetsService extends PrivateAssetsService {
  constructor() {
    super('from', Object.values(fromPrivateToRubicChainMap));
  }
}
