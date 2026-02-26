import { inject, Injectable, Injector } from '@angular/core';
import { ModalService } from '@core/modals/services/modal.service';
import { Observable } from 'rxjs';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { PublicTokensSelectorComponent } from '@features/privacy/providers/shared-privacy-providers/components/public-tokens-selector/public-tokens-selector.component';
import { PrivateTokensSelectorComponent } from '@features/privacy/providers/shared-privacy-providers/components/private-tokens-selector/private-tokens-selector.component';

@Injectable({
  providedIn: 'root'
})
export class PrivateModalsService {
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

  public openPrivateTokensModal(injector: Injector): Observable<BalanceToken> {
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
