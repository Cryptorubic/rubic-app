import { Injectable } from '@angular/core';
import { PrivateAssetsService } from '../../shared-privacy-providers/services/private-assets/private-assets.service';
import { ZAMA_SUPPORTED_CHAINS } from '../constants/chains';

@Injectable()
export class ZamaPrivateAssetsService extends PrivateAssetsService {
  constructor() {
    super('from', ZAMA_SUPPORTED_CHAINS);
  }
}
