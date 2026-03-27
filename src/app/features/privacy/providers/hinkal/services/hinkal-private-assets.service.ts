import { Injectable, Self } from '@angular/core';
import { PrivateAssetsService } from '../../shared-privacy-providers/services/private-assets/private-assets.service';
import { HINKAL_SUPPORTED_CHAINS } from '../constants/hinkal-supported-chains';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { HinkalFacadeService } from './hinkal-sdk/hinkal-facade.service';
import { combineLatestWith, takeUntil } from 'rxjs';
import { PrivateSwapWindowService } from '../../shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import { PrivatePageTypeService } from '../../shared-privacy-providers/services/private-page-type/private-page-type.service';

@Injectable()
export class HinkalPrivateAssetsService extends PrivateAssetsService {
  constructor(
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly hinkalFacade: HinkalFacadeService,
    private readonly privatePageType: PrivatePageTypeService,
    private readonly swapWindowService: PrivateSwapWindowService
  ) {
    super('from', HINKAL_SUPPORTED_CHAINS);

    this.assetListType$
      .pipe(takeUntil(this.destroy$))
      .subscribe(asset => this.hinkalFacade.switchChain(asset));

    this.swapWindowService.swapInfo$
      .pipe(combineLatestWith(this.privatePageType.activePage$), takeUntil(this.destroy$))
      .subscribe(([swapInfo, pageType]) => {
        if (swapInfo.toAsset?.blockchain && pageType.type === 'swap') {
          this.setBlockchainList([swapInfo.toAsset?.blockchain]);
        } else {
          this.setBlockchainList(HINKAL_SUPPORTED_CHAINS);
        }
      });
  }
}
