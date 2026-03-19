import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PrivacycashRefundService } from '../../services/privacy-cash-revert.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { firstValueFrom } from 'rxjs';
import { PrivateTransferFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { PrivacycashPrivateAssetsService } from '../../services/common/assets-services/privacycash-private-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { EphemeralWalletTokensFacadeService } from '../../services/common/token-facades/ephemeral-wallet-tokens-facade.service';
import { FormControl } from '@angular/forms';
import { Token } from '@cryptorubic/core';

@Component({
  selector: 'app-privacycash-refund-page',
  templateUrl: './privacycash-refund-page.component.html',
  styleUrls: ['./privacycash-refund-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: PrivacycashPrivateAssetsService },
    { provide: TokensFacadeService, useClass: EphemeralWalletTokensFacadeService }
  ]
})
export class PrivacycashRefundPageComponent {
  private readonly privacycashRefundService = inject(PrivacycashRefundService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  public readonly receiverCtrl = new FormControl<string>('');

  public readonly refundFormCreationConfig: PrivateTransferFormConfig = {
    withActionButton: true,
    withReceiver: true,
    withSrcAmount: false,
    buttonText: 'Refund Tokens',
    withMaxBtn: false
  };

  public async refund({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const dstTokenAmountWei = await this.privacycashRefundService.quoteRefundableAmount(
        token.address
      );
      const dstTokenAmount = Token.fromWei(dstTokenAmountWei, token.decimals).dp(4).toFixed();
      const receiverAddr = this.receiverCtrl.value
        ? this.receiverCtrl.value
        : this.walletConnectorService.address;

      const preview$ = openPreview({
        steps: [
          {
            label: 'Refund tokens',
            action: () => this.privacycashRefundService.refundTokens(token.address, receiverAddr)
          }
        ],
        swapType: 'refund',
        srcTokenAmount: dstTokenAmount,
        dstTokenAmount
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
