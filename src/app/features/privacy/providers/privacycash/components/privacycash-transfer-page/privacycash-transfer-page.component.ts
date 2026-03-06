import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';

@Component({
  selector: 'app-privacycash-transfer-page',
  templateUrl: './privacycash-transfer-page.component.html',
  styleUrls: ['./privacycash-transfer-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacycashTransferPageComponent {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  private readonly targetNetworkAddressService = inject(TargetNetworkAddressService);

  public async transfer({ token, loadingCallback }: PrivateEvent): Promise<void> {
    try {
      const receiverAddr = this.targetNetworkAddressService.address;
      await this.privacycashSwapService.transfer(token, receiverAddr);
    } finally {
      loadingCallback();
    }
  }
}
