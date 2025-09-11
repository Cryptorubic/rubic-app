import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { BlockchainName, BlockchainsInfo, EvmBlockchainName } from '@cryptorubic/sdk';
import { ErrorsService } from '@core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { TokenPocketError } from '@core/errors/models/provider/token-pocket-error';

export class TokenPocketWalletAdapter extends EvmWalletAdapter {
  public readonly walletName = WALLET_NAME.TOKEN_POCKET;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  public async activate(): Promise<void> {
    if (typeof this.window.tokenpocket.ethereum?.isTokenPocket === 'undefined') {
      throw new TokenPocketError();
    }

    try {
      const accounts = (await this.window.tokenpocket.ethereum?.request({
        method: 'eth_requestAccounts'
      })) as RubicAny;

      this.wallet = this.window.ethereum;

      const chain = await this.wallet.request({ method: 'eth_chainId' });
      this.isEnabled = true;

      [this.selectedAddress] = accounts;
      this.selectedChain =
        (BlockchainsInfo.getBlockchainNameById(chain) as EvmBlockchainName) ?? null;
      this.onAddressChanges$.next(this.selectedAddress);
      this.onNetworkChanges$.next(this.selectedChain);

      this.initSubscriptionsOnChanges();
    } catch {
      throw new TokenPocketError();
    }
  }
}
