import { inject, Injectable, Injector } from '@angular/core';
import { ModalService } from '@core/modals/services/modal.service';
import { Observable } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { AssetsSelectorConfig } from '@app/features/trade/components/assets-selector/models/assets-selector-layout';
import { Zkp2pTokensSelectorComponent } from '../components/zkp2p-tokens-selector/zkp2p-tokens-selector.component';

@Injectable()
export class Zkp2pService {
  private readonly modalService = inject(ModalService);

  private readonly defaultSelectorConfig: AssetsSelectorConfig = {
    withChainsFilter: false,
    withTokensFilter: false,
    withFavoriteTokens: true,
    showAllChains: false
  };

  public openTokensModal(
    injector: Injector,
    direction: 'from' | 'to',
    assetsSelectorConfig: AssetsSelectorConfig = this.defaultSelectorConfig
  ): Observable<BalanceToken> {
    return this.modalService.showDialog(
      Zkp2pTokensSelectorComponent,
      {
        title: '',
        size: 'l',
        showMobileMenu: true,
        data: {
          formType: direction,
          assetsSelectorConfig
        },
        fitContent: true
      },
      injector
    );
  }
}
