import { Injectable, Self } from '@angular/core';
import { PrivateAssetsService } from '../../shared-privacy-providers/services/private-assets/private-assets.service';
import { HINKAL_SUPPORTED_CHAINS } from '../constants/hinkal-supported-chains';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { HinkalFacadeService } from './hinkal-sdk/hinkal-facade.service';
import { takeUntil } from 'rxjs';

@Injectable()
export class HinkalPrivateAssetsService extends PrivateAssetsService {
  constructor(
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly hinkalFacade: HinkalFacadeService
  ) {
    super('from', HINKAL_SUPPORTED_CHAINS);

    this.assetListType$
      .pipe(takeUntil(this.destroy$))
      .subscribe(asset => this.hinkalFacade.switchChain(asset));
  }
}
