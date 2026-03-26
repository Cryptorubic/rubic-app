import { inject, Injectable } from '@angular/core';
import { PrivateAssetsService } from '../providers/shared-privacy-providers/services/private-assets/private-assets.service';
import { PRIVATE_MODE_SUPPORTED_CHAINS } from '../constants/private-mode-supported-chains';
import { PRIVATE_MODE_TAB } from '../constants/private-mode-tab';
import { PrivacyMainPageService } from './privacy-main-page.service';
import { tap } from 'rxjs';

@Injectable()
export class PrivacyMainPageFromPrivateAssetsService extends PrivateAssetsService {
  private readonly privacyMainPageService = inject(PrivacyMainPageService);

  constructor() {
    super('from', PRIVATE_MODE_SUPPORTED_CHAINS[PRIVATE_MODE_TAB.ON_CHAIN]);
    this.subscribeOnMainPageState();
  }

  subscribeOnMainPageState(): void {
    this.privacyMainPageService.selectedTab$
      .pipe(
        tap(tab => {
          this.setBlockchainList(PRIVATE_MODE_SUPPORTED_CHAINS[tab]);
        })
      )
      .subscribe();
  }
}
