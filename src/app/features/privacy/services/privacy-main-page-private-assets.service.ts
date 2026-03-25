import { Injectable } from '@angular/core';
import { PRIVATE_MODE_SUPPORTED_CHAINS } from '../constants/private-mode-supported-chains-and-tokens';
import { PrivateAssetsService } from '../providers/shared-privacy-providers/services/private-assets/private-assets.service';

@Injectable()
export class PrivacyMainPagePrivateAssetsService extends PrivateAssetsService {
  constructor() {
    super('from', PRIVATE_MODE_SUPPORTED_CHAINS);
  }
}
