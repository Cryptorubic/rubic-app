import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { NgZone } from '@angular/core';
import { BlockchainName, BlockchainsInfo, EvmBlockchainName } from '@cryptorubic/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { RubicError } from '@core/errors/models/rubic-error';
import { WalletNotInstalledError } from '@app/core/errors/models/provider/wallet-not-installed-error';
import CustomError from '@app/core/errors/models/custom-error';
import { AddressChangedMsg } from '../../models/events';

// @TODO_530 add this wallet to new wallet modal
export class PhantomWalletAdapter extends EvmWalletAdapter {
  public walletNameUI = 'Phantom';

  public readonly walletName = WALLET_NAME.PHANTOM;

  constructor(
    onAddressChanges$: BehaviorSubject<AddressChangedMsg>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  private checkErrors(): void {
    if (!this.wallet || !this.wallet?.isPhantom) {
      throw new WalletNotInstalledError();
    }
  }

  public async activate(): Promise<void> {
    try {
      const provider = await this.getProvider({
        provider: 'phantom'
      });

      if (!provider) {
        throw new WalletNotInstalledError();
      }

      this.wallet = provider;

      const accounts = (await this.wallet.request({
        method: 'eth_requestAccounts'
      })) as RubicAny;
      this.checkErrors();

      const chain = await this.wallet.request({ method: 'eth_chainId' });
      this.isEnabled = true;

      [this.selectedAddress] = accounts;
      this.selectedChain =
        (BlockchainsInfo.getBlockchainNameById(chain) as EvmBlockchainName) ?? null;
      this.onAddressChanges$.next({
        address: this.selectedAddress,
        walletName: this.walletName,
        chainType: this.chainType
      });
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

      if (error instanceof RubicError) {
        throw error;
      }

      throw new CustomError(error?.message);
    }
  }
}
