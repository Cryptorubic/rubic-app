import { CommonSolanaWalletAdapter } from '@core/services/wallets/wallets-adapters/solana/common/common-solana-wallet-adapter';
import { PhantomWallet } from '@core/services/wallets/wallets-adapters/solana/models/solana-wallet-types';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { PublicKey } from '@solana/web3.js';
import { ErrorsService } from '@core/errors/errors.service';
import { BLOCKCHAIN_NAME, BlockchainName, BlockchainsInfo, EvmBlockchainName } from 'rubic-sdk';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import CustomError from '@core/errors/models/custom-error';
import { WalletNotInstalledError } from '@core/errors/models/provider/wallet-not-installed-error';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { NeedDisableCtrlWalletError } from '@app/core/errors/models/provider/ctrl-wallet-enabled-error';

export class PhantomWalletAdapter extends CommonSolanaWalletAdapter<PhantomWallet> {
  public get walletName(): WALLET_NAME {
    return WALLET_NAME.PHANTOM;
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
    const wallet = typeof this.window !== 'undefined' && this.window.solana;
    await this.checkErrors(wallet);
    const publicKey = new PublicKey(wallet.publicKey.toBytes());
    this.isEnabled = true;

    this.wallet = wallet;
    this.selectedAddress = publicKey.toBase58();
    this.selectedChain = BLOCKCHAIN_NAME.SOLANA;

    this.handleEvmWallet();
    this.handleDeactivation();
    this.handleAccountChange();

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
    if (!wallet || !wallet?.isPhantom) {
      throw new WalletNotInstalledError();
    }

    // Hotfix if Ctrl-wallet connected, it catches requests to phantom wallet and returns solana wallets from itself
    if (wallet.isXDEFI) {
      throw new NeedDisableCtrlWalletError(this.walletName.toUpperCase());
    }

    if (!wallet.isConnected) {
      await this.handleDisconnect(wallet);
    }

    if (!wallet.publicKey) {
      throw new RubicError('Connection error');
    }
  }

  private handleAccountChange(): void {
    this.wallet.on('accountChanged', (address: PublicKey) => {
      if (!address) {
        this.deactivate();
      } else {
        this.selectedAddress = address.toBase58();
        this.zone.run(() => {
          this.onAddressChanges$.next(this.selectedAddress);
        });
      }
    });
  }

  private handleNetworkChange(chainId: string): void {
    if (chainId) {
      this.selectedChain =
        (BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName) ?? null;
      this.zone.run(() => {
        this.onNetworkChanges$.next(this.selectedChain);
      });
    }
  }

  private handleEvmWallet(): void {
    const ethereum = this.window?.phantom?.ethereum;
    const solana = this.window?.phantom?.solana;
    if (ethereum && !solana) {
      ethereum.on('chainChanged', () => {
        this.errorsService.catch(new CustomError('EVM network change is not supported'));
      });
      ethereum.on('accountsChanged', () => {
        this.errorsService.catch(new CustomError('EVM network change is not supported'));
      });
    }
  }

  private handleDeactivation(): void {
    this.wallet.on('deactivate', () => this.deactivate());
  }
}
