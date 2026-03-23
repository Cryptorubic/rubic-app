import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PrivacycashRefundService } from '../../services/privacy-cash-revert.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { firstValueFrom } from 'rxjs';
import { PrivateTransferFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { PrivacycashPrivateAssetsService } from '../../services/common/assets-services/privacycash-private-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { EphemeralWalletTokensFacadeService } from '../../services/common/token-facades/ephemeral-wallet-tokens-facade.service';
import { FormControl } from '@angular/forms';
import { Token } from '@cryptorubic/core';
import { PrivateTransferWindowService } from '../../../shared-privacy-providers/services/private-transfer-window/private-transfer-window.service';
import { PrivateRefundWindowService } from '../../../shared-privacy-providers/services/private-refund-window/private-refund-window.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { EPHEMERAL_WALLET_GAS_AMOUNT } from '../../constants/privacycash-consts';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';

@Component({
  selector: 'app-privacycash-refund-page',
  templateUrl: './privacycash-refund-page.component.html',
  styleUrls: ['./privacycash-refund-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: FromAssetsService, useClass: PrivacycashPrivateAssetsService },
    { provide: TokensFacadeService, useClass: EphemeralWalletTokensFacadeService },
    { provide: PrivateTransferWindowService, useExisting: PrivateRefundWindowService }
  ]
})
export class PrivacycashRefundPageComponent {
  private readonly privacycashRefundService = inject(PrivacycashRefundService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly notificationsService = inject(NotificationsService);

  public readonly receiverCtrl = new FormControl<string>('');

  public readonly refundFormCreationConfig: PrivateTransferFormConfig = {
    withActionButton: true,
    withReceiver: false,
    withSrcAmount: false,
    buttonText: 'Refund Tokens',
    withMaxBtn: false
  };

  public async refund({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const dstTokenAmountWei = await this.privacycashRefundService.quoteRefundableAmount(
        token.address
      );
      const dstTokenAmount = Token.fromWei(dstTokenAmountWei, token.decimals).dp(4);

      if (!token.isNative && dstTokenAmount.isZero()) {
        this.notificationsService.showWarning('Nothing to refund.');
        return;
      }
      if (token.isNative && dstTokenAmount.lt(EPHEMERAL_WALLET_GAS_AMOUNT)) {
        this.notificationsService.showWarning('Withdrawal failed: 0.0033 SOL is required for gas.');
        return;
      }

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
        srcTokenAmount: dstTokenAmount.toFixed(),
        dstTokenAmount: dstTokenAmount.toFixed()
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
