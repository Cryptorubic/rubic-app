import { Injectable } from '@angular/core';
import { PrivateAssetsService } from '../../shared-privacy-providers/services/private-assets/private-assets.service';
import { CLEARSWAP_SUPPORTED_CHAINS } from '@app/features/privacy/providers/clearswap/constants/clearswap-supported-chains-and-tokens';

@Injectable()
export class ClearswapPrivateAssetsService extends PrivateAssetsService {
  constructor() {
    super('from', CLEARSWAP_SUPPORTED_CHAINS);
  }
}
