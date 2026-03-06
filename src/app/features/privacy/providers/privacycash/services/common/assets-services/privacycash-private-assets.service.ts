import { Injectable } from '@angular/core';
import { PrivateAssetsService } from '@features/privacy/providers/shared-privacy-providers/services/private-assets/private-assets.service';
import { PRIVACYCASH_SUPPORTED_CHAINS } from '../../../constants/chains';

@Injectable()
export class PrivacycashPrivateAssetsService extends PrivateAssetsService {
  constructor() {
    super('to', PRIVACYCASH_SUPPORTED_CHAINS);
  }
}
