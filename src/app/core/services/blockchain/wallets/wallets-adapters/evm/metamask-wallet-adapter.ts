import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { AddEthChainParams } from '@core/services/blockchain/wallets/models/add-eth-chain-params';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { CoinbaseExtensionError } from '@core/errors/models/provider/coinbase-extension-error';
import { MetamaskError } from '@core/errors/models/provider/metamask-error';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { NgZone } from '@angular/core';
import { BlockchainName, BlockchainsInfo, CHAIN_TYPE } from 'rubic-sdk';
import { RubicWindow } from '@shared/utils/rubic-window';

export class MetamaskWalletAdapter extends CommonWalletAdapter {
  public readonly walletType = CHAIN_TYPE.EVM;

  public get isMultiChainWallet(): boolean {
    return false;
  }

  public get walletName(): WALLET_NAME {
    return WALLET_NAME.METAMASK;
  }

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone);

    const { ethereum } = window;
    MetamaskWalletAdapter.checkErrors(ethereum);
    this.wallet = ethereum;
    this.handleEvents();
  }

  /**
   * Checks possible metamask errors.
   * @param ethereum Global ethereum object.
   */
  private static checkErrors(ethereum: RubicAny): void {
    if (!ethereum?.isMetaMask) {
      throw new MetamaskError();
    }

    // installed coinbase Chrome extension
    if (ethereum.hasOwnProperty('overrideIsMetaMask')) {
      throw new CoinbaseExtensionError();
    }
  }

  /**
   * Handles chain and account change events.
   */
  private handleEvents(): void {
    this.wallet.on('chainChanged', (chainId: string) => {
      this.selectedChain = BlockchainsInfo.getBlockchainNameById(chainId) ?? null;
      if (this.isEnabled) {
        this.zone.run(() => {
          this.onNetworkChanges$.next(this.selectedChain);
        });
        console.info('Chain changed', chainId);
      }
    });

    this.wallet.on('accountsChanged', (accounts: string[]) => {
      this.selectedAddress = accounts[0] || null;
      if (this.isEnabled) {
        this.zone.run(() => {
          this.onAddressChanges$.next(this.selectedAddress);
        });
        console.info('Selected account changed to', accounts[0]);
      }
      if (!this.selectedAddress) {
        this.selectedChain = null;
        this.deActivate();
      }
    });
  }

  public async activate(params?: unknown[]): Promise<void> {
    try {
      const accounts = await this.wallet.request({
        method: 'eth_requestAccounts',
        params
      });
      const chain = await this.wallet.request({ method: 'eth_chainId' });
      this.isEnabled = true;

      [this.selectedAddress] = accounts;
      this.selectedChain = BlockchainsInfo.getBlockchainNameById(chain) ?? null;
      this.onAddressChanges$.next(this.selectedAddress);
      this.onNetworkChanges$.next(this.selectedChain);
    } catch (error) {
      if (
        error.code === 4001 ||
        // metamask browser
        error.message?.toLowerCase().includes('user denied message signature')
      ) {
        throw new SignRejectError();
      }
      throw new MetamaskError();
    }
  }

  public deActivate(): void {
    this.onAddressChanges$.next(null);
    this.onNetworkChanges$.next(null);
    this.isEnabled = false;
  }

  public async switchChain(chainId: string): Promise<null | never> {
    return this.wallet.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }]
    });
  }

  public async addChain(params: AddEthChainParams): Promise<null | never> {
    return this.wallet.request({
      method: 'wallet_addEthereumChain',
      params: [params]
    });
  }
}
