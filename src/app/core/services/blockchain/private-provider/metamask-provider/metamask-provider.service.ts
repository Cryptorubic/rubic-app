/* eslint-disable consistent-return */
import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { BehaviorSubject } from 'rxjs';
import { PrivateProvider } from '../private-provider';

import { BlockchainsInfo } from '../../blockchain-info';
import { IBlockchain } from '../../../../../shared/models/blockchain/IBlockchain';

@Injectable({
  providedIn: 'root'
})
export class MetamaskProviderService extends PrivateProvider {
  private isEnabled: boolean = false;

  private readonly _metaMask: any;

  private readonly _web3: Web3;

  public readonly onAddressChanges: BehaviorSubject<string>;

  public readonly onNetworkChanges: BehaviorSubject<IBlockchain>;

  get isInstalled(): boolean {
    return !!this._metaMask;
  }

  get isActive(): boolean {
    return this.isEnabled && !!this._metaMask?.selectedAddress;
  }

  get web3(): Web3 {
    if (this.isActive) {
      return this._web3;
    }
  }

  constructor() {
    super();

    const { ethereum } = window as any;
    if (!ethereum) {
      console.error('No Metamask installed.');
      return;
    }
    const web3 = new Web3(ethereum);
    if ((web3.currentProvider as any)?.isMetaMask) {
      this._metaMask = ethereum;
      this._web3 = web3;

      if (this._metaMask?.selectedAddress) {
        this.isEnabled = true;
      }

      this.onNetworkChanges = new BehaviorSubject<IBlockchain>(this.getNetwork());
      this.onAddressChanges = new BehaviorSubject<string>(this.getAddress());

      this._metaMask.on('chainChanged', (chain: string) => {
        if (this.isEnabled) {
          this.onNetworkChanges.next(BlockchainsInfo.getBlockchainById(chain));
          console.info('Chain changed', chain);
          // window.location.reload();
        }
      });

      this._metaMask.on('accountsChanged', (accounts: string[]) => {
        if (this.isEnabled) {
          this.onAddressChanges.next(accounts[0]);
          console.info('Selected account changed to', accounts[0]);
        }
      });
    } else {
      console.error('Selected other provider.');
    }
  }

  protected getAddress(): string {
    if (this.isEnabled) {
      return this._metaMask?.selectedAddress;
    }
  }

  protected getNetwork(): IBlockchain {
    if (this.isEnabled) {
      const networkId = this._metaMask?.networkVersion;
      return networkId ? BlockchainsInfo.getBlockchainById(networkId) : undefined;
    }
  }

  public async activate(): Promise<void> {
    await this._metaMask?.request({ method: 'eth_requestAccounts' });
    this.isEnabled = true;
    this.onNetworkChanges.next(this.getNetwork());
    this.onAddressChanges.next(this.getAddress());
  }

  public deActivate(): void {
    this.onAddressChanges.next(undefined);
    this.onNetworkChanges.next(undefined);
    this.isEnabled = false;
  }
}
