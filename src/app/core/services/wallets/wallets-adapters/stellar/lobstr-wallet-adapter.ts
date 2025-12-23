import {
  LOBSTR_ID,
  LobstrModule,
  StellarWalletsKit,
  WalletNetwork
} from '@creit.tech/stellar-wallets-kit';
import { CommonStellarWalletAdapter } from './common/common-stellar-wallet-adapter';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { StoreService } from '@app/core/services/store/store.service';
import { SignRejectError } from '@app/core/errors/models/provider/sign-reject-error';
import { WalletNotInstalledError } from '@app/core/errors/models/provider/wallet-not-installed-error';

export class LobstrWalletAdapter extends CommonStellarWalletAdapter {
  protected readonly walletId = LOBSTR_ID;

  protected readonly walletModule = new LobstrModule();

  public walletName = WALLET_NAME.LOBSTR;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    private readonly storeService: StoreService
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  public async activate(): Promise<void> {
    const savedWalletAddress = this.storeService.getItem('LOBSTR_WALLET_ADDRESS');
    const wallet = new StellarWalletsKit({
      network: WalletNetwork.PUBLIC,
      selectedWalletId: this.walletId,
      modules: [this.walletModule]
    });

    try {
      if (savedWalletAddress) {
        wallet.setWallet(this.walletId);
        this.selectedAddress = savedWalletAddress;
      } else {
        const { address } = await wallet.getAddress();
        this.selectedAddress = address;
        this.storeService.setItem('LOBSTR_WALLET_ADDRESS', address);
      }

      this.selectedChain = BLOCKCHAIN_NAME.STELLAR;
      this.isEnabled = true;
      this.wallet = wallet;

      this.onNetworkChanges$.next(this.selectedChain);
      this.onAddressChanges$.next(this.selectedAddress);
    } catch (err) {
      if (err.message?.toLowerCase()?.includes('user declined access')) {
        throw new SignRejectError();
      }
      if (err?.message?.toLowerCase()?.includes('is not connected')) {
        throw new WalletNotInstalledError();
      }

      throw err;
    }
  }

  public deactivate(): void {
    this.storeService.deleteItem('LOBSTR_WALLET_ADDRESS');
    super.deactivate();
  }
}
