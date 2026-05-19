import { Injectable } from '@angular/core';
import { PrivateAssetsService } from '../../shared-privacy-providers/services/private-assets/private-assets.service';
import { HOUDINI_SUPPORTED_CHAINS } from '@app/features/privacy/providers/houdini/constants/chains';

@Injectable()
export class HoudiniPrivateAssetsService extends PrivateAssetsService {
  constructor() {
    super('from', HOUDINI_SUPPORTED_CHAINS);
  }
}
