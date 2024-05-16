import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { BlockchainName, BlockchainsInfo, EvmBlockchainName } from 'rubic-sdk';
import { ErrorsService } from '@core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
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
    if (typeof this.window.ethereum?.isTokenPocket === 'undefined') {
      throw new TokenPocketError();
    }

    try {
      const accounts = (await this.window.ethereum?.request({
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
    } catch (error) {
      if (
        error.code === 4001 ||
        // metamask browser
        error.message?.toLowerCase().includes('user denied message signature')
      ) {
        throw new SignRejectError();
      }
      throw new TokenPocketError();
    }
  }
}
