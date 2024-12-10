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
    this.wallet.on('chainChanged', async (chain: string) => {
      this.selectedChain = (chain as EvmBlockchainName) ?? null;

      if (this.isEnabled) {
        this.onNetworkChanges$.next(BlockchainsInfo.getBlockchainNameById(chain));
        console.info('Chain changed', BlockchainsInfo.getBlockchainNameById(chain));
      }
    });

    // buggy listener, when you switch between accounts having bitcoin wallets, it doesn't see updated bitcoin address
    this.wallet.on('accountsChanged', async (accounts: string[]) => {
      this.selectedAddress = accounts[0] || null;

      // Trick to connect another account
      if (!this.selectedAddress) {
        [this.selectedAddress] = await this.wallet.getAccounts();
      }

      if (this.isEnabled) {
        this.onAddressChanges$.next(this.selectedAddress);
        console.log(
          `%cSelected account changed to ${accounts[0]}`,
          'color: yellow; font-size: 16px;'
        );
      }
    });
  }

  public async activate(): Promise<void> {
    try {
      const wallet = this.window?.xfi?.bitcoin;
      this.checkErrors(wallet);
      this.wallet = wallet;
      this.handleEvents();

      const accounts = await this.wallet.getAccounts();
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
      if (error instanceof WalletNotInstalledError) {
        this.errorsService.catch(error);
      }
    }
  }

  public deActivate(): void {
    this.onAddressChanges$.next(null);
    this.onNetworkChanges$.next(null);
    this.isEnabled = false;
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

    this.onDisconnectSub = fromEvent(this.wallet as RubicAny, 'disconnect').subscribe(() =>
      this.deactivate()
    );
  }

  private getAccounts(): Promise<string[]> {
    return this.wallet.getAccounts();
  }
}
