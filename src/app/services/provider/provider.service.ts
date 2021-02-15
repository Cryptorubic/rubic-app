import { Injectable } from '@angular/core';
import {MetamaskError} from '../../errors/bridge/MetamaskError';
import Web3 from 'web3';
import {AccountError} from '../../errors/bridge/AccountError';
import {RubicError} from '../../errors/RubicError';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  public ethereum = window.ethereum;
  public web3: Web3;
  public error: RubicError;
  public address: string;
  public connection: any;
  public defaultMockGas: string;

  constructor() {
    if (!this.ethereum) {
      console.error("No Metamask installed");
      this.error = new MetamaskError();
      return
    }

    this.web3 = new Web3(window.ethereum);
    this.connection = window.ethereum;
    // @ts-ignore
    if (this.web3.currentProvider && this.web3.currentProvider.isMetaMask) {
      window.ethereum.enable();
      this.address = this.ethereum.selectedAddress;
      if (!this.address) {
        this.error = new AccountError();
      }
    } else {
      this.error = new MetamaskError();
      console.error("Selected other provider")
    }
  }
}
