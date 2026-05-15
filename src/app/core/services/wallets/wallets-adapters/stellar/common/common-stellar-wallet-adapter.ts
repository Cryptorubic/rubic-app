import { BehaviorSubject } from 'rxjs';
import { CommonWalletAdapter } from '../../common-wallet-adapter';
import { BLOCKCHAIN_NAME, BlockchainName, CHAIN_TYPE } from '@cryptorubic/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { ModuleInterface, StellarWalletsKit, WalletNetwork } from '@creit.tech/stellar-wallets-kit';
import { StellarWallet } from '../models/stellar-wallet';
import { SignRejectError } from '@app/core/errors/models/provider/sign-reject-error';
import { WalletNotInstalledError } from '@app/core/errors/models/provider/wallet-not-installed-error';
import { waitFor } from '@cryptorubic/web3';

export abstract class CommonStellarWalletAdapter extends CommonWalletAdapter<StellarWallet> {
  public chainType = CHAIN_TYPE.STELLAR;

  protected abstract walletId: string;

  protected abstract walletModule: ModuleInterface;

  protected needDelayAfterModuleInit: boolean = false;

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
    const wallet = new StellarWalletsKit({
      network: WalletNetwork.PUBLIC,
      selectedWalletId: this.walletId,
      modules: [this.walletModule]
    });

    try {
      // some modules have async init
      if (this.needDelayAfterModuleInit) await waitFor(500);

      const { address } = await wallet.getAddress();

      this.selectedChain = BLOCKCHAIN_NAME.STELLAR;
      this.selectedAddress = address;
      this.isEnabled = true;
      this.wallet = wallet;

      this.handleEvents();

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

  protected handleEvents(): void {}

  public deactivate(): void {
    this.wallet?.disconnect();
    super.deactivate();
  }
}
