import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TokenAmount } from '@cryptorubic/core';
import { PrivacycashSwapService } from '../../services/privacy-cash-swap.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { toPrivacyCashTokenAddr } from '../../utils/converter';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { SolanaWallet } from '@app/core/services/wallets/wallets-adapters/solana/models/solana-wallet-types';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivacycashPublicTokensFacadeService } from '../../services/common/token-facades/privacycash-public-tokens-facade.service';
import { PrivacycashPublicAssetsService } from '../../services/common/assets-services/privacycash-public-assets.service';

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

  private readonly walletConnectorService = inject(WalletConnectorService);

  constructor() {}

  public async hide({
    token,
    loadingCallback
  }: {
    token: TokenAmount;
    loadingCallback: () => void;
  }): Promise<void> {
    try {
      const userPK = new PublicKey(this.walletConnectorService.address);
      const wallet: SolanaWallet = this.walletConnectorService.provider.wallet;
      await this.privacycashSwapService.makeDeposit(
        toPrivacyCashTokenAddr(token.address),
        token.weiAmount.toNumber(),
        userPK,
        async (tx: VersionedTransaction) => {
          return await wallet.signTransaction(tx);
        }
      );
    } finally {
      loadingCallback();
    }
  }
}
