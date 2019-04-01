const BigNumber = require('bignumber.js');

import {Directive, EventEmitter, Injectable, Output} from '@angular/core';
import Web3 from 'web3';

import {AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, NG_VALIDATORS, ValidationErrors} from '@angular/forms';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ETH_NETWORKS, ERC20_TOKEN_ABI} from './web3.constants';


export interface TokenInfoInterface {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
}

const IS_PRODUCTION = location.protocol === 'https:';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  private providers;
  private Web3;

  constructor() {

    this.providers = {};
    try {
      const metaMaskProvider = Web3.givenProvider || new Web3.providers.WebsocketProvider('ws://localhost:8546');
      // if (metaMaskProvider && metaMaskProvider.publicConfigStore) {
      this.providers.metamask = metaMaskProvider;
      // }

    } catch (err) {
      console.log('Metamask not found');
    }

    try {
      this.providers.parity = new Web3.providers.HttpProvider('http://localhost:8545');
    } catch (err) {
      console.log('Parity not found');
    }

    try {
      this.providers.infura =
        new Web3.providers.HttpProvider(
          IS_PRODUCTION ? ETH_NETWORKS.INFURA_ADDRESS : ETH_NETWORKS.ROPSTEN_INFURA_ADDRESS
        );
    } catch (err) {
      console.log('Infura not found');
    }
    this.Web3 = new Web3(this.providers.infura);
  }

  // 0xcDDF6eCa70DCc93538fc8dEF899E5facE2598d7a

  public getTokenInfo(tokenAddress) {
    const tokenInfoFields = ['decimals', 'symbol', 'name'];

    let fieldsCount = tokenInfoFields.length;
    const tokenInfo: any = {};

    return new Promise((resolve, reject) => {
      const address = tokenAddress ? tokenAddress.toLowerCase() : tokenAddress;
      if (!this.Web3.utils.isAddress(address)) {
        return resolve({
          ethAddress: true
        });
      }


      const contract = this.Web3.eth.Contract(ERC20_TOKEN_ABI, address);

      tokenInfoFields.map((method) => {
        contract.methods[method]().call().then(result => {
          tokenInfo[method] = result;
          fieldsCount--;
          if (!fieldsCount) {
            tokenInfo.address = tokenAddress;
            resolve({
              data: tokenInfo
            });
          }
        }, (err) => {
          reject({
            tokenAddress: true
          });
        });
      });
    }).then((res) => {
      return res;
    });
  }


  public checkTokenAddress(address) {
    return this.getTokenInfo(address);
  }

  private setProvider(providerName) {

    const usedNetworkVersion = IS_PRODUCTION ? 1 : 3;

    switch (providerName) {
      case 'metamask':
        const networkVersion = Number(this.providers[providerName].publicConfigStore._state.networkVersion);
        if (usedNetworkVersion === networkVersion) {
          this.Web3.setProvider(this.providers[providerName]);
        }
        break;
    }
  }


  private getAccountsByProvider(providerName) {
    return new Promise((resolve, reject) => {
      try {
        this.setProvider(providerName);
        this.Web3.eth.getAccounts((err, addresses) => {
          if (!err) {
            resolve({
              type: providerName,
              addresses
            });
          }
        });
      } catch (err) {
        resolve({
          type: providerName,
          addresses: []
        });
      }
    });
  }


  public getAccounts() {
    const addressesDictionary: any = {};
    return new Promise((resolve, reject) => {
      this.getAccountsByProvider('metamask').then((addresses: any) => {
        addressesDictionary[addresses.type] = addresses.addresses;
        this.Web3.setProvider(this.providers.infura);
        resolve(addressesDictionary);
      });
    });
  }

  public encodeFunctionCall(abi, data) {
    return this.Web3.eth.abi.encodeFunctionCall(abi, data);
  }

  public sendTransaction(transactionConfig, provider?) {
    if (provider) {
      this.Web3.setProvider(this.providers[provider]);
    }
    return this.Web3.eth.sendTransaction(transactionConfig).then((result) => {
      if (provider) {
        this.Web3.setProvider(this.providers.infura);
      }
      return result;
    });
  }

}


// noinspection JSAnnotator
@Directive({
  selector: '[appEthTokenValidator]',
  providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: EthTokenValidatorDirective, multi: true }]
})

export class EthTokenValidatorDirective implements AsyncValidator {

  @Output() TokenResolve = new EventEmitter<any>();

  constructor(
    private web3Service: Web3Service
  ) {}

  validate(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.web3Service.checkTokenAddress(ctrl.value).then((result: any) => {
      if (result.data) {
        this.TokenResolve.emit(result.data);
        return null;
      } else {
        return result;
      }

    });
  }
}
