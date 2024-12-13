import { BehaviorSubject, fromEvent } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  BlockchainsInfo,
  CHAIN_TYPE,
  EvmBlockchainName
} from 'rubic-sdk';
import { NgZone } from '@angular/core';

import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { BtcWallet } from '@core/services/wallets/wallets-adapters/solana/models/btc-wallet';
import { WalletNotInstalledError } from '@core/errors/models/provider/wallet-not-installed-error';
import { RubicError } from '@app/core/errors/models/rubic-error';

export class CtrlWalletAdapter extends CommonWalletAdapter<BtcWallet> {
  public readonly chainType = CHAIN_TYPE.BITCOIN;

  public readonly walletName = WALLET_NAME.CTRL;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  /**
   * Checks possible BitKeep errors.
   * @param ethereum Global ethereum object.
   */
  private checkErrors(wallet: BtcWallet): void {
    if (!wallet) {
      throw new WalletNotInstalledError();
    }
  }

  /**
   * Handles chain and account change events.
   */
  private handleEvents(): void {
    this.wallet.on('chainChanged', async (chain: string) => await this.handleChainChanged(chain));
    // buggy listener, when you switch between accounts having bitcoin wallets,
    // it doesn't see updated bitcoin address and returns ampty `accounts` object
    this.wallet.on(
      'accountsChanged',
      async (accounts: string[]) => await this.handleAccountChanged(accounts)
    );
  }

  public async activate(): Promise<void> {
    try {
      const wallet = this.window?.xfi?.bitcoin;
      this.checkErrors(wallet);
      this.wallet = wallet;
      this.handleEvents();

      const accounts = await this.wallet.getAccounts();
      if (!accounts || !accounts.length) {
        throw new WalletNotInstalledError();
      }

      this.isEnabled = true;
      this.selectedChain = BLOCKCHAIN_NAME.BITCOIN;
      [this.selectedAddress] = accounts;
      this.onNetworkChanges$.next(this.selectedChain);
      this.onAddressChanges$.next(this.selectedAddress);

      this.initSubscriptionsOnChanges();
    } catch (error) {
      if (
        error.code === 4001 ||
        // metamask browser
        error.message?.toLowerCase().includes('user denied message signature')
      ) {
        throw new SignRejectError();
      }

      if (error instanceof WalletNotInstalledError) throw error;

      throw new RubicError(error.message);
    }
  }

  public override deactivate(): void {
    this.wallet?.off('chainChanged', this.handleChainChanged);
    this.wallet?.off('accountsChanged', this.handleAccountChanged);
    super.deactivate();
  }

  protected initSubscriptionsOnChanges(): void {
    this.onAddressChangesSub = fromEvent(this.wallet as RubicAny, 'accountsChanged').subscribe(
      (accounts: string[]) => {
        this.selectedAddress = accounts[0] || null;
        this.zone.run(() => {
          this.onAddressChanges$.next(this.selectedAddress);
        });
      }
    );

    this.onNetworkChangesSub = fromEvent(this.wallet as RubicAny, 'chainChanged').subscribe(
      (chainId: string) => {
        this.selectedChain =
          (BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName) ?? null;
        this.zone.run(() => {
          this.onNetworkChanges$.next(this.selectedChain);
        });
      }
    );

    this.onDisconnectSub = fromEvent(this.wallet as RubicAny, 'disconnect').subscribe(() => {
      this.deactivate();
    });
  }

  private handleChainChanged(chain: string): void {
    this.selectedChain = (chain as EvmBlockchainName) ?? null;

    if (this.isEnabled) {
      this.onNetworkChanges$.next(BlockchainsInfo.getBlockchainNameById(chain));
    }
  }

  private async handleAccountChanged(accounts: string[]): Promise<void> {
    this.selectedAddress = accounts[0] || null;

    // Trick to connect another account
    if (!this.selectedAddress) {
      try {
        [this.selectedAddress] = await this.wallet.getAccounts();
      } catch {
        this.errorsService.catch(new SignRejectError());
        this.deactivate();
      }
    }

    if (this.isEnabled) {
      this.onAddressChanges$.next(this.selectedAddress);
    }
  }
}
