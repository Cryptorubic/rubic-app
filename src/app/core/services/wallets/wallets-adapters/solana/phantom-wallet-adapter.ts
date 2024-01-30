import { CommonSolanaWalletAdapter } from '@core/services/wallets/wallets-adapters/solana/common/common-solana-wallet-adapter';
import { PhantomWallet } from '@core/services/wallets/wallets-adapters/solana/models/solana-wallet-types';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { Connection, PublicKey } from '@solana/web3.js';
import { ErrorsService } from '@core/errors/errors.service';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import CustomError from '@core/errors/models/custom-error';
import { WalletNotInstalledError } from '@core/errors/models/provider/wallet-not-installed-error';

export class PhantomWalletAdapter extends CommonSolanaWalletAdapter<PhantomWallet> {
  public get walletName(): WALLET_NAME {
    return WALLET_NAME.PHANTOM;
  }

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    connection: Connection
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window, connection);
  }

  public async activate(): Promise<void> {
    const wallet = typeof window !== 'undefined' && window.solana;
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

  private async handleDisconnect(wallet: PhantomWallet): Promise<void> {
    // HACK: Phantom doesn't reject or emit an event if the popup is closed
    const handleDisconnect = wallet._handleDisconnect;
    try {
      await new Promise<void>((resolve, reject) => {
        const connect = () => {
          wallet.off('connect', connect);
          resolve();
        };

        wallet._handleDisconnect = (...args: unknown[]) => {
          wallet.off('connect', connect);
          reject(new CustomError('User close modal'));
          return handleDisconnect.apply(wallet, args);
        };

        wallet.on('connect', connect);

        wallet.connect().catch((reason: unknown) => {
          wallet.off('connect', connect);
          reject(reason);
        });
      });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CustomError(error?.message);
      }
    } finally {
      wallet._handleDisconnect = handleDisconnect;
    }
  }

  private async checkErrors(wallet: PhantomWallet): Promise<void> {
    if (!wallet) {
      throw new WalletNotInstalledError();
    }
    if (!wallet.isPhantom) {
      throw new CustomError('Phantom is not installed');
    }

    if (!wallet.isConnected) {
      await this.handleDisconnect(wallet);
    }

    if (!wallet.publicKey) {
      throw new CustomError('Connection error');
    }
  }
}
