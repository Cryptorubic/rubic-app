import { inject, Injectable } from '@angular/core';
import { PrivateAssetsService } from '../providers/shared-privacy-providers/services/private-assets/private-assets.service';
import { PRIVATE_MODE_SUPPORTED_CHAINS } from '../constants/private-mode-supported-chains';
import { PrivacyMainPageService } from './privacy-main-page.service';
import { PRIVATE_MODE_TAB } from '../constants/private-mode-tab';
import { combineLatest, tap } from 'rxjs';

@Injectable()
export class PrivacyMainPageToPrivateAssetsService extends PrivateAssetsService {
  private readonly privacyMainPageService = inject(PrivacyMainPageService);

  constructor() {
    super('to', PRIVATE_MODE_SUPPORTED_CHAINS[PRIVATE_MODE_TAB.ON_CHAIN]);
    this.subscribeOnMainPageState();
  }

  subscribeOnMainPageState(): void {
    combineLatest([this.privacyMainPageService.swapInfo$, this.privacyMainPageService.selectedTab$])
      .pipe(
        tap(([swapInfo, tab]) => {
          if (tab === PRIVATE_MODE_TAB.ON_CHAIN && swapInfo.fromAsset) {
            this.setBlockchainList([swapInfo.fromAsset.blockchain]);
          } else {
            this.setBlockchainList(PRIVATE_MODE_SUPPORTED_CHAINS[tab]);
          }
        })
      )
      .subscribe();
  }
}
