import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { ReplaySubject } from 'rxjs';
import { PrivateProvider } from '../private-provider';

import { BlockchainsInfo } from '../../blockchain-info';
import { IBlockchain } from '../../../../../shared/models/blockchain/IBlockchain';

@Injectable({
  providedIn: 'root'
})
export class MetamaskProviderService extends PrivateProvider {
  private readonly _metaMask: any;

  public readonly web3: Web3;

  public readonly onAddressChanges = new ReplaySubject<string>();

  public readonly onNetworkChanges = new ReplaySubject<IBlockchain>();

  get isInstalled(): boolean {
    return !!this._metaMask;
  }

  get isActive(): boolean {
    return !!this._metaMask?.selectedAddress;
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
      this.web3 = web3;

      if (this.isActive) {
        this.onNetworkChanges.next(this.getNetwork());
        this.onAddressChanges.next(this.getAddress());
      }

      this._metaMask.on('chainChanged', (chain: string) => {
        this.onNetworkChanges.next(BlockchainsInfo.getBlockchainById(chain));
        console.info('Chain changed', chain);
        window.location.reload();
      });

      this._metaMask.on('accountsChanged', (accounts: string[]) => {
        this.onAddressChanges.next(accounts[0]);
        console.info('Selected account changed to', accounts[0]);
      });
    } else {
      console.error('Selected other provider.');
    }
  }

  protected getAddress(): string {
    return this._metaMask?.selectedAddress;
  }

  protected getNetwork(): IBlockchain {
    const networkId = this._metaMask?.networkVersion;
    return networkId ? BlockchainsInfo.getBlockchainById(networkId) : undefined;
  }

  public async activate(): Promise<void> {
    return this._metaMask?.request({ method: 'eth_requestAccounts' });
  }
}
