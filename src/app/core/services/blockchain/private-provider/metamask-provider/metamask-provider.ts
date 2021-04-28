import Web3 from 'web3';
import { BehaviorSubject } from 'rxjs';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { WALLET_NAME } from 'src/app/core/header/components/header/components/wallets-modal/wallets-modal.component';
import { PrivateProvider } from '../private-provider';

import { BlockchainsInfo } from '../../blockchain-info';
import { IBlockchain } from '../../../../../shared/models/blockchain/IBlockchain';
import { MetamaskError } from '../../../../../shared/models/errors/provider/MetamaskError';

export class MetamaskProvider extends PrivateProvider {
  private isEnabled: boolean = false;

  private readonly _metaMask: any;

  private selectedAddress: string;

  private selectedChain: string;

  public readonly onAddressChanges: BehaviorSubject<string>;

  public readonly onNetworkChanges: BehaviorSubject<IBlockchain>;

  get isInstalled(): boolean {
    return !!this._metaMask;
  }

  get isActive(): boolean {
    return this.isEnabled && !!this.selectedAddress;
  }

  constructor(
    web3: Web3,
    chainChange: BehaviorSubject<IBlockchain>,
    accountChange: BehaviorSubject<string>
  ) {
    super();
    this.onAddressChanges = accountChange;
    this.onNetworkChanges = chainChange;

    const { ethereum } = window as any;
    if (!ethereum) {
      console.error('No Metamask installed.');
      return;
    }

    web3.setProvider(ethereum);
    this._metaMask = ethereum;
    if ((web3.currentProvider as any)?.isMetaMask) {
      this._metaMask.request({ method: 'eth_chainId' }).then((chain: string) => {
        this.selectedChain = chain;
        chainChange.next(BlockchainsInfo.getBlockchainById(chain));
      });
      this._metaMask.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        [this.selectedAddress] = accounts;
        accountChange.next(this.selectedAddress);
      });

      this._metaMask.on('chainChanged', (chain: string) => {
        this.selectedChain = chain;
        if (this.isEnabled) {
          chainChange.next(BlockchainsInfo.getBlockchainById(chain));
          console.info('Chain changed', chain);
        }
      });

      this._metaMask.on('accountsChanged', (accounts: string[]) => {
        [this.selectedAddress] = accounts;
        this.selectedAddress = this.selectedAddress || null;
        if (this.isEnabled) {
          accountChange.next(this.selectedAddress);
          console.info('Selected account changed to', accounts[0]);
        }
      });
    } else {
      console.error('Selected other provider.');
    }
  }

  protected getAddress(): string {
    if (this.isEnabled) {
      return this.selectedAddress;
    }
    return null;
  }

  protected getNetwork(): IBlockchain {
    if (this.isEnabled) {
      return this.selectedChain ? BlockchainsInfo.getBlockchainById(this.selectedChain) : undefined;
    }
    return null;
  }

  public async activate(): Promise<void> {
    try {
      await this._metaMask.request({ method: 'eth_requestAccounts' });
      this.isEnabled = true;
      this.onNetworkChanges.next(this.getNetwork());
      this.onAddressChanges.next(this.getAddress());
      localStorage.setItem('provider', WALLET_NAME.METAMASK);
    } catch (error) {
      console.error(`No Metamask installed. ${error}`);
      throw new MetamaskError();
    }
  }

  public deActivate(): void {
    this.onAddressChanges.next(null);
    this.onNetworkChanges.next(null);
    this.isEnabled = false;
  }

  public addToken(token: SwapToken): Promise<void> {
    if (!this.isActive) {
      throw new MetamaskError();
    }
    if (this.getNetwork().name !== token.blockchain) {
      throw new NetworkError(token.blockchain);
    }

    return this._metaMask.request({
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
}
