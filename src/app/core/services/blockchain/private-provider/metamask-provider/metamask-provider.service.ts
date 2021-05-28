import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { PrivateProvider } from '../private-provider';

import { BlockchainsInfo } from '../../blockchain-info';
import { IBlockchain } from '../../../../../shared/models/blockchain/IBlockchain';
import { MetamaskError } from '../../../../../shared/models/errors/provider/MetamaskError';
import { NetworkError } from '../../../../../shared/models/errors/provider/NetworkError';
import SwapToken from '../../../../../shared/models/tokens/SwapToken';

@Injectable({
  providedIn: 'root'
})
export class MetamaskProviderService extends PrivateProvider {
  private isEnabled: boolean = false;

  private readonly _metaMask: any;

  private readonly _web3: Web3;

  private selectedAddress: string;

  private selectedChain: string;

  public onAddressChanges: BehaviorSubject<string>;

  public onNetworkChanges: BehaviorSubject<IBlockchain>;

  get isInstalled(): boolean {
    return !!this._metaMask;
  }

  get isActive(): boolean {
    return this.isEnabled && !!this.selectedAddress;
  }

  get web3(): Web3 {
    if (this.isActive) {
      return this._web3;
    }
    return null;
  }

  constructor(private readonly translateService: TranslateService) {
    super();

    this.onNetworkChanges = new BehaviorSubject<IBlockchain>(undefined);
    this.onAddressChanges = new BehaviorSubject<string>(undefined);

    const { ethereum } = window as any;
    if (!ethereum) {
      console.error('No Metamask installed.');
      return;
    }

    const web3 = new Web3(ethereum);
    if ((web3.currentProvider as any)?.isMetaMask) {
      this._metaMask = ethereum;
      this._web3 = web3;

      this._metaMask.request({ method: 'eth_chainId' }).then((chain: string) => {
        this.selectedChain = chain;
        this.onNetworkChanges.next(BlockchainsInfo.getBlockchainById(chain));
      });
      this._metaMask.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        [this.selectedAddress] = accounts;
        this.selectedAddress = this.selectedAddress || null;
        this.onAddressChanges.next(this.selectedAddress);
      });

      this._metaMask.on('chainChanged', (chain: string) => {
        this.selectedChain = chain;
        if (this.isEnabled) {
          this.onNetworkChanges.next(BlockchainsInfo.getBlockchainById(chain));
          console.info('Chain changed', chain);
        }
      });

      this._metaMask.on('disconnect', () => {
        this.selectedChain = null;
        this.deActivate();
      });

      this._metaMask.on('accountsChanged', (accounts: string[]) => {
        this.selectedAddress = accounts[0] || null;
        if (this.isEnabled) {
          this.onAddressChanges.next(this.selectedAddress);
          console.info('Selected account changed to', accounts[0]);
        }
        if (!this.selectedAddress) {
          this.selectedChain = null;
          this.deActivate();
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

  public async activate(params?: any[]): Promise<void> {
    try {
      await this._metaMask.request({
        method: 'eth_requestAccounts',
        params
      });
      this.isEnabled = true;
      this.onNetworkChanges.next(this.getNetwork());
      this.onAddressChanges.next(this.getAddress());
    } catch (error) {
      console.error(`No Metamask installed. ${error}`);
      throw new MetamaskError(this.translateService);
    }
  }

  public async requestPermissions(): Promise<any[]> {
    try {
      return this._metaMask.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });
    } catch (err) {
      console.error(err);
    }
    return null;
  }

  public deActivate(): void {
    this.onAddressChanges.next(null);
    this.onNetworkChanges.next(null);
    this.isEnabled = false;
  }

  public addToken(token: SwapToken): Promise<void> {
    if (!this.isActive) {
      throw new MetamaskError(this.translateService);
    }
    if (this.getNetwork().name !== token.blockchain) {
      throw new NetworkError(token.blockchain, this.translateService);
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
