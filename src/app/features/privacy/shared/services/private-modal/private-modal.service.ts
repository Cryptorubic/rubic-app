import { PublicTokensSelectorComponent } from '@features/privacy/shared/components/public-tokens-selector/public-tokens-selector.component';
import { ModalService } from '@core/modals/services/modal.service';
import { inject, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { BlockchainName } from '@cryptorubic/core';
import { PrivateTokensSelectorComponent } from '@features/privacy/shared/components/private-tokens-selector/private-tokens-selector.component';

export class PrivateModalService {
  private readonly modalService = inject(ModalService);

  constructor() {}

  public openPublicTokensModal(injector: Injector): Observable<BalanceToken> {
    return this.modalService.showDialog(
      PublicTokensSelectorComponent,
      {
        title: '',
        size: 'l',
        showMobileMenu: true,
        data: {
          formType: 'from'
        },
        fitContent: true
      },
      injector
    );
  }

  public openPrivateTokensModal(
    injector: Injector,
    _tokensWithBalance: Partial<Record<BlockchainName, BalanceToken[]>>
  ): Observable<BalanceToken> {
    return this.modalService.showDialog(
      PrivateTokensSelectorComponent,
      {
        title: '',
        size: 'l',
        showMobileMenu: true,
        data: {
          formType: 'to'
        },
        fitContent: true
      },
      injector
    );
  }
}
