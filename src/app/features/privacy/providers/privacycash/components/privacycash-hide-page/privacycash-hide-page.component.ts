import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivacycashPublicTokensFacadeService } from '../../services/common/token-facades/privacycash-public-tokens-facade.service';
import { PrivacycashPublicAssetsService } from '../../services/common/assets-services/privacycash-public-assets.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { firstValueFrom } from 'rxjs';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';

@Component({
  selector: 'app-privacycash-hide-page',
  templateUrl: './privacycash-hide-page.component.html',
  styleUrls: ['./privacycash-hide-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: FromAssetsService, useClass: PrivacycashPublicAssetsService },
    { provide: TokensFacadeService, useClass: PrivacycashPublicTokensFacadeService }
  ]
})
export class PrivacycashHidePageComponent {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  private readonly targetNetworkAddressService = inject(TargetNetworkAddressService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  constructor() {}

  public async hide({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const receiverAddr = this.targetNetworkAddressService.address
        ? this.targetNetworkAddressService.address
        : this.walletConnectorService.address;
      const preview$ = openPreview({
        steps: [
          {
            label: 'Hide Tokens',
            action: () => this.privacycashSwapService.shield(token, receiverAddr)
          }
        ]
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
