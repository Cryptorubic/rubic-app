import { Injectable } from '@angular/core';
import { MetamaskError } from '../../errors/bridge/MetamaskError';
import Web3 from 'web3';
import { AccountError } from '../../errors/bridge/AccountError';
import { RubicError } from '../../errors/RubicError';
import { ethers } from 'ethers';
import { BLOCKCHAIN_NAMES } from '../../pages/main-page/trades-form/types';

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
  public ethersProvider: any;
  public web3Infura: {
    [BLOCKCHAIN_NAMES.ETHEREUM]: Web3;
    [BLOCKCHAIN_NAMES.BINANCE_SMART_CHAIN]: Web3;
    [BLOCKCHAIN_NAMES.MATIC]: Web3;
  };

  private readonly INFURA_NETWORKS = {
    [BLOCKCHAIN_NAMES.ETHEREUM]: 'https://mainnet.infura.io/v3/2e15c999e7854a6d9d95d7eb68b11ad6',
    [BLOCKCHAIN_NAMES.BINANCE_SMART_CHAIN]: 'https://bsc-dataseed1.binance.org',
    [BLOCKCHAIN_NAMES.MATIC]: 'https://rpc-mainnet.matic.network'
  };

  constructor() {
    if (!this.ethereum) {
      console.error('No Metamask installed');
      this.error = new MetamaskError();
      return;
    }

    this.web3 = new Web3(window.ethereum);
    this.connection = window.ethereum;
    // @ts-ignore
    if (this.web3.currentProvider && this.web3.currentProvider.isMetaMask) {
      window.ethereum.enable();
      this.address = this.ethereum.selectedAddress;
      this.ethersProvider = new ethers.providers.Web3Provider(this.connection);
      if (!this.address) {
        this.error = new AccountError();
      }

      this.web3Infura = {
        [BLOCKCHAIN_NAMES.ETHEREUM]: new Web3(this.INFURA_NETWORKS[BLOCKCHAIN_NAMES.ETHEREUM]),
        [BLOCKCHAIN_NAMES.BINANCE_SMART_CHAIN]: new Web3(
          this.INFURA_NETWORKS[BLOCKCHAIN_NAMES.BINANCE_SMART_CHAIN]
        ),
        [BLOCKCHAIN_NAMES.MATIC]: new Web3(this.INFURA_NETWORKS[BLOCKCHAIN_NAMES.MATIC])
      };
    } else {
      this.error = new MetamaskError();
      console.error('Selected other provide');
    }
  }
}
