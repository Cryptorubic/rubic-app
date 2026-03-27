import { inject, Injectable, Injector } from '@angular/core';
import { ModalService } from '@core/modals/services/modal.service';
import { Observable } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { PublicTokensSelectorComponent } from '@features/privacy/providers/shared-privacy-providers/components/public-tokens-selector/public-tokens-selector.component';
import { PrivateTokensSelectorComponent } from '@features/privacy/providers/shared-privacy-providers/components/private-tokens-selector/private-tokens-selector.component';
import { PrivatePreviewSwapComponent } from '../../components/private-preview-swap/private-preview-swap.component';
import { PreviewPrivateSwapOptions } from '../../components/private-preview-swap/models/preview-swap-options';
import { AssetsSelectorConfig } from '@app/features/trade/components/assets-selector/models/assets-selector-layout';

@Injectable({
  providedIn: 'root'
})
export class PrivateModalsService {
  private readonly modalService = inject(ModalService);

  private readonly defaultSelectorConfig: AssetsSelectorConfig = {
    withChainsFilter: false,
    withTokensFilter: false,
    withFavoriteTokens: true,
    showAllChains: false
  };

  public openPublicTokensModal(
    injector: Injector,
    direction: 'from' | 'to' = 'from',
    assetsSelectorConfig: AssetsSelectorConfig = this.defaultSelectorConfig
  ): Observable<BalanceToken> {
    return this.modalService.showDialog(
      PublicTokensSelectorComponent,
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

  public openPrivateTokensModal(
    injector: Injector,
    direction: 'from' | 'to',
    assetsSelectorConfig: AssetsSelectorConfig = this.defaultSelectorConfig
  ): Observable<BalanceToken> {
    return this.modalService.showDialog(
      PrivateTokensSelectorComponent,
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

  public openPrivatePreviewSwap(
    injector: Injector,
    options: PreviewPrivateSwapOptions
  ): Observable<void> {
    return this.modalService.showDialog(
      PrivatePreviewSwapComponent,
      {
        size: 's',
        fitContent: true,
        closeable: false,
        dismissible: false,
        data: options
      },
      injector
    );
  }
}
