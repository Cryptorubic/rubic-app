import { Injectable } from '@angular/core';
import { PrivateAssetsService } from '../../shared-privacy-providers/services/private-assets/private-assets.service';
import { HINKAL_SUPPORTED_CHAINS } from '../constants/hinkal-supported-chains';

@Injectable()
export class HinkalToPrivateAssetsService extends PrivateAssetsService {
  constructor() {
    super('to', HINKAL_SUPPORTED_CHAINS);
  }
}
