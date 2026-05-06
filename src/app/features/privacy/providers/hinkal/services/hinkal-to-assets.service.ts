import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Injectable } from '@angular/core';
import { PrivateAssetsService } from '../../shared-privacy-providers/services/private-assets/private-assets.service';
import { HINKAL_SUPPORTED_CHAINS } from '../constants/hinkal-supported-chains';
import { HinkalFacadeService } from './hinkal-sdk/hinkal-facade.service';

@Injectable()
export class HinkalToPrivateAssetsService extends PrivateAssetsService {
  constructor(private readonly hinkalFacade: HinkalFacadeService) {
    super('to', HINKAL_SUPPORTED_CHAINS);

    this.assetListType$
      .pipe(takeUntilDestroyed())
      .subscribe(asset => this.hinkalFacade.switchChain(asset));
  }
}
