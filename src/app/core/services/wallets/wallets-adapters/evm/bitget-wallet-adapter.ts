import Web3 from 'web3';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { Token } from '@shared/models/tokens/token';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { CoinbaseExtensionError } from '@core/errors/models/provider/coinbase-extension-error';
import { NetworkError } from '@core/errors/models/provider/network-error';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { RubicError } from '@core/errors/models/rubic-error';
import { BitKeepError } from '@core/errors/models/provider/bitkeep-error';
import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import {
  BlockchainName,
  BlockchainsInfo,
  CHAIN_TYPE,
  ChainType,
  EvmBlockchainName
} from 'rubic-sdk';
import { AddEvmChainParams } from '@core/services/wallets/models/add-evm-chain-params';
import { NgZone } from '@angular/core';
import { NeedDisableTokenPocketWalletError } from '@app/core/errors/models/provider/token-pocket-enabled-error';

export class BitgetWalletAdapter extends EvmWalletAdapter {
  public get isMultiChainWallet(): boolean {
    return false;
  }

  get walletType(): ChainType {
    return CHAIN_TYPE.EVM;
  }

  public get walletName(): WALLET_NAME {
    return WALLET_NAME.BITGET;
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

  /**
   * Checks possible BitKeep errors.
   * @param ethereum Global ethereum object.
   */
  private checkErrors(ethereum: RubicAny): void {
    if (!ethereum?.isBitKeep && !ethereum?.isBitKeepChrome) {
      throw new BitKeepError();
    }

    if (ethereum?.isTokenPocket) {
      throw new NeedDisableTokenPocketWalletError(this.walletName);
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
    this.wallet.on('chainChanged', async (chain: string) => {
      this.selectedChain = (chain as EvmBlockchainName) ?? null;

      if (this.isEnabled) {
        this.onNetworkChanges$.next(BlockchainsInfo.getBlockchainNameById(chain));
        console.info('Chain changed', BlockchainsInfo.getBlockchainNameById(chain));
      }
    });

    this.wallet.on('accountsChanged', async (accounts: string[]) => {
      this.selectedAddress = accounts[0] || null;

      if (this.isEnabled) {
        this.onAddressChanges$.next(this.selectedAddress);
        console.info('Selected account changed to', accounts[0]);
      }

      if (!this.selectedAddress) {
        this.selectedChain = null;
        this.deActivate();
      }
    });
  }

  public async setupDefaultValues(): Promise<void> {
    const chain = await this.wallet.request({ method: 'eth_chainId' });
    const accounts = await this.wallet.request({ method: 'eth_accounts' });
    this.selectedChain = chain;
    [this.selectedAddress] = accounts;
  }

  public async signPersonal(message: string): Promise<string> {
    return new Web3(this.wallet).eth.personal.sign(message, this.address, undefined);
  }

  public async activate(params?: unknown[]): Promise<void> {
    try {
      const provider = await this.getProvider({ provider: 'bitget wallet' });
      this.checkErrors(provider);

      this.wallet = provider;
      const accounts = await this.wallet.request({
        method: 'eth_requestAccounts',
        params
      });
      const chain = await this.wallet.request({ method: 'eth_chainId' });
      this.isEnabled = true;
      this.selectedChain = BlockchainsInfo.getBlockchainNameById(chain) as EvmBlockchainName;
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

      if (error instanceof RubicError) {
        throw error;
      }
    }
  }

  public deActivate(): void {
    this.onAddressChanges$.next(null);
    this.onNetworkChanges$.next(null);
    this.isEnabled = false;
  }

  public addToken(token: Token): Promise<void> {
    if (!this.isActive) {
      throw new RubicError('Please make sure that you have BitKeep plugin installed and unlocked.');
    }
    if (this.selectedChain !== token.blockchain) {
      throw new NetworkError(token.blockchain);
    }

    return this.wallet.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: token.image
        }
      }
    });
  }

  public async switchChain(chainId: string): Promise<null | never> {
    return this.wallet.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }]
    });
  }

  public async addChain(params: AddEvmChainParams): Promise<null | never> {
    return this.wallet.request({
      method: 'wallet_addEthereumChain',
      params: [params]
    });
  }
}
