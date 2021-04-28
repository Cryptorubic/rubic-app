import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WALLET_NAME } from '../../header/components/header/components/wallets-modal/wallets-modal.component';
import { ProviderConnectorService } from '../blockchain/provider-connector/provider-connector.service';

@Injectable({
  providedIn: 'root'
})
export class UseTestingModeService {
  public isTestingMode = new BehaviorSubject(false);

  constructor(private readonly providerService: ProviderConnectorService) {
    window['useTestingMode'] = async () => {
      if (!this.isTestingMode.getValue()) {
        if (localStorage.getItem('provider') === WALLET_NAME.WALLET_LINK) {
          await this.providerService.connectProvider(WALLET_NAME.WALLET_LINK, 42);
          await this.providerService.activate();
        }
        this.isTestingMode.next(true);
      }
    };
  }
}
