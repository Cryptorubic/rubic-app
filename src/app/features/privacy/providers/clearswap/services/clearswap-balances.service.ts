import { inject, Injectable } from '@angular/core';
import { TokensBalanceService } from '@app/core/services/tokens/tokens-balance.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { PRIVATE_MODE_SUPPORTED_TOKENS } from '@app/features/privacy/constants/private-mode-supported-tokens';
import { BLOCKCHAIN_NAME, CHAIN_TYPE } from '@cryptorubic/core';
import { filter, map } from 'rxjs';

@Injectable()
export class ClearswapBalancesService {
  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly tokensBalanceService = inject(TokensBalanceService);

  public subscribeOnWallet(): void {
    this.walletConnectorService.activeWallets$
      .pipe(
        filter(activeWallets => activeWallets.some(wallet => wallet.chainType === CHAIN_TYPE.TRON)),
        map(() =>
          this.walletConnectorService.getActiveProvider({
            chainType: CHAIN_TYPE.TRON
          })
        )
      )
      .subscribe(() => {
        Promise.all(
          PRIVATE_MODE_SUPPORTED_TOKENS[BLOCKCHAIN_NAME.TRON].map(tokenAddress => {
            return this.tokensBalanceService.getAndUpdateTokenBalance(
              { address: tokenAddress, blockchain: BLOCKCHAIN_NAME.TRON },
              20
            );
          })
        );
      });
  }
}
