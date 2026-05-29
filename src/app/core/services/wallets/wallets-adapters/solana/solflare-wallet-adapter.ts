import { CommonSolanaWalletAdapter } from '@core/services/wallets/wallets-adapters/solana/common/common-solana-wallet-adapter';
import { SolflareWallet } from '@core/services/wallets/wallets-adapters/solana/models/solana-wallet-types';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { PublicKey } from '@solana/web3.js';
import { ErrorsService } from '@core/errors/errors.service';
import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import CustomError from '@core/errors/models/custom-error';
import { WalletNotInstalledError } from '@core/errors/models/provider/wallet-not-installed-error';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';

export class SolflareWalletAdapter extends CommonSolanaWalletAdapter<SolflareWallet> {
  public get walletName(): WALLET_NAME {
    return WALLET_NAME.SOLFLARE;
  }

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
    const wallet = typeof window !== 'undefined' && window.solflare;
    await this.checkErrors(wallet);
    const publicKey = new PublicKey(wallet.publicKey.toBytes());
    this.isEnabled = true;
    wallet.on('disconnect', this.deactivate);

    this.wallet = wallet;
    this.selectedAddress = publicKey.toBase58();
    this.selectedChain = BLOCKCHAIN_NAME.SOLANA;

    this.onNetworkChanges$.next(this.selectedChain);
    this.onAddressChanges$.next(this.selectedAddress);
  }

  private async checkErrors(wallet: SolflareWallet): Promise<void> {
    if (!wallet) {
      throw new WalletNotInstalledError();
    }
    if (!wallet.isSolflare) {
      throw new CustomError('Solflare is not installed');
    }

    if (!wallet.isConnected) {
      try {
        await wallet.connect();
      } catch (error: unknown) {
        throw new SignRejectError();
      }
    }

    // HACK: Solflare doesn't reject its promise if the popup is closed.
    if (!wallet.publicKey) {
      throw new CustomError('Connection error');
    }
  }
}
