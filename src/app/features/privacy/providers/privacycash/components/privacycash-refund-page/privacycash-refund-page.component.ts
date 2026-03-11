import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PrivacycashRefundService } from '../../services/privacy-cash-revert.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
import { firstValueFrom } from 'rxjs';
import { PrivateTransferFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';

@Component({
  selector: 'app-privacycash-refund-page',
  templateUrl: './privacycash-refund-page.component.html',
  styleUrls: ['./privacycash-refund-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacycashRefundPageComponent {
  public readonly refundFormCreationConfig: PrivateTransferFormConfig = {
    withActionButton: true,
    withReceiver: false,
    withSrcAmount: false,
    buttonText: 'Refund Tokens'
  };

  private readonly privacycashRefundService = inject(PrivacycashRefundService);

  private readonly targetNetworkAddressService = inject(TargetNetworkAddressService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  public async refund({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const receiverAddr = this.targetNetworkAddressService.address
        ? this.targetNetworkAddressService.address
        : this.walletConnectorService.address;
      const preview$ = openPreview({
        steps: [
          {
            label: 'Refund tokens',
            action: () => this.privacycashRefundService.refundTokens(token.address, receiverAddr)
          }
        ]
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
