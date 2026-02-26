import { Injectable } from '@angular/core';
import { fromPrivateToRubicChainMap } from '@features/privacy/providers/railgun/constants/network-map';
import { PrivacyAssetsService } from '@features/privacy/shared/services/private-assets-service/privacy-assets.service';

@Injectable()
export class RailgunPublicAssetsService extends PrivacyAssetsService {
  constructor() {
    super('from', Object.values(fromPrivateToRubicChainMap));
  }
}
