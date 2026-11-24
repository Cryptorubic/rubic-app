import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { CommonBitcoinWalletAdapter } from './common/common-btc-wallet-adapter';
import { BtcWallet } from '@cryptorubic/web3';
import { BehaviorSubject } from 'rxjs';
import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { AddressPurpose, request } from 'sats-connect';
import { WalletNotInstalledError } from '@app/core/errors/models/provider/wallet-not-installed-error';
import { SignRejectError } from '@app/core/errors/models/provider/sign-reject-error';
import { XverseBtcWallet } from './xverse-btc-wallet';

export class XverseWalletAdapter extends CommonBitcoinWalletAdapter<BtcWallet> {
  public readonly walletName = WALLET_NAME.XVERSE;

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
    try {
      const response = await request('wallet_connect', null);
      if (response.status === 'error') throw response.error;

      const paymentAddressItem = response.result.addresses.find(
        address => address.purpose === AddressPurpose.Payment
      );
      if (!paymentAddressItem) throw new WalletNotInstalledError();

      this.wallet = new XverseBtcWallet(paymentAddressItem.publicKey);
      this.selectedAddress = paymentAddressItem.address;
      this.selectedChain = BLOCKCHAIN_NAME.BITCOIN;
      this.isEnabled = true;

      this.onNetworkChanges$.next(this.selectedChain);
      this.onAddressChanges$.next(this.selectedAddress);

      this.wallet.on('accountsChanged', (userAddress: string) => {
        this.selectedAddress = userAddress;
        this.onAddressChanges$.next(this.selectedAddress);
      });
    } catch (error) {
      if (error.code === -32000) {
        throw new SignRejectError();
      }
      throw error;
    }
  }

  public override deactivate(): void {
    this.wallet.off('accountsChanged');
    super.deactivate();
  }
}
