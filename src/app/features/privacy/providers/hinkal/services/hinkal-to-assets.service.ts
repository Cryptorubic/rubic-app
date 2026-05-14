import { Injectable, DestroyRef, inject } from '@angular/core';
import { PrivateAssetsService } from '../../shared-privacy-providers/services/private-assets/private-assets.service';
import { HINKAL_SUPPORTED_CHAINS } from '../constants/hinkal-supported-chains';
import { HinkalFacadeService } from './hinkal-sdk/hinkal-facade.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class HinkalToPrivateAssetsService extends PrivateAssetsService {
  private readonly destroyRef = inject(DestroyRef);

  constructor(private readonly hinkalFacade: HinkalFacadeService) {
    super('to', HINKAL_SUPPORTED_CHAINS);

    this.assetListType$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(asset => this.hinkalFacade.switchChain(asset));
  }
}
