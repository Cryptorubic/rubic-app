import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';
import { firstValueFrom } from 'rxjs';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { PrivacycashPrivateAssetsService } from '../../services/common/assets-services/privacycash-private-assets.service';
import { PrivacycashPrivateTokensFacadeService } from '../../services/common/token-facades/privacycash-private-tokens-facade.service';
import { TokenAmount } from '@cryptorubic/core';
import { toPrivacyCashTokenAddr } from '../../utils/converter';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';

@Component({
  selector: 'app-privacycash-transfer-page',
  templateUrl: './privacycash-transfer-page.component.html',
  styleUrls: ['./privacycash-transfer-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: PrivacycashPrivateAssetsService },
    { provide: TokensFacadeService, useClass: PrivacycashPrivateTokensFacadeService }
  ]
})
export class PrivacycashTransferPageComponent {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  public readonly receiverCtrl = new FormControl<string>('');

  public async transfer({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const pcSupportedToken = new TokenAmount({
        ...token.asStructWithAmount,
        address: toPrivacyCashTokenAddr(token.address)
      });
      const dstToken = await this.privacycashSwapService.quote(
        pcSupportedToken,
        pcSupportedToken,
        token.tokenAmount
      );
      const receiverAddr = this.receiverCtrl.value
        ? this.receiverCtrl.value
        : this.walletConnectorService.address;

      const preview$ = openPreview({
        steps: [
          {
            label: 'Transfer tokens',
            action: () => this.privacycashSwapService.transfer(token, receiverAddr)
          }
        ],
        dstTokenAmount: dstToken.tokenAmount.toFixed(),
        swapTime: '1 min'
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
