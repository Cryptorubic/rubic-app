import { Injectable, Self } from '@angular/core';
import { PrivateAssetsService } from '../../shared-privacy-providers/services/private-assets/private-assets.service';
import { HINKAL_SUPPORTED_CHAINS } from '../constants/hinkal-supported-chains';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs';
import { HinkalFacadeService } from './hinkal-sdk/hinkal-facade.service';

@Injectable()
export class HinkalToPrivateAssetsService extends PrivateAssetsService {
  constructor(
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly hinkalFacade: HinkalFacadeService
  ) {
    super('to', HINKAL_SUPPORTED_CHAINS);

    this.assetListType$
      .pipe(takeUntil(this.destroy$))
      .subscribe(asset => this.hinkalFacade.switchChain(asset));
  }
}
