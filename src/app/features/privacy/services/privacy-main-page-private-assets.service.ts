import { Injectable } from '@angular/core';
import { PrivateAssetsService } from '../providers/shared-privacy-providers/services/private-assets/private-assets.service';
import { PRIVATE_MODE_SUPPORTED_CHAINS } from '../constants/private-mode-supported-chains';

@Injectable()
export class PrivacyMainPagePrivateAssetsService extends PrivateAssetsService {
  constructor() {
    super('from', PRIVATE_MODE_SUPPORTED_CHAINS);
  }
}
