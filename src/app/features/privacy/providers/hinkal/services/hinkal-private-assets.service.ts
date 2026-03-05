import { Injectable } from '@angular/core';
import { PrivateAssetsService } from '../../shared-privacy-providers/services/private-assets/private-assets.service';
import { HINKAL_SUPPORTED_CHAINS } from '../constants/hinkal-supported-chains';

@Injectable()
export class HinkalPrivateAssetsService extends PrivateAssetsService {
  constructor() {
    super('from', HINKAL_SUPPORTED_CHAINS);
  }
}
