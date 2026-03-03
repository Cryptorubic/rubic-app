import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { PrivacycashPrivateAssetsService } from '../../services/common/assets-services/privacycash-private-assets.service';
import { PrivacycashPrivateTokensFacadeService } from '../../services/common/token-facades/privacycash-private-tokens-facade.service';
import { TokenAmount } from '@cryptorubic/core';
import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { toPrivacyCashTokenAddr } from '../../utils/converter';
import { PublicKey } from '@solana/web3.js';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';

@Component({
  selector: 'app-privacycash-reveal-page',
  templateUrl: './privacycash-reveal-page.component.html',
  styleUrls: ['./privacycash-reveal-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: FromAssetsService, useClass: PrivacycashPrivateAssetsService },
    { provide: TokensFacadeService, useClass: PrivacycashPrivateTokensFacadeService }
  ]
})
export class PrivacycashRevealPageComponent {
  private readonly privacycashSwapService = inject(PrivacycashSwapService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly targetNetworkAddressService = inject(TargetNetworkAddressService);

  public async reveal({
    token,
    loadingCallback
  }: {
    token: TokenAmount;
    loadingCallback: () => void;
  }): Promise<void> {
    try {
      const senderPK = new PublicKey(this.walletConnectorService.address);
      const recipientPK = new PublicKey(this.targetNetworkAddressService.address);
      await this.privacycashSwapService.makePartialWithdraw(
        toPrivacyCashTokenAddr(token.address),
        token.weiAmount.toNumber(),
        senderPK,
        recipientPK
      );
    } finally {
      loadingCallback();
    }
  }
}
