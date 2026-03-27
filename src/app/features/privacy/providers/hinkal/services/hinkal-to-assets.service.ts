import { Injectable, Self } from '@angular/core';
import { PrivateAssetsService } from '../../shared-privacy-providers/services/private-assets/private-assets.service';
import { HINKAL_SUPPORTED_CHAINS } from '../constants/hinkal-supported-chains';
import { PrivateSwapWindowService } from '../../shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs';

@Injectable()
export class HinkalToPrivateAssetsService extends PrivateAssetsService {
  constructor(
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly swapWindowService: PrivateSwapWindowService
  ) {
    super('to', HINKAL_SUPPORTED_CHAINS);
    this.swapWindowService.swapInfo$.pipe(takeUntil(this.destroy$)).subscribe(swapInfo => {
      if (swapInfo.fromAsset?.blockchain) {
        this.setBlockchainList([swapInfo.fromAsset?.blockchain]);
      } else {
        this.setBlockchainList(HINKAL_SUPPORTED_CHAINS);
      }
    });
  }
}
