import { ApplicationRef, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProviderConnectorService } from '../blockchain/provider-connector/provider-connector.service';
import { WALLET_NAME } from '../../header/components/header/components/wallets-modal/models/providers';

declare global {
  interface Window {
    useTestingMode: () => Promise<void>;
  }
}

@Injectable({
  providedIn: 'root'
})
export class UseTestingModeService {
  public isTestingMode = new BehaviorSubject(false);

  constructor(
    private readonly providerService: ProviderConnectorService,
    private zone: NgZone,
    private appRef: ApplicationRef
  ) {
    window.useTestingMode = async () => {
      if (!this.isTestingMode.getValue()) {
        if (this.providerService.provider.name === WALLET_NAME.WALLET_LINK) {
          await this.providerService.connectProvider(WALLET_NAME.WALLET_LINK, 42);
          await this.providerService.activate();
        }
        this.isTestingMode.next(true);
      }
      this.zone.run(() => {
        setTimeout(() => this.appRef.tick(), 1000);
      });
    };
  }
}
